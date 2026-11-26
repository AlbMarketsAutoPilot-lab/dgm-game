// The win clock for the Records (Step I phase E, owner 26 Nov 2026). Only a game that is never interrupted gives a
// time: a person's clock starts when they leave Home and stops at the finish. Any interruption (the app hidden,
// minimised or closed, the window losing focus, the sound settings, "Leave game?" even with "Stay", a continued saved
// game) stops every clock of the game at once and for good: no pause, no restart, nothing saved. Only the game's own
// popups are allowed. Robots are never timed.
// One clock per person (owner: in another game fast clicks started two timers): a second start for the same person is
// refused, and a new game's clock stops the previous game's clock for good.
// The time comes from the device's running timer (performance.now), never from its clock time, so changing the
// device's time changes nothing. A check every second: a gap of more than 5 seconds means the game was frozen
// (a phone can stop an app without telling it), and the time is void.

/** What the clock needs from the page (a fake one in the tests). */
export interface ClockEnv {
  now(): number;
  /** Calls `tick` every `ms`; returns a function that stops it. */
  every(ms: number, tick: () => void): () => void;
  /** Calls `stop` on any interruption from outside the game; returns a function that stops listening. */
  onInterrupt(stop: () => void): () => void;
  /** Whether the game is on screen and has the focus right now. */
  inFront(): boolean;
}

export const TICK = 1000;
/** More than this between two checks: the game was frozen. */
export const GAP = 5000;

const pageEnv: ClockEnv = {
  now: () => performance.now(),
  every: (ms, tick) => { const id = setInterval(tick, ms); return () => clearInterval(id); },
  onInterrupt(stop) {
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("blur", stop);
    window.addEventListener("pagehide", stop);
    document.addEventListener("freeze", stop);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("blur", stop);
      window.removeEventListener("pagehide", stop);
      document.removeEventListener("freeze", stop);
    };
  },
  inFront: () => !document.hidden && document.hasFocus(),
};

/** The game whose clock is running: there is never more than one. */
let current: WinClock | null = null;

export class WinClock {
  /** When each person left Home (null: not started; robots are never started). */
  private readonly started: (number | null)[];
  private broken = false;
  private done = false;
  private last = 0;
  private stopTick: (() => void) | null = null;
  private readonly unlisten: () => void;

  /** `people[i]`: seat i is a person. `valid` false: this game can never give a time (a continued saved game). */
  constructor(private readonly people: readonly boolean[], valid: boolean, private readonly env: ClockEnv = pageEnv) {
    current?.interrupt(); // one game timed at a time
    current = this;
    this.started = people.map(() => null);
    this.unlisten = env.onInterrupt(() => this.interrupt());
    if (!valid) this.interrupt();
  }

  /** Whether this game can still give a time. */
  get valid(): boolean {
    return !this.broken;
  }

  /** The person left Home. A robot, a second start or a game already interrupted: refused (false). */
  start(seat: number): boolean {
    if (this.broken || this.done || !this.people[seat] || this.started[seat] !== null) return false;
    if (!this.env.inFront()) { this.interrupt(); return false; }
    const now = this.env.now();
    this.started[seat] = now;
    if (!this.stopTick) { this.last = now; this.stopTick = this.env.every(TICK, () => this.check()); }
    return true;
  }

  /** An interruption: every clock of this game stops for good. */
  interrupt(): void {
    this.broken = true;
    this.halt();
  }

  /** The finish: the winner's time in milliseconds, or null (a robot, never started, interrupted). Stops the clock. */
  finish(seat: number): number | null {
    if (!this.done) this.check();
    const start = this.started[seat], ok = !this.broken && !this.done && start !== null;
    this.done = true;
    this.halt();
    this.unlisten();
    if (current === this) current = null;
    return ok ? Math.max(0, this.env.now() - (start as number)) : null;
  }

  /** The game screen is gone: nothing more is timed. */
  dispose(): void {
    this.interrupt();
    this.unlisten();
    if (current === this) current = null;
  }

  private check(): void {
    if (!this.stopTick) return;
    const now = this.env.now();
    if (now - this.last > GAP) return this.interrupt();
    this.last = now;
  }

  private halt(): void {
    this.stopTick?.();
    this.stopTick = null;
  }
}
