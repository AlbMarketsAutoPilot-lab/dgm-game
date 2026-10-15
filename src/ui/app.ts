// The game screen (owner's design, 14–15 Oct): the whole board is the info area (where am I, what is ahead; tap a
// square to see what it does), the stage is the action area (the square, the token, the die). Every story moment,
// choice and the win are popups over the whole board. The players sit in a row on top (portrait) or a column on the
// right (landscape); tap one to see everything about them. All rules come from the engine (src/engine); this file
// only shows its events, in order, and answers its decisions.
import { BOARDS, Game, OFF, OUT, START, randomSeed, simplePlayer, type Answer, type Board, type Decision, type GameEvent, type PlayerState, type Pos, type Tile } from "../engine";
import { artFor } from "../render/art";
import { esc } from "../render/html";
import { cardFace } from "../render/art-modern";
import { Dice } from "./dice";
import { Overview, reachSteps } from "./overview";
import { PLAYERS, tokenSvg } from "./players";
import { Popups, type PopupContent } from "./popup";
import { SpoilQuestion } from "./spoil";
import { Stage } from "./stage";
import { MOMENTS, fill, outcome, taleOf, type Tale } from "./tales";
import { POSTCARDS, loadAlbum, postcardsFor, saveAlbum, showAlbum, type Postcard } from "./postcards";
import { clearGame, replay, saveGame, type SavedGame } from "./save";

export interface Setup {
  board: Board;
  players: number;
  /** true = computer player (GCD §8.6) for that seat. */
  computer: boolean[];
}

// `?fast` in the address fast-forwards whole games, for testing: only in development and in the browser-test build
// (`vite build --mode browsertest`), never in the published game (S4). "Reduce motion" only stops the animations.
const fast = import.meta.env.MODE !== "production" && new URLSearchParams(location.search).has("fast");
/** Leaving a game in the middle of a turn: whatever was still running stops here, quietly. */
const STOP = new Promise<never>(() => {});
/** A computer player's badge on the avatar (owner, Step 7: a robot instead of "CPU"). */
const robotSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6V3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="2.6" r="1.7" fill="currentColor"/><rect x="4.5" y="6" width="15" height="13" rx="4" fill="currentColor"/><rect x="2" y="10" width="2" height="5" rx="1" fill="currentColor"/><rect x="20" y="10" width="2" height="5" rx="1" fill="currentColor"/><circle cx="9.2" cy="11.6" r="1.9" fill="var(--ink)"/><circle cx="14.8" cy="11.6" r="1.9" fill="var(--ink)"/><rect x="9" y="15.2" width="6" height="1.7" rx=".85" fill="var(--ink)"/></svg>`;
const leaveSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5M14 8l-4 4 4 4M10 12h10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const lanternSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6M12 2v2M8 7h8l-1 11H9zM8 7c0-2 8-2 8 0M9.5 18h5v2.5h-5z" fill="#f2c230" stroke="#4b2377" stroke-width="1.7" stroke-linejoin="round"/></svg>`;

const CARD_INFO = {
  bonus: { icon: "card", title: "Bonus card", text: "With this card you have the power to cancel a punishment for yourself or cancel a reward for another player. Use any time at your will." },
  jailPass: { icon: "boots", title: "Bog boots", text: "They work by themselves: the next time the Bog would catch you, you walk straight through. Then they're worn out." },
  snakeLeader: { icon: "snake-crown", title: "Snake Leader", text: "You rode the sea snake. Careful: if you land on the very last square, the snake wants its ride back." },
};

export class GameScreen {
  private readonly game: Game;
  private readonly board: Board;
  private readonly overview: Overview;
  private readonly stage: Stage;
  private readonly dice: Dice;
  private readonly pops: Popups;
  private readonly bar: HTMLElement;
  private readonly hud: HTMLElement;
  private readonly act: HTMLElement;
  private round = 0;
  /** Postcards collected on this device, and the new ones from this game. */
  private readonly album = loadAlbum();
  private readonly newCards: Postcard[] = [];
  private seat = 0;
  /** Why each player is waiting (the square that made them miss turns), for the "skips this turn" popup. */
  private readonly waitCause: string[] = [];
  /** Who said "Don't ask me again this game" to the spoil question (Step 5b). */
  private spoil = new SpoilQuestion();
  /** This turn's story so far (newest first); only the newest is shown (owner: no list of earlier moments). */
  private told: PopupContent[] = [];
  /** Where each token is shown (follows the events, one step behind the engine's final state). */
  private readonly places: Pos[];
  /** What decides this game (U1: saved after every turn, so it can be continued). */
  private readonly seed: number;
  private readonly answers: Answer[] = [];
  private turns = 0;
  /** Continued from a saved game. */
  private readonly resumed: boolean;
  /** The players left this game (U2): nothing more happens on this screen. */
  private gone = false;

  /** `resume`: a saved game to continue (U1); without it a new game, with a random first player (U3). */
  constructor(root: HTMLElement, private readonly setup: Setup, private readonly onExit: (again: boolean) => void, resume?: SavedGame) {
    const { board, players } = setup;
    this.board = board;
    const again = resume ? replay(resume) : null;
    this.resumed = !!again;
    if (again && resume) {
      this.seed = resume.seed;
      this.game = again;
      this.answers.push(...resume.answers);
      this.turns = resume.turns;
      this.spoil = new SpoilQuestion(resume.quiet);
      this.newCards.push(...POSTCARDS.filter((c) => resume.cards.includes(c.id)));
      for (const e of again.events) this.noteWait(e);
    } else {
      this.seed = randomSeed();
      this.game = new Game(board, { players, seed: this.seed, first: Math.floor(Math.random() * players) });
    }
    root.innerHTML = `
      <div class="game">
        <h1 class="sr">Don't Get Mad!: the game</h1>
        <nav class="players" aria-label="Players"></nav>
        <section class="overview" aria-label="The whole board"></section>
        <section class="stage-panel">
          <div class="hud"></div>
          <div class="stage"></div>
          <div class="controls"><div class="dice"></div><div class="act"></div></div>
        </section>
      </div>`;
    const ov = root.querySelector<HTMLElement>(".overview")!;
    this.overview = new Overview(ov, board, players, (pos) => this.squareInfo(pos));
    this.pops = new Popups(ov, root.querySelector(".game")!, root.querySelector(".controls")!);
    this.stage = new Stage(root.querySelector(".stage")!, board);
    this.dice = new Dice(root.querySelector(".dice")!);
    this.bar = root.querySelector(".players")!;
    this.hud = root.querySelector(".hud")!;
    this.act = root.querySelector(".act")!;
    this.places = this.game.players.map((p) => p.pos);
    this.places.forEach((pos, i) => this.overview.setPlace(i, pos));
    this.overview.setRoadblock(this.game.roadblock);
    this.bar.addEventListener("click", (e) => {
      if ((e.target as Element).closest(".leave")) return void this.leave();
      const b = (e.target as Element).closest<HTMLElement>("[data-seat]");
      if (b) this.playerInfo(Number(b.dataset.seat));
    });
    this.hud.addEventListener("click", (e) => {
      const b = (e.target as Element).closest<HTMLElement>("[data-card]");
      if (b) this.cardInfo(b.dataset.card as keyof typeof CARD_INFO);
    });
    this.render();
    if (!this.resumed) this.save(); // a new game replaces the saved one at once (not only after its first turn)
    void this.run();
  }

  /** A pause; never ends once the players have left the game. */
  private wait(ms: number): Promise<void> {
    if (this.gone) return STOP;
    return new Promise<void>((r) => setTimeout(r, fast ? Math.min(ms, 40) : ms)).then(() => (this.gone ? STOP : undefined));
  }

  /** A player's name, as HTML (S3: names may one day be typed by players). */
  private name(seat: number): string {
    return esc(PLAYERS[seat].name);
  }

  private nextSeat(from = this.game.currentSeat): number {
    const P = this.game.players;
    let s = from;
    do s = (s + 1) % P.length; while (P[s].out);
    return s;
  }

  private async run(): Promise<void> {
    const people = this.setup.computer.some((c) => !c);
    if (this.resumed) {
      const next = this.nextSeat();
      if (people) {
        await this.pops.show({
          kind: "info", art: `<div class="one">${tokenSvg(next, "tok", true)}</div>`, kicker: "Saved game", title: "Welcome back!",
          text: `The journey goes on where you left it: round ${this.roundOf(next)}, <b>${this.name(next)}</b> plays next.`,
          buttons: [{ label: "Let's go on!", value: "ok", primary: true }],
        });
        if (this.gone) return;
      }
    } else {
      await this.whoStarts();
      if (this.gone) return;
    }
    if (people && !this.resumed) {
      const first = this.name(this.game.first);
      await this.pops.show({
        kind: "info", art: artFor("house", "Home"), kicker: `${first} starts`, title: "You need a 6 to enter",
        text: "Everyone starts at Home, off the board. <b>Roll a 6 to step onto the board.</b> A 6 always gives you one more throw, and the throws add up. No 6 in three throws: you set off anyway, but a lantern goes out.",
        outcome: "First to the Festival of Lights wins. You need the exact number to get in.",
        buttons: [{ label: "Let's go!", value: "ok", primary: true }],
      });
    }
    if (this.gone) return;
    while (!this.game.over) await this.turn();
    if (this.gone) return;
    clearGame();
    const w = this.game.winner;
    this.overview.setReach(null);
    const m = w === null ? MOMENTS.nobody : this.game.lastStanding ? MOMENTS.winLast : MOMENTS.win;
    if (w !== null) { this.overview.setCurrent(w); this.stage.celebrate("win"); this.stage.stamp("good", "Champion!"); }
    this.setAct([]);
    const cards = this.newCards.length ? `<p class="pop-sub">New postcard${this.newCards.length > 1 ? "s" : ""}: <b>${this.newCards.map((c) => esc(c.title)).join(", ")}</b></p>` : "";
    let again: string;
    for (;;) {
      again = await this.pops.show({
        kind: "win", tone: "good", art: artFor("lanterns", "Festival of Lights"), kicker: "The end of the journey",
        title: fill(m.title, { p: w === null ? "" : this.name(w) }), text: fill(m.text, { p: w === null ? "" : this.name(w) }), more: cards || undefined,
        buttons: [{ label: "Play again: same players", value: "again", primary: true }, { label: "New game: change players or board", value: "new" }, { label: "Postcard album", value: "album" }],
      });
      if (again !== "album") break;
      await showAlbum();
    }
    this.onExit(again !== "new");
  }

  /** U3: the first player is drawn at random. The avatars take turns lighting up, and stop on the one who starts. */
  private async whoStarts(): Promise<void> {
    const n = this.game.players.length, first = this.game.first, hops = 2 * n + first + 1;
    for (let i = 0; i < hops; i++) {
      this.bar.querySelectorAll(".avatar").forEach((a, k) => a.classList.toggle("now", k === i % n));
      await this.wait(fast ? 10 : 90 + i * 14);
    }
    this.seat = first;
    this.overview.setCurrent(first);
    this.drawn.bar = ""; // the spin changed the avatars by hand: draw them again
    this.render();
    this.stage.show(first, OFF);
    this.stage.stamp("good", `${PLAYERS[first].name} starts!`); // plain text, not HTML
    await this.wait(900);
  }

  /** The round a turn of `seat` belongs to (the engine counts a round only when its first throw starts). */
  private roundOf(seat: number): number {
    const n = this.game.players.length, rel = (s: number) => (s - this.game.first + n) % n;
    return this.game.round + (rel(seat) <= rel(this.game.currentSeat) ? 1 : 0);
  }

  /** U2: leave the game, after "Are you sure?". It stays saved, so "Continue game" brings it back. */
  private async leave(): Promise<void> {
    if (this.gone) return;
    const v = await this.pops.show({
      kind: "info", art: artFor("house", "Home"), kicker: "Leave game", title: "Leave this game?",
      text: this.game.over ? "Back to the start screen." : "The game is saved on this device: <b>Continue game</b> on the start screen brings you back to the start of this turn, with the same throws.",
      buttons: [{ label: "Leave", value: "leave", primary: true }, { label: "Stay", value: "stay" }],
    });
    if (v !== "leave" || this.gone) return;
    this.gone = true;
    this.onExit(false);
  }

  /** U1: what decides the game so far, after every whole turn. */
  private save(): void {
    if (this.gone) return;
    if (this.game.over) return clearGame();
    const id = (Object.keys(BOARDS) as (keyof typeof BOARDS)[]).find((k) => BOARDS[k] === this.board);
    if (!id) return;
    saveGame({
      board: id, players: this.setup.players, computer: this.setup.computer, seed: this.seed, first: this.game.first,
      answers: this.answers, turns: this.turns, quiet: this.spoil.silenced, cards: this.newCards.map((c) => c.id), round: this.roundOf(this.nextSeat()),
    });
  }

  // ---- One turn ----

  private async turn(): Promise<void> {
    const seat = (this.seat = this.nextSeat()), p = this.game.players[seat], comp = this.setup.computer[seat];
    this.told = [];
    if (!comp) this.pops.clear(); // a person's turn starts with the whole board in view
    this.overview.setCurrent(seat);
    this.overview.zoomOutAll();
    this.dice.clear();
    const pl = this.places[seat];
    this.stage.show(seat, pl);
    // The round this turn belongs to: the engine counts it only when the throw starts (audit: the prompt showed the
    // previous round, and no round at all on the first turn).
    this.round = this.roundOf(seat);
    this.render();
    // the Puddle moves exactly 1 whatever the die shows: no die faces then (the line under "Blue's turn" says so)
    this.overview.setReach(p.skip > 0 || p.trapped || p.pos === OFF || p.slow ? null : pl, p.double);
    if (p.skip > 0) {
      const who = this.name(seat), left = p.skip - 1, cause = this.waitCause[seat];
      this.story(seat, { title: MOMENTS.wait.title, text: cause ? `${who} landed on <b>${cause}</b>, which says “miss turns”. So ${who} skips this turn.` : fill(MOMENTS.wait.text, { p: who }), art: artFor("big-clock", "Waiting") },
        left > 0 ? `${left} more turn${left > 1 ? "s" : ""} to wait after this one.` : `Next turn ${who} plays again.`);
      if (comp) await this.wait(1400); else await this.ask([{ label: "OK, skip this turn", value: "ok" }]);
    } else if (comp) {
      await this.wait(800);
    } else {
      this.dice.ready(true);
      await Promise.race([this.ask([{ label: "Roll the die", value: "roll" }]), this.dice.tapped()]);
      this.dice.ready(false);
    }
    this.setAct([]);
    this.overview.setReach(null);

    const t = this.game.turn();
    let shown = this.game.events.length, r = t.next(), rolls: number[] = [], sum = 0;
    for (;;) {
      const fresh = this.game.events.slice(shown);
      shown = this.game.events.length;
      for (const e of fresh) {
        if (e.type === "tile") sum = e.tile.type === "rollSum" ? e.tile.dice ?? 0 : e.tile.type === "extraRoll" ? -1 : 0;
        if (e.type === "move" || e.type === "jump") { rolls = []; if (e.type === "move") sum = 0; }
        // A person throws every die themselves (owner): after a 6, and on "throw 3 times".
        if (e.type === "roll" && !comp && e.player === seat && (rolls.length || sum)) await this.rollAgain(rolls, sum);
        await this.play(e);
        if (e.type === "roll") rolls.push(e.value);
        const after = fresh.slice(fresh.indexOf(e) + 1);
        if (e.type === "roll" && e.value === 6 && sum <= 0 && !comp && e.player === seat && after[0]?.type !== "released" && after.some((x) => x.type === "roll" && x.player === seat)) this.sixParty(seat);
        this.collect(e);
      }
      if (r.done) break;
      // decide() answers for computer players itself; a person may be asked in a computer's turn too (audit: a person
      // holding a Bonus card was never offered to spoil a computer player's luck)
      const a = await this.decide(r.value);
      this.answers.push(a);
      r = t.next(a);
    }
    this.turns++;
    this.save();
    this.render();
    if (this.game.over) return;
    await this.wait(300);
    // Pass the die only from one person to another (owner): computer players just play, and a person's own turn
    // starts with "Roll the die".
    const next = this.nextSeat(seat);
    if (comp || next === seat || this.setup.computer[next]) await this.wait(comp ? 1300 : 2200);
    else await this.ask([{ label: `Pass the die to ${PLAYERS[next].name} ▶`, value: "ok" }]); // a label is plain text
    this.setAct([]);
  }

  /** Journey postcards (GCD §12): a person earns one the first time on this device; a stamp on the square says so. */
  private collect(e: GameEvent): void {
    for (const c of postcardsFor(this.board, e, (seat) => !this.setup.computer[seat])) {
      if (this.album.has(c.id)) continue;
      this.album.add(c.id);
      this.newCards.push(c);
      saveAlbum(this.album);
      this.stage.stamp("good", "New postcard!"); // waits for the square's own stamp
    }
  }

  /** A person's choice (R21: the road, the bonus card), in a popup. */
  private async decide(d: Decision): Promise<Answer> {
    if (this.setup.computer[d.player]) return simplePlayer(d, this.game);
    if (d.kind === "bonusAttack" && !this.spoil.asks(d.player)) return false;
    const v = await this.choose(d);
    this.pops.clear();
    if (d.kind === "bonusAttack") return this.spoil.answer(d.player, v);
    return v === "yes";
  }

  /** A 6 for a person: a popup and a stamp, then they roll again themselves. */
  private sixParty(seat: number): void {
    this.stage.celebrate("good");
    this.stage.stamp("good", "A six!");
    this.story(seat, { title: "A 6!", text: "Lucky you: a 6 always gives you one more throw, and the throws add up. Roll again!", art: artFor("lanterns", "A six") }, "Three 6s in a row win a lantern.", "good");
  }

  /** Waits for a person to throw the next die of this turn. */
  private async rollAgain(rolls: number[], sum: number): Promise<void> {
    const label = sum > 0 ? `Throw ${rolls.length + 1} of ${sum}` : "Roll again";
    this.dice.ready(true);
    await Promise.race([this.ask([{ label, value: "roll", primary: true }]), this.dice.tapped()]);
    this.dice.ready(false);
    this.setAct([]);
  }

  /** The choice: the popup explains it, the big buttons wait in the action area. */
  private choose(d: Decision): Promise<string> {
    const who = this.name(d.player);
    switch (d.kind) {
      case "road": return Promise.resolve("main"); // never asked: the boards have no Shortcut (owner, 15 Oct; C2)
      case "bonusDefend": {
        const tl = this.taleAt(d.square, d.tile);
        void this.pops.show({
          kind: "choice", tone: "bad", art: cardFace("bonus", "Bonus card"), kicker: `${who} · ${tl.title}`,
          title: "Use your Bonus card?", text: `The card makes this bad luck slide right off. You only have it once.`,
          outcome: `Without the card: ${outcome(this.board, d.tile)}`,
        });
        return this.ask([{ label: "Use the card: dodge it!", value: "yes", primary: true }, { label: "Keep the card", value: "no" }]);
      }
      case "bonusAttack": {
        const tl = this.taleAt(d.square, d.tile), them = this.name(d.target);
        void this.pops.show({
          kind: "choice", tone: "good", art: cardFace("bonus", "Bonus card"), kicker: `${who} · Bonus card`,
          title: `Spoil ${them}'s luck?`, text: `${them} just landed on <b>${tl.title}</b>. Your Bonus card can cancel it. You only have it once.`,
          outcome: `If you let it go: ${them} gets "${outcome(this.board, d.tile)}"`,
        });
        return this.ask([{ label: "Spoil it!", value: "yes", primary: true }, { label: "Let it go", value: "no" }, { label: "Don't ask me again this game", value: "never" }]);
      }
    }
  }

  // ---- Showing one engine event ----

  private async play(e: GameEvent): Promise<void> {
    const st = this.stage, M = MOMENTS;
    switch (e.type) {
      case "round": this.round = e.round; this.render(); break;
      case "roadblockPlaced": this.overview.setRoadblock(e.square); break;
      case "roadblockRemoved": this.overview.setRoadblock(null); break;
      case "roll": await this.dice.roll(e.value); break;
      case "skipTurn": await this.wait(500); break;
      case "noSix":
        this.story(e.player, { ...(e.where === "start" ? M.porch : M.stones), art: artFor(e.where === "start" ? "steps" : "boot-in-mud", "No 6") }, `Throw ${e.tries} of 3 without a 6.`);
        await this.wait(900);
        break;
      case "released": {
        if (e.where === "start") { this.places[e.player] = START; st.show(e.player, START); this.overview.setPlace(e.player, START); }
        if (e.bySix) this.dice.released(e.where); // R15: the 6 that lets you in (or out of the Bog) moves nobody
        this.render();
        if (e.bySix) st.celebrate("good");
        if (e.bySix) st.stamp("good", e.where === "start" ? "A six!" : "Free!");
        this.story(e.player, { ...(e.bySix ? (e.where === "start" ? M.leaveHome : M.leaveBog) : M.thirdThrow), art: artFor(e.where === "start" ? "house" : "boot-in-mud", "Leaving") }, "", "good");
        await this.wait(900);
        break;
      }
      case "move":
        await st.walk(e.path.map((s) => s.pos), (pos) => { this.places[e.player] = pos; this.overview.setPlace(e.player, pos); });
        this.arrived(e.from, e.to);
        this.dice.moved();
        break;
      case "overshoot": {
        const need = this.board.endTile - this.places[e.player];
        this.story(e.player, { ...M.overshoot, art: artFor("lanterns", "Festival"), text: fill(M.overshoot.text, { n: need }) },
          `Rolled ${e.squares}, needed exactly ${need}: you stay where you are.${need === 6 ? " A 6 can never finish: a 6 always throws again, so the total is at least 7." : ""}`, "bad");
        await this.wait(1100);
        break;
      }
      case "tile": {
        const tl = this.taleAt(e.square, e.tile), tone = e.tile.cat === "R" ? "good" : "bad";
        st.pulse();
        st.celebrate(tone);
        st.stamp(tone);
        this.noteWait(e);
        this.story(e.player, { ...tl, art: this.pic(taleOf(this.board, e.square)?.icon ?? "card", tl.title) }, outcome(this.board, e.tile), tone);
        await this.wait(1700);
        break;
      }
      case "jump":
        await st.fly(e.to);
        this.places[e.player] = e.to;
        this.overview.setPlace(e.player, e.to);
        this.arrived(e.from, e.to);
        await this.wait(400);
        break;
      case "capture":
        this.places[e.victim] = START;
        this.overview.setPlace(e.victim, START);
        st.celebrate("bump");
        st.stamp("bad", "Bump!");
        this.story(e.player, { title: M.capture.title, text: fill(M.capture.text, { p: this.name(e.player), o: this.name(e.victim) }), art: this.twoTokens(e.player, e.victim) }, `${this.name(e.victim)} goes back to Start.`, "bad");
        this.render();
        await this.wait(1400);
        break;
      case "roadblockHit": st.celebrate("bad"); this.story(e.player, { ...M.tree, art: artFor("fallen-tree", "Fallen tree") }, "Back 10 squares.", "bad"); await this.wait(1300); break;
      case "trapped": if (this.told[0]?.outcome?.includes("Stuck")) break; // the square already said so
        this.story(e.player, { ...M.bogged, art: artFor("boot-in-mud", "The Bog") }, "Only a 6 gets you out.", "bad"); await this.wait(1100); break;
      case "bogBoots": st.celebrate("good"); st.stamp("good", "Not today, Bog!");
        this.story(e.player, { ...M.boots, art: cardFace("jailPass", "Bog boots") }, "The boots are worn out now.", "good"); this.render(); await this.wait(1300); break;
      case "card": this.render(); await this.wait(300); break;
      case "bonusUsed": {
        const m = e.use === "defend" ? M.bonusDefend : M.bonusAttack;
        st.cardPlayed();
        st.stamp(e.use === "defend" ? "good" : "bad", e.use === "defend" ? "Dodged it!" : "Spoiled!");
        this.story(e.player, { title: m.title, text: fill(m.text, { p: this.name(e.player), o: this.name(e.target) }), art: cardFace("bonus", "Bonus card") }, "The Bonus card is used up.", e.use === "defend" ? "good" : "bad");
        this.render();
        await this.wait(1500);
        break;
      }
      case "doubleNext": this.render(); break;
      case "snakeLeader": this.render(); st.stamp("good", "Snake Leader!");
        this.story(e.player, { ...M.snakeLeader, text: fill(M.snakeLeader.text, { p: this.name(e.player) }), art: cardFace("snakeLeader", "Snake Leader") }, "You hold the Snake Leader card.", "good"); await this.wait(1200); break;
      case "swap": {
        const mine = this.places[e.player];
        this.places[e.other] = mine;
        this.overview.setPlace(e.other, mine);
        this.story(e.player, { title: M.swap.title, text: fill(M.swap.text, { p: this.name(e.player), o: this.name(e.other) }), art: this.twoTokens(e.player, e.other) }, "", "good");
        await this.wait(900);
        break;
      }
      case "lanternLost":
        st.celebrate("bad");
        st.stamp("bad", e.left > 0 ? "Lights dim…" : "Last light!");
        this.story(e.player, { ...(e.left > 0 ? M.lanternLost : M.lanternNone), text: fill((e.left > 0 ? M.lanternLost : M.lanternNone).text, { p: this.name(e.player) }), art: artFor("lantern", "Lantern") }, `${e.left} lantern${e.left === 1 ? "" : "s"} left.`, "bad");
        this.render();
        await this.wait(1600);
        break;
      case "lanternWon": st.celebrate("good"); st.stamp("good", "Three sixes!");
        this.story(e.player, { ...M.lanternWon, text: fill(M.lanternWon.text, { p: this.name(e.player) }), art: artFor("lantern", "Lantern") }, `${e.total} lanterns now.`, "good"); this.render(); await this.wait(1400); break;
      case "out":
        this.places[e.player] = OUT;
        this.overview.setPlace(e.player, OUT);
        this.story(e.player, { ...M.out, text: fill(M.out.text, { p: this.name(e.player) }), art: artFor("lantern", "Lights out") }, "Out of the game.", "bad");
        this.render();
        await this.wait(1800);
        break;
      case "win": await this.wait(600); break;
      default: break;
    }
  }

  /** After a move: a sign for a new region, and everyone's avatar shows who needs an exact throw. */
  private arrived(from: Pos, to: Pos): void {
    const R = this.board.story.regions, at = (q: Pos) => (q >= 1 ? R.findIndex((r) => q >= r.from && q <= r.to) : -1);
    const a = at(from), b = at(to);
    if (b > 0 && b !== a) this.stage.sign(R[b].name);
    this.render();
  }

  // ---- Popups ----

  /** Remembers which square made a player miss turns (for the "skips this turn" popup). */
  private noteWait(e: GameEvent): void {
    if (e.type !== "tile") return;
    if (e.tile.type === "skip" || e.tile.type === "hospital" || e.tile.then === "hospital" || e.tile.then === "skip2")
      this.waitCause[e.player] = `${this.taleAt(e.square, e.tile).title} (square ${e.square})`;
  }

  /** A square's picture: the squares that give a card show that card's face. */
  private pic(icon: string, title: string): string {
    return icon === "card" ? cardFace("bonus", title) : icon === "boots" ? cardFace("jailPass", title) : artFor(icon, title);
  }

  private taleAt(pos: Pos, tile: Tile): Tale {
    return taleOf(this.board, pos)?.tale ?? { title: "On the road", text: esc(tile.story ?? tile.text) };
  }

  /** A story moment, in a popup (only the newest one: owner, no list of earlier moments). */
  private story(seat: number, t: Tale & { art?: string }, result = "", tone: "good" | "bad" | "" = ""): void {
    const c: PopupContent = { title: t.title, text: t.text, art: t.art, outcome: result || undefined, tone, kicker: `${tokenSvg(seat, "kick", true)}${this.name(seat)}` };
    this.told.unshift(c);
    void this.pops.show(c);
  }

  private twoTokens(a: number, b: number): string {
    return `<div class="two">${tokenSvg(a, "tok", true)}${tokenSvg(b, "tok", true)}</div>`;
  }

  private squareInfo(pos: Pos): void {
    const B = this.board, steps = this.stepsTo(this.places[this.seat], pos);
    const kicker = pos === 0 ? "Start" : pos === B.endTile ? "The end of the road" : `Square ${pos}`;
    // a 6 always throws again, so one throw stops 1–5 squares ahead, never 6 (audit, 15 Oct)
    const reach = steps !== null && steps >= 1 && steps <= 5 ? `${this.name(this.seat)} gets here with a ${steps}.` : steps !== null && steps > 5 ? `${steps} squares ahead of ${this.name(this.seat)}.` : "";
    const x = taleOf(B, pos);
    let c: PopupContent;
    if (x) c = { title: x.tale.title, text: x.tale.text, art: this.pic(x.icon, x.tale.title), outcome: outcome(B, x.tile), tone: x.tile.cat === "R" ? "good" : "bad" };
    else if (pos === 0) c = { ...MOMENTS.home, title: "Home & Start", art: artFor("house", "Home"), outcome: "Roll a 6 to leave Home. No 6 in three throws: a lantern goes out, and you set off anyway with that third throw." };
    else if (pos === B.endTile) c = { ...MOMENTS.end, art: artFor("lanterns", "Festival"), outcome: "You need the exact number to get in. Too much, and you stay where you are. A 6 can never land here exactly: a 6 always throws again and adds up." };
    else {
      const lm = B.story.landmarks[pos], region = B.story.regions.find((r) => pos >= r.from && pos <= r.to)?.name ?? "";
      c = lm ? { title: esc(lm.name), text: `A landmark of the ${esc(region)}. Nothing happens here: enjoy the view.`, art: artFor(lm.icon, lm.name) }
        : { title: esc(region) || "The road", text: "A quiet stretch of road. Nothing happens here, unless someone else lands on you." };
    }
    void this.pops.show({ ...c, kind: "info", kicker, outcome: [c.outcome, reach].filter(Boolean).join(" ") || undefined });
  }

  /** Squares from `from` to `to` along the road, or null if `to` is behind. */
  private stepsTo(from: Pos, to: Pos): number | null {
    if (from === OFF || from === OUT) return null;
    return to > from ? to - from : null;
  }

  private cardInfo(k: keyof typeof CARD_INFO): void {
    const c = CARD_INFO[k], p = this.game.players[this.seat];
    const n = k === "bonus" ? p.bonus : k === "jailPass" ? p.jailPass : Number(p.snakeLeader);
    const where = (cat: "card" | "boots") => Object.entries(this.board.tiles).filter(([, t]) => t.icon === cat).map(([q]) => q).join(", ");
    const have = n ? `${this.name(this.seat)} holds ${n === 1 ? "this card" : `${n} of these`}.` : k === "snakeLeader" ? "" : `${this.name(this.seat)} doesn't have one yet. Land on square ${where(k === "bonus" ? "card" : "boots")} to get it.`;
    void this.pops.show({ kind: "info", title: c.title, text: c.text, art: cardFace(k, c.title), kicker: "Card", outcome: have || undefined, tone: n ? "good" : "" });
  }

  private playerInfo(seat: number): void {
    const p = this.game.players[seat], B = this.board, lines: string[] = [];
    const pos = this.places[seat];
    const where = p.out ? "Out of the game." : pos === OFF ? "At Home: needs a 6 to set off." : p.trapped ? "Stuck in the Bog: needs a 6." : pos === 0 ? "On Start."
      : `On square ${pos}: ${B.endTile - pos} squares to the festival.`;
    lines.push(where);
    lines.push(`${lanternSvg.replace("<svg", '<svg class="inl"')} ${p.lanterns} lantern${p.lanterns === 1 ? "" : "s"}${p.lanterns === 0 ? ": one more slip and it's over" : ""}.`);
    if (p.bonus) lines.push(`<b>Bonus card${p.bonus > 1 ? ` ×${p.bonus}` : ""}</b>: cancel a punishment for yourself, or cancel a reward for another player. Once.`);
    if (p.jailPass) lines.push(`<b>Bog boots</b>: walk through the Bog once.`);
    if (p.snakeLeader) lines.push(`<b>Snake Leader</b>: beware the very last square.`);
    if (p.skip) lines.push(`Waits ${p.skip} more turn${p.skip > 1 ? "s" : ""}.`);
    if (p.double) lines.push(`Next throw counts double.`);
    if (p.slow) lines.push(`Next turn: moves exactly 1 square.`);
    lines.push(this.tip(seat));
    void this.pops.show({
      kind: "info", kicker: this.setup.computer[seat] ? "Computer player" : "Player", title: this.name(seat),
      art: `<div class="one">${tokenSvg(seat, "tok", true)}</div>`, text: lines.filter(Boolean).map((l) => `<span class="line">${l}</span>`).join(""),
    });
  }

  /** A recommendation: what the next throw can bring. */
  private tip(seat: number): string {
    const p = this.game.players[seat], pos = this.places[seat], B = this.board;
    if (p.out) return "";
    if (pos === OFF || p.trapped) return "Tip: only a 6 will do. Three misses cost a lantern.";
    const toEnd = B.endTile - pos;
    if (p.slow) return toEnd === 1 ? "Tip: next turn moves exactly 1 square: straight into the festival." : "Tip: next turn moves exactly 1 square, whatever the die shows.";
    const fin = this.finish(p, toEnd);
    if (fin) return `Tip: ${fin}`;
    const notes: string[] = [];
    for (const { face, steps } of reachSteps(p.double)) {
      const sq = pos + steps, t = B.tiles[sq];
      if (sq < B.endTile && t && !(t.requires && !p.snakeLeader)) notes.push(`a ${face} ${t.cat === "R" ? "▲" : "▼"} ${taleOf(B, sq)?.tale.title ?? ""}`);
    }
    const dbl = p.double ? " (the throw counts double)" : "";
    return notes.length ? `Next throw${dbl}: ${notes.join("; ")}. A 6 throws again.` : `Next throw${dbl}: nothing special within reach. Enjoy the road.`;
  }

  // ---- The action button, the player row, the current player's things ----

  private setAct(options: { label: string; value: string; primary?: boolean }[]): Promise<string> {
    return new Promise((done) => {
      this.act.replaceChildren(...options.map((o) => {
        const b = document.createElement("button");
        b.textContent = o.label;
        b.className = o.primary || options.length === 1 ? "primary big" : "big";
        b.addEventListener("click", () => { this.act.replaceChildren(); done(o.value); }, { once: true });
        return b;
      }));
    });
  }

  private ask(options: { label: string; value: string; primary?: boolean }[]): Promise<string> {
    return this.setAct(options);
  }

  /** Squares to the festival when they need an exact throw of 1–5 (shown to everyone on the avatar), else 0. */
  private need(seat: number): number {
    const p = this.game.players[seat], pos = this.places[seat], d = this.board.endTile - pos;
    return p.out || pos < 1 || p.trapped ? 0 : d >= 1 && d <= 5 ? d : 0;
  }

  /** One line under "Blue's turn" that says what this turn is about, in plain words. */
  private guide(seat: number): string {
    const p = this.game.players[seat], pos = this.places[seat], d = this.board.endTile - pos;
    if (p.out) return "Out of the game.";
    if (p.skip > 0) return `Waits this turn${this.waitCause[seat] ? ` (${this.waitCause[seat]})` : ""}.`;
    if (pos === OFF) return `At Home: roll a 6 to enter the board (throw ${p.tries + 1} of 3).`;
    if (p.trapped) return `Stuck in the Bog: only a 6 gets you out (throw ${p.tries + 1} of 3).`;
    if (p.slow) return "Puddle: this turn you move exactly 1 square, whatever you roll.";
    const extra = p.double ? " Your throw counts double this turn." : "";
    if (p.double) { // a doubled throw needs half the squares (audit: "needs exactly 3" with a double meant 6 squares)
      const fin = this.finish(p, d);
      return fin ? fin.charAt(0).toUpperCase() + fin.slice(1) : extra.trim();
    }
    if (d >= 1 && d <= 5) return `Needs exactly ${d} to reach the festival.`;
    if (d === 6) return "6 squares to go, but a 6 can't win (it throws again). Get closer first.";
    return "";
  }

  /** What reaches the festival from `d` squares away with the next throw (doubled or not); "" when it is far. */
  private finish(p: PlayerState, d: number): string {
    if (p.double) {
      if (d < 1 || d > 11) return "";
      return d % 2 === 0 && d <= 10 ? `your throw counts double: exactly a ${d / 2} reaches the festival.` : `your throw counts double, so no throw lands exactly on the festival this turn (${d} squares to go).`;
    }
    if (d >= 1 && d <= 5) return `exactly a ${d} reaches the festival.`;
    if (d === 6) return "6 squares to go, but a 6 can't win: it always throws again, so the total is 7 or more. Get closer first.";
    return "";
  }

  /** What the bar, the turn line and the hand show now: drawn again only when it changes (P2). */
  private drawn = { bar: "", who: "", hand: "" };

  private render(): void {
    const P = this.game.players, cur = this.seat;
    const bar = `<div class="avs">` + P.map((p, i) => `<button class="avatar${i === cur ? " now" : ""}${p.out ? " gone" : ""}" data-seat="${i}" aria-label="${this.name(i)}${this.setup.computer[i] ? " (computer)" : ""}: ${p.lanterns} lanterns${p.bonus ? `, ${p.bonus} Bonus card` : ""}. Tap for details">`
      + `${tokenSvg(i, "tok", true)}<span class="badge l">${lanternSvg}${p.out ? "✕" : p.lanterns}</span>`
      + (p.bonus || p.jailPass ? `<span class="badge c">${artFor(p.bonus ? "card" : "boots", "")}${p.bonus + p.jailPass}</span>` : "")
      + (this.setup.computer[i] ? `<span class="cpu" aria-hidden="true">${robotSvg}</span>` : "")
      + (this.need(i) ? `<span class="need" aria-hidden="true">needs ${this.need(i)}</span>` : "") + `</button>`).join("")
      + `</div><button class="leave" aria-label="Leave game">${leaveSvg}<span>Leave</span></button>`;
    const p: PlayerState = P[cur];
    // The cards: always both slots, so everyone knows what exists; the ones held glow and can be tapped.
    const slot = (k: keyof typeof CARD_INFO, n: number) => `<button class="gcard ${k}${n ? " held" : ""}" data-card="${k}" aria-label="${CARD_INFO[k].title}: ${n ? `you hold ${n}` : "not held"}. Tap to see what it does">`
      + `${cardFace(k, CARD_INFO[k].title)}${n > 1 ? `<span class="gc-n">×${n}</span>` : ""}</button>`;
    const status = this.guide(cur);
    const who = `${tokenSvg(cur, "tok", true)}<div><b>${this.name(cur)}'s turn</b>${this.round ? `<span class="st">Round ${this.round}</span>` : ""}${status ? `<span class="st guide">${status}</span>` : ""}</div>`;
    const hand = `${slot("bonus", p.bonus)}${slot("jailPass", p.jailPass)}${p.snakeLeader ? slot("snakeLeader", 1) : ""}`;
    if (!this.hud.firstElementChild) this.hud.innerHTML = `<div class="who"></div><div class="hand"></div>`;
    if (bar !== this.drawn.bar) this.bar.innerHTML = this.drawn.bar = bar;
    if (who !== this.drawn.who) this.hud.firstElementChild!.innerHTML = this.drawn.who = who;
    if (hand !== this.drawn.hand) this.hud.lastElementChild!.innerHTML = this.drawn.hand = hand;
  }
}
