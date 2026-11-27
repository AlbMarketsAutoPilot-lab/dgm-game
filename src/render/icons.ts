// Line icons for every `icon` name in the board files (GCD §14: every event has a colour and an icon).
// SVG path data on a 24 × 24 grid, drawn with the purple ink pen. Simple shapes, so they read at small sizes.

const c = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const lantern = (x: number, s = 1) =>
  `M${x - 3 * s} ${8}h${6 * s}l${-1 * s} ${7 * s}h${-4 * s}zM${x - 3 * s} 8c0 ${-2 * s} ${6 * s} ${-2 * s} ${6 * s} 0M${x} ${8 - 2 * s}v${-1.5 * s}`;

export const ICONS: Record<string, string> = {
  "big-clock": c(12, 12, 8.5) + "M12 7v5l3.5 2.5",
  cabin: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5M16 5v3",
  "cable-car": "M2 6l20-3M12 4.5V8M7 8h10l1 9H6zM6 12.5h12",
  card: "M5 3h14v18H5zM9 8h6M9 12h6M9 16h3",
  "crossed-bed": "M3 19V8M3 14h18v5M10 11h10v3M7 11.5h.5M3 4l18 18",
  "fallen-tree": "M2 19l15-7M3 21.5l15-7M17 12c3-2 5 0 3 3M10 15.5l-2-5M13 14l1-4M2 19l1 2.5",
  "hay-cart": "M2 14h15V9c-3-4-11-4-15 0zM17 12l5 2.5" + c(6, 17.5, 2.5) + c(14, 17.5, 2.5),
  house: "M3 11l9-8 9 8M5 9.5V20h14V9.5M10 20v-6h4v6",
  "ice-cream": "M8 10l4 11 4-11M7 10c0-6.5 10-6.5 10 0z",
  lantern: "M9 4h6M12 2v2M8 7h8l-1 11H9zM8 7c0-2 8-2 8 0M9.5 18h5v2.5h-5zM12 15c-1.5-1-1-3 0-4 1 1 1.5 3 0 4z",
  lanterns: "M1 4c7 4 15 4 22 0" + lantern(6, 0.9) + lantern(12, 1.1) + lantern(18, 0.9),
  pier: "M2 11h20M5 11v8M11 11v8M17 11v8M2 21c3-1.5 5 1 8 0s5-1.5 8 0 3 0 4 0",
  sailboat: "M12 3v13M12 4l7 11h-7M11 6.5L5 15h6M3 17h18l-3 4H6z",
  sheep: "M7 10c0-2 3-3 4-1 1-2 4-2 5 0 2-1 4 1 3 3 2 1 1 4-1 4H8c-2 0-3-3-1-4zM9 16v4M12 16v4M15 16v4M18 16v4" + c(4.5, 11, 2),
  signpost: "M12 3v18M12 5h7l2 2-2 2h-7M12 11H5l-2 2 2 2h7M8.5 21h7",
  "sleeping-face": c(11, 13, 8) + "M7 12h3M12 12h3M9 16.5c1 1 3 1 4 0M17 2h4l-4 4h4",
  stones: "M2 18c0-2 6-2 6 0s-6 2-6 0zM9 13.5c0-2 6-2 6 0s-6 2-6 0zM16 9c0-2 6-2 6 0s-6 2-6 0z",
  suitcase: "M4 8h16v12H4zM9 8V5h6v3M4 13h16",
  "swap-arrows": "M4 8h15l-3-3M19 8l-3 3M20 16H5l3-3M5 16l3 3",
  tent: "M2 20L12 4l10 16zM12 4v16M9 20l3-5 3 5",
  tractor: c(7, 16, 4) + c(18.5, 17.5, 2.5) + "M5 12V5h7l2 7h7v3.5M12 5v7",
  "traffic-light": "M8 2h8v20H8z" + c(12, 6, 1.8) + c(12, 12, 1.8) + c(12, 18, 1.8),
  "train-back": "M9 3h12v12H9zM9 9h12M11 15l-2 4M19 15l2 4M7 18H2l2-2M2 18l2 2",
  waves: "M2 8c3-2 4 2 7 0s4-2 7 0 4 2 6 0M2 13c3-2 4 2 7 0s4-2 7 0 4 2 6 0M2 18c3-2 4 2 7 0s4-2 7 0 4 2 6 0",
};

const paths = new Map<string, Path2D>();

/**
 * Draws icon `name` centred on (x, y), `size` units wide, with the current stroke style.
 * Unknown names draw a question mark so a missing icon is visible, never silent.
 */
export function drawIcon(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, size: number, width = 1.7): void {
  let p = paths.get(name);
  if (!p) { p = new Path2D(ICONS[name] ?? "M8 8c0-5 8-5 8 0s-4 4-4 7M12 19v1"); paths.set(name, p); }
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(p);
  ctx.restore();
}
