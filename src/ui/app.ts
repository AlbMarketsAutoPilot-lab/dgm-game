// The game screen: the whole board (top / left) and the stage (bottom / right). One turn at a time:
// "Blue's turn" → Roll → the die → the move square by square → what the square does → "Blue's turn is over" → OK.
// All rules come from the engine (src/engine); this file only shows its events, in order.
import { Game, OFF, OUT, START, simplePlayer, type Answer, type Board, type Decision, type GameEvent, type Pos } from "../engine";
import { Dice } from "./dice";
import { Overview } from "./overview";
import { PLAYERS, tokenSvg } from "./players";
import { Stage, describe } from "./stage";
import { artFor } from "../render/art";

export interface Setup {
  board: Board;
  players: number;
  /** true = computer player (GCD §8.6) for that seat. */
  computer: boolean[];
}

type Story = {
  stairs?: { start?: { story?: string }; trap?: { story?: string } };
  lifelines?: { lose?: string; win?: string; none?: string; out?: string };
  roadblock?: { story?: string };
  roads?: { safe?: { name?: string; story?: string }; wild?: { name?: string }; forks?: { crossroads?: string }[] };
  cards?: { bonus?: { name?: string }; jailPass?: { name?: string; story?: string } };
  badges?: { snakeLeader?: { story?: string } };
};

// Pauses are reading time, so "reduce motion" keeps them (only the animations stop). `?fast` in the address
// fast-forwards whole games (for testing).
const fast = new URLSearchParams(location.search).has("fast");
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, fast ? Math.min(ms, 60) : ms));
/** A small version of the real illustration (player bar). */
const pic = (name: string, label: string) => `<span class="pic">${artFor(name, label)}</span>`;
const lanternSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6M12 2v2M8 7h8l-1 11H9zM8 7c0-2 8-2 8 0M9.5 18h5v2.5h-5z" fill="#f2c230" stroke="#4b2377" stroke-width="1.7" stroke-linejoin="round"/></svg>`;

export class GameScreen {
  private readonly game: Game;
  private readonly overview: Overview;
  private readonly stage: Stage;
  private readonly dice: Dice;
  private readonly chips: HTMLElement;
  private readonly msg: HTMLElement;
  private readonly buttons: HTMLElement;
  private round = 0;
  private readonly story: Story;
  /** Where each token is shown (follows the events, one step behind the engine's final state). */
  private readonly places: { pos: Pos; stair: number }[];

  constructor(root: HTMLElement, private readonly setup: Setup, private readonly onExit: (again: boolean) => void) {
    const { board, players } = setup;
    this.game = new Game(board, { players });
    this.story = board.story as unknown as Story;
    root.innerHTML = `
      <div class="game">
        <section class="overview" aria-label="The whole board"></section>
        <section class="stage-panel">
          <div class="chips" aria-label="Players"></div>
          <div class="stage"></div>
          <div class="controls">
            <div class="dice"></div>
            <div class="talk"><p class="msg" aria-live="polite"></p><div class="buttons"></div></div>
          </div>
        </section>
      </div>`;
    this.overview = new Overview(root.querySelector(".overview")!, board, players);
    this.stage = new Stage(root.querySelector(".stage")!, board);
    this.dice = new Dice(root.querySelector(".dice")!);
    this.chips = root.querySelector(".chips")!;
    this.msg = root.querySelector(".msg")!;
    this.buttons = root.querySelector(".buttons")!;
    this.places = this.game.players.map((p) => ({ pos: p.pos, stair: 0 }));
    this.renderChips();
    void this.run();
  }

  private name(seat: number): string {
    return PLAYERS[seat].name;
  }

  private nextSeat(): number {
    const P = this.game.players;
    let s = this.game.currentSeat;
    do s = (s + 1) % P.length; while (P[s].out);
    return s;
  }

  private async run(): Promise<void> {
    while (!this.game.over) await this.turn();
    const w = this.game.winner;
    if (w === null) { this.say("Nobody reached the festival this time."); }
    else {
      this.overview.setCurrent(w);
      this.say(this.game.lastStanding ? `${this.name(w)} is the last one still travelling, and wins!` : `${this.name(w)} reached the Festival of Lights and wins!`, w);
    }
    const again = await this.ask([{ label: "Play again", value: "again" }, { label: "New game", value: "new" }]);
    this.onExit(again === "again");
  }

  // ---- One turn ----

  private async turn(): Promise<void> {
    const seat = this.nextSeat(), p = this.game.players[seat], comp = this.setup.computer[seat];
    this.overview.setCurrent(seat);
    this.renderChips(seat);
    this.dice.clear();
    const pl = this.places[seat];
    this.stage.show(seat, pl.pos, pl.stair);
    const waiting = p.pos === OFF ? "at Home: roll a 6 to set off" : p.trapped ? "in the Bog: roll a 6 to get out" : "";
    if (p.skip > 0) {
      this.say(`${this.name(seat)} has to wait this turn.`, seat);
      if (comp) await wait(1100); else await this.ask([{ label: "OK", value: "ok" }]);
    } else {
      this.say(`${this.name(seat)}'s turn${waiting ? `, ${waiting}` : ""}.`, seat);
      if (comp) await wait(900); else await this.ask([{ label: "Roll the die", value: "roll" }], true);
    }
    this.clearButtons();

    const t = this.game.turn();
    let shown = this.game.events.length, r = t.next();
    for (;;) {
      const fresh = this.game.events.slice(shown);
      shown = this.game.events.length;
      for (const e of fresh) await this.play(e, seat);
      if (r.done) break;
      r = t.next(comp ? simplePlayer(r.value, this.game) : await this.decide(r.value));
    }
    this.renderChips(seat);
    if (this.game.over) return;
    await wait(250);
    this.say(`${this.name(seat)}'s turn is over.`, seat);
    if (comp) await wait(1200); else await this.ask([{ label: "OK", value: "ok" }], true);
    this.clearButtons();
  }

  /** A human player's choice (R21: the road, the bonus card). */
  private async decide(d: Decision): Promise<Answer> {
    const who = this.name(d.player);
    if (this.setup.computer[d.player]) return simplePlayer(d, this.game);
    switch (d.kind) {
      case "road": {
        this.say(`${who}: ${this.story.roads?.forks?.[d.fork]?.crossroads ?? "Crossroads. Which way?"}`, d.player);
        const v = await this.ask([{ label: this.story.roads?.safe?.name ?? "Main Road", value: "main" }, { label: `${this.story.roads?.wild?.name ?? "The Shortcut"}!`, value: "shortcut" }]);
        return v as Answer;
      }
      case "bonusDefend":
        this.say(`${who}: use your ${this.story.cards?.bonus?.name ?? "Bonus card"} to dodge this?`, d.player);
        return (await this.ask([{ label: "Use the card", value: "yes" }, { label: "Keep it", value: "no" }])) === "yes";
      case "bonusAttack":
        this.say(`${who}: use your ${this.story.cards?.bonus?.name ?? "Bonus card"} to spoil ${this.name(d.target)}'s luck?`, d.player);
        return (await this.ask([{ label: "Spoil it", value: "yes" }, { label: "Let it go", value: "no" }])) === "yes";
    }
  }

  // ---- Showing one engine event ----

  private async play(e: GameEvent, seat: number): Promise<void> {
    const S = this.story, st = this.stage;
    switch (e.type) {
      case "round": this.round = e.round; this.renderChips(seat); break;
      case "roadblockPlaced": this.overview.setRoadblock(e.square); break;
      case "roadblockRemoved": this.overview.setRoadblock(null); break;
      case "roll": await this.dice.roll(e.value); break;
      case "skipTurn": st.caption(e.turnsLeft ? `Waiting… ${e.turnsLeft} more turn${e.turnsLeft > 1 ? "s" : ""} to wait.` : "Waiting… moving again next turn.", "info"); await wait(900); break;
      case "noSix":
        st.caption((e.where === "start" ? S.stairs?.start?.story : S.stairs?.trap?.story) ?? "No 6.", "info");
        await wait(1000);
        break;
      case "released":
        if (e.where === "start") { this.places[e.player] = { pos: START, stair: 0 }; st.show(e.player, START, 0, false); this.overview.setPlace(e.player, START); }
        st.caption(e.bySix ? (e.where === "start" ? "A 6! Off you go, throw again." : "A 6! Out of the Bog, throw again.") : "Third throw: off you go anyway, two steps slower.", "good");
        await wait(800);
        break;
      case "road":
        st.caption(e.road === "main" ? (S.roads?.safe?.story ?? "The Main Road.") : `${S.roads?.wild?.name ?? "The Shortcut"}! Good luck…`, "info");
        await wait(700);
        break;
      case "move":
        await st.walk(e.path, (s) => { this.places[e.player] = { ...s }; this.overview.setPlace(e.player, s.pos, s.stair); });
        st.caption(e.crossroads ? (S.roads?.forks?.find((_, i) => this.game.board.rules.forks[i].at === e.to)?.crossroads ?? "Crossroads! Everyone stops here.")
          : describe(this.game.board, e.to, e.path.at(-1)?.stair ?? 0).caption);
        await wait(e.crossroads ? 900 : 350);
        break;
      case "overshoot": {
        const need = this.game.board.endTile - this.places[e.player].pos;
        st.caption(`Too far! You need exactly ${need} to reach the festival.`, "info");
        await wait(1100);
        break;
      }
      case "tile":
        st.pulse();
        st.caption(e.tile.story ?? e.tile.text, e.tile.cat === "R" ? "good" : "bad");
        await wait(1500);
        break;
      case "jump":
        await st.fly(e.to);
        this.places[e.player] = { pos: e.to, stair: 0 };
        this.overview.setPlace(e.player, e.to);
        if (e.cause !== "roadblock") st.caption(describe(this.game.board, e.to).caption);
        await wait(500);
        break;
      case "capture":
        this.places[e.victim] = { pos: START, stair: 0 };
        this.overview.setPlace(e.victim, START);
        st.caption(`Bump! ${this.name(e.victim)} goes back to Start.`, "info");
        this.renderChips(seat);
        await wait(1300);
        break;
      case "roadblockHit": st.caption(S.roadblock?.story ?? "Fallen tree! Back ten squares.", "bad"); await wait(1300); break;
      case "trapped": st.caption("Stuck in the Bog. Only a 6 gets you out.", "bad"); await wait(1100); break;
      case "bogBoots": st.caption(S.cards?.jailPass?.story ?? "Bog boots! Straight through the mud.", "good"); this.renderChips(seat); await wait(1300); break;
      case "card": this.renderChips(seat); await wait(400); break;
      case "bonusUsed":
        st.caption(e.use === "defend" ? `${this.name(e.player)} uses the ${S.cards?.bonus?.name ?? "Bonus card"}. Dodged!` : `${this.name(e.player)} uses the ${S.cards?.bonus?.name ?? "Bonus card"}. ${this.name(e.target)}'s luck is spoiled!`, "info");
        this.renderChips(seat);
        await wait(1400);
        break;
      case "doubleNext": this.renderChips(seat); break;
      case "snakeLeader": this.renderChips(seat); st.caption(S.badges?.snakeLeader?.story ?? "Snake Leader!", "good"); await wait(1200); break;
      case "swap": {
        const mine = this.places[e.player];
        this.places[e.other] = { ...mine };
        this.overview.setPlace(e.other, mine.pos, mine.stair);
        st.caption(`${this.name(e.player)} and ${this.name(e.other)} swap places!`, "good");
        await wait(900);
        break;
      }
      case "lanternLost":
        st.caption(e.left > 0 ? (S.lifelines?.lose ?? "A lantern goes out.") : (S.lifelines?.none ?? "No lanterns left!"), "bad");
        this.renderChips(seat);
        await wait(1500);
        break;
      case "lanternWon": st.caption(S.lifelines?.win ?? "Lantern back on!", "good"); this.renderChips(seat); await wait(1300); break;
      case "out":
        this.places[e.player] = { pos: OUT, stair: 0 };
        this.overview.setPlace(e.player, OUT);
        st.caption(`${this.name(e.player)}: ${S.lifelines?.out ?? "out of the game."}`, "bad");
        this.renderChips(seat);
        await wait(1800);
        break;
      case "win":
        if (!e.lastStanding) st.caption(describe(this.game.board, this.game.board.endTile).caption, "good");
        await wait(800);
        break;
      default: break;
    }
  }

  // ---- Talking and buttons ----

  private say(text: string, seat?: number): void {
    this.msg.innerHTML = seat === undefined ? text : `<span class="who">${tokenSvg(seat, "mini", true)}</span>${text}`;
  }

  private clearButtons(): void {
    this.buttons.replaceChildren();
  }

  private ask(options: { label: string; value: string }[], primary = false): Promise<string> {
    return new Promise((done) => {
      this.buttons.replaceChildren(...options.map((o, i) => {
        const b = document.createElement("button");
        b.textContent = o.label;
        if (primary || i === 0) b.classList.add("primary");
        b.addEventListener("click", () => { this.clearButtons(); done(o.value); }, { once: true });
        return b;
      }));
      (this.buttons.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
    });
  }

  /** Each player: token, name, lanterns, cards, badges. */
  private renderChips(current = this.game.currentSeat): void {
    this.chips.innerHTML = this.game.players.map((p, i) => {
      const extras = [
        p.bonus ? `<span class="tag">${pic("card", this.story.cards?.bonus?.name ?? "Bonus card")}${p.bonus > 1 ? `×${p.bonus}` : ""}</span>` : "",
        p.jailPass ? `<span class="tag">${pic("boots", this.story.cards?.jailPass?.name ?? "Bog boots")}${p.jailPass > 1 ? `×${p.jailPass}` : ""}</span>` : "",
        p.snakeLeader ? `<span class="tag">${pic("snake-crown", "Snake Leader")}</span>` : "",
        p.double ? `<span class="tag" aria-label="Next throw doubled">×2</span>` : "",
        p.skip ? `<span class="tag" aria-label="${p.skip} turn${p.skip > 1 ? "s" : ""} to wait">wait ${p.skip}</span>` : "",
      ].join("");
      const lanterns = p.out ? `<span class="tag">out</span>` : `<span class="lanterns" role="img" aria-label="${p.lanterns} lantern${p.lanterns === 1 ? "" : "s"}">${lanternSvg.repeat(Math.min(p.lanterns, 6))}${p.lanterns > 6 ? `+${p.lanterns - 6}` : ""}${p.lanterns === 0 ? "none" : `<b class="count">${p.lanterns}</b>`}</span>`;
      return `<div class="chip${i === current ? " now" : ""}${p.out ? " gone" : ""}"${i === current ? ` aria-current="true"` : ""}>${tokenSvg(i, "mini", true)}<span class="nm">${PLAYERS[i].name}${this.setup.computer[i] ? " (cpu)" : ""}</span>${lanterns}${extras}</div>`;
    }).join("") + (this.round ? `<span class="round">Round ${this.round}</span>` : "");
  }
}
