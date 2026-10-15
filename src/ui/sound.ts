// Sound, music and vibration (U7, sounds chosen by the owner on 15 Oct; files and credits in src/assets/sounds/).
// The sound files are part of the game itself (owner, 15 Oct: "all sound should be part of the package"): the build
// puts them with the game's other files, the Android app carries them, and the offline worker stores every one of them
// when the game is installed, so sound works fully offline from the first start.
// On by default (owner, 15 Oct); a player can mute either with its switch (sound effects with vibration, and music),
// and the choice is kept on this device. Web Audio: browsers allow sound only after a tap, so the sound starts, and all
// sounds are prepared, at the first tap or key press.
// The game never waits for a sound.

export type Effect =
  | "dice" | "step" | "six" | "good" | "bad" | "bump" | "jump-up" | "jump-down" | "bog" | "card"
  | "lantern-out" | "lantern-on" | "postcard" | "tap" | "win" | "out";
export type Music = "menu" | "game";

/** How loud each effect plays (the files are all equally loud): the ones that repeat often are quieter. */
const LEVEL: Partial<Record<Effect, number>> = { step: 0.3, tap: 0.22, dice: 0.75, card: 0.7, postcard: 0.7 };
const MUSIC_LEVEL: Record<Music, number> = { menu: 0.4, game: 0.28 };
/** The music loops by its original length: an MP3 file is a few milliseconds longer, which would click at each loop. */
const LOOP: Record<string, number> = { "menu-loop": 8.428844, game: 46.836893 };
/** Short buzzes on phones, with the sound switch (milliseconds: buzz, pause, buzz …). */
const BUZZ: Partial<Record<Effect, number | number[]>> = { six: 60, bad: [40, 60, 40], bump: [40, 60, 40], bog: 120, out: [80, 80, 80], win: 300 };

/** Every sound file of the game, by name (the build gives each its address inside the package). */
const FILES: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob<string>("../assets/sounds/*.mp3", { eager: true, query: "?url", import: "default" }))
    .map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1, -4), url]),
);

const KEY = "dgm.sound.v1";
interface Settings { fx: boolean; music: boolean }

function load(): Settings {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Settings>;
    return { fx: s.fx !== false, music: s.music !== false }; // on unless the player muted it
  } catch {
    return { fx: true, music: true };
  }
}

class Sound {
  readonly settings: Settings = load();
  private ctx: AudioContext | null = null;
  private fxGain: GainNode | null = null;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private want: Music | null = null;
  private playing: { name: Music; gain: GainNode; sources: AudioBufferSourceNode[] } | null = null;
  private listeners = new Set<() => void>();
  /** Whether the player has tapped or pressed a key yet (before that, browsers keep sound blocked). */
  private unlocked = false;

  constructor() {
    // The first tap anywhere opens the sound (browsers allow it only then)
    const unlock = () => {
      if (this.unlocked) { if (this.settings.fx || this.settings.music) this.start(); return; }
      this.unlocked = true;
      if (this.settings.fx || this.settings.music) { this.start(); this.music(this.want); }
    };
    addEventListener("pointerdown", unlock, { capture: true });
    addEventListener("keydown", unlock, { capture: true });
    // A soft click on every button, when sound is on
    addEventListener("click", (e) => { if ((e.target as Element | null)?.closest?.("button")) this.play("tap"); }, { capture: true });
    // Quiet when the game is in the background
    document.addEventListener("visibilitychange", () => { if (document.hidden) void this.ctx?.suspend(); else if (this.ctx) void this.ctx.resume(); });
  }

  /** Called when a switch changes (the switches on screen show the new state). */
  onChange(fn: () => void): void {
    this.listeners.add(fn);
  }

  set(which: keyof Settings, on: boolean): void {
    this.settings[which] = on;
    try { localStorage.setItem(KEY, JSON.stringify(this.settings)); } catch { /* not kept: the game goes on */ }
    if (on) this.start();
    if (which === "music") this.music(this.want);
    this.listeners.forEach((fn) => fn());
  }

  /** An effect (and its buzz), if sound is on. */
  play(name: Effect): void {
    if (!this.settings.fx) return;
    const buzz = BUZZ[name];
    if (buzz !== undefined) try { navigator.vibrate?.(buzz); } catch { /* no vibration here */ }
    const ctx = this.start();
    if (!ctx || ctx.state !== "running") return;
    void this.buffer(name).then((b) => {
      if (!b || !this.fxGain) return;
      const src = ctx.createBufferSource(), g = ctx.createGain();
      g.gain.value = LEVEL[name] ?? 0.85;
      src.buffer = b;
      src.connect(g).connect(this.fxGain);
      src.start();
    });
  }

  /** Which music should play now (null: none). It plays only when the music switch is on. */
  music(name: Music | null): void {
    this.want = name;
    const target = this.settings.music ? name : null;
    if (this.playing?.name === target) return;
    this.fadeOut();
    if (!target) return;
    const ctx = this.start();
    if (!ctx) return;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    const entry = { name: target, gain, sources: [] as AudioBufferSourceNode[] };
    this.playing = entry;
    const loopName = target === "menu" ? "menu-loop" : "game";
    void Promise.all([target === "menu" ? this.buffer("menu-intro") : Promise.resolve(null), this.buffer(loopName)]).then(([intro, loop]) => {
      if (this.playing !== entry || !loop) return;
      const t = ctx.currentTime + 0.05;
      let at = t;
      if (intro) { // the musician's own beginning, once, then the loop for as long as the screen is open
        const s = ctx.createBufferSource(); s.buffer = intro; s.connect(gain); s.start(t); entry.sources.push(s);
        at = t + intro.duration;
      }
      const l = ctx.createBufferSource();
      l.buffer = loop; l.loop = true; l.loopStart = 0; l.loopEnd = Math.min(LOOP[loopName], loop.duration);
      l.connect(gain); l.start(at); entry.sources.push(l);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(MUSIC_LEVEL[target], t + 1.2);
    });
  }

  private fadeOut(): void {
    const p = this.playing, ctx = this.ctx;
    this.playing = null;
    if (!p || !ctx) return;
    const t = ctx.currentTime;
    p.gain.gain.cancelScheduledValues(t);
    p.gain.gain.setValueAtTime(p.gain.gain.value, t);
    p.gain.gain.linearRampToValueAtTime(0, t + 0.6);
    p.sources.forEach((s) => { try { s.stop(t + 0.65); } catch { /* not started yet */ } });
  }

  /** The audio context, made on first need (after a tap, or the browser keeps it paused). */
  private start(): AudioContext | null {
    if (!this.unlocked) return null; // nothing before the first tap: the music then starts on it
    try {
      if (!this.ctx) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.fxGain = this.ctx.createGain();
        this.fxGain.connect(this.ctx.destination);
        Object.keys(FILES).forEach((n) => void this.buffer(n)); // all of them ready before they are needed
      }
      if (this.ctx.state === "suspended" && !document.hidden) void this.ctx.resume().then(() => this.music(this.want));
      return this.ctx;
    } catch {
      return null;
    }
  }

  /** A sound file from the package, decoded once. */
  private buffer(name: string): Promise<AudioBuffer | null> {
    let p = this.buffers.get(name);
    if (!p && FILES[name]) {
      p = fetch(FILES[name])
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((a) => this.ctx!.decodeAudioData(a))
        .catch(() => { this.buffers.delete(name); return null; }); // could not be decoded now: tried again next time
      this.buffers.set(name, p);
    }
    return p ?? Promise.resolve(null);
  }
}

/** The one sound player of the app. */
export const sound = new Sound();
