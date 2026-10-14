// The camera over the board (GCD §14: pan and zoom; Step 4 adds following the moving token).
// The board is a "world" element in board units × UNIT pixels; the camera moves it with one CSS transform.
// Pure view math (exported for tests) + a controller for touch, mouse, wheel and keyboard.

export interface View {
  /** Board point at the centre of the screen, in board units. */
  cx: number;
  cy: number;
  /** Screen pixels per board unit. */
  zoom: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Zoom at which `across` squares fill the narrower side of the screen ("square level"). */
export const squareZoom = (vw: number, vh: number, across = 2.8): number => Math.min(vw, vh) / across;

/** Zoom at which the whole board fits the screen. */
export const fitZoom = (b: Rect, vw: number, vh: number): number => Math.min(vw / b.w, vh / b.h);

export interface Limits {
  minZoom: number;
  maxZoom: number;
}

export function limitsFor(b: Rect, vw: number, vh: number): Limits {
  const min = Math.min(fitZoom(b, vw, vh), squareZoom(vw, vh));
  return { minZoom: min, maxZoom: squareZoom(vw, vh, 1.3) };
}

/** Keeps the zoom within limits and the board on screen (centred when it is smaller than the screen). */
export function clampView(v: View, b: Rect, vw: number, vh: number, lim: Limits): View {
  const zoom = Math.min(lim.maxZoom, Math.max(lim.minZoom, v.zoom));
  const axis = (c: number, start: number, size: number, screen: number) => {
    const half = screen / 2 / zoom;
    if (size <= 2 * half) return start + size / 2;
    return Math.min(start + size - half, Math.max(start + half, c));
  };
  return { zoom, cx: axis(v.cx, b.x, b.w, vw), cy: axis(v.cy, b.y, b.h, vh) };
}

/** Zooms by `factor` keeping the board point under the screen point (px, py) in place. */
export function zoomAround(v: View, factor: number, px: number, py: number, vw: number, vh: number): View {
  const zoom = v.zoom * factor;
  const wx = v.cx + (px - vw / 2) / v.zoom, wy = v.cy + (py - vh / 2) / v.zoom;
  return { zoom, cx: wx - (px - vw / 2) / zoom, cy: wy - (py - vh / 2) / zoom };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Moves `world` (a board drawn at `unit` px per board unit, origin at `bounds.x/y`) inside `viewport`. */
export class Camera {
  view: View = { cx: 0, cy: 0, zoom: 1 };
  /** Called after every change (for example to update which squares animate). */
  onChange: (v: View) => void = () => {};
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private flight = 0;

  constructor(
    private readonly viewport: HTMLElement,
    private readonly world: HTMLElement,
    private readonly bounds: Rect,
    private readonly unit: number,
  ) {
    viewport.addEventListener("pointerdown", this.down);
    viewport.addEventListener("pointermove", this.move);
    for (const t of ["pointerup", "pointercancel", "pointerleave"] as const) viewport.addEventListener(t, this.up);
    viewport.addEventListener("wheel", this.wheel, { passive: false });
    viewport.addEventListener("keydown", this.key);
    viewport.addEventListener("dblclick", this.dbl);
    new ResizeObserver(() => this.set(this.view)).observe(viewport);
  }

  get size(): { vw: number; vh: number } {
    return { vw: this.viewport.clientWidth || 1, vh: this.viewport.clientHeight || 1 };
  }

  get limits(): Limits {
    const { vw, vh } = this.size;
    return limitsFor(this.bounds, vw, vh);
  }

  /** Shows `v` at once (clamped). */
  set(v: View): void {
    const { vw, vh } = this.size;
    this.view = clampView(v, this.bounds, vw, vh, this.limits);
    const { cx, cy, zoom } = this.view, k = zoom / this.unit;
    const tx = vw / 2 - (cx - this.bounds.x) * zoom, ty = vh / 2 - (cy - this.bounds.y) * zoom;
    this.world.style.transform = `translate(${tx}px, ${ty}px) scale(${k})`;
    this.onChange(this.view);
  }

  /** Glides to `target` (instantly with reduced motion). */
  flyTo(target: Partial<View>, ms = 600): Promise<void> {
    const from = this.view, to = clampView({ ...from, ...target }, this.bounds, this.size.vw, this.size.vh, this.limits);
    cancelAnimationFrame(this.flight);
    if (reducedMotion() || ms <= 0) { this.set(to); return Promise.resolve(); }
    const t0 = performance.now();
    return new Promise((done) => {
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms), e = ease(t), lz = Math.log(from.zoom) + (Math.log(to.zoom) - Math.log(from.zoom)) * e;
        this.set({ cx: from.cx + (to.cx - from.cx) * e, cy: from.cy + (to.cy - from.cy) * e, zoom: Math.exp(lz) });
        if (t < 1) this.flight = requestAnimationFrame(step); else done();
      };
      this.flight = requestAnimationFrame(step);
    });
  }

  /** Square level around a board point. */
  focus(x: number, y: number, ms?: number): Promise<void> {
    const { vw, vh } = this.size;
    return this.flyTo({ cx: x, cy: y, zoom: squareZoom(vw, vh) }, ms);
  }

  /** The whole board. */
  overview(ms?: number): Promise<void> {
    return this.flyTo({ cx: this.bounds.x + this.bounds.w / 2, cy: this.bounds.y + this.bounds.h / 2, zoom: 0 }, ms);
  }

  zoomBy(factor: number): void {
    const { vw, vh } = this.size;
    this.flyTo(zoomAround(this.view, factor, vw / 2, vh / 2, vw, vh), 250);
  }

  // ---- Input ----

  private local(e: PointerEvent | WheelEvent | MouseEvent) {
    const r = this.viewport.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private down = (e: PointerEvent) => {
    cancelAnimationFrame(this.flight);
    this.viewport.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, this.local(e));
  };

  private move = (e: PointerEvent) => {
    const old = this.pointers.get(e.pointerId);
    if (!old) return;
    const now = this.local(e), { vw, vh } = this.size;
    if (this.pointers.size === 1) {
      this.set({ ...this.view, cx: this.view.cx - (now.x - old.x) / this.view.zoom, cy: this.view.cy - (now.y - old.y) / this.view.zoom });
    } else if (this.pointers.size === 2) {
      const other = [...this.pointers.entries()].find(([id]) => id !== e.pointerId)![1];
      const d0 = Math.hypot(old.x - other.x, old.y - other.y), d1 = Math.hypot(now.x - other.x, now.y - other.y);
      const mx = (now.x + other.x) / 2, my = (now.y + other.y) / 2, pmx = (old.x + other.x) / 2, pmy = (old.y + other.y) / 2;
      let v = zoomAround(this.view, d0 > 0 ? d1 / d0 : 1, mx, my, vw, vh);
      v = { ...v, cx: v.cx - (mx - pmx) / v.zoom, cy: v.cy - (my - pmy) / v.zoom };
      this.set(v);
    }
    this.pointers.set(e.pointerId, now);
  };

  private up = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
  };

  private wheel = (e: WheelEvent) => {
    e.preventDefault();
    const p = this.local(e), { vw, vh } = this.size;
    this.set(zoomAround(this.view, Math.exp(-e.deltaY * 0.0015), p.x, p.y, vw, vh));
  };

  private dbl = (e: MouseEvent) => {
    const p = this.local(e), { vw, vh } = this.size, sq = squareZoom(vw, vh);
    const wx = this.view.cx + (p.x - vw / 2) / this.view.zoom, wy = this.view.cy + (p.y - vh / 2) / this.view.zoom;
    if (this.view.zoom < sq * 0.9) this.flyTo({ cx: wx, cy: wy, zoom: sq }); else this.overview();
  };

  private key = (e: KeyboardEvent) => {
    const step = 1.5;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      this.flyTo({ cx: this.view.cx + moves[e.key][0], cy: this.view.cy + moves[e.key][1] }, 200);
    } else if (e.key === "+" || e.key === "=") this.zoomBy(1.4);
    else if (e.key === "-") this.zoomBy(1 / 1.4);
  };
}
