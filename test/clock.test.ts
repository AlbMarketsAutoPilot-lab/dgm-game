// The win clock for the Records (Step I phase E, owner 26 Nov 2026): it starts on leaving Home, one per person, and
// any interruption voids it for good (no pause, no restart, nothing saved). Robots and continued games are never timed.
import { describe, expect, it } from "vitest";
import { GAP, TICK, WinClock, type ClockEnv } from "../src/ui/clock";

/** A fake page: time moves only when the test says so; interruptions come when the test sends them. */
function fakePage() {
  let t = 1000, front = true;
  const ticks = new Set<() => void>(), stops = new Set<() => void>();
  const env: ClockEnv = {
    now: () => t,
    every: (_ms, tick) => { ticks.add(tick); return () => ticks.delete(tick); },
    onInterrupt: (stop) => { stops.add(stop); return () => stops.delete(stop); },
    inFront: () => front,
  };
  return {
    env,
    /** Time goes on, with the checks every second (a frozen game: one jump, no checks). */
    play(ms: number) { for (let left = ms; left > 0; left -= TICK) { t += Math.min(TICK, left); ticks.forEach((f) => f()); } },
    freeze(ms: number) { t += ms; },
    interrupt() { stops.forEach((f) => f()); },
    set front(v: boolean) { front = v; },
    get ticking() { return ticks.size; },
    get listening() { return stops.size; },
  };
}

const PEOPLE = [true, false, true]; // seats 0 and 2 are people, seat 1 a robot

describe("the win clock", () => {
  it("runs from leaving Home to the finish, through a bump (a bumped person's clock keeps running)", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    page.play(5000); // still at Home: not timed
    expect(clock.start(0)).toBe(true);
    page.play(60_000);
    expect(clock.start(0)).toBe(false); // bumped and leaving again: the same clock goes on, no restart
    page.play(30_000);
    expect(clock.finish(0)).toBe(90_000);
    expect(page.ticking).toBe(0);
    expect(page.listening).toBe(0);
  });

  it("one clock per person: a second start, even right after the first, is refused", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    expect(clock.start(2)).toBe(true);
    page.play(500);
    expect(clock.start(2)).toBe(false);
    expect(page.ticking).toBe(1); // one check, whoever runs
    page.play(9500);
    expect(clock.finish(2)).toBe(10_000);
  });

  it("a new game stops the previous game's clock for good: never two games timed", () => {
    const page = fakePage(), first = new WinClock(PEOPLE, true, page.env);
    first.start(0);
    const second = new WinClock(PEOPLE, true, page.env);
    expect(first.valid).toBe(false);
    second.start(0);
    page.play(3000);
    expect(first.finish(0)).toBeNull();
    expect(second.finish(0)).toBe(3000);
  });

  it("robots are never timed", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    expect(clock.start(1)).toBe(false);
    page.play(20_000);
    expect(clock.finish(1)).toBeNull();
  });

  it("the person who did not leave Home has no time", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    clock.start(0);
    page.play(4000);
    expect(clock.finish(2)).toBeNull();
  });

  it("any interruption voids every clock of the game at once and for good: no pause, no restart", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    clock.start(0);
    page.play(10_000);
    page.interrupt(); // app hidden, minimised, closed, or the window lost the focus
    expect(clock.valid).toBe(false);
    expect(page.ticking).toBe(0);
    expect(clock.start(2)).toBe(false); // never restarts in the middle of a game
    page.play(10_000);
    expect(clock.finish(0)).toBeNull();
    expect(clock.finish(2)).toBeNull();
  });

  it("an interruption from the game's own screens (settings, \"Leave game?\") voids it too", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    clock.start(0);
    page.play(2000);
    clock.interrupt(); // the game screen calls this for the sound settings and for "Leave game?" (even with "Stay")
    page.play(2000);
    expect(clock.finish(0)).toBeNull();
  });

  it("an interruption before anyone left Home voids the game too", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    page.interrupt();
    expect(clock.start(0)).toBe(false);
    page.play(5000);
    expect(clock.finish(0)).toBeNull();
  });

  it("a game frozen for more than 5 seconds is void, even with no word from the device", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    clock.start(0);
    page.play(3000);
    page.freeze(GAP + 1);
    page.play(1000); // the next check sees the gap
    expect(clock.finish(0)).toBeNull();
  });

  it("a freeze just before the finish is caught at the finish", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    clock.start(0);
    page.play(3000);
    page.freeze(GAP + 1);
    expect(clock.finish(0)).toBeNull();
  });

  it("a short wait between checks is not a freeze", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    clock.start(0);
    page.play(3000);
    page.freeze(GAP - 1000);
    page.play(1000);
    expect(clock.finish(0)).toBe(3000 + GAP);
  });

  it("leaving Home while the game is not in front voids the game", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    page.front = false;
    expect(clock.start(0)).toBe(false);
    page.front = true;
    expect(clock.start(2)).toBe(false);
    expect(clock.finish(0)).toBeNull();
  });

  it("a continued saved game is never timed", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, false, page.env);
    expect(clock.start(0)).toBe(false);
    page.play(5000);
    expect(clock.finish(0)).toBeNull();
  });

  it("after the finish nothing more is timed, and a late interruption changes nothing", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    clock.start(0);
    page.play(7000);
    expect(clock.finish(0)).toBe(7000);
    page.interrupt();
    expect(clock.start(2)).toBe(false);
    expect(clock.finish(0)).toBeNull(); // asked again: no second time
  });

  it("leaving the game screen stops listening to the page", () => {
    const page = fakePage(), clock = new WinClock(PEOPLE, true, page.env);
    clock.start(0);
    clock.dispose();
    expect(page.ticking).toBe(0);
    expect(page.listening).toBe(0);
  });
});
