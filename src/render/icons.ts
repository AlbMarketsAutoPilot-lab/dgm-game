// Line icons for every `icon` name in the board files (GCD §14: every event has a colour and an icon).
// SVG path data on a 24 × 24 grid, drawn with the purple ink pen. Simple shapes, so they read at small sizes.

const c = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const lantern = (x: number, s = 1) =>
  `M${x - 3 * s} ${8}h${6 * s}l${-1 * s} ${7 * s}h${-4 * s}zM${x - 3 * s} 8c0 ${-2 * s} ${6 * s} ${-2 * s} ${6 * s} 0M${x} ${8 - 2 * s}v${-1.5 * s}`;

export const ICONS: Record<string, string> = {
  anchor: c(12, 5, 2) + "M12 7v14M7 11h10M4 14c1 4 4 7 8 7s7-3 8-7",
  balloon: "M12 3c-4 0-6 3-6 6 0 4 4 7 6 8 2-1 6-4 6-8 0-3-2-6-6-6zM10.5 17l.5 2h2l.5-2M10 19h4v3h-4z",
  bicycle: c(6, 16, 3.5) + c(18, 16, 3.5) + "M6 16l4-7h6l2 7M10 9l2 7h-6M15 6h3M8 7h4",
  "big-clock": c(12, 12, 8.5) + "M12 7v5l3.5 2.5",
  "boat-leaving": "M3 15h12l-2 4H5zM9 15V5l5 8H9M16 19c1-1 2-1 3 0s2 1 3 0M17 9h5M20 7l2 2-2 2",
  "boot-in-mud": "M8 3h5v9l5 2v3H8zM3 18c3-2 5 2 9 0s6-2 9 0M4 21h16",
  boots: "M4 5h4v8l4 2v3H4zM13 5h4v8l4 2v3h-8z",
  "broken-train": "M5 4h14v11H5zM5 10h14M8 15l-2 4M16 15l2 4M11 3l2 3-2 3 2 3",
  bunting: "M2 5c6 4 14 4 20 0M4 6.5l2 5 2-4M9.5 8l2 5 2-5M15.5 7.5l2 5 2-5.5",
  cabin: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5M16 5v3",
  "cable-car": "M2 6l20-3M12 4.5V8M7 8h10l1 9H6zM6 12.5h12",
  card: "M5 3h14v18H5zM9 8h6M9 12h6M9 16h3",
  compass: c(12, 12, 8.5) + "M15.5 8.5l-2.5 4.5-4.5 2.5 2.5-4.5z",
  "crossed-bed": "M3 19V8M3 14h18v5M10 11h10v3M7 11.5h.5M3 4l18 18",
  "door-key": "M4 21V4h9v17M10 12.5h1" + c(18, 8, 2.5) + "M18 10.5V19M18 15h2M18 17.5h2",
  duck: "M7 9a3 3 0 1 1 5 2c4-1 8 0 9 3-1 4-5 6-9 6s-8-2-8-5c0-2 2-3 3-3M6 8l-4 1.5 4 1M8.5 8h.5",
  "fallen-tree": "M2 19l15-7M3 21.5l15-7M17 12c3-2 5 0 3 3M10 15.5l-2-5M13 14l1-4M2 19l1 2.5",
  ferry: "M3 15h18l-3 5H6zM6 15v-4h12v4M9 11V8h5v3M8 13h1M11.5 13h1M15 13h1",
  "flat-path": "M8 21L11 3M16 21L13 3M12 19v-2.5M12 13.5v-2M12 8.5V7",
  fog: "M4 7h11M7 11h13M3 15h14M8 19h10",
  "hay-cart": "M2 14h15V9c-3-4-11-4-15 0zM17 12l5 2.5" + c(6, 17.5, 2.5) + c(14, 17.5, 2.5),
  house: "M3 11l9-8 9 8M5 9.5V20h14V9.5M10 20v-6h4v6",
  "ice-cream": "M8 10l4 11 4-11M7 10c0-6.5 10-6.5 10 0z",
  "joining-paths": "M5 21c0-6 7-8 7-12V3M19 21c0-6-7-8-7-12",
  key: c(7, 12, 3.5) + "M10.5 12H21M17 12v3M20 12v3.5",
  lantern: "M9 4h6M12 2v2M8 7h8l-1 11H9zM8 7c0-2 8-2 8 0M9.5 18h5v2.5h-5zM12 15c-1.5-1-1-3 0-4 1 1 1.5 3 0 4z",
  lanterns: "M1 4c7 4 15 4 22 0" + lantern(6, 0.9) + lantern(12, 1.1) + lantern(18, 0.9),
  maze: "M3 3h18v18H3zM7 3v14h4M11 7h6v10M15 11v6M7 21v-1",
  "park-bench": "M3 11h18M3 14h18M5 14v6M19 14v6M4 11V7h16v4",
  "phone-map": "M7 2h10v20H7zM10.5 19h3M12 13c-2-2-3-3.5-3-5a3 3 0 0 1 6 0c0 1.5-1 3-3 5zM12 8h.1",
  pier: "M2 11h20M5 11v8M11 11v8M17 11v8M2 21c3-1.5 5 1 8 0s5-1.5 8 0 3 0 4 0",
  puddle: "M3 16c0-3 5-4 9-3s9 0 9 3-4 4-9 4-9-1-9-4zM10 5l-1 4M14 3l-1 4M17.5 6.5l-1 3",
  "rope-swing": "M3 3h18M14 3l-5 13M7 16h4M2 21c3-1.5 5 1 8 0s5-1.5 8 0 3 0 4 0",
  sailboat: "M12 3v13M12 4l7 11h-7M11 6.5L5 15h6M3 17h18l-3 4H6z",
  scooter: c(5, 18, 2.2) + c(19, 18, 2.2) + "M7 18h10M17 18l1.5-14H22",
  sheep: "M7 10c0-2 3-3 4-1 1-2 4-2 5 0 2-1 4 1 3 3 2 1 1 4-1 4H8c-2 0-3-3-1-4zM9 16v4M12 16v4M15 16v4M18 16v4" + c(4.5, 11, 2),
  shoelace: "M2 17v-5l4-1 3 2 4-2c3 0 8 2 8 4v2zM2 19.5h19M13 11c1-4 5-5 5-3s-4 1-5 3c0 2 3 3 1 5",
  signpost: "M12 3v18M12 5h7l2 2-2 2h-7M12 11H5l-2 2 2 2h7M8.5 21h7",
  "ski-lift": "M2 6l20-3M12 5v6M7 11h10v3H7zM8 14v4M16 14v4M7 18h10",
  sledge: "M3 16h15c2 0 3-1 3-3M5 16l1-4h10l1 4M5 19.5h14c2 0 2.5-2 2.5-3",
  "sleeping-face": c(11, 13, 8) + "M7 12h3M12 12h3M9 16.5c1 1 3 1 4 0M17 2h4l-4 4h4",
  "slide-mud": c(7, 5, 2) + "M8 8l3 3 4 1M3 9l17 10M3 21.5c5-2 7 1 11-1 3-1 5-1 7 0",
  "snake-crown": "M7 8l1.5-5 3.5 3 3.5-3L17 8zM3 20c3 0 4-5 8-5s3-4 0-4M11 15c4 0 5 5 10 5",
  "snake-down": c(14, 3.5, 1.8) + "M14 5.5c-4 1-4 4 0 5s4 4 0 5-4 4-1 5M13 20.5l-3 .5 1.5-2.5",
  station: "M4 21V9l8-5 8 5v12M3 21h18M9 21v-6h6v6M10 10h4",
  steps: "M3 20h5v-4h5v-4h5V8h3M3 20h18",
  stones: "M2 18c0-2 6-2 6 0s-6 2-6 0zM9 13.5c0-2 6-2 6 0s-6 2-6 0zM16 9c0-2 6-2 6 0s-6 2-6 0z",
  suitcase: "M4 8h16v12H4zM9 8V5h6v3M4 13h16",
  "swap-arrows": "M4 8h15l-3-3M19 8l-3 3M20 16H5l3-3M5 16l3 3",
  tent: "M2 20L12 4l10 16zM12 4v16M9 20l3-5 3 5",
  ticket: "M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM15 8v1.5M15 11.5v1.5M15 15v1",
  tractor: c(7, 16, 4) + c(18.5, 17.5, 2.5) + "M5 12V5h7l2 7h7v3.5M12 5v7",
  "traffic-light": "M8 2h8v20H8z" + c(12, 6, 1.8) + c(12, 12, 1.8) + c(12, 18, 1.8),
  train: "M6 3h12v13H6zM6 10h12M9 16l-2 5M15 16l2 5M8.5 13h1M14.5 13h1M9 6h6",
  "train-back": "M9 3h12v12H9zM9 9h12M11 15l-2 4M19 15l2 4M7 18H2l2-2M2 18l2 2",
  "two-keys": c(6, 7, 2.5) + "M8.5 7H18M15 7v2.5" + c(7, 16, 2.5) + "M9.5 16H21M18 16v2.5",
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
