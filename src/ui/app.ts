// The game screen (owner's design, 14–15 Oct; Step I phase C4, owner 25–26 Nov 2026). The whole board is the info
// area (tap a square to see what it does). The stage beside it (below it on phones held upright) shows the square,
// the token and the die; its action area holds only "Roll die". Two channels tell what happens:
// - Mr. Lin's panel (guide-panel.ts) covers the stage and the die after the pieces stop: his story of a person's turn
//   and every choice, with buttons that name their action. Robots get no panel, and he never tells their story.
// - The notifications (notes.ts) on the left: short facts for everyone, from the destination file's approved patterns.
// No square numbers anywhere, except the "→ 24" label on the zoomed square; the screen-reader labels keep them.
// All rules come from the engine (src/engine/v3): this file only shows its events, in order, and answers its questions.
import { DESTINATIONS, robot, type Answer3, type Board3, type Decision3, type Event3, type Game3, type Player3 } from "../engine/v3";
import { randomSeed } from "../engine/rng";
import { artFor } from "../render/art";
import { esc } from "../render/html";
import { cardFace } from "../render/art-modern";
import { inApp } from "./android";
import { Dice } from "./dice";
import { GuidePanel, type GuideButton, type GuideContent } from "./guide-panel";
import { Notes } from "./notes";
import { Overview } from "./overview";
import { PLAYERS, tokenSvg } from "./players";
import { Popups, type PopupContent } from "./popup";
import { sound } from "./sound";
import { switchIcon } from "./sound-switch";
import { Stage } from "./stage";
import { WinClock } from "./clock";
import { addRecord, recordOf } from "./records";
import { RT, rankingLine, showRecords } from "./records-page";
import { POSTCARDS, loadAlbum, postcardsFor, saveAlbum, showAlbum, type Postcard } from "./postcards";
import { clearGame, newGame, replay, saveGame, type DestinationId, type SavedGame } from "./save";
import { TIPS, Tips, type TipId } from "./tips";
import { standingWords } from "./standing";
import { boatNeed, finishFace, needTag, needsSix, plainThrow, reachFace } from "./turn-info";

export interface Setup {
  players: number;
  /** true = robot (GCD §8.6) for that seat. */
  computer: boolean[];
}

const DEST: DestinationId = "lantern-festival";

// `?fast` in the address fast-forwards whole games, for testing: only in development and in the browser-test build
// (`vite build --mode browsertest`), never in the published game (S4). "Reduce motion" only stops the animations.
const fast = import.meta.env.MODE !== "production" && new URLSearchParams(location.search).has("fast");
/** Leaving a game in the middle of a turn: whatever was still running stops here, quietly. */
const STOP = new Promise<never>(() => {});
/** A robot's badge on the avatar (owner, Step 7: a robot instead of "CPU"). */
const robotSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6V3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="2.6" r="1.7" fill="currentColor"/><rect x="4.5" y="6" width="15" height="13" rx="4" fill="currentColor"/><rect x="2" y="10" width="2" height="5" rx="1" fill="currentColor"/><rect x="20" y="10" width="2" height="5" rx="1" fill="currentColor"/><circle cx="9.2" cy="11.6" r="1.9" fill="var(--ink)"/><circle cx="14.8" cy="11.6" r="1.9" fill="var(--ink)"/><rect x="9" y="15.2" width="6" height="1.7" rx=".85" fill="var(--ink)"/></svg>`;
const leaveSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5M14 8l-4 4 4 4M10 12h10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---- Texts approved by the owner in phase C2 (26 Nov 2026), word for word ----
const T = {
  // A1, A2 (owner, 26 Nov 2026: Mr. Lin's own words, not a plain question)
  homeQ: "To begin your journey, you may leave your fate to luck and hope to roll a 6. Or will you take your journey's fate into your own hands and use a Bonus card?",
  treeQ: "The fallen tree blocks the path. You may leave it to luck and hope to roll a 6, or take your journey into your own hands and use a Bonus card to get past it.",
  cancelQ: "Use your Bonus card to cancel this?", // A3, A4
  without: "Without the card:", // A3
  giveQ: "Who receives your Bonus card?", // A5
  takeQ: "Whose Bonus card do you take?", // A6
  rest: "Rest for now. The road will still be there tomorrow.", // A8
  useCard: "Use Bonus card", noCard: "No Bonus card this turn", keepCard: "Keep my card", letsGo: "Let's go", skip: "Skip this turn",
  give: (q: string) => `Give it to ${q}`, take: (q: string) => `Take ${q}'s card`, pass: (q: string) => `Pass the die to ${q} ▶`,
  roll: "Roll die", rollAgain: "Roll again", // B1
  cardHome: "{p} uses a Bonus card to leave Home.", // C1
  cardTree: "{p} uses a Bonus card to pass the tree.", // C2
  tooFar: "{p} needs exactly {n} to finish.", // C4
  boatWin: "{p} rolls the 4 and steps ashore!", // C5
  marketNone: "Nobody has a Bonus card to trade.", // C6
  squareBox: { plain: "A quiet stretch of road. Nothing happens here, unless someone else lands on you.", landmark: "A landmark of the {a}. Nothing happens here: enjoy the view." }, // D8
  homeBox: "Roll a 6 to set off, or use your Bonus card. After a bump, no 6 is needed.", // D9
  endBox: "You need the exact number to get in. Too much, and you stay where you are. A 6 never lands here: it rolls again.", // D10
  cardBox: { title: "Bonus card", text: "Leave Home or pass the fallen tree without a 6, or cancel your own bad luck. One use per card.", hold: (n: number) => `You hold ${n}.` }, // D11
  player: "Player", robot: "Computer player", // D12
  where: {
    home: "At Home: needs a 6 to set off.", homeFree: "At Home: no 6 needed.", tree: "Stuck at the fallen tree: needs a 6.",
    toGo: (n: number) => `${n} squares to the festival.`,
    cards: (n: number) => `Bonus cards: ${n}.`, skip: (n: number) => `Misses ${n} more turn${n > 1 ? "s" : ""}.`, double: "Next roll counts double.",
    slow: "Next move: exactly 1 square.", back: "Next move goes backward.", boat: (n: number) => `On the Dragon Boat: needs exactly ${n}.`,
    finish: (n: number) => `Needs exactly ${n} to finish.`,
  }, // D12, D13
  win: { title: "{p} made it!", newGame: "New game", album: "Postcard album" }, // D6
  sixes: "Sixes!", // D14
  understand: "I understand", // owner, Step I phase F: closes Mr. Lin's stories and tips
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export class GameScreen {
  private readonly game: Game3;
  private readonly board: Board3;
  private readonly overview: Overview;
  private readonly stage: Stage;
  private readonly dice: Dice;
  private readonly pops: Popups;
  private readonly guide: GuidePanel;
  private readonly notes: Notes;
  private readonly bar: HTMLElement;
  private readonly hud: HTMLElement;
  private readonly act: HTMLElement;
  private round = 0;
  private seat = 0;
  /** Postcards collected on this device, and the new ones from this game (GCD §12). */
  private readonly album = loadAlbum();
  private readonly newCards: Postcard[] = [];
  /** Where each token is shown, and each player's cards as shown (both follow the events, behind the engine). */
  private readonly places: number[];
  private readonly cards: number[];
  /** Mr. Lin told this person about Home in this stay (the first turn only: A1). */
  private readonly homeTold: boolean[];
  /** Mr. Lin said "the tree is still there" in this stay at the tree (once only: audit, C4). */
  private readonly treeTold: boolean[];
  /** What decides this game (U1: saved after every turn, so it can be continued). */
  private readonly seed: number;
  private readonly answers: Answer3[] = [];
  private turns = 0;
  private readonly resumed: boolean;
  /** The win clock (phase E): one per person, void after any interruption; a continued game is never timed. */
  private readonly clock: WinClock;
  /** Mr. Lin's tips (phase F): once per device, to people only, at most one per turn. */
  private readonly tips = new Tips();
  /** The winner's time in ms when it counts for the Records, else null. */
  winTime: number | null = null;
  /** The players left this game (U2): nothing more happens on this screen. */
  private gone = false;
  /** The area effect of the step on screen (Big City's lost turn is told as such). */
  private areaFx = "";
  /** Skipping Stones' three rolls are on screen: a 6 there rolls nothing more (audit, B3). */
  private stones = false;
  /** Mr. Lin has just told a person what the square does: its notification is not repeated (owner, 27 Nov 2026). */
  private toldSquare = false;
  /** Stops listening to the sound switch when the screen goes (audit, B10). */
  private readonly offSound: () => void;

  /** `resume`: a saved game to continue (U1); without it a new game, with a random first player (U3). */
  constructor(root: HTMLElement, private readonly setup: Setup, private readonly onExit: (again: boolean) => void, resume?: SavedGame) {
    const { players, computer } = setup;
    this.board = DESTINATIONS[DEST];
    const again = resume ? replay(resume) : null;
    this.resumed = !!again;
    this.clock = new WinClock(computer.slice(0, players).map((c) => !c), !this.resumed);
    if (again && resume) {
      this.seed = resume.seed;
      this.game = again;
      this.answers.push(...resume.answers);
      this.turns = resume.turns;
      this.newCards.push(...POSTCARDS.filter((c) => resume.cards.includes(c.id)));
    } else {
      this.seed = randomSeed();
      this.game = newGame(DEST, players, computer, this.seed, Math.floor(Math.random() * players));
    }
    root.innerHTML = `
      <div class="game">
        <h1 class="sr">Don't Get Mad!: the game</h1>
        <nav class="players" aria-label="Players"></nav>
        <section class="overview" aria-label="The whole board"></section>
        <section class="stage-panel">
          <div class="hud"></div>
          <div class="stage"></div>
          <div class="controls"><div class="dice"></div><div class="act"></div><button class="snd-open" aria-label="Sound and music"></button></div>
        </section>
      </div>`;
    const ov = root.querySelector<HTMLElement>(".overview")!;
    this.overview = new Overview(ov, this.board, players, (pos) => this.squareInfo(pos));
    this.notes = new Notes(ov); // under the popups (made after it, they lie on top)
    this.pops = new Popups(ov, root.querySelector(".game")!, root.querySelector(".controls")!);
    this.stage = new Stage(root.querySelector(".stage")!, this.board);
    this.guide = new GuidePanel(root.querySelector(".stage-panel")!, this.board.guide?.name ?? "", root.querySelector<HTMLElement>(".game")!);
    this.dice = new Dice(root.querySelector(".dice")!);
    this.bar = root.querySelector(".players")!;
    this.hud = root.querySelector(".hud")!;
    this.act = root.querySelector(".act")!;
    this.places = this.game.players.map((p) => p.pos);
    this.cards = this.game.players.map((p) => p.cards);
    this.homeTold = this.game.players.map(() => false);
    this.treeTold = this.game.players.map(() => false);
    this.places.forEach((pos, i) => this.overview.setPlace(i, pos));
    this.bar.addEventListener("click", (e) => {
      if ((e.target as Element).closest(".leave")) return void this.leave();
      const b = (e.target as Element).closest<HTMLElement>("[data-seat]");
      if (b) this.playerInfo(Number(b.dataset.seat));
    });
    // U7: the speaker beside the die opens the two sound switches
    const sndBtn = root.querySelector<HTMLButtonElement>(".snd-open")!;
    const showSnd = () => { sndBtn.innerHTML = switchIcon("fx", sound.settings.fx || sound.settings.music); };
    showSnd();
    this.offSound = sound.onChange(showSnd);
    sndBtn.addEventListener("click", () => void this.soundSwitches());
    sound.music("game");
    this.hud.addEventListener("click", (e) => { if ((e.target as Element).closest("[data-card]")) this.cardInfo(); });
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

  private person(seat: number): boolean {
    return !this.setup.computer[seat];
  }

  /** A pattern filled in: {p} the player, {q} the other player, {n} a distance (names escaped, S3). */
  private fill(s: string, p?: number, q?: number, n?: number): string {
    return s.replace(/\{p\}/g, p === undefined ? "" : this.name(p)).replace(/\{q\}/g, q === undefined ? "" : this.name(q)).replace(/\{n\}/g, n === undefined ? "" : String(n))
      .replace(/\b1 squares\b/g, "1 square"); // "back 1 square", not "back 1 squares" (audit, C1)
  }

  private note(key: string, seat: number, tone: "good" | "bad" | "" = "", q?: number, n?: number): void {
    const s = this.board.notes?.[key];
    if (s) this.notes.push(seat, this.fill(s, seat, q, n), tone);
  }

  private async run(): Promise<void> {
    const people = this.setup.computer.some((c) => !c);
    if (this.resumed) {
      const next = this.game.next;
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
      // Mr. Lin's welcome (Home Town's announcement), for the people at the table
      const welcome = this.board.areas[0]?.announce;
      if (people && welcome) { sound.play("lantern-out"); await this.talk({ text: esc(welcome), art: artFor(this.board.destination?.icon ?? "lanterns", ""), buttons: [{ label: T.letsGo, value: "ok", primary: true }] }); }
    }
    while (!this.game.over) await this.turn();
    if (this.gone) return;
    clearGame();
    const w = this.game.winner;
    this.overview.setReach(null);
    this.guide.close();
    this.notes.clear();
    sound.music(null);
    sound.play(w === null ? "out" : "win");
    if (w !== null) { this.overview.setCurrent(w); this.stage.celebrate("win"); this.stage.stamp("good", "Champion!"); }
    this.setAct([]);
    const finish = this.board.moments?.finish?.guide;
    const dest = this.board.destination?.name ?? "";
    const cards = this.newCards.length ? `<p class="pop-sub">New postcard${this.newCards.length > 1 ? "s" : ""}: <b>${this.newCards.map((c) => esc(c.title)).join(", ")}</b></p>` : "";
    const ranking = this.recordLine(w);
    let again: string;
    for (;;) {
      again = await this.pops.show({
        kind: "win", tone: "good", art: artFor(this.board.destination?.icon ?? "lanterns", dest), kicker: esc(dest),
        title: w === null ? esc(dest) : this.fill(T.win.title, w), text: w !== null && this.person(w) && finish ? this.fill(esc(finish), w) : undefined, more: ranking + cards || undefined,
        buttons: [{ label: T.win.newGame, value: "new", primary: true }, { label: T.win.album, value: "album" }, { label: RT.button, value: "records" }],
      });
      if (again === "album") await showAlbum();
      else if (again === "records") await showRecords();
      else break;
    }
    this.quit();
    this.onExit(false);
  }

  /** The game screen goes: nothing more is timed, shown or heard from it (audit, B10). */
  private quit(): void {
    this.clock.dispose();
    this.guide.close();
    this.guide.dispose();
    this.offSound();
  }

  /** Phase E: a person's win goes to the Records when its time counts (R8–R12); otherwise R13. A robot's win: nothing. */
  private recordLine(w: number | null): string {
    if (w === null || !this.person(w)) return "";
    if (this.winTime === null) return `<p class="pop-sub rec-line">${esc(rankingLine(null, 0))}</p>`;
    const rec = recordOf(this.winTime, w, this.setup.players, DEST);
    return `<p class="pop-sub rec-line">${esc(rankingLine(addRecord(rec), rec.s))}</p>`;
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
    this.stage.show(first, 0);
    this.stage.stamp("good", `${PLAYERS[first].name} starts!`); // plain text, not HTML
    await this.wait(900);
  }

  /** The round a turn of `seat` belongs to (the engine counts a round when the first player's turn starts). */
  private roundOf(seat: number): number {
    const n = this.game.players.length, rel = (s: number) => (s - this.game.first + n) % n;
    if (this.game.round === 0) return 1;
    return this.game.round + (rel(seat) <= rel(this.game.current) ? 1 : 0);
  }

  /** U7: the sound switches, in a popup; each tap switches one and shows the popup again with the new state. */
  private async soundSwitches(): Promise<void> {
    this.clock.interrupt(); // the settings are outside the game: the time is void (owner, phase E)
    for (;;) {
      const fx = sound.settings.fx, music = sound.settings.music;
      const v = await this.pops.show({
        kind: "info", kicker: "Settings", title: "Sound and music", art: `<div class="one snd-art">${switchIcon("fx", true)}</div>`,
        text: inApp() ? "Sound effects and quiet music under the game. Saved on this device." : "Sound effects and the buzz on phones, and quiet music under the game. Saved on this device.", // the app never vibrates (B4)
        buttons: [
          { label: `Sound effects: ${fx ? "on" : "off"}`, value: "fx", primary: fx },
          { label: `Music: ${music ? "on" : "off"}`, value: "music", primary: music },
          { label: "Done", value: "done" },
        ],
      });
      if (v === "fx") sound.set("fx", !fx);
      else if (v === "music") sound.set("music", !music);
      else return;
    }
  }

  /** U2: leave the game, after "Are you sure?". It stays saved, so "Continue game" brings it back. */
  private async leave(): Promise<void> {
    if (this.gone) return;
    this.clock.interrupt(); // "Leave game?" is outside the game, even with "Stay": the time is void (owner, phase E)
    const v = await this.pops.show({
      kind: "info", art: artFor("house", "Home"), kicker: "Leave game", title: "Leave this game?",
      text: this.game.over ? "Back to the start screen." : "The game is saved on this device: <b>Continue game</b> on the start screen brings you back to the start of this turn, with the same throws.",
      buttons: [{ label: "Leave", value: "leave", primary: true }, { label: "Stay", value: "stay" }],
    });
    if (v !== "leave" || this.gone) return;
    this.gone = true;
    this.quit();
    this.onExit(false);
  }

  /** U1: what decides the game so far, after every whole turn. */
  private save(): void {
    if (this.gone) return;
    if (this.game.over) return clearGame();
    saveGame({
      destination: DEST, players: this.setup.players, computer: this.setup.computer, seed: this.seed, first: this.game.first,
      answers: this.answers, turns: this.turns, cards: this.newCards.map((c) => c.id), round: this.roundOf(this.game.next),
    });
  }

  // ---- One turn ----

  private async turn(): Promise<void> {
    // the stamps of the last turn are seen before the next one starts, so none of them lands on the next player's
    // square (audit, C2)
    await this.wait(this.stage.busyFor());
    const seat = (this.seat = this.game.next), p = this.game.players[seat], me = this.person(seat);
    this.guide.close(); // a new turn starts with the die free
    this.overview.setCurrent(seat);
    this.overview.zoomOutAll();
    this.dice.clear();
    this.cards.splice(0, this.cards.length, ...this.game.players.map((q) => q.cards));
    const pl = this.places[seat];
    this.stage.show(seat, pl);
    this.round = this.roundOf(seat);
    this.render();
    this.overview.setReach(plainThrow(p, pl) ? pl : null, p.dbl); // a backward move has no faces ahead (audit, B5)
    this.tips.newTurn();
    if (me) await this.opening(seat, p);
    else await this.wait(800);
    // A quiet turn (Mr. Lin says nothing at its start): his tip, if one waits; the roll's button comes into his panel
    if (me && !(p.skip > 0 || p.boat || p.home || p.stuck || p.slow || pl <= 0)) {
      const d = this.board.endTile - pl, tip = this.tips.quiet(d >= 1 && d <= 6);
      if (tip) await this.story({ text: esc(tip), art: this.tipArt(tip) }); // it stays until "I understand"; then "Roll die" in the action area
    }

    this.areaFx = "";
    this.stones = false;
    this.toldSquare = false;
    const t = this.game.turn();
    let shown = this.game.events.length, r = t.next(), last = 0;
    for (;;) {
      const fresh = this.game.events.slice(shown);
      shown = this.game.events.length;
      for (let i = 0; i < fresh.length; i++) {
        const e = fresh[i];
        if (e.type === "roll" && me && e.player === seat) {
          const again = last === 6 && e.why !== "wait" && e.why !== "boat" && !this.stones; // Skipping Stones: a 6 rolls nothing more (B3)
          if (again && !this.guide.open) { const tip = this.tips.sixes(); if (tip) await this.story({ text: esc(tip), art: this.tipArt(tip) }); } // T1
          await this.rollTap(again ? T.rollAgain : T.roll);
          last = e.value;
        }
        if (e.type === "free" || e.type === "move") last = 0;
        await this.play(e, fresh.slice(i + 1), r.done ? null : r.value);
        this.collect(e);
      }
      if (r.done) break;
      const a = await this.decide(r.value);
      this.answers.push(a);
      r = t.next(a);
    }
    this.overview.setReach(null);
    // a bump or bad luck of this very turn: its tip now, never at a later turn (owner, 27 Nov 2026)
    if (me) { const tip = this.tips.endOfTurn(seat); if (tip) await this.story({ text: esc(tip), art: this.tipArt(tip) }); }
    this.turns++;
    this.save();
    this.render();
    if (this.game.over) return;
    await this.wait(300);
    // Pass the die only from one person to another (owner): robots just play, and a person's turn starts at once.
    const next = this.game.next;
    if (!me || next === seat || !this.person(next)) await this.wait(me ? 2200 : 1300);
    else await this.talk({ text: this.standing(seat), art: this.placeArt(seat), buttons: [{ label: T.pass(PLAYERS[next].name), value: "ok", primary: true }] }); // A9; a label is plain text
  }

  /** Journey postcards (GCD §12): a person earns one the first time on this device; a stamp on the square says so. */
  private collect(e: Event3): void {
    for (const c of postcardsFor(this.board, e, (seat) => this.person(seat))) {
      if (this.album.has(c.id)) continue;
      this.album.add(c.id);
      this.newCards.push(c);
      saveAlbum(this.album);
      this.stage.stamp("good", "New postcard!"); // waits for the square's own stamp
      sound.play("postcard");
    }
  }

  /** A person's turn before the engine plays it: a missed turn, and Mr. Lin's word at Home, at the tree, on the boat. */
  private async opening(seat: number, p: Player3): Promise<void> {
    const M = this.board.moments ?? {};
    if (p.skip > 0) { // A8
      await this.talk({ text: esc(T.rest), art: this.placeArt(seat), buttons: [{ label: T.skip, value: "ok", primary: true }] });
      return;
    }
    if (p.boat && M.boatWait?.guide) return this.story({ text: esc(M.boatWait.guide), art: artFor("dragon-boat", "") });
    if (p.pos === 0 && !p.home && M.backHome?.guide) return this.story({ text: esc(M.backHome.guide), art: artFor("house", "") }); // bumped: no 6 needed
    if (p.stuck && p.back) return; // the Forest's backward move frees the tree: no 6, no question (R6; audit, B8)
    if (p.cards > 0 && (p.home || p.stuck)) return; // the question tells it (A1, A2)
    if (p.home && !this.homeTold[seat]) { this.homeTold[seat] = true; return this.story({ title: esc(M.home?.title ?? ""), text: esc(M.home?.guide ?? ""), art: artFor("house", "") }); }
    // the tree: told once in a stay, not every turn (audit, C4)
    if (p.stuck && M.treeStuck?.guide && !this.treeTold[seat]) { this.treeTold[seat] = true; return this.story({ text: esc(M.treeStuck.guide), art: artFor("great-tree", ""), tone: "bad", outcome: esc(T.where.tree) }); } // he says the 6 (owner, 27 Nov 2026)
  }

  /**
   * Waits for a person to roll: "Roll die" (or "Roll again" after a 6), only ever in the action area, or a tap on the die
   * (owner, Step I phase F: game time, not talking time; no popup is open). The tap clears the notifications, so the
   * whole board is in view while the die rolls and the token moves.
   */
  private async rollTap(label: string): Promise<void> {
    this.guide.close();
    this.dice.ready(true);
    await Promise.race([this.setAct([{ label, value: "roll", primary: true }]), this.dice.tapped()]);
    this.dice.ready(false);
    this.notes.clear();
    this.setAct([]);
  }

  /** A person's choice (R19), in Mr. Lin's panel; a robot answers itself (R20). */
  private async decide(d: Decision3): Promise<Answer3> {
    if (!this.person(d.player)) return robot(d, this.game);
    const M = this.board.moments ?? {}, B = this.board;
    let v: string;
    switch (d.kind) {
      case "waitCard": {
        const home = d.where === "home";
        let title: string | undefined, text: string | undefined;
        if (home && !this.homeTold[d.player]) { this.homeTold[d.player] = true; title = esc(M.home?.title ?? ""); text = esc(M.home?.guide ?? ""); }
        // at the tree the question itself tells of the tree (owner's rule: Mr. Lin never says it twice)
        v = await this.talk({ title, text, art: artFor(home ? "house" : "great-tree", ""), question: home ? T.homeQ : T.treeQ, says: true, buttons: [{ label: T.useCard, value: "card", primary: true }, { label: T.noCard, value: "roll" }] });
        return v === "card";
      }
      case "punishment": {
        const tile = d.tile, area = d.area ? B.areas.find((a) => a.effect?.type === d.area) : null;
        const without = this.outcome(d.area ? d.area : tile!);
        v = await this.talk({
          title: esc(tile ? tile.title ?? "" : area?.name ?? ""), text: esc(tile ? tile.guide ?? "" : area?.announce ?? ""), tone: "bad",
          art: tile ? this.tileArt(tile) : artFor(area?.icon ?? "", ""),
          outcome: without ? `${T.without} ${esc(without)}` : undefined, question: T.cancelQ,
          buttons: [{ label: T.useCard, value: "card", primary: true }, { label: T.keepCard, value: "keep" }],
        });
        return v === "card";
      }
      case "swapMarket": {
        const tile = B.tiles[this.places[d.player]];
        const buttons: GuideButton[] = d.candidates.map((q) => ({ label: d.give ? T.give(PLAYERS[q].name) : T.take(PLAYERS[q].name), value: String(q) }));
        v = await this.talk({ title: esc(tile?.title ?? ""), text: esc(tile?.guide ?? ""), art: tile ? this.tileArt(tile) : undefined, question: d.give ? T.giveQ : T.takeQ, buttons });
        return Number(v);
      }
    }
  }

  /** What a square or a bad area effect does, in the notification's own words without the name ("back 18 squares."). */
  private outcome(x: Board3["tiles"][string] | string, sq?: number): string {
    const N = this.board.notes ?? {};
    const bare = (key: string, n?: number) => (N[key] ?? "").replace(/^\{p\}:? /, "").replace(/\{n\}/g, n === undefined ? "" : String(n));
    if (typeof x === "string") return bare(x === "swapBehind" ? "loseTurn" : x);
    const from = sq ?? Number(Object.keys(this.board.tiles).find((k) => this.board.tiles[k] === x));
    switch (x.type) {
      case "jump": return x.then === "skip2" ? bare("jumpBackSkip2", Math.abs(from - x.to!)) : bare(x.to! > from ? "jumpForward" : "jumpBack", Math.abs(x.to! - from));
      case "tree": return bare("tree").replace(/^is /, "");
      case "slowNext": return bare("slowNext");
      case "nearest": return bare("nearest");
      case "swapLeader": return bare("swapLeader");
      case "rollSum": return bare("rollSum");
      case "doubleOthers": return bare("doubleOthers");
      case "card": return bare("card");
      case "dragonBoat": return bare("dragonBoat");
      default: return "";
    }
  }

  // ---- Showing one engine event ----

  /** `after`: the events that follow in the same step; `asked`: the question the engine waits on after them. */
  private async play(e: Event3, after: Event3[], asked: Decision3 | null): Promise<void> {
    const st = this.stage, me = this.person(e.player) && e.player === this.seat, B = this.board;
    switch (e.type) {
      case "turn": break;
      case "skip": this.note("missTurn", e.player); await this.wait(600); break;
      case "roll": sound.play("dice"); await this.dice.roll(e.value);
        if (e.value === 6 && (e.why === "move" || e.why === "dice") && after[0]?.type === "roll" && !this.stones) { sound.play("six"); st.celebrate("good"); st.stamp("good", "A six!"); }
        break;
      case "sixes": st.stamp("good", T.sixes); break;
      case "noSix":
        if (e.where === "home") this.note("needSix", e.player); else this.note("tree", e.player, "bad");
        this.render();
        await this.wait(900);
        break;
      case "free": {
        if (e.where === "home") this.clock.start(e.player); // the clock starts on leaving Home; refused for robots and a second time
        if (e.by === "six") { this.dice.freed(); sound.play("six"); st.celebrate("good"); }
        const ok = B.moments?.freeToGo?.guide;
        // a robot's forced card moves it by that same throw: no "roll to move" (audit, B4); Mr. Lin says it to a person
        // himself (owner's rule: a notification never repeats him; audit, C3)
        if (e.by !== "forced" && !(me && ok)) this.note("free", e.player, "good");
        if (e.where === "home") this.homeTold[e.player] = false;
        this.render();
        if (me && ok) await this.talk({ text: esc(ok), art: artFor(e.where === "home" ? "house" : "great-tree", ""), buttons: [{ label: T.letsGo, value: "ok", primary: true }] }); // A7
        else await this.wait(700);
        break;
      }
      case "move": {
        const path: number[] = [];
        for (let k = e.from + e.dir; e.dir > 0 ? k <= e.to : k >= e.to; k += e.dir) path.push(k);
        await st.walk(path, (pos) => { sound.play("step"); this.places[e.player] = pos; this.overview.setPlace(e.player, pos); });
        this.places[e.player] = e.to;
        if (e.dir < 0) this.note("jumpBack", e.player, "bad", undefined, e.from - e.to); // C7: the Forest's backward move
        this.arrived(e.player, e.from, e.to, e.dir > 0 && e.by !== "dice");
        this.dice.moved();
        this.stones = false;
        break;
      }
      case "overshoot": this.notes.push(e.player, this.fill(T.tooFar, e.player, undefined, B.endTile - this.places[e.player]), "bad"); await this.wait(1100); break;
      case "square": {
        // the Swap Market is neither luck nor bad luck: no cheer, no "Lucky!" (audit, B9)
        const t = e.tile, tone = t.cat === "P" ? "bad" : t.cat === "R" ? "good" : "";
        st.pulse();
        if (tone) { sound.play(tone); st.celebrate(tone); st.stamp(tone); }
        if (t.type === "rollSum") this.stones = true;
        const silent = t.type === "swapLeader" && after[0]?.type === "noLeader"; // owner, 26 Nov 2026: no guide text then
        const question = asked && after.length === 0 && asked.kind !== "waitCard"; // its question tells the story itself
        // owner, 27 Nov 2026: for a person, Mr. Lin's story of a green or red square also says what it does, in the
        // approved words of its notification ("Forward 16 squares."), and the notification is then not repeated;
        // robots keep only their notifications
        const what = t.type === "tree" ? T.where.tree : this.outcome(t, e.square); // the tree: "…: needs a 6." (owner, 27 Nov 2026)
        this.toldSquare = !!(me && !silent && !question && t.guide);
        if (t.type === "tree") { this.treeTold[e.player] = false; if (!this.toldSquare) this.note("tree", e.player, "bad"); }
        if (t.cat === "P" && this.person(e.player) && this.cards[e.player] <= 0) this.tips.earn(e.player, "card"); // T4
        if (t.type === "rollSum" && !this.toldSquare) this.note("rollSum", e.player, "good");
        if (this.toldSquare) await this.story({ title: esc(t.title ?? ""), text: esc(t.guide!), tone, art: this.tileArt(t), outcome: what && t.cat !== "S" ? esc(cap(what)) : undefined });
        await this.wait(me ? 600 : 1500);
        break;
      }
      case "area": {
        const a = B.areas[e.area];
        this.areaFx = e.effect;
        const question = asked && after.length === 0;
        if (e.effect === "gifted6" && !(me && a.announce)) this.note("gifted6", e.player, "good"); // he says it to a person (C3)
        // owner, 26 Nov 2026: Mr. Lin's welcome and his area announcements have their own sound ("lantern-out")
        if (me && a.announce) sound.play("lantern-out");
        if (me && !question && a.announce) await this.story({ title: esc(a.name), text: esc(a.announce), art: artFor(a.icon ?? "", "") });
        await this.wait(me ? 600 : 1200);
        break;
      }
      case "jump": {
        sound.play(e.to >= e.from ? "jump-up" : "jump-down");
        if (e.cause !== "boatBack" && this.toldSquare) { /* Mr. Lin has just said it (owner, 27 Nov 2026) */ }
        else if (e.cause === "tile") {
          const skip2 = after.some((x) => x.type === "pending" && x.what === "skip" && x.player === e.player);
          this.note(skip2 ? "jumpBackSkip2" : e.to > e.from ? "jumpForward" : "jumpBack", e.player, e.to > e.from ? "good" : "bad", undefined, Math.abs(e.to - e.from));
        } else if (e.cause === "nearest") this.note("nearest", e.player, "good");
        else if (e.cause === "boat") this.note("dragonBoat", e.player, "good");
        else this.note("boatMiss", e.player, "bad", undefined, e.from - e.to);
        if (e.cause === "boatBack" && me && B.moments?.boatMiss?.guide) await this.story({ text: esc(B.moments.boatMiss.guide), tone: "bad", art: artFor("dragon-boat", "") });
        await st.fly(e.to);
        this.places[e.player] = e.to;
        this.overview.setPlace(e.player, e.to);
        this.arrived(e.player, e.from, e.to, false);
        await this.wait(400);
        break;
      }
      case "bump": {
        sound.play("bump");
        this.places[e.victim] = 0;
        this.overview.setPlace(e.victim, 0);
        this.homeTold[e.victim] = true; // bumped: no Home story, the "back Home" word comes on their turn
        st.celebrate("bump");
        st.stamp("bad", "Bump!");
        this.note("bump", e.player, "bad", e.victim);
        if (this.person(e.player)) this.tips.earn(e.player, "bump"); // T3
        const back = B.moments?.backHome?.note;
        if (back) this.notes.push(e.victim, this.fill(back, e.victim), "");
        this.render();
        await this.wait(1400);
        break;
      }
      case "swap": {
        const a = this.places[e.player], b = this.places[e.other];
        if (e.cause === "leader") { if (!this.toldSquare) this.note("swapLeader", e.player, "good"); }
        else this.note("areaSwap", e.player, "", e.other);
        await st.fly(b);
        this.places[e.player] = b; this.places[e.other] = a;
        this.overview.setPlace(e.player, b); this.overview.setPlace(e.other, a);
        this.render();
        await this.wait(900);
        break;
      }
      case "noLeader": this.note("swapLeaderNone", e.player); await this.wait(600); break;
      case "pending":
        if (e.what === "slow") { if (!this.toldSquare) this.note("slowNext", e.player, "bad"); }
        // the Forest's and the Mountains' effects: Mr. Lin has just said them to a person (owner's rule; audit, C3)
        else if (e.what === "back") { if (!(me && this.areaFx === "backward")) this.note("backward", e.player, "bad"); }
        else if (e.what === "double" && e.player === this.seat) { if (!(me && this.areaFx === "double")) this.note("double", e.player, "good"); }
        else if (e.what === "double") { if (!this.toldSquare && !after.some((x) => x.type === "pending" && x.what === "double")) this.notes.push(null, esc(B.notes?.doubleOthers ?? ""), "bad"); }
        else if (e.what === "skip" && this.areaFx === "swapBehind") this.note("loseTurn", e.player, "bad");
        // T4: the Forest's backward move or the Big City's lost turn, with no card to cancel it
        if (((e.what === "back" && this.areaFx === "backward") || (e.what === "skip" && this.areaFx === "swapBehind")) && this.person(e.player) && this.cards[e.player] <= 0) this.tips.earn(e.player, "card");
        this.render();
        await this.wait(500);
        break;
      case "card": {
        sound.play("card");
        this.cards[e.player]++;
        if (e.source === "market" && e.from !== undefined) {
          this.cards[e.from]--;
          if (e.from === this.seat) this.note("swapMarketGive", e.from, "", e.player); else this.note("swapMarketTake", e.player, "", e.from);
        } else if (!(e.source === "square" && this.toldSquare)) this.note("card", e.player, "good");
        this.render();
        await this.wait(700);
        break;
      }
      case "cardUsed": {
        sound.play("card");
        this.cards[e.player]--;
        // the robot's forced card: at Home or at the tree, as the next event says (audit, B4)
        const atHome = e.use === "home" || (e.use === "forced" && after[0]?.type === "free" && after[0].where === "home");
        if (atHome) this.notes.push(e.player, this.fill(T.cardHome, e.player), "good");
        else if (e.use === "tree" || e.use === "forced") this.notes.push(e.player, this.fill(T.cardTree, e.player), "good");
        else { this.note("cardCancel", e.player, "good"); st.cardPlayed(); st.stamp("good", "Dodged it!"); }
        this.render();
        await this.wait(800);
        break;
      }
      case "marketNone": this.notes.push(e.player, esc(T.marketNone), ""); await this.wait(600); break;
      case "win":
        this.winTime = this.clock.finish(e.player); // the last square: the clock stops here
        if (e.boat) {
          const told = me && B.moments?.boatWin?.guide;
          if (!told) this.notes.push(e.player, this.fill(T.boatWin, e.player), "good"); // he says it to a person (C3)
          else await this.story({ text: esc(told), tone: "good", art: artFor("pier", "") });
        }
        await this.wait(600);
        break;
    }
  }

  /** After a move: the area's sign when a token enters a new area by its own move, and the avatars. */
  private arrived(seat: number, from: number, to: number, sign: boolean): void {
    const A = this.board.areas, at = (q: number) => (q >= 1 && q <= this.board.lastTile ? A.findIndex((r) => q >= r.from && q <= r.to) : -1);
    const a = at(from), b = at(to);
    if (sign && seat === this.seat && b > 0 && b !== a) this.stage.sign(A[b].name);
    this.render();
  }

  // ---- Mr. Lin's panel ----

  /** Mr. Lin's words when a person passes the die (owner, Step I phase F): `standing.ts`. */
  private standing(seat: number): string {
    const p = this.game.players[seat];
    // stuck at the tree with the Forest's backward move waiting: the tree does not bar the way (R6; audit, B8)
    return standingWords(this.board, seat, this.places, { boat: !!p.boat, stuck: !!p.stuck && !p.back }, (i) => this.name(i));
  }

  /** A square's picture for Mr. Lin's panel (the one on the board and the stage). */
  private tileArt(t: Board3["tiles"][string]): string {
    return t.icon === "card" ? cardFace("bonus", "") : artFor(t.icon ?? "card", "");
  }

  /** The picture of where a player stands (Home, the tree, the Dragon Boat, or the area's picture). */
  private placeArt(seat: number): string {
    const p = this.game.players[seat], pos = this.places[seat];
    if (pos <= 0) return artFor("house", "");
    if (p.boat) return artFor("dragon-boat", "");
    if (p.stuck) return artFor("great-tree", "");
    const a = this.board.areas.find((x) => pos >= x.from && pos <= x.to);
    return artFor(a?.icon ?? "", "");
  }

  /** A tip's picture, where one of the game's pictures tells the same thing; else none. */
  private tipArt(tip: string): string | undefined {
    const id = (Object.keys(TIPS) as TipId[]).find((k) => TIPS[k] === tip);
    const pic: Partial<Record<TipId, () => string>> = {
      sixes: () => artFor("sixes-3", ""), card: () => cardFace("bonus", ""),
      exact: () => artFor(this.board.destination?.icon ?? "lanterns", ""), records: () => artFor(this.board.destination?.icon ?? "lanterns", ""),
    };
    return id ? pic[id]?.() : undefined;
  }

  /**
   * Every panel of Mr. Lin goes through here: it opens once the stamps and the area sign on the square have been seen,
   * so his panel never covers them (owner's rule, Part 2; audit, C2), and it never answers once the players have left
   * the game (audit, B1, B2: the turn then stops where it is).
   */
  private async talk(c: GuideContent): Promise<string> {
    if (this.gone) return STOP;
    const busy = this.stage.busyFor();
    if (busy > 0) await this.wait(busy);
    const v = await this.guide.show(c);
    return this.gone ? STOP : v;
  }

  /**
   * Mr. Lin's story of a person's turn, and his tips (owner, Step I phase F): it stays until the person taps
   * "I understand", and the game waits meanwhile (talking time); then the game goes on.
   */
  private async story(c: { title?: string; text: string; tone?: "good" | "bad" | ""; art?: string; outcome?: string }): Promise<void> {
    await this.talk({ ...c, buttons: [{ label: T.understand, value: "ok", primary: true }] });
  }

  // ---- Info popups (over the board) ----

  private squareInfo(pos: number): void {
    const B = this.board, from = this.places[this.seat], steps = pos > from && from >= 0 ? pos - from : null;
    // a 6 always throws again, so one throw stops 1–5 squares ahead, never 6 (audit, 15 Oct); only when the next move is
    // one plain throw, and a doubled roll moves twice the face (audit, 27 Nov: B7)
    const face = steps === null ? 0 : reachFace(this.game.players[this.seat], from, pos);
    const reach = face ? `${this.name(this.seat)} gets here with a ${face}.` : steps !== null && steps > 5 ? `${steps} squares ahead of ${this.name(this.seat)}.` : "";
    const t = B.tiles[pos], area = B.areas.find((a) => pos >= a.from && pos <= a.to);
    let c: PopupContent;
    if (pos <= 0) c = { title: esc(B.moments?.home?.title ?? ""), text: esc(B.moments?.home?.guide ?? ""), art: artFor("house", "Home"), outcome: T.homeBox };
    else if (pos >= B.endTile) c = { title: esc(B.destination?.name ?? ""), art: artFor(B.destination?.icon ?? "lanterns", B.destination?.name ?? ""), outcome: T.endBox };
    else if (t) {
      const what = this.outcome(t, pos);
      c = { title: esc(t.title ?? ""), text: esc(t.guide ?? ""), art: t.icon === "card" ? cardFace("bonus", t.title ?? "") : artFor(t.icon ?? "card", t.title ?? ""), outcome: what ? esc(cap(what)) : undefined, tone: t.cat === "P" ? "bad" : t.cat === "S" ? "swap" : "good" }; // the Swap Market: blue, like its square (owner, phase F)
    } else {
      const lm = B.landmarks?.[pos];
      c = lm ? { title: esc(lm.name), text: T.squareBox.landmark.replace("{a}", esc(area?.name ?? "")), art: artFor(lm.icon ?? "", lm.name) }
        : { title: esc(area?.name ?? ""), text: T.squareBox.plain, art: artFor(area?.icon ?? "", area?.name ?? "") };
    }
    void this.pops.show({ ...c, kind: "info", outcome: [c.outcome, reach].filter(Boolean).join(" ") || undefined });
  }

  private cardInfo(): void {
    const n = this.cards[this.seat];
    void this.pops.show({ kind: "info", title: T.cardBox.title, text: T.cardBox.text, art: cardFace("bonus", T.cardBox.title), outcome: T.cardBox.hold(n), tone: n ? "good" : "" });
  }

  /** The lines about a player (D12); the first one is also the line under "…'s turn" (D13). */
  private lines(seat: number): string[] {
    const p = this.game.players[seat], pos = this.places[seat], W = T.where, out: string[] = [];
    const f = finishFace(this.board, p, pos); // follows a double, "exactly 1" and the backward move (audit, B6)
    if (p.boat) out.push(W.boat(boatNeed(this.board)));
    else if (pos <= 0) out.push(p.home ? W.home : W.homeFree);
    else if (needsSix(p, pos)) out.push(W.tree); // not when the Forest's backward move frees the tree (B8)
    else if (f) out.push(W.finish(f));
    if (p.skip) out.push(W.skip(p.skip));
    if (p.dbl) out.push(W.double);
    if (p.slow) out.push(W.slow);
    if (p.back) out.push(W.back);
    return out;
  }

  private playerInfo(seat: number): void {
    const p = this.game.players[seat], pos = this.places[seat], d = this.board.endTile - pos, all = this.lines(seat);
    if (pos > 0 && pos < this.board.endTile && !p.boat && !finishFace(this.board, p, pos)) all.unshift(T.where.toGo(d));
    all.splice(1, 0, T.where.cards(this.cards[seat]));
    void this.pops.show({
      kind: "info", kicker: this.person(seat) ? T.player : T.robot, title: this.name(seat),
      art: `<div class="one">${tokenSvg(seat, "tok", true)}</div>`, text: all.map((l) => `<span class="line">${l}</span>`).join(""),
    });
  }

  // ---- The action button, the player row, the current player's card ----

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

  /** The tag on the avatar: "needs 6" at Home or the tree when a 6 is really needed, else the exact roll to finish
   * (it follows a double, "exactly 1", the backward move and the boat's own number: audit, B6, B8, B13). */
  private need(seat: number): string {
    return needTag(this.board, this.game.players[seat], this.places[seat]);
  }

  /** What the bar, the turn line and the hand show now: drawn again only when it changes (P2). */
  private drawn = { bar: "", who: "", hand: "" };

  private render(): void {
    const P = this.game.players, cur = this.seat;
    const bar = `<div class="avs">` + P.map((_, i) => {
      const n = this.cards[i], need = this.need(i);
      // the spoken name is hidden text, not a label, so it never differs from what the button shows (accessibility scan)
      return `<button class="avatar${i === cur ? " now" : ""}" data-seat="${i}"><span class="sr">${this.name(i)}${this.setup.computer[i] ? " (computer)" : ""}${need ? `, ${need}` : ""}: ${n} Bonus card${n === 1 ? "" : "s"}. Tap for details</span>`
        + `${tokenSvg(i, "tok", true)}<span class="badge c${n ? "" : " none"}" aria-hidden="true">${cardFace("bonus", "")}${n}</span>`
        + (this.setup.computer[i] ? `<span class="cpu" aria-hidden="true">${robotSvg}</span>` : "")
        + (need ? `<span class="need" aria-hidden="true">${need}</span>` : "") + `</button>`;
    }).join("") + `</div><button class="leave" aria-label="Leave game">${leaveSvg}<span>Leave</span></button>`;
    const n = this.cards[cur];
    const status = this.lines(cur)[0] ?? "";
    const who = `${tokenSvg(cur, "tok", true)}<div><b>${this.name(cur)}'s turn</b>${this.round ? `<span class="st">Round ${this.round}</span>` : ""}${status ? `<span class="st guide">${status}</span>` : ""}</div>`;
    // The card area keeps only the Bonus card slot (owner, 25 Nov 2026); held, it glows and shows how many.
    const hand = `<button class="gcard bonus${n ? " held" : ""}" data-card="bonus" aria-label="${T.cardBox.title}: ${n ? `you hold ${n}` : "not held"}. Tap to see what it does">`
      + `${cardFace("bonus", T.cardBox.title)}${n > 1 ? `<span class="gc-n">×${n}</span>` : ""}</button>`;
    if (!this.hud.firstElementChild) this.hud.innerHTML = `<div class="who"></div><div class="hand"></div>`;
    if (bar !== this.drawn.bar) this.bar.innerHTML = this.drawn.bar = bar;
    if (who !== this.drawn.who) this.hud.firstElementChild!.innerHTML = this.drawn.who = who;
    if (hand !== this.drawn.hand) this.hud.lastElementChild!.innerHTML = this.drawn.hand = hand;
  }
}
