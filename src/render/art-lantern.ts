// Step I phase B10 (owner, 26 Nov 2026): the new pictures of the Lantern Festival, in the game's own style (the purple
// ink outline, flat colours, one shaded side, one gentle motion; no text on pictures). Approved by the owner on
// 26 Nov 2026 after seeing them (the Dragon Boat and the Swap Market redrawn without people). Names are new, so the v2
// board's pictures stay as they are until phase C.
import { A, C, INK, S, S2, waves } from "./art-kit";

interface Art {
  svg: string;
  css: string;
  box?: string;
}

const W = "#fffdf6", DARK = "#5f5a6b", GREY = "#8d8a96", GLASS = "#bfe2ff", BARK = "#8a5a3c", BARK2 = "#6b4428";
const BLACK = "#1f1a24", SIGN_YELLOW = "#f6c61c";

// ---- small pieces ----
const pine = (x: number, y: number, k = 1) => `<path d="M${x} ${y - 32 * k}l${10 * k} ${26 * k}H${x - 10 * k}z" fill="${C.pine}" ${S2}/><path d="M${x} ${y - 6 * k}v${6 * k}" ${S2}/>`;
const wheel = (x: number, y: number, r: number) => `<g${A("spin", { d: 1.2, o: [x, y] })}><circle cx="${x}" cy="${y}" r="${r}" fill="${DARK}" ${S}/>`
  + `<circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${GREY}" ${S2}/><path d="M${x} ${y - r * 0.45}v${-r * 0.4}M${x - r * 0.39} ${y + r * 0.22}l${-r * 0.35} ${r * 0.2}M${x + r * 0.39} ${y + r * 0.22}l${r * 0.35} ${r * 0.2}" ${S2}/></g>`;
/** A head with hair, no face (as the game's other people). */
const head = (x: number, y: number, r = 3.4, hair: string = C.dbrown) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.skin}" ${S2}/>`
  + `<path d="M${x - r} ${y - 0.3}a${r} ${r} 0 0 1 ${2 * r} 0q${-r} ${-1.5 * r * 0.45} ${-2 * r} 0z" fill="${hair}"/>`;
const leaf = (x: number, y: number, colour: string = C.leaf) => `<path d="M${x} ${y}q3-3.4 7 0-4 3.4-7 0z" fill="${colour}"/><path d="M${x} ${y}h7" stroke="#00000033" stroke-width=".8"/>`;
/** A red paper lantern hanging at (x, y), swaying. */
const paperLantern = (x: number, y: number, k = 1) => `<g${A("sway", { r: 6, d: 2.6, o: [x, y] })}><path d="M${x} ${y}v${5 * k}" ${S2}/>`
  + `<rect x="${x - 3 * k}" y="${y + 5 * k}" width="${6 * k}" height="${2 * k}" rx="0.8" fill="${C.gold}" ${S2}/>`
  + `<ellipse cx="${x}" cy="${y + 13 * k}" rx="${7 * k}" ry="${6.5 * k}" fill="${C.red}" ${S}/>`
  + `<path d="M${x - 3.4 * k} ${y + 7.2 * k}q${-1.6 * k} ${5.8 * k} 0 ${11.6 * k}M${x + 3.4 * k} ${y + 7.2 * k}q${1.6 * k} ${5.8 * k} 0 ${11.6 * k}" fill="none" stroke="#00000033" stroke-width="1.2"/>`
  + `<rect x="${x - 3 * k}" y="${y + 19 * k}" width="${6 * k}" height="${2 * k}" rx="0.8" fill="${C.gold}" ${S2}/><path d="M${x} ${y + 21 * k}v${4 * k}" stroke="${C.gold}" stroke-width="1.6"/></g>`;

// ---- The lantern's flame (owner, 26 Nov 2026: squares 96 and 99 replace the keys) ----
const NIGHT = "#2c3163", STONE = "#4a4466", STONE2 = "#3b3656";
const RED2 = "#a8322b", RED3 = "#7e2421";
/** The evening street (owner, 26 Nov 2026: only the sky and the cobbles): sky, stars, the cobbled street. */
const nightStreet = () => {
  let s = `<rect x="-10" y="-10" width="120" height="120" fill="${NIGHT}"/>`;
  for (const [x, y, d] of [[30, 14, 2.2], [72, 10, 2.8], [88, 26, 1.9], [40, 30, 3.1], [64, 24, 2.5]]) s += `<g${A("twinkle", { d, dl: x / 40 })}><path d="M${x} ${y - 2}l.7 1.3 1.3.7-1.3.7-.7 1.3-.7-1.3-1.3-.7 1.3-.7z" fill="#fff4c8"/></g>`;
  // the street: cobbles in the lamplight
  s += `<rect x="-10" y="70" width="120" height="40" fill="${STONE}"/><path d="M-10 70H110" stroke="${INK}" stroke-width="1.6"/>`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
    const x = -6 + c * 13 + (r % 2) * 6.5, y = 74 + r * 7;
    s += `<rect x="${x}" y="${y}" width="10.5" height="5" rx="2" fill="${STONE2}" opacity=".85"/>`;
  }
  return s;
};
/** The wind: dashed gusts blowing from the left. */
const gusts = (ys: number[]) => ys.map((y, i) => `<path d="M-4 ${y}q14-5 26 0t26 0q8 2 12-3" fill="none" stroke="#dfe8ff" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="7 6" opacity=".75"${A("dash", { d: 1.1 + i * 0.3 })}/>`).join("");
/** A red paper lantern, unlit: ribs, gold caps (x, y: the top of its cord); standing on the street: no cord, no tassel. */
const darkLantern = (x: number, y: number, standing = false) => {
  const cy = y + 26, rx = 17, ry = 15;
  let ribs = "";
  for (const k of [-0.62, -0.25, 0.25, 0.62]) ribs += `<path d="M${x + k * rx} ${cy - ry * 0.86}q${k * rx * 0.55} ${ry * 0.86} 0 ${ry * 1.72}" fill="none" stroke="${RED3}" stroke-width="1.1"/>`;
  return (standing ? `<path d="M${x - 3} ${y + 7}q3-5 6 0" fill="none" ${S2}/>` : `<path d="M${x} ${y}v7" ${S2}/>`)
    + `<rect x="${x - 7}" y="${y + 7}" width="14" height="4.6" rx="1.4" fill="${C.gold}" ${S2}/>`
    + `<ellipse cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${RED2}" ${S}/>` + ribs
    + `<path d="M${x - rx + 4} ${cy - 6}q3-6 8-7" fill="none" stroke="#c9564c" stroke-width="2" stroke-linecap="round"/>`
    + `<path d="M${x - rx + 1.5} ${cy + 3}q${rx - 1.5} 5 ${2 * rx - 3} 0" fill="none" stroke="${RED3}" stroke-width="1" opacity=".7"/>`
    + `<rect x="${x - 7}" y="${cy + ry - 2}" width="14" height="4.6" rx="1.4" fill="${C.gold}" ${S2}/>`
    + (standing ? "" : `<circle cx="${x}" cy="${cy + ry + 4.2}" r="1.6" fill="${C.gold}" ${S2}/>`
    + [-2, -1, 0, 1, 2].map((k) => `<path d="M${x + k * 0.5} ${cy + ry + 5.6}l${k * 0.9} 8" stroke="#d9a520" stroke-width="1" stroke-linecap="round"/>`).join(""));
};
/** A wisp of smoke curling up from (x, y). */
const smoke = (x: number, y: number) => [0, 1.3].map((dl) => `<g${A("puff", { d: 2.6, dl, x: 8, y: -16, s: 1.8 })}><path d="M${x} ${y}q-3-4 0-7t0-7" fill="none" stroke="#cfd3e6" stroke-width="2.2" stroke-linecap="round" opacity=".85"/></g>`).join("");

// ---- The sixes postcards (owner, 26 Nov 2026): 3, 4, 5 or 6 dice, every one showing 6, on a wooden table ----
/** One die seen from the front and a little above: the 6 on the front face, its top and right side in shade. */
const die3d = (x: number, y: number, k = 1, tilt = 0) => {
  const w = 18 * k, d = 5.5 * k, r = 2.4 * k;
  const pip = (px: number, py: number) => `<circle cx="${(x + px * w).toFixed(2)}" cy="${(y + py * w).toFixed(2)}" r="${(1.75 * k).toFixed(2)}" fill="${INK}"/>`;
  return `<g transform="rotate(${tilt} ${x + w / 2} ${y + w / 2})">`
    + `<path d="M${x} ${y}l${d} ${-d}h${w}l${-d} ${d}z" fill="#f3ead8" ${S2}/>` // top
    + `<path d="M${x + w} ${y}l${d} ${-d}v${w}l${-d} ${d}z" fill="#d9ccb2" ${S2}/>` // right side
    + `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${r}" fill="${C.white}" ${S}/>`
    + [[0.27, 0.25], [0.27, 0.5], [0.27, 0.75], [0.73, 0.25], [0.73, 0.5], [0.73, 0.75]].map(([a, b]) => pip(a, b)).join("")
    + `<path d="M${x + w + d * 0.5} ${y - d * 0.15}v${w * 0.5}" stroke="#b9ab90" stroke-width="${(1.2 * k).toFixed(2)}" stroke-linecap="round"/>`
    + `</g>`;
};
/** The table and the dice, placed for `n` dice (back row first, so the front ones overlap it). */
const sixes = (n: number) => {
  const spots: Record<number, [number, number, number, number][]> = { // x, y, size, tilt: every die stands on the table
    3: [[20, 55, 1.05, -4], [41, 53, 1.05, 3], [62, 56, 1.05, -2]],
    4: [[24, 43, 0.92, 3], [52, 43, 0.92, -3], [14, 64, 0.98, -2], [62, 64, 0.98, 4]],
    5: [[12, 45, 0.84, -3], [39, 44, 0.84, 2], [66, 45, 0.84, -2], [25, 65, 0.92, 3], [55, 66, 0.92, -3]],
    6: [[10, 46, 0.8, 2], [38, 45, 0.8, -3], [66, 46, 0.8, 3], [8, 67, 0.84, -2], [38, 67, 0.84, 3], [68, 67, 0.84, -2]],
  };
  let t = `<rect x="-10" y="-10" width="120" height="120" fill="#f6ecd6"/>`
    + `<path d="M-10 52H110V110H-10z" fill="${C.brown}"/><path d="M-10 52H110" ${S}/>`
    + `<path d="M2 60q20-2 40 0t44 0M-2 72q24-2 48 0t50 0M6 86q22-2 44 0t46 0M-4 98q26-2 50 0" fill="none" stroke="#8a5a3c" stroke-width="1.4" stroke-linecap="round"/>`;
  spots[n].forEach(([x, y, k, tilt], i) => {
    t += `<ellipse cx="${x + 9 * k + 2}" cy="${y + 18 * k + 1.5}" rx="${11 * k}" ry="${2.2 * k}" fill="#00000026"/>`;
    t += i === spots[n].length - 1 ? `<g${A("hop", { d: 1.6, a: 3 })}>${die3d(x, y, k, tilt)}</g>` : die3d(x, y, k, tilt);
  });
  return t;
};

export const LANTERN_ART: Record<string, Art> = {
  "sixes-3": { // the postcard "Three Sixes" (owner, 26 Nov 2026): 3 dice, all showing 6
    box: "0 0 100 100",
    svg: sixes(3),
    css: "",
  },
  "sixes-4": { // the postcard "Four Sixes" (owner, 26 Nov 2026): 4 dice, all showing 6
    box: "0 0 100 100",
    svg: sixes(4),
    css: "",
  },
  "sixes-5": { // the postcard "Five Sixes" (owner, 26 Nov 2026): 5 dice, all showing 6
    box: "0 0 100 100",
    svg: sixes(5),
    css: "",
  },
  "sixes-6": { // the postcard "Six Sixes" (owner, 26 Nov 2026): 6 dice, all showing 6
    box: "0 0 100 100",
    svg: sixes(6),
    css: "",
  },
  "lantern-out": { // The Flame Goes Out (owner, 26 Nov 2026; replaces "Forgot Your Keys"): an evening street of an old town;
    // a traveller's red paper lantern stands on the cobbles (owner: no pole, no person), rocking in the wind, its flame
    // just blown out: a wisp of smoke rises from it.
    box: "0 0 100 100",
    svg: nightStreet() + gusts([30, 56])
      + `<ellipse cx="50" cy="87" rx="20" ry="2.6" fill="#00000040"/>`
      + `<g${A("sway", { r: 3, d: .9, o: [50, 86] })}>` + darkLantern(50, 42, true) + `</g>` + smoke(50, 48),
    css: "",
  },
  "lantern-torn": { // Out Again! (owner, 26 Nov 2026; replaces "Forgot Your Keys Again!"): the same street; the wind has
    // blown the lantern over and torn it: crushed on the cobbles, ribs broken, the gold cap rolled away, the candle out, scraps flying.
    box: "0 0 100 100",
    svg: nightStreet()
      // the lantern lying on its side, squashed, its far end torn open: bare ribs, the dark inside, the candle rolled out
      + `<g transform="rotate(-6 48 82)">`
      + `<path d="M30 82q0-11 18-11h10l4 3-3 3 4 2-3 3 4 3-4 4h-11q-19 0-19-7z" fill="${RED2}" ${S}/>`
      + `<path d="M36 72q-3 10 0 19M45 71q-2 10 0 21M54 71q-2 11 0 21" fill="none" stroke="${RED3}" stroke-width="1.2"/>`
      + `<path d="M58 74q5 0 4 8t-4 8" fill="#3a1820" ${S2}/>` // the dark inside
      + `<path d="M58 73q8 2 11-3M60 80q7 1 12 0M58 89q8 0 11 4" fill="none" stroke="#e3c48f" stroke-width="1.6" stroke-linecap="round"/>` // bare ribs
      + `<path d="M34 76q4-3 9-3" fill="none" stroke="#c9564c" stroke-width="1.8" stroke-linecap="round"/>`
      + `<rect x="25.5" y="75" width="5" height="14" rx="1.4" fill="${C.gold}" ${S2}/>` // the cap still on
      + `<circle cx="23.5" cy="82" r="1.6" fill="${C.gold}" ${S2}/>` + [-2, -1, 0, 1, 2].map((k) => `<path d="M22 ${82 + k * 0.5}l-7 ${k * 1.4}" stroke="#d9a520" stroke-width="1" stroke-linecap="round"/>`).join("")
      + `</g>`
      + `<rect x="78" y="86" width="12" height="4.6" rx="1.4" fill="${C.gold}" ${S2} transform="rotate(-24 84 88)"/>` // the other cap, rolled away
      + `<path d="M66 91l9 1.5" stroke="#efe6d2" stroke-width="3.6" stroke-linecap="round"/><path d="M66 91l9 1.5" ${S2} fill="none"/>` // the candle
      + `<g${A("puff", { d: 2.8, x: 6, y: -12, s: 1.6 })}><path d="M76 91q-2-3 0-6" fill="none" stroke="#cfd3e6" stroke-width="1.6" stroke-linecap="round"/></g>`
      // torn scraps of red paper blown away by the wind
      + [[38, 42, 2.6, 0], [56, 32, 3.2, 1.1], [26, 58, 2.9, 2]].map(([x, y, d, dl]) => `<g${A("move", { d, dl, x: 40, y: -12 })}><path d="M${x} ${y}l4-1.5 1 3-3.6 2.2z" fill="${C.red}" stroke="${RED3}" stroke-width=".8" stroke-linejoin="round"/></g>`).join("")
      + gusts([24, 46]),
    css: "",
  },
  "great-tree": { // The Fallen Tree (redraw): an old trunk across a forest path, roots in the air, leaves drifting down
    svg: `<rect x="-10" y="58" width="120" height="50" fill="${C.grass}"/>` + pine(18, 60, 0.9) + pine(30, 58, 0.7) + pine(78, 60, 0.85) + pine(90, 59, 0.7)
      + `<path d="M38 100L46 58h8l8 42z" fill="#d8c29a"/><path d="M6 58H94" ${S}/>`
      // roots and the earth they pulled up (left), then the trunk lying across the path
      + `<path d="M20 58q-8 12 0 26q6 4 10-2V62q-4-6-10-4z" fill="${C.mud}" ${S}/>`
      + `<path d="M18 62l-9-7M16 68l-10-1M16 75l-9 5M19 82l-5 8M22 60l-3-9" ${S}/>`
      + `<path d="M26 62L88 70q5 1 4 7t-6 6L26 82z" fill="${BARK}" ${S}/><path d="M28 78L86 79" stroke="${BARK2}" stroke-width="2.4"/>`
      + `<path d="M40 67l10 1.5M56 72l12 1M46 75l9 .5" stroke="${BARK2}" stroke-width="1.6" stroke-linecap="round"/>`
      + `<ellipse cx="27" cy="72" rx="4" ry="10" fill="#d8b98a" ${S}/><ellipse cx="27" cy="72" rx="1.6" ry="4.6" fill="none" stroke="#a0683f" stroke-width="1.2"/>`
      // broken branches and leaves (right)
      + `<path d="M70 70l6-12M80 72l9-9M64 82l4 8" ${S}/>`
      + `<g${A("sway", { r: 3, d: 3, o: [80, 64] })}><circle cx="76" cy="56" r="7" fill="${C.leaf}" ${S}/><circle cx="89" cy="61" r="6" fill="#5f9e63" ${S}/></g>`
      // ferns at the edge
      + `<path d="M8 92q4-10 10-12M10 92q6-6 12-6M90 92q-4-9-10-11M88 92q-6-6-12-5" fill="none" stroke="${C.leaf}" stroke-width="2.6" stroke-linecap="round"/>`
      + [0, 1, 2].map((i) => `<g${A("fall", { d: 3.6, dl: i * 1.2, x: -6 + i * 4, y: 34 })}>${leaf(46 + i * 14, 20 + i * 3, i === 1 ? C.orange : C.leaf)}</g>`).join(""),
    css: "",
  },

  "village-bus": { // The Village Bus: a small rounded country bus on a lane between grass verges
    svg: `<rect x="-10" y="70" width="120" height="40" fill="${C.grass}"/><path d="M-10 84h120" stroke="#cdbb92" stroke-width="10"/><path d="M6 70H94" ${S}/>`
      + `<g${A("bob", { a: 1.6, d: 0.9 })}>`
      + `<path d="M12 74V44q0-10 10-10h52q12 0 14 14v26z" fill="${W}" ${S}/>`
      + `<path d="M12.6 62H87.4v6H12.6z" fill="${C.leaf}"/><path d="M80 35.5q6 1.6 7 10V73h-7z" fill="#e4dfd3"/>`
      + [0, 1, 2].map((i) => `<rect x="${18 + i * 15}" y="40" width="11" height="12" rx="2" fill="${GLASS}" ${S2}/>${head(23.5 + i * 15, 49, 3, i === 1 ? "#2b2233" : C.dbrown)}`).join("")
      + `<rect x="64" y="40" width="10" height="28" rx="1.5" fill="${GLASS}" ${S2}/><path d="M69 40v28" ${S2}/>`
      + `<path d="M78 40h6q3 1 3.4 10H78z" fill="${GLASS}" ${S2}/><circle cx="86" cy="66" r="2" fill="${C.gold}" ${S2}/>`
      + `<path d="M12 74H88" ${S}/></g>` + wheel(26, 76, 6) + wheel(72, 76, 6),
    css: "",
  },

  "falling-rocks": { // The Rockslide: China's "falling rocks" warning sign (left version): yellow triangle, black border
    svg: `<path d="M50 80v16" stroke="${GREY}" stroke-width="4"/>`
      + `<path d="M50 8L94 84H6z" fill="${SIGN_YELLOW}" stroke="${BLACK}" stroke-width="1.4" stroke-linejoin="round"/>`
      + `<path d="M50 17L86.5 80H13.5z" fill="none" stroke="${BLACK}" stroke-width="5.4" stroke-linejoin="round"/>`
      // the cliff on the left, rocks falling to the right onto the road
      + `<path d="M34 73V58l4-4 3 4 3-2 2 7-2 5 3 4-1 1z" fill="${BLACK}"/>`
      + `<path d="M50 54l4-2 3 2.4-.8 4-4 .8-2.6-2.4z" fill="${BLACK}"/><path d="M56 63l5-1 2.6 3.4-1.6 4-5 0-1.8-3.4z" fill="${BLACK}"/>`
      + `<path d="M30 74H70" stroke="${BLACK}" stroke-width="2.6"/>`
      + `<g${A("fall", { d: 2.4, x: 6, y: 12 })}><path d="M50 42l3.4-1 2 2.6-1.6 2.8-3.4 0-1-2.6z" fill="${BLACK}"/></g>`,
    css: "",
  },

  "dragon-boat": { // The Dragon Boat (owner, 26 Nov 2026: the boat only, no people; a proper dragon): the big carved
    // dragon head at the bow (open jaws with fangs and a curled tongue, a big eye under a flaming gold brow, antlers, a
    // flaming mane, whiskers, a beard, a scaled neck), the long hull with painted scales, the drum and the curled tail.
    box: "-1 -1 101 101",
    svg: (() => {
      const RED = "#d8433b", RED2 = "#a8322b", RED3 = "#7e2421", GOLD = C.gold, GOLD2 = "#c99a1a";
      const GRN = "#2f8f6a", GRN2 = "#6cc596", MOUTH = "#5a1f2a";
      const L = `stroke="${INK}" stroke-width="1.15" stroke-linejoin="round" stroke-linecap="round"`;
      const T = `stroke="${INK}" stroke-width=".75" stroke-linejoin="round" stroke-linecap="round"`;
      /** A row of scales (small arcs) from x0 to x1 at height y. */
      const scales = (y: number, x0: number, x1: number, w = 4.4) => {
        let d = "";
        for (let x = x0; x < x1 - 0.1; x += w) d += `M${x.toFixed(1)} ${y}q${w / 2} ${w * 0.6} ${w} 0`;
        return `<path d="${d}" fill="none" stroke="${RED3}" stroke-width=".8" opacity=".8"/>`;
      };
      return ``
        // shore and water
        + `<path d="M-6 68Q12 58 26 63Q40 55 54 64L106 62V72H-6z" fill="#d6e8dc"/>`
        + `<rect x="-10" y="71" width="120" height="40" fill="${C.water}"/>` + waves(84, C.deep, 3, 0.45)
        + `<path d="M10 79Q46 83 88 79Q70 86 46 86Q24 85 10 79z" fill="${RED}" opacity=".16"/>`
        + `<g${A("bob", { a: 1.3, d: 1.9 })}>`
        // the tail at the stern: a curl with gold spines
        + `<path d="M6.4 52l-3-1.2 2.8-2zM6.6 45.6l-3.2-1.6 3.2-1.6zM10.8 40.8l-1.4-3.6 3.6.8z" fill="${GOLD}" ${T}/>`
        + `<path d="M8.6 64C4.4 56 5 46 10.4 40.6C13.6 37.6 18.4 38.6 18.2 42.6C18 45.6 14.8 46 13.8 44C14 51 15.4 58 19 64z" fill="${RED}" ${L}/>`
        + `<path d="M13.8 44C14 51 15.4 58 19 64" fill="none" stroke="${GOLD}" stroke-width="1.4"/>`
        + `<path d="M8.8 58q1.8-1.4 3.4 0M8.2 52.6q1.8-1.4 3.4 0M8.8 47.4q1.6-1.4 3.2 0" fill="none" stroke="${RED3}" stroke-width=".8"/>`
        // the hull: gold gunwale, painted scales, darker keel
        + `<path d="M8 63.4H84Q90 63.4 90.4 66.6Q88.4 75 78 77H20Q10.6 75 8 63.4z" fill="${RED}" ${L}/>`
        + `<path d="M10.4 71.4Q14.4 76 20 77H78Q85.6 75.6 88.4 71.4z" fill="${RED2}"/>`
        + scales(68.6, 13, 86) + scales(72, 15.2, 84)
        + `<path d="M8.4 63.8H84.2Q89.4 63.8 90.2 66.2L89.8 67.2H9.6z" fill="${GOLD}" ${T}/>`
        + `<path d="M8 63.4H84Q90 63.4 90.4 66.6Q88.4 75 78 77H20Q10.6 75 8 63.4z" fill="none" ${L}/>`
        // the drum
        + `<path d="M36.6 63.4v-2.4M45.4 63.4v-2.4" stroke="${C.dbrown}" stroke-width="1.3"/>`
        + `<rect x="35" y="52.6" width="12" height="8.8" rx="3.4" fill="${RED}" ${L}/><path d="M36 55h10M36 59h10" stroke="${GOLD}" stroke-width="1.1"/>`
        + `<ellipse cx="35.4" cy="57" rx="1.8" ry="4.3" fill="#f3e1b8" ${T}/>`
        // the flaming mane behind the head and down the neck (drawn first, behind)
        + `<path d="M62 20C54 15 48 16 42 13C46 20 50 24 58 26C52 26 47 29 41 28C46 34 52 34 59 32C53 35 50 39 45 40C51 44 56 42 61 38C57 43 56 47 52 50C58 51 61 47 63.6 43z" fill="${GRN}" ${L}/>`
        + `<path d="M58 21.6C53 19.6 50 19.4 47 18.4M56 29.4C52 30 49 30.6 46 30.4M58 36C55 38 52 39.4 49.6 40M60.6 42.4C58.6 45 57 46.6 55.4 48" fill="none" stroke="${GRN2}" stroke-width="1.1" stroke-linecap="round"/>`
        // the neck rising from the bow: scales and gold belly plates
        + `<path d="M62 40C59 50 63 58 68 64H86C82 58 78.6 52 77.8 45z" fill="${RED}" ${L}/>`
        + `<path d="M77.4 46C78.4 52.6 81.4 58.6 85 63.6" fill="none" stroke="${GOLD}" stroke-width="3"/>`
        + `<path d="M77.2 49.4l2.6-.6M78.4 53.4l2.6-.8M80 57.2l2.6-.8M82 60.6l2.4-.9" stroke="${GOLD2}" stroke-width=".8"/>`
        + `<path d="M63.4 46q2 2.2 4 0M67.4 46q2 2.2 4 0M71.4 46.4q2 2.2 4 0M63.6 51q2 2.2 4 0M67.6 51q2 2.2 4 0M71.6 51.4q2 2.2 4 0M65.4 56q2 2.2 4 0M69.4 56q2 2.2 4 0M73.4 56.4q2 2.2 4 0M68.6 60.6q2 2.2 4 0M72.6 60.8q2 2.2 4 0" fill="none" stroke="${RED3}" stroke-width=".8"/>`
        // the antlers, sweeping back
        + `<path d="M66.6 17.4C62 12 57 9.4 51 9M58.4 10.8L56.4 5.6M71 15.6C68.6 9.6 64.6 5.6 59.4 3.4M65.4 7.2L67.6 2.6" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`
        + `<path d="M66.6 17.4C62 12 57 9.4 51 9M58.4 10.8L56.4 5.6M71 15.6C68.6 9.6 64.6 5.6 59.4 3.4M65.4 7.2L67.6 2.6" fill="none" stroke="${GOLD}" stroke-width="1.9" stroke-linecap="round"/>`
        // the lower jaw (open), the mouth, the curled tongue and the teeth
        + `<path d="M71 36.6C78 38.6 85 39.4 92 38.8C93.4 38.8 93.6 40.6 92.6 41.4C86 45.4 78 47 70.4 45.6C66 44.8 64.4 41.4 66 38.6z" fill="${RED2}" ${L}/>`
        + `<path d="M71.4 36.4L95.6 29.4L92.4 38.8C85 39.4 78 38.6 71.4 36.4z" fill="${MOUTH}" ${T}/>`
        + `<path d="M78 37.6C84 37 88.6 36.2 92 35.6C95.6 35 98.4 36.4 97.8 39C97.2 41 94.6 40.8 94.8 39.2" fill="none" stroke="#e8707a" stroke-width="2.2" stroke-linecap="round"/>`
        + `<path d="M76 35.4l.9 2.4 1-2.8M80.6 34.1l.9 2.4 1-2.8M85.2 32.8l.9 2.4 1-2.8M89.6 31.5l.8 2.2.9-2.6" fill="#fffdf6" ${T}/>`
        + `<path d="M92.8 30.6l.7 4 1.6-4.6z" fill="#fffdf6" ${T}/>`
        + `<path d="M77.6 39.4l1-2.2.9 2.4M82 39.8l1-2.2.9 2.4M86.4 39.8l1-2.2.9 2.4M90.2 39.2l.9-2.6.9 2.5" fill="#fffdf6" ${T}/>`
        // the upper head: skull, brow bump, long snout with the curled nose
        + `<path d="M60.4 32C60 23 64 15.6 72 14.4C77 13.6 80.6 15.4 82 18.6C85 19.4 88 20.2 90.4 20.4C91.6 17.6 95 17 96.6 19C98.2 21 97.6 24.4 96.2 26.6L95.6 29.4C88 31.6 79 34.4 71.4 36.4C67 37.6 62.6 36.2 60.4 32z" fill="${RED}" ${L}/>`
        + `<path d="M82 18.6C85 19.4 88 20.2 90.4 20.4C91.6 17.6 95 17 96.6 19" fill="none" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round"/>`
        + `<path d="M82 18.6C85 19.4 88 20.2 90.4 20.4C91.6 17.6 95 17 96.6 19" fill="none" ${T}/>`
        + `<path d="M94.2 22.4q1.6.2 1.8 1.8" fill="none" stroke="${INK}" stroke-width="1.1" stroke-linecap="round"/>`
        + `<path d="M64 31.6C68 33.4 74 32.4 80 30.4" fill="none" stroke="${RED2}" stroke-width="1.6" stroke-linecap="round"/>`
        // the cheek frill behind the jaws
        + `<path d="M66.4 30.6C62 30 58 31 55 33.6C59 34.6 61 35.4 62.6 37.4C59 38.6 57 40.4 55.6 43C60 43 63 42.4 66.4 40.6C68.6 37.6 68.6 33.4 66.4 30.6z" fill="${GRN}" ${L}/>`
        // the eye under its flaming gold brow
        + `<path d="M70 20.4C73 18.4 77.4 18.6 80 21C77.4 20.4 75.6 20.6 74.6 21.6C72.6 20.6 71.2 20.4 70 20.4z" fill="${GOLD}" ${T}/>`
        + `<path d="M69.6 20.6C67 18 64.4 17.6 62 18.4C64.6 18.8 66 20 66.6 21.2C64.6 20.8 63 21.4 62 22.6C65 22.4 67.6 22.6 69.6 20.6z" fill="${GOLD}" ${T}/>`
        + `<ellipse cx="75.4" cy="24.8" rx="3.6" ry="2.7" fill="#fffdf6" ${T}/><circle cx="76.2" cy="24.8" r="1.9" fill="${GOLD2}"/><circle cx="76.4" cy="24.8" r="1.15" fill="${INK}"/><circle cx="77" cy="24.2" r=".45" fill="#fff"/>`
        // the whiskers from the snout, and the beard under the chin
        + `<path d="M93 27.6C99.4 31 99 41.6 92.4 47.4C89.4 50 86.6 48.6 87.6 46.2" fill="none" stroke="${GOLD}" stroke-width="1.3" stroke-linecap="round"/>`
        + `<path d="M88.6 28.8C92 33.6 90.6 40 86 44" fill="none" stroke="${GOLD}" stroke-width=".9" stroke-linecap="round" opacity=".9"/>`
        + `<path d="M70 45.6C69.4 49.4 70.6 52.4 73 54.4C73.4 51.6 74.6 49.4 76.2 47.8C76.2 50.8 77.4 53 79.6 54.6C79.6 51.6 80.4 49 82 46.6z" fill="${GRN}" ${L}/>`
        + `</g>`
        // the water in front of the hull, so the boat sits in it, and foam at the bow
        + `<path d="M-6 76.2q5-2.2 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0V82H-6z" fill="${C.water}"/>`
        + `<path d="M-6 76.2q5-2.2 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0" fill="none" stroke="${C.deep}" stroke-width="1.1" opacity=".55"/>`
        + `<path d="M88.6 75.6q3-1.6 6 0M91 78.2q2.4-1.2 5 0" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round"/>`;
    })(),
    css: "",
  },

  "forest": { // The Forest's sign picture (owner, 26 Nov 2026: replaces the compass): tall pines in three rows, a
    // winding path between them into the misty distance, ferns and two mushrooms. Motion: the front pines sway.
    svg: (() => {
      const L = `stroke="${INK}" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"`;
      /** A pine of three tiers: base at (x, y), height h. */
      const pine3 = (x: number, y: number, h: number, fill: string, shade: string, line = true) => {
        const w = h * 0.34, t = (k: number) => y - h * k;
        const tier = (top: number, bot: number, half: number) => `<path d="M${x} ${t(top)}L${x + half} ${t(bot)}Q${x} ${t(bot) + h * 0.05} ${x - half} ${t(bot)}z" fill="${fill}"${line ? " " + L : ""}/>`
          + `<path d="M${x} ${t(top)}L${x + half} ${t(bot)}Q${x + half * 0.4} ${t(bot) + h * 0.03} ${x} ${t(bot) + h * 0.04}z" fill="${shade}"/>`;
        return `<rect x="${x - h * 0.035}" y="${t(0.16)}" width="${h * 0.07}" height="${h * 0.16}" fill="#7d4f2e"${line ? " " + L : ""}/>`
          + tier(0.58, 0.14, w) + tier(0.8, 0.4, w * 0.78) + tier(1, 0.64, w * 0.56);
      };
      return ``
        + `<rect x="0" y="0" width="100" height="100" fill="#eaf4ea"/>`
        + `<path d="M0 66Q50 58 100 66V100H0z" fill="${C.grass}"/>`
        // the far row, faded by the mist
        + [14, 26, 40, 60, 74, 88].map((x, k) => pine3(x, 64, 26 + (k % 2) * 6, "#9cc7a8", "#86b594", false)).join("")
        + `<rect x="0" y="40" width="100" height="26" fill="#eaf4ea" opacity=".35"/>`
        // the path winding into the distance
        + `<path d="M40 100C44 88 60 84 56 76C53 70 46 69 50 64L52 64C50 69 57 70 60 76C64 84 52 90 60 100z" fill="#dcc79a" ${L}/>`
        // the middle row
        + pine3(24, 74, 38, "#3f9a5f", "#2f7a45") + pine3(76, 73, 36, "#3f9a5f", "#2f7a45") + pine3(36, 70, 26, "#4fa86c", "#3f9a5f") + pine3(66, 70, 24, "#4fa86c", "#3f9a5f")
        // the front pines, framing the picture
        + `<g${A("sway", { r: 1.5, d: 3.6, o: [10, 96] })}>${pine3(10, 96, 62, C.pine, "#245f36")}</g>`
        + `<g${A("sway", { r: 1.5, d: 3.2, dl: 0.8, o: [90, 96] })}>${pine3(90, 96, 58, C.pine, "#245f36")}</g>`
        // ferns and mushrooms by the path
        + `<path d="M28 96q3-8 9-9M30 96q5-5 10-4M33 96q2-6 6-8M72 96q-3-8-9-9M70 96q-5-5-10-4" fill="none" stroke="${C.leaf}" stroke-width="2" stroke-linecap="round"/>`
        + `<path d="M64 88v-3M68.6 89v-2.6" stroke="${INK}" stroke-width="1.6"/><path d="M61.4 85.4q2.6-4.4 5.2 0zM66.4 86.6q2.2-3.6 4.4 0z" fill="${C.red}" ${L}/>`
        + `<circle cx="63.4" cy="84" r=".5" fill="#fff"/><circle cx="68.4" cy="85.4" r=".45" fill="#fff"/>`;
    })(),
    css: "",
  },

  "swap-market": { // The Swap Market (blue ◆; owner, 26 Nov 2026: no people): a festival market stall with a blue and
    // white striped awning and red paper lanterns, goods on the shelf, two Bonus cards on the counter with the two arrows
    // of a swap between them, and the blue ◆ on the counter. Motion: the cards hop in turn, the lanterns sway.
    box: "-2 2 104 104",
    svg: (() => {
      const BLUE = "#3d74c4", BLUE2 = "#2c5a9e", WOOD = "#a0683f", WOOD2 = "#7d4f2e", CREAM = "#f7e8c8", GOLD = C.gold;
      const L = `stroke="${INK}" stroke-width="1.15" stroke-linejoin="round" stroke-linecap="round"`;
      const T = `stroke="${INK}" stroke-width=".75" stroke-linejoin="round" stroke-linecap="round"`;
      const lantern = (x: number, y: number, dl: number) => `<g${A("sway", { r: 5, d: 2.4, dl, o: [x, y] })}><path d="M${x} ${y}v3" ${T}/>`
        + `<rect x="${x - 2.4}" y="${y + 3}" width="4.8" height="1.6" rx=".6" fill="${GOLD}" ${T}/>`
        + `<ellipse cx="${x}" cy="${y + 9}" rx="5" ry="4.6" fill="${C.red}" ${L}/>`
        + `<path d="M${x - 2.4} ${y + 5}q-1.2 4 0 8M${x + 2.4} ${y + 5}q1.2 4 0 8" fill="none" stroke="#00000030" stroke-width=".9"/>`
        + `<rect x="${x - 2.4}" y="${y + 13.4}" width="4.8" height="1.6" rx=".6" fill="${GOLD}" ${T}/><path d="M${x} ${y + 15}v3" stroke="${GOLD}" stroke-width="1.2"/></g>`;
      const card = (x: number, y: number, dl: number) => `<g${A("hop", { a: 3, d: 2.4, dl })}>`
        + `<rect x="${x}" y="${y}" width="13" height="17.6" rx="2" fill="#fffdf6" ${L}/><rect x="${x + 1.8}" y="${y + 1.8}" width="9.4" height="14" rx="1.2" fill="#4b2377"/>`
        + `<path d="M${x + 6.5} ${y + 5.2}l1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5z" fill="${GOLD}"/>`
        + `<circle cx="${x + 3.2}" cy="${y + 3.2}" r=".7" fill="${GOLD}"/><circle cx="${x + 9.8}" cy="${y + 14.4}" r=".7" fill="${GOLD}"/></g>`;
      let stripes = "";
      for (let k = 0; k < 8; k++) stripes += `<path d="M${10 + k * 10} 22h5v14h-5z" fill="${BLUE}"/>`;
      let scallops = "";
      for (let k = 0; k < 16; k++) scallops += `<path d="M${10 + k * 5} 36q2.5 4 5 0z" fill="${Math.floor(k / 2) % 2 === 0 ? BLUE : "#fffdf6"}" ${T}/>`;
      return ``
        // the back wall and the shelf with goods
        + `<rect x="14" y="36" width="72" height="34" fill="${CREAM}" ${L}/>`
        + `<path d="M15 51.6H85" stroke="${WOOD}" stroke-width="2.4"/><path d="M15 53H85" stroke="${WOOD2}" stroke-width=".8"/>`
        + `<rect x="19" y="43" width="5.6" height="8.4" rx="1.6" fill="#7fb7a0" ${T}/><rect x="18.6" y="41.6" width="6.4" height="2" rx=".6" fill="${WOOD2}" ${T}/>`
        + `<rect x="26.4" y="44.6" width="5" height="6.8" rx="1.4" fill="#e9b04c" ${T}/><rect x="26" y="43.2" width="5.8" height="1.8" rx=".6" fill="${WOOD2}" ${T}/>`
        + `<path d="M38 51.2q0-5 6-5t6 5z" fill="#d9e3ef" ${T}/>` + [40.6, 44, 47.4, 42.4, 45.8].map((x, k) => `<circle cx="${x}" cy="${k < 3 ? 46 : 43.4}" r="1.9" fill="${C.orange}" ${T}/>`).join("")
        + `<path d="M57 51.2q-1-6 5-6.4t6 6.4z" fill="${BLUE}" ${T}/><path d="M68 47.4q3.4-1.6 4 1.6M59.4 45q2.6-3 5.2 0" fill="none" ${T}/><circle cx="62" cy="44" r=".9" fill="${BLUE2}" ${T}/>`
        + `<rect x="74" y="46" width="8" height="5.4" rx="2.4" fill="#c8577a" ${T}/><rect x="75" y="42" width="7" height="4.4" rx="2" fill="#e7a43c" ${T}/>`
        // the posts and the roof board
        + `<rect x="10" y="22" width="4.2" height="72" fill="${WOOD}" ${L}/><rect x="85.8" y="22" width="4.2" height="72" fill="${WOOD}" ${L}/>`
        + `<path d="M5 14H95L92 22H8z" fill="${WOOD2}" ${L}/><path d="M7.4 17.6H92.6" stroke="${GOLD}" stroke-width="1.2"/>`
        // the blue and white awning with its scalloped edge
        + `<rect x="8" y="22" width="84" height="14" fill="#fffdf6"/>` + stripes + scallops
        + `<rect x="8" y="22" width="84" height="14" fill="none" ${L}/>`
        // the lanterns hanging from the awning
        + `<path d="M2 16.4h6M92 16.4h6" stroke="${WOOD2}" stroke-width="1.6"/>` + lantern(4.6, 16.4, 0) + lantern(95.4, 16.4, 0.8)
        // the counter: wood planks, gold trim and the blue ◆
        + `<rect x="8" y="68" width="84" height="5" rx="1" fill="${WOOD2}" ${L}/>`
        + `<rect x="11" y="73" width="78" height="21" fill="${WOOD}" ${L}/>`
        + `<path d="M11 80H89M11 87H89" stroke="${WOOD2}" stroke-width=".9"/><path d="M11 75.4H89" stroke="${GOLD}" stroke-width="1.2"/>`
        + `<path d="M50 77l6.6 6.8L50 90.6l-6.6-6.8z" fill="${BLUE}" ${L}/><path d="M50 79.8l3.8 4-3.8 4-3.8-4z" fill="#7fb0ec"/>`
        // the two Bonus cards and the two arrows of a swap between them
        + card(23, 50.6, 0) + card(64, 50.6, 1.2)
        + `<path d="M39.6 56.4Q50 49.4 60.4 56.4" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/><path d="M39.6 56.4Q50 49.4 60.4 56.4" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>`
        + `<path d="M56.2 55.8l5.6 1.6-1.4-5.6z" fill="${GOLD}" ${T}/>`
        + `<path d="M60.4 63Q50 70 39.6 63" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/><path d="M60.4 63Q50 70 39.6 63" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>`
        + `<path d="M43.8 63.6l-5.6-1.6 1.4 5.6z" fill="${GOLD}" ${T}/>`;
    })(),
    css: "",
  },
};

/** The area sign (owner, 26 Nov 2026): one painted wooden board on two posts, the area's picture inside and a small
 * red paper lantern at the corner. The area's name is written by the game beside it, never drawn. */
export function areaSign(inner: string): string {
  return `<path d="M20 70V98M80 70V98" stroke="${C.brown}" stroke-width="5"/>`
    + `<rect x="8" y="12" width="84" height="62" rx="6" fill="#c98c55" ${S}/><rect x="13" y="17" width="74" height="52" rx="3" fill="${W}" ${S2}/>`
    + `<svg x="14" y="18" width="72" height="50" viewBox="6 6 88 88" preserveAspectRatio="xMidYMid meet">${inner}</svg>`
    + `<rect x="13" y="17" width="74" height="52" rx="3" fill="none" ${S2}/>` + `<path d="M80 80h8" stroke="${C.brown}" stroke-width="2.4"/>` + paperLantern(88, 80, 0.7);
}
