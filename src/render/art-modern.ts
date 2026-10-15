// DRAFT for the owner's review (15 Oct), not used by the game yet: every picture redrawn as a grown-up subject in the
// game's own style (the purple ink outline, flat colours, one shaded side, a little motion; no text on pictures).
// The owner approved the house. Compare all of them with the current ones at /gallery.html?compare (npm run dev).
import { esc } from "./html";
import { A, C, INK, S, S2, waves } from "./art-kit";

interface Art {
  svg: string;
  css: string;
  box?: string;
}

const W = "#fffdf6", SH = "#e4dfd3", GREY = "#8d8a96", GREY2 = "#76737f", DARK = "#5f5a6b", GLASS = "#bfe2ff", LEAF = C.leaf, MUD = "#7a5c3e";

// ---- small pieces in this style ----
const ground = (y = 84) => `<path d="M6 ${y}H94" ${S}/>`;
const sea = (y: number) => `<rect x="-10" y="${y}" width="120" height="${110 - y}" fill="${C.water}"/>` + waves(y, C.deep, 2) + waves(y + 9, C.deep, 2.8, 0.5);
/** A wheel with three spokes, turning. */
const wheel = (x: number, y: number, r: number, d = 1) => `<g${A("spin", { d, o: [x, y] })}><circle cx="${x}" cy="${y}" r="${r}" fill="${DARK}" ${S}/>`
  + `<circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${GREY}" ${S2}/><path d="M${x} ${y - r * 0.45}v${-r * 0.4}M${x - r * 0.39} ${y + r * 0.22}l${-r * 0.35} ${r * 0.2}M${x + r * 0.39} ${y + r * 0.22}l${r * 0.35} ${r * 0.2}" ${S2}/></g>`;
/** A pictogram traveller (head at x, y), no face: grown-up proportions. */
const figure = (x: number, y: number, body: string, k = 1) => {
  const f = (n: number) => +n.toFixed(2);
  return `<path d="M${f(x - 3 * k)} ${f(y + 14 * k)}l${f(-0.6 * k)} ${f(11 * k)}h${f(2.8 * k)}l${f(0.8 * k)} ${f(-7 * k)}l${f(0.8 * k)} ${f(7 * k)}h${f(2.8 * k)}l${f(-0.6 * k)} ${f(-11 * k)}z" fill="${DARK}" ${S2}/>`
    + `<path d="M${f(x - 5 * k)} ${f(y + 15 * k)}v${f(-6 * k)}q0 ${f(-4 * k)} ${f(5 * k)} ${f(-4 * k)}t${f(5 * k)} ${f(4 * k)}v${f(6 * k)}z" fill="${body}" ${S2}/>`
    + `<circle cx="${x}" cy="${y}" r="${f(3.6 * k)}" fill="${C.skin}" ${S2}/><path d="M${f(x - 3.6 * k)} ${f(y - 0.4 * k)}a${f(3.6 * k)} ${f(3.6 * k)} 0 0 1 ${f(7.2 * k)} 0q${f(-3.6 * k)} ${f(-1.6 * k)} ${f(-7.2 * k)} 0z" fill="${C.dbrown}"/>`;
};
const train = (x: number, colour: string) => `<path d="M${x} 50h46q12 0 14 14v14H${x}z" fill="${colour}" ${S}/><path d="M${x + 1.3} 72h57.4v4.7H${x + 1.3}z" fill="#00000022"/>`
  + `<path d="M${x + 46} 54h6q6 1 7.5 9H${x + 46}z" fill="${GLASS}" ${S2}/>` + [0, 1, 2].map((i) => `<rect x="${x + 5 + i * 13}" y="55" width="9" height="8" rx="1.5" fill="${GLASS}" ${S2}/>`).join("")
  + `<path d="M${x} 68h60" stroke="${W}" stroke-width="2.4"/>` + `<circle cx="${x + 10}" cy="80" r="3.4" fill="${DARK}" ${S2}/><circle cx="${x + 48}" cy="80" r="3.4" fill="${DARK}" ${S2}/>`;
const boot = (x: number, colour: string, shade: string) => `<path d="M${x} 30h14v34l11 4q4 1.6 4 6v4H${x}z" fill="${colour}" ${S}/><path d="M${x + 10.6} 31.3h2v33.5l-2 -.7z" fill="${shade}"/>`
  + `<rect x="${x - 1.5}" y="27" width="17" height="5" rx="1.5" fill="${shade}" ${S2}/><path d="M${x} 78h29" ${S}/>`;
const key = (x: number, y: number, rot = 0, colour = C.gold) => `<g transform="rotate(${rot} ${x} ${y})"><circle cx="${x}" cy="${y}" r="8" fill="${colour}" ${S}/><circle cx="${x}" cy="${y}" r="2.8" fill="${W}" ${S2}/>`
  + `<path d="M${x + 8} ${y - 2.4}h22v4.8h-3v4h-4v-4h-3v3h-4v-3h-8z" fill="${colour}" ${S}/></g>`;
const lanternShape = (x: number, y: number, k: number, colour: string) => `<path d="M${x} ${y - 13 * k}v${3 * k}" ${S2}/><rect x="${x - 4 * k}" y="${y - 10 * k}" width="${8 * k}" height="${2.6 * k}" rx="1" fill="${DARK}" ${S2}/>`
  + `<ellipse cx="${x}" cy="${y}" rx="${9 * k}" ry="${8 * k}" fill="${colour}" ${S}/><path d="M${x - 4.5 * k} ${y - 6.9 * k}q${-2 * k} ${6.9 * k} 0 ${13.8 * k}M${x + 4.5 * k} ${y - 6.9 * k}q${2 * k} ${6.9 * k} 0 ${13.8 * k}" fill="none" stroke="#00000033" stroke-width="1.4"/>`
  + `<rect x="${x - 4 * k}" y="${y + 7.4 * k}" width="${8 * k}" height="${2.6 * k}" rx="1" fill="${DARK}" ${S2}/>`;
const tree = (x: number, y: number, k = 1) => `<path d="M${x} ${y}v${-10 * k}" ${S}/><g${A("sway", { r: 2, d: 3.4, o: [x, y - 10 * k] })}><circle cx="${x}" cy="${y - 20 * k}" r="${11 * k}" fill="${LEAF}" ${S}/><path d="M${x + 4 * k} ${y - 29 * k}a${10 * k} ${10 * k} 0 0 1 0 ${18 * k}" fill="none" stroke="#3a7a40" stroke-width="${3 * k}"/></g>`;
const pine = (x: number, y: number, k = 1) => `<path d="M${x} ${y - 32 * k}l${10 * k} ${26 * k}H${x - 10 * k}z" fill="${C.pine}" ${S2}/><path d="M${x} ${y - 6 * k}v${6 * k}" ${S2}/>`;
const mountains = `<path d="M4 80L30 38l12 18 12-24 34 48z" fill="#b8b2a6" ${S}/><path d="M30 38l-6 10 6-3 4 4zM54 32l-8 13 7-4 6 4z" fill="${W}" ${S2}/>`;
const sign = (x: number, y: number, inner: string, frame = C.red) => `<g transform="translate(${x} ${y + 14}) scale(1.6) translate(${-x} ${-(y + 14)})"><path d="M${x} ${y + 24}v18" ${S}/><path d="M${x} ${y - 4}L${x + 16} ${y + 24}H${x - 16}z" fill="${W}" stroke="${frame}" stroke-width="4.6" stroke-linejoin="round"/>`
  + `<path d="M${x} ${y - 6.6}L${x + 18.4} ${y + 25.4}H${x - 18.4}z" fill="none" ${S2}/>` + inner + `</g>`;

export const MODERN: Record<string, Art> = {
  house: { // Home (approved): a modern two-storey house, the upper floor reaching out over the door
    svg: `<defs><clipPath id="mh-glass"><rect x="20" y="31" width="24" height="17"/></clipPath></defs>`
      + ground()
      + `<rect x="34" y="52" width="46" height="32" fill="${W}" ${S}/><rect x="72" y="53.3" width="6.7" height="29.4" fill="${SH}"/>`
      + `<rect x="42" y="60" width="12" height="24" fill="${GREY}" ${S}/><circle cx="51" cy="72" r="1.2" fill="${DARK}"/>`
      + `<rect x="61" y="60" width="8" height="13" fill="${DARK}" ${S}/><rect x="61" y="60" width="8" height="13" fill="#ffd27a"${A("flicker", { d: 3.2 })}/>`
      + `<rect x="16" y="26" width="46" height="26" fill="${W}" ${S}/><rect x="54" y="27.3" width="6.7" height="23.4" fill="${SH}"/>`
      + `<rect x="20" y="31" width="24" height="17" fill="${GLASS}" ${S}/>`
      + `<g clip-path="url(#mh-glass)"><path d="M10 50l10-22h5L15 50z" fill="#fff" opacity=".7"${A("slide", { x: 34, d: 3.6 })}/></g>`
      + `<path d="M26 31v17M32 31v17M38 31v17" ${S2}/><rect x="20" y="31" width="24" height="17" fill="none" ${S}/>`
      + `<rect x="48" y="32" width="8" height="12" fill="${DARK}" ${S}/>`
      + `<rect x="12" y="19.5" width="54" height="7" rx="2.5" fill="${GREY}" ${S}/><rect x="56" y="20.8" width="8.6" height="4.4" fill="${GREY2}"/>`
      + `<g${A("sway", { r: 2.5, d: 3, o: [16, 84] })}><path d="M9 84c-2-14 4-20 7-20s9 6 7 20z" fill="${LEAF}" ${S}/><path d="M16 70v14" ${S2}/></g>`
      + `<g${A("sway", { r: 2, d: 3.6, dl: 0.6, o: [27, 84] })}><path d="M22 84c-1-9 2-13 5-13s6 4 5 13z" fill="#5f9e63" ${S}/></g>`
      + `<g${A("sway", { r: 2, d: 3.3, dl: 0.3, o: [87, 84] })}><path d="M81 84c-1-11 3-16 6-16s7 5 6 16z" fill="${LEAF}" ${S}/><path d="M87 72v12" ${S2}/></g>`,
    css: "",
  },

  signpost: { // Crossroads: a road sign where the road splits, arrows only
    svg: `<path d="M-4 96L30 62H44L22 96z" fill="#b8b2a6" ${S}/><path d="M104 96L62 62H50L74 96z" fill="#b8b2a6" ${S}/>`
      + `<path d="M28 86l6-8M36 75l4-5M80 86l-6-8M70 75l-4-5" stroke="${W}" stroke-width="2.4" stroke-linecap="round"/><path d="M6 62H94" ${S}/>`
      + `<rect x="47" y="18" width="6" height="66" rx="1" fill="#a8a3b0" ${S}/><rect x="50.4" y="19.3" width="1.6" height="63.4" fill="${GREY}"/>`
      + `<path d="M53 22H80l8 8-8 8H53z" fill="#3c8c50" ${S}/><path d="M54.3 34.8H79.5l3.2-3.2" fill="none" stroke="#2f6e3f" stroke-width="2.6"/>`
      + `<path d="M60 30h14m-5-5 5 5-5 5" fill="none" stroke="${W}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<g${A("tilt", { r: 3, d: 2.6, o: [47, 46] })}><path d="M47 42H20l-8 8 8 8h27z" fill="#a0683f" ${S}/><path d="M45.7 54.8H20.5l-3.2-3.2" fill="none" stroke="#7d4f2e" stroke-width="2.6"/>`
      + `<path d="M40 50q-4-5-8 0t-8 0" fill="none" stroke="${W}" stroke-width="3" stroke-linecap="round"/><path d="M27 46l-4 4 4 4" fill="none" stroke="${W}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`
      + `<rect x="43" y="82" width="14" height="4" rx="1" fill="${GREY}" ${S}/>`,
    css: "",
  },

  card: { // The Bonus card: a playing card with a shield and a star (dodge bad luck, or spoil someone's good luck)
    svg: `<defs><clipPath id="mc-face"><rect x="30" y="16" width="44" height="66" rx="6"/></clipPath></defs>`
      + `<g${A("bob", { a: 2.5, d: 2.6 })}><rect x="22" y="22" width="44" height="66" rx="6" fill="#6a3d9a" ${S} transform="rotate(-10 44 55)"/>`
      + `<g${A("tilt", { r: 3, d: 3.4, o: [52, 49] })}><rect x="30" y="16" width="44" height="66" rx="6" fill="${W}" ${S}/>`
      + `<rect x="35" y="21" width="34" height="56" rx="3" fill="#4b2377"/><rect x="66" y="21" width="3" height="56" fill="#3a1a5e"/>`
      + `<rect x="38" y="24" width="28" height="50" rx="2" fill="none" stroke="${C.gold}" stroke-width="1.2"/>`
      + `<path d="M52 36l11 4v8q0 9-11 14-11-5-11-14v-8z" fill="${C.gold}" ${S2}/><path d="M52 38.4v21q8.6-4.4 8.6-11.6v-6.4z" fill="#d9a92a"/>`
      + `<path d="M52 42l1.8 3.8 4 .4-3 2.8.9 4-3.7-2.1-3.7 2.1.9-4-3-2.8 4-.4z" fill="${W}"${A("pulse", { s: 1.15, d: 1.4, o: [52, 47.5] })}/>`
      + `<path d="M41 28l2 2-2 2-2-2zM63 66l2 2-2 2-2-2z" fill="${C.gold}"/>`
      + `<g clip-path="url(#mc-face)"><path d="M14 90l22-80h7L21 90z" fill="#fff" opacity=".35"${A("slide", { x: 60, d: 3.8 })}/></g></g></g>`,
    css: "",
  },

  balloon: { // Hot-air balloon over the fields
    svg: `<path d="M50 10C31 10 22 24 25 38c2 9 10 16 16 24h18c6-8 14-15 16-24 3-14-6-28-25-28z" fill="${C.red}" ${S}/>`
      + `<path d="M50 10c-8 6-11 30-7 52h14c4-22 1-46-7-52z" fill="${W}" ${S2}/><path d="M66 18q10 10 6 22-3 10-12 22h-3c6-12 11-30 9-44z" fill="#b8352e"/>`
      .replace(/^/, `<g${A("bob", { a: 4, d: 3.2 })}>`)
      + `<path d="M43 62l2 9M57 62l-2 9" ${S2}/><rect x="42" y="71" width="16" height="11" rx="2" fill="#a0683f" ${S}/><path d="M52 72.3h4.7v8.4H52z" fill="#7d4f2e"/></g>`
      + `<path d="M6 92q22-6 44 0t44 0" fill="none" ${S}/><path d="M12 92h8M70 92h10" stroke="${LEAF}" stroke-width="3"/>`,
    css: "",
  },

  "boot-in-mud": { // The Bog: a rubber boot stuck fast in the mud
    svg: `<ellipse cx="50" cy="76" rx="40" ry="12" fill="${MUD}" ${S}/><ellipse cx="54" cy="79" rx="30" ry="6" fill="#6a4f35"/>`
      + `<g${A("tilt", { r: 5, d: 2.8, o: [46, 76] })}><path d="M36 30h20v42H36z" fill="#3c8c50" ${S}/><path d="M51 31.3h3.7v39.4H51z" fill="#2f6e3f"/><rect x="34" y="26" width="24" height="6" rx="2" fill="#2f6e3f" ${S2}/></g>`
      + `<path d="M30 74q16 6 32 0" fill="none" ${S}/>`
      + [[24, 74], [72, 76], [64, 71]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${3 - i * 0.6}" fill="#a07d58" ${S2}${A("puff", { d: 2.8, dl: i * 0.9, x: 0, y: -14, s: 1.3 })}/>`).join(""),
    css: "",
  },

  sheep: { // Rush hour, rural edition: the sheep-crossing sign
    svg: sign(50, 24, `<g${A("hop", { a: 2, d: 1.4 })}><path d="M41 39q0-5 5-5h7q6 0 6 5t-6 5h-7q-5 0-5-5z" fill="${DARK}"/><circle cx="60" cy="36" r="3" fill="${DARK}"/><path d="M44 43v4M48 43v4M53 43v4M57 43v4" stroke="${DARK}" stroke-width="1.8"/></g>`),
    css: "",
  },

  fog: { // The fog: a road disappearing into grey, two headlights
    svg: `<path d="M38 84l10-34h4l10 34z" fill="#b8b2a6" ${S}/>` + ground()
      + `<circle cx="45" cy="66" r="2.6" fill="#ffe08a" ${S2}/><circle cx="55" cy="66" r="2.6" fill="#ffe08a" ${S2}/><path d="M45 66l-14 10M55 66l14 10" stroke="#ffe08a" stroke-width="3" opacity=".6"/>`
      + [[12, 40, 50, 0], [36, 52, 54, 1], [10, 62, 36, 2], [60, 30, 30, 3]].map(([x, y, w, i]) => `<g${A("drift", { x: 6, d: 5 + i, dl: i * 0.6 })}><rect x="${x}" y="${y}" width="${w}" height="7" rx="3.5" fill="#dcd8d0" ${S2} opacity=".95"/></g>`).join(""),
    css: "",
  },

  "cable-car": { // The cable car up to the Mountain Lodge
    svg: mountains + `<path d="M8 22L92 46" ${S}/>`
      + `<g${A("slide", { x: 20, y: 5.7, d: 4 })}><path d="M40 31v6" ${S}/><rect x="31" y="37" width="18" height="15" rx="3" fill="${C.red}" ${S}/><rect x="34" y="40" width="5" height="5" fill="${GLASS}" ${S2}/><rect x="41" y="40" width="5" height="5" fill="${GLASS}" ${S2}/><path d="M45.7 38.3h2v12.4h-2z" fill="#b8352e"/></g>`,
    css: "",
  },

  "traffic-light": { // The green wave: a traffic light, green
    svg: `<path d="M50 70v14" ${S}/>` + ground() + `<rect x="38" y="16" width="24" height="54" rx="6" fill="${DARK}" ${S}/><rect x="56" y="17.3" width="4.7" height="51.4" rx="2" fill="#4c4858"/>`
      + `<circle cx="50" cy="28" r="6" fill="#6b3a3a" ${S2}/><circle cx="50" cy="43" r="6" fill="#6b5a3a" ${S2}/><circle cx="50" cy="58" r="6" fill="#4cd964" ${S2}/>`
      + `<circle cx="50" cy="58" r="9.5" fill="none" stroke="#4cd964" stroke-width="2"${A("ripple", { s: 1.5, d: 1.6, o: [50, 58] })}/>`,
    css: "",
  },

  lanterns: { // The Festival of Lights: paper lanterns on a string
    svg: `<path d="M4 16q46 22 92 0" fill="none" ${S2}/>`
      + [[20, 36, C.red], [50, 44, C.yellow], [80, 36, C.orange]].map(([x, y, c], i) => `<g${A("sway", { r: 6, d: 2.2 + i * 0.4, o: [x as number, (y as number) - 18] })}>${lanternShape(x as number, y as number, 1.1, c as string)}</g>`).join("")
      + [[30, 70], [66, 66], [48, 78]].map(([x, y], i) => `<g${A("move", { x: 4, y: -40, d: 5, dl: i * 1.6 })}><path d="M${x - 3} ${y}h6l1 6h-8z" fill="#ffb347" ${S2}/></g>`).join(""),
    css: "",
  },

  "snake-crown": { // The Snake Leader: a sea serpent's coils in the bay, and its crown
    svg: sea(66)
      + `<path d="M14 68q8-22 18 0M38 68q9-26 20 0" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M14 68q8-22 18 0M38 68q9-26 20 0" fill="none" stroke="#2a9d8f" stroke-width="6.6" stroke-linecap="round"/>`
      + `<path d="M64 68q0-22 12-28" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M64 68q0-22 12-28" fill="none" stroke="#2a9d8f" stroke-width="7.6" stroke-linecap="round"/>`
      + `<path d="M70 36q8-6 16-2l-2 6q-6 2-12 2z" fill="#2a9d8f" ${S}/><path d="M78 37.4l3-.6" ${S2}/><path d="M58 52l4-6 3 5" fill="#1f7a6f" ${S2}/>`
      + `<g${A("bob", { a: 2.5, d: 1.6 })}><path d="M70 30l1.5-9 4 4 3-7 3 7 4-4 1.5 9z" fill="${C.gold}" ${S2}/></g>`,
    css: "",
  },

  key: { // Forgot your keys: a house key on its ring, swinging
    svg: `<circle cx="50" cy="12" r="3" fill="${GREY}" ${S2}/><g${A("sway", { r: 10, d: 1.8, o: [50, 12] })}><circle cx="50" cy="22" r="8" fill="none" stroke="${GREY}" stroke-width="2.4"/>`
      + `<g transform="translate(50 40) scale(1.5) translate(-50 -40)"><g transform="rotate(90 50 40)">${key(50, 40, 0, C.gold)}</g></g></g>`,
    css: "",
  },

  "two-keys": { // Forgot your keys AGAIN: two keys and two alarms
    svg: key(30, 36, 20, C.gold) + key(30, 64, -10, GREY)
      + `<g${A("hop", { a: 3, d: 0.9 })}><rect x="78" y="22" width="5" height="22" rx="2.5" fill="${C.red}" ${S2}/><circle cx="80.5" cy="51" r="3" fill="${C.red}" ${S2}/></g>`
      + `<g${A("hop", { a: 3, d: 0.9, dl: 0.2 })}><rect x="87" y="22" width="5" height="22" rx="2.5" fill="${C.red}" ${S2}/><circle cx="89.5" cy="51" r="3" fill="${C.red}" ${S2}/></g>`,
    css: "",
  },

  puddle: { // Not a puddle: one shoe, a lot of water
    svg: `<ellipse cx="50" cy="76" rx="40" ry="10" fill="${C.water}" ${S}/><ellipse cx="56" cy="78" rx="26" ry="4" fill="#5fb0e8"/>`
      + `<ellipse cx="50" cy="76" rx="16" ry="4" fill="none" stroke="${C.deep}" stroke-width="1.6"${A("ripple", { s: 1.6, d: 1.8, o: [50, 76] })}/>`
      + `<path d="M34 44h14v22l14 5q4 1.5 4 6H34z" fill="#a0683f" ${S}/><path d="M44.6 45.3h2v20.4l-2-.7z" fill="#7d4f2e"/><path d="M34 74h32" ${S}/>`
      + [[26, 64], [74, 62], [70, 54], [30, 56]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2" fill="${C.water}" ${S2}${A("hop", { a: 6, d: 1.2, dl: i * 0.2 })}/>`).join(""),
    css: "",
  },

  waves: { // Waiting for the tide: the causeway under water, a marker post
    svg: `<path d="M-4 60h34v30H-4zM70 60h34v30H70z" fill="#d8c08a" ${S}/>` + sea(64)
      + `<rect x="47" y="24" width="6" height="56" fill="${W}" ${S}/>` + [32, 44, 56].map((y) => `<rect x="47" y="${y}" width="6" height="6" fill="${C.red}"/>`).join("") + `<rect x="47" y="24" width="6" height="56" fill="none" ${S}/>`,
    css: "",
  },

  stones: { // Stepping stones across the mud (and the Shortcut's plain stones)
    svg: `<rect x="-10" y="40" width="120" height="70" fill="${MUD}"/><path d="M-10 40H110" ${S}/>`
      + [[26, 78, 13], [52, 64, 10], [74, 52, 8]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.42}" fill="#b8b2a6" ${S}/><ellipse cx="${x + r * 0.3}" cy="${y + r * 0.15}" rx="${r * 0.55}" ry="${r * 0.18}" fill="#9a958b"/>`).join("")
      + `<g${A("sway", { r: 4, d: 2.6, o: [88, 70] })}><path d="M88 70V44M84 70V52" ${S2}/><rect x="86" y="40" width="4" height="9" rx="2" fill="#6b4f34" ${S2}/></g>`
      + `<circle cx="40" cy="88" r="2" fill="#a07d58" ${S2}${A("puff", { d: 2.6, x: 0, y: -10 })}/>`,
    css: "",
  },

  steps: { // The porch steps: the front door, three steps, a plant
    svg: `<rect x="30" y="14" width="40" height="52" fill="${W}" ${S}/><rect x="38" y="20" width="24" height="46" fill="${GREY}" ${S}/><rect x="56" y="21.3" width="4.7" height="43.4" fill="${GREY2}"/><circle cx="57" cy="44" r="1.3" fill="${DARK}"/>`
      + `<rect x="26" y="66" width="48" height="6" fill="#c9b28a" ${S}/><rect x="20" y="72" width="60" height="6" fill="#b89c70" ${S}/><rect x="14" y="78" width="72" height="6" fill="#a8895a" ${S}/>`
      + `<rect x="66" y="22" width="5" height="8" rx="1.5" fill="#ffd27a" ${S2}${A("flicker", { d: 2.4 })}/>`
      + `<rect x="16" y="58" width="10" height="8" fill="#c76a3a" ${S2}/><g${A("sway", { r: 3, d: 3, o: [21, 58] })}><path d="M21 58c-6-6-4-14 0-16 4 2 6 10 0 16z" fill="${LEAF}" ${S2}/></g>`,
    css: "",
  },

  "fallen-tree": { // Fallen tree across the road
    svg: `<path d="M6 76H94" ${S}/><path d="M12 86H88" stroke="${GREY}" stroke-width="2.6" stroke-dasharray="8 6"/>`
      + `<path d="M14 66l62-18 4 10-62 18z" fill="#8a5a3c" ${S}/><path d="M17 72l62-18" stroke="#6b4428" stroke-width="2"/>`
      + `<ellipse cx="16" cy="71" rx="5" ry="6" fill="#d8b98a" ${S}/><ellipse cx="16" cy="71" rx="2" ry="2.6" fill="none" stroke="#a0683f" stroke-width="1.2"/>`
      + `<g${A("sway", { r: 3, d: 2.8, o: [76, 52] })}><circle cx="82" cy="44" r="12" fill="${LEAF}" ${S}/><circle cx="70" cy="40" r="8" fill="#5f9e63" ${S}/></g>`
      + [0, 1].map((i) => `<path d="M${60 + i * 16} 24q3-3 6 0-3 3-6 0z" fill="${LEAF}" ${S2}${A("fall", { d: 3.2, dl: i * 1.4, x: -8, y: 40 })}/>`).join(""),
    css: "",
  },

  "flat-path": { // The Main Road: straight, paved, reliable
    svg: `<path d="M6 40H94" ${S}/><path d="M42 40h16l22 52H20z" fill="#b8b2a6" ${S}/>`
      + `<g${A("slide", { y: 8, x: 0, d: 0.8 })}>${[46, 58, 72].map((y, i) => `<path d="M50 ${y}v${4 + i * 2}" stroke="${W}" stroke-width="${2.4 + i}" stroke-linecap="round"/>`).join("")}</g>`
      + tree(20, 40, 0.7) + tree(82, 40, 0.6),
    css: "",
  },

  "joining-paths": { // The two roads meet again
    svg: `<path d="M8 20h14l20 36v40H28V58zM92 20H78L58 56v40h14V58z" fill="#b8b2a6" ${S}/><path d="M42 56h16v40H42z" fill="#b8b2a6"/>`
      + `<path d="M50 62v6M50 76v6M50 90v6" stroke="${W}" stroke-width="2.4" stroke-linecap="round"/>`
      + `<path d="M15 26l14 26M85 26L71 52" stroke="${W}" stroke-width="2.4" stroke-dasharray="4 6"${A("dash", { d: 1.2 })}/>`,
    css: "",
  },

  compass: { // A compass that has been lying
    svg: `<circle cx="50" cy="50" r="34" fill="#c8a24a" ${S}/><circle cx="50" cy="50" r="28" fill="${W}" ${S}/>`
      + [0, 90, 180, 270].map((a) => `<path d="M50 24v5" ${S2} transform="rotate(${a} 50 50)"/>`).join("")
      + `<g${A("sway", { r: 25, d: 1.3, o: [50, 50] })}><path d="M50 28l5 22h-10z" fill="${C.red}" ${S2}/><path d="M50 72l5-22h-10z" fill="${GREY}" ${S2}/></g><circle cx="50" cy="50" r="3" fill="${DARK}" ${S2}/>`,
    css: "",
  },

  maze: { // Lost in the alleys: two walls, a narrow lane, signs pointing every way
    svg: `<path d="M6 10L36 30V76L6 92z" fill="${W}" ${S}/><path d="M94 10L64 30V76L94 92z" fill="${SH}" ${S}/><path d="M36 30h28v46H36z" fill="${DARK}" ${S}/>`
      + `<path d="M36 76L6 92H94L64 76z" fill="#b8b2a6" ${S}/>`
      + [[14, 26], [24, 32], [14, 50], [24, 52]].map(([x, y]) => `<path d="M${x} ${y}l6 2v8l-6-2z" fill="${GLASS}" ${S2}/>`).join("")
      + `<path d="M76 30l6-2v8l-6 2zM76 52l6-2v8l-6 2z" fill="#ffd27a" ${S2}/>`
      + `<g${A("tilt", { r: 6, d: 1.6, o: [50, 70] })}><path d="M50 76V50" ${S}/><path d="M50 50h12l4 4-4 4H50z" fill="#a0683f" ${S2}/><path d="M50 60H38l-4 4 4 4h12z" fill="#3c8c50" ${S2}/></g>`,
    css: "",
  },

  "park-bench": { // Through the park: a bench under a tree, a lamp
    svg: ground() + tree(24, 84, 1.2) + `<path d="M84 84V34" ${S}/><path d="M78 30h12l-2 6h-8z" fill="#ffd27a" ${S2}/><path d="M80 28h8" ${S}/>`
      + `<rect x="42" y="56" width="34" height="5" rx="1" fill="#a0683f" ${S}/><rect x="42" y="64" width="34" height="5" rx="1" fill="#a0683f" ${S}/><rect x="40" y="70" width="38" height="4" rx="1" fill="#8a5a3c" ${S}/><path d="M45 74v10M73 74v10" ${S}/>`,
    css: "",
  },

  pier: { // River Pier: wooden boards on posts, a bollard, a lamp
    svg: sea(70) + `<rect x="6" y="56" width="70" height="6" fill="#a0683f" ${S}/><path d="M14 62v24M34 62v24M54 62v24M72 62v24" ${S}/>`
      + `<path d="M64 56v-6h6v6" fill="${DARK}" ${S2}/><path d="M20 56V26" ${S}/><path d="M14 22h12l-2 6h-8z" fill="#ffd27a" ${S2}/>`,
    css: "",
  },

  anchor: { // Harbour: an anchor and its rope
    svg: sea(76) + `<path d="M50 16v8" ${S}/><circle cx="50" cy="20" r="5" fill="none" ${S}/><g${A("sway", { r: 4, d: 2.4, o: [50, 20] })}>`
      + `<path d="M47 25h6v40h-6z" fill="${GREY}" ${S}/><path d="M40 32h20" ${S}/><path d="M26 54q2 18 24 20 22-2 24-20l-6 4M26 54l6 4" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M26 54q2 18 24 20 22-2 24-20" fill="none" stroke="${GREY}" stroke-width="2.6"/></g>`,
    css: "",
  },

  tent: { // Base Camp: a dome tent and a campfire
    svg: ground() + `<path d="M14 84q8-44 32-44t32 44z" fill="${C.orange}" ${S}/><path d="M46 40q10 2 18 20l14 24H60z" fill="#c4692a"/><path d="M14 84q8-44 32-44t32 44" fill="none" ${S}/>`
      + `<path d="M38 84l8-26 8 26z" fill="${DARK}" ${S2}/>`
      + `<path d="M80 84l10-4M80 80l10 4" ${S}/><g${A("flicker", { d: 0.5 })}><path d="M85 80q-6-6 0-14 6 8 0 14z" fill="${C.yellow}" ${S2}/></g>`,
    css: "",
  },

  cabin: { // Mountain Lodge: an A-frame with a big window and snow on the roof
    svg: ground() + pine(14, 84, 0.9) + `<path d="M50 16L84 84H16z" fill="#a0683f" ${S}/><path d="M50 16l34 68H72L50 30z" fill="#8a5a3c"/>`
      + `<path d="M50 16L60 36q-4 2-10-2-6 4-10 2z" fill="${W}" ${S2}/><path d="M50 44L64 76H36z" fill="#ffd27a" ${S}/><path d="M50 44v32M43 60h14" ${S2}/>`
      + `<rect x="64" y="24" width="7" height="14" fill="${DARK}" ${S2}/><circle cx="68" cy="18" r="3" fill="${SH}" ${S2}${A("puff", { d: 3, x: 4, y: -12 })}/>`,
    css: "",
  },

  station: { // Forest / Hill Station: the station building, its clock
    svg: ground() + `<rect x="14" y="40" width="72" height="44" fill="${W}" ${S}/><rect x="78" y="41.3" width="6.7" height="41.4" fill="${SH}"/><path d="M10 40h80l-6-10H16z" fill="${GREY}" ${S}/>`
      + [22, 44, 66].map((x) => `<path d="M${x} 84V62q6-8 12 0v22" fill="${GLASS}" ${S2}/>`).join("")
      + `<circle cx="50" cy="22" r="8" fill="${W}" ${S}/><path d="M50 22v-5" ${S2}/><g${A("spin", { d: 8, o: [50, 22] })}><path d="M50 22h4" ${S2}/></g>`,
    css: "",
  },

  "big-clock": { // Waiting: the station clock on its bracket
    svg: `<path d="M50 6v14M38 20h24" ${S}/><circle cx="50" cy="50" r="28" fill="${GREY}" ${S}/><circle cx="50" cy="50" r="23" fill="${W}" ${S}/>`
      + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => `<path d="M50 ${i % 3 ? 29 : 28}v${i % 3 ? 3 : 5}" stroke="${INK}" stroke-width="${i % 3 ? 1.4 : 2.4}" transform="rotate(${a} 50 50)"/>`).join("")
      + `<g${A("spin", { d: 4, o: [50, 50] })}><path d="M50 50V32" stroke="${C.red}" stroke-width="1.6" stroke-linecap="round"/></g><g${A("spin", { d: 48, o: [50, 50] })}><path d="M50 50l9 6" ${S}/></g><circle cx="50" cy="50" r="2.4" fill="${DARK}"/>`,
    css: "",
  },

  bunting: { // The Fair: bunting and the big wheel
    svg: ground() + `<g${A("spin", { d: 18, o: [50, 52] })}><circle cx="50" cy="52" r="24" fill="none" ${S}/>${[0, 45, 90, 135].map((a) => `<path d="M50 28v48" stroke="${INK}" stroke-width="1.6" transform="rotate(${a} 50 52)"/>`).join("")}`
      + [0, 60, 120, 180, 240, 300].map((a, i) => `<circle cx="${(50 + Math.cos((a * Math.PI) / 180) * 24).toFixed(1)}" cy="${(52 + Math.sin((a * Math.PI) / 180) * 24).toFixed(1)}" r="4" fill="${[C.red, C.yellow, C.deep][i % 3]}" ${S2}/>`).join("") + `</g>`
      + `<path d="M50 52l-12 32M50 52l12 32" ${S}/><path d="M4 14q46 16 92 0" fill="none" ${S2}/>`
      + [10, 26, 42, 58, 74, 90].map((x, i) => `<path d="M${x - 5} ${14 + (x < 50 ? (x - 4) * 0.3 : (96 - x) * 0.3)}h10l-5 9z" fill="${[C.red, C.yellow, C.deep, C.orange][i % 4]}" ${S2}/>`).join(""),
    css: "",
  },

  "swap-arrows": { // Plot twist: two arrows trading places
    svg: `<g${A("spin", { d: 4, o: [50, 50] })}><path d="M24 44a27 27 0 0 1 46-14" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M24 44a27 27 0 0 1 46-14" fill="none" stroke="${C.deep}" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M64 20l10 12-14 4z" fill="${C.deep}" ${S2}/>`
      + `<path d="M76 56a27 27 0 0 1-46 14" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M76 56a27 27 0 0 1-46 14" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M36 80L26 68l14-4z" fill="${C.red}" ${S2}/></g>`,
    css: "",
  },

  "phone-map": { // Trusting the app: a phone, a route, a pin
    svg: `<rect x="30" y="10" width="40" height="80" rx="7" fill="${DARK}" ${S}/><rect x="34" y="17" width="32" height="64" rx="2" fill="#e8f2e0"/>`
      + `<path d="M34 40h32M50 17v64M34 62h32" stroke="${W}" stroke-width="4"/><path d="M40 74q0-14 10-16t10-20" fill="none" stroke="${C.deep}" stroke-width="2.6" stroke-dasharray="3 3"${A("dash", { d: 1 })}/>`
      + `<g${A("hop", { a: 4, d: 1.2 })}><path d="M60 38q-6-6-6-11a6 6 0 0 1 12 0q0 5-6 11z" fill="${C.red}" ${S2}/><circle cx="60" cy="27" r="2" fill="${W}"/></g><rect x="45" y="84" width="10" height="2.4" rx="1.2" fill="${GREY}"/>`,
    css: "",
  },

  "ice-cream": { // Ice cream break: a cone, two scoops
    svg: `<g${A("tilt", { r: 4, d: 2.4, o: [50, 88] })}><path d="M36 48h28L50 88z" fill="#d8a24a" ${S}/><path d="M57 49.3h5.2L50 84z" fill="#b8862a"/><path d="M40 56l14 10M46 52l12 9M42 64l8-6" stroke="#a8742a" stroke-width="1.2"/>`
      + `<circle cx="42" cy="44" r="10" fill="#f4b6c8" ${S}/><circle cx="58" cy="44" r="10" fill="#9fdcc0" ${S}/><circle cx="50" cy="32" r="10" fill="#8a5a3c" ${S}/><path d="M36 50q2 5 4 0" fill="#f4b6c8" ${S2}/></g>`,
    css: "",
  },

  ticket: { // The Fair ticket: admission, perforated, star-punched
    svg: `<g${A("tilt", { r: 5, d: 2.8, o: [50, 50] })}><path d="M14 32h72v12a6 6 0 0 0 0 12v12H14V56a6 6 0 0 0 0-12z" fill="${C.yellow}" ${S}/><path d="M80 33.3h4.7v9.5q-2 .8-2 .8V66.7H80z" fill="#d9a92a"/>`
      + `<path d="M66 33v34" stroke="${INK}" stroke-width="1.6" stroke-dasharray="2 2.4"/><rect x="20" y="38" width="40" height="24" rx="2" fill="none" ${S2}/>`
      + `<path d="M40 41l2.6 5.4 6 .8-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.8z" fill="${C.red}" ${S2}/><circle cx="76" cy="50" r="3" fill="${W}" ${S2}/></g>`,
    css: "",
  },

  suitcase: { // A spontaneous weekend: a cabin suitcase, ready
    svg: `<g${A("bob", { a: 2, d: 1.6 })}><path d="M42 22h16v12" fill="none" ${S}/><path d="M42 22v12" ${S}/><rect x="28" y="32" width="44" height="50" rx="6" fill="#2a9d8f" ${S}/><rect x="64" y="33.3" width="6.7" height="47.4" rx="3" fill="#1f7a6f"/>`
      + `<path d="M40 36v42M60 36v42" stroke="#1f7a6f" stroke-width="2.4"/><rect x="34" y="44" width="10" height="7" rx="1.5" fill="${C.yellow}" ${S2}/><circle cx="58" cy="66" r="4" fill="${C.red}" ${S2}/></g>`
      + `<circle cx="36" cy="86" r="3" fill="${DARK}" ${S2}/><circle cx="64" cy="86" r="3" fill="${DARK}" ${S2}/>`,
    css: "",
  },

  "crossed-bed": { // What booking? A made bed and a no-entry sign
    svg: ground(80) + `<rect x="12" y="50" width="70" height="20" rx="3" fill="${W}" ${S}/><rect x="12" y="62" width="70" height="8" fill="${C.deep}"/><rect x="12" y="50" width="70" height="20" rx="3" fill="none" ${S}/>`
      + `<rect x="8" y="38" width="8" height="42" rx="2" fill="#a0683f" ${S}/><rect x="16" y="44" width="16" height="8" rx="4" fill="${W}" ${S2}/><path d="M80 70v10M16 70v10" ${S}/>`
      + `<g${A("pulse", { s: 1.1, d: 1, o: [74, 30] })}><circle cx="74" cy="30" r="14" fill="${C.red}" ${S}/><rect x="65" y="27" width="18" height="6" rx="1" fill="${W}"/></g>`,
    css: "",
  },

  "door-key": { // Did you lock the door? The front door, the key in the lock
    svg: `<rect x="26" y="10" width="48" height="80" fill="${W}" ${S}/><rect x="32" y="16" width="36" height="74" fill="${C.red}" ${S}/><rect x="62" y="17.3" width="4.7" height="71.4" fill="#b8352e"/>`
      + `<rect x="38" y="24" width="24" height="18" rx="1" fill="none" ${S2}/><rect x="38" y="50" width="24" height="30" rx="1" fill="none" ${S2}/>`
      + `<rect x="56" y="44" width="6" height="12" rx="2" fill="${C.gold}" ${S2}/><g${A("tilt", { r: 40, d: 1.4, o: [59, 50] })}><path d="M59 50h10" ${S}/><circle cx="72" cy="50" r="4" fill="${C.gold}" ${S2}/></g>`,
    css: "",
  },

  shoelace: { // Shoelace situation: a trainer, laces undone
    svg: ground(76) + `<path d="M16 72q2-18 20-22l20-6q10 0 14 10l14 6q6 3 4 10H16z" fill="${W}" ${S}/><path d="M16 70h72v6H16z" fill="${C.red}" ${S}/>`
      + `<path d="M38 52l18-6q8 0 11 7" fill="none" stroke="${C.deep}" stroke-width="3"/><path d="M44 52l3 5M50 50l3 5M56 48l3 5" ${S2}/>`
      + `<g${A("sway", { r: 12, d: 1.6, o: [54, 52] })}><path d="M54 52q-6 12-18 16t-20 0M56 52q8 8 4 18t6 8" fill="none" ${S2}/></g>`,
    css: "",
  },

  boots: { // Bog boots: a pair of yellow wellies
    svg: `<ellipse cx="50" cy="80" rx="38" ry="7" fill="${MUD}" ${S}/>` + `<g${A("hop", { a: 4, d: 1.6 })}>${boot(22, C.yellow, "#d9a92a")}</g>` + `<g${A("hop", { a: 4, d: 1.6, dl: 0.4 })}>${boot(52, C.yellow, "#d9a92a")}</g>`,
    css: "",
  },

  lantern: { // A Lantern (lifeline)
    svg: `<path d="M50 8v8" ${S}/><g${A("sway", { r: 6, d: 2.4, o: [50, 10] })}>${lanternShape(50, 46, 2.6, C.yellow)}<ellipse cx="50" cy="46" rx="8" ry="10" fill="#fff6c8"${A("flicker", { d: 1.2 })}/></g>`,
    css: "",
  },

  "snake-down": { // The sea serpent dives: all the way back
    svg: sea(56) + `<path d="M24 20q30 0 30 36" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M24 20q30 0 30 36" fill="none" stroke="#2a9d8f" stroke-width="7.6" stroke-linecap="round"/>`
      + `<path d="M16 14q8-6 14 2l-4 6q-6 0-10-8z" fill="#2a9d8f" ${S}/>`
      + `<g${A("slide", { y: 8, x: 0, d: 1 })}><path d="M76 20v28m-7-7 7 7 7-7" fill="none" stroke="${C.red}" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/></g>`
      + `<path d="M44 58q10-8 20 0" fill="none" stroke="${W}" stroke-width="2.4"${A("ripple", { s: 1.4, d: 1.6, o: [54, 58] })}/>`,
    css: "",
  },

  tractor: { // A farmer's lift: the tractor
    svg: ground(84) + `<path d="M22 58h34V40h20v28H22z" fill="${C.red}" ${S}/><path d="M60 44h12v12H60z" fill="${GLASS}" ${S2}/><path d="M73 41.3h1.4v25.4H73z" fill="#b8352e"/><path d="M30 58v-10" ${S}/>`
      + wheel(66, 72, 12, 1.4) + wheel(28, 76, 8, 1)
      + `<circle cx="30" cy="42" r="3" fill="${SH}" ${S2}${A("puff", { d: 2.4, x: -4, y: -14 })}/>`,
    css: "",
  },

  "hay-cart": { // The hay cart: a flatbed trailer stacked with bales
    svg: ground(86) + [[18, 46], [38, 46], [58, 46], [28, 32], [48, 32]].map(([x, y]) => `<rect x="${x}" y="${y}" width="20" height="14" rx="2" fill="#e9c35a" ${S}/><path d="M${x + 4} ${y}v14M${x + 16} ${y}v14" stroke="#b8862a" stroke-width="1.6"/>`).join("")
      + `<rect x="12" y="60" width="72" height="8" fill="#a0683f" ${S}/><path d="M84 64h10" ${S}/>` + wheel(28, 76, 9, 1.4) + wheel(68, 76, 9, 1.4),
    css: "",
  },

  bicycle: { // Gravity bike: a city bike, freewheeling
    svg: ground(84) + wheel(26, 66, 15, 0.8) + wheel(74, 66, 15, 0.8)
      + `<path d="M26 66l14-24h26l8 24M40 42l12 24h-26M52 66l14-24" fill="none" stroke="${C.deep}" stroke-width="3.4" stroke-linejoin="round"/><path d="M36 38h10M64 42l2-8h7" fill="none" ${S}/>`
      + [0, 1, 2].map((i) => `<path d="M${4 + i * 3} ${46 + i * 8}h${8 - i * 2}" ${S2}${A("slide", { x: -6, d: 0.6, dl: i * 0.2 })}/>`).join(""),
    css: "",
  },

  train: { // The on-time train
    svg: `<path d="M4 84H96" ${S}/><path d="M4 88H96" stroke="${GREY}" stroke-width="2" stroke-dasharray="3 4"/><g${A("slide", { x: 6, d: 1.6 })}>${train(14, C.red)}</g>`,
    css: "",
  },

  "train-back": { // Missed your stop: the train, going back
    svg: `<path d="M4 84H96" ${S}/><path d="M4 88H96" stroke="${GREY}" stroke-width="2" stroke-dasharray="3 4"/><g${A("slide", { x: -6, d: 1.6 })}>${train(20, C.deep)}</g>`
      + `<path d="M70 30q-20-16-40 0" fill="none" ${S} stroke-width="3"/><path d="M30 22v8h8" fill="none" ${S} stroke-width="3"/>`,
    css: "",
  },

  "broken-train": { // Cancelled: the train, a warning sign
    svg: `<path d="M4 84H96" ${S}/>${train(8, C.deep)}`
      + `<g${A("pulse", { s: 1.1, d: 0.8, o: [76, 28] })}><path d="M76 12l16 28H60z" fill="${C.yellow}" ${S}/><rect x="74.4" y="20" width="3.2" height="10" rx="1.6" fill="${DARK}"/><circle cx="76" cy="34" r="1.8" fill="${DARK}"/></g>`,
    css: "",
  },

  scooter: { // The last e-scooter
    svg: ground(84) + `<path d="M24 74h44l8-46" fill="none" stroke="${DARK}" stroke-width="4" stroke-linecap="round"/><path d="M70 28h12" ${S}/><rect x="30" y="68" width="30" height="6" rx="3" fill="#2a9d8f" ${S2}/>`
      + wheel(24, 76, 7, 0.7) + wheel(74, 76, 7, 0.7) + `<path d="M46 52l-4 7h5l-3 7 8-9h-5l3-5z" fill="${C.yellow}" ${S2}${A("flicker", { d: 0.8 })}/>`,
    css: "",
  },

  ferry: { // Wrong ferry: a car ferry crossing the bay
    svg: sea(70) + `<g${A("bob", { a: 2, d: 1.6 })}><path d="M10 58h80l-8 14H18z" fill="${W}" ${S}/><path d="M18 70h64" stroke="${C.red}" stroke-width="3"/>`
      + `<rect x="30" y="42" width="40" height="16" fill="${W}" ${S}/>${[34, 44, 54, 64].map((x) => `<rect x="${x}" y="46" width="5" height="5" fill="${GLASS}" ${S2}/>`).join("")}`
      + `<rect x="56" y="30" width="8" height="12" fill="${C.red}" ${S2}/></g><circle cx="60" cy="24" r="3" fill="${SH}" ${S2}${A("puff", { d: 2.6, x: -6, y: -12 })}/>`,
    css: "",
  },

  sailboat: { // A free boat ride: a sailboat in the wind
    svg: sea(70) + `<g${A("bob", { a: 2, d: 1.8 })}><path d="M18 64h62l-8 10H26z" fill="#a0683f" ${S}/><path d="M50 16v48" ${S}/>`
      + `<g${A("sway", { r: 3, d: 2, o: [50, 60] })}><path d="M50 18l26 40H50z" fill="${W}" ${S}/><path d="M48 24L26 58h22z" fill="${C.red}" ${S}/></g></g>`,
    css: "",
  },

  "boat-leaving": { // Missed the boat: the end of the pier, the boat already out
    svg: sea(66) + `<rect x="4" y="56" width="30" height="6" fill="#a0683f" ${S}/><path d="M10 62v26M28 62v26" ${S}/>` + figure(22, 30, C.purple)
      + `<g${A("slide", { x: 10, d: 4 })}><path d="M58 58h30l-4 8H62z" fill="${W}" ${S}/><rect x="66" y="48" width="14" height="10" fill="${W}" ${S2}/><rect x="74" y="40" width="4" height="8" fill="${C.red}" ${S2}/></g>`,
    css: "",
  },

  "ski-lift": { // The free ski lift: a chair on the cable
    svg: `<path d="M-6 92L106 50V110H-6z" fill="${W}" ${S}/><path d="M80 60V22" ${S}/><path d="M74 22h12" ${S}/><path d="M-4 30L104 18" ${S2}/>`
      + `<g${A("slide", { x: 14, y: -1.6, d: 3.4 })}><path d="M36 26v20" ${S2}/><path d="M26 46h20v4H26zM42 46v-8" fill="${C.red}" ${S2}/>${figure(34, 30, C.orange, 0.7)}</g>` + pine(16, 88, 0.6),
    css: "",
  },

  sledge: { // Sledge run: a wooden sledge flying downhill
    svg: `<path d="M-6 36L106 90V110H-6z" fill="${W}" ${S}/>`
      + `<g${A("slide", { x: 10, y: 5, d: 1.2 })}><path d="M30 46l34 16" ${S}/><path d="M28 52l40 19q6 3 8-2" fill="none" ${S}/><path d="M30 46l-2 6M64 62l-2 7" ${S}/><path d="M30 44l34 16 2-4-34-16z" fill="#a0683f" ${S2}/></g>`
      + [0, 1, 2].map((i) => `<path d="M${16 + i * 4} ${36 + i * 6}l-8-4" ${S2}${A("slide", { x: -5, d: 0.6, dl: i * 0.2 })}/>`).join("") + pine(84, 60, 0.6),
    css: "",
  },

  "rope-swing": { // The rope swing over the river
    svg: sea(72) + `<path d="M-6 14q40-6 70 2" fill="none" stroke="#6b4f34" stroke-width="7" stroke-linecap="round"/><path d="M-6 14q40-6 70 2" fill="none" ${S2}/>`
      + `<g${A("sway", { r: 18, d: 1.8, o: [40, 12] })}><path d="M40 12v44" stroke="#c9a46a" stroke-width="2.6"/><circle cx="40" cy="58" r="3.4" fill="#c9a46a" ${S2}/></g>`
      + `<path d="M74 70q6-14 26-14v20H74z" fill="${LEAF}" ${S}/>`,
    css: "",
  },

  "sleeping-face": { // Asleep on the train: the seat, the window, a sleep mask
    svg: `<rect x="10" y="14" width="56" height="40" rx="8" fill="#2a3f7a" ${S}/><circle cx="52" cy="26" r="5" fill="#fff6c8" ${S2}/>`
      + [0, 1].map((i) => `<path d="M${16 + i * 22} 46l10-8 10 8" fill="none" stroke="#4a5f9a" stroke-width="2.4"${A("slide", { x: -8, d: 1.4, dl: i * 0.5 })}/>`).join("")
      + `<path d="M58 30h22q8 0 8 8v50H58z" fill="${C.purple}" ${S}/><path d="M80 31.3q6.7.7 6.7 6.7v48.7H80z" fill="#7d4593"/>`
      + `<g${A("bob", { a: 1.5, d: 2.6 })}><path d="M26 62h28q4 0 4 4t-4 4H26q-4 0-4-4t4-4z" fill="${DARK}" ${S}/><path d="M30 66q4 3 8 0M44 66q4 3 8 0" fill="none" stroke="${W}" stroke-width="1.6"/></g>`,
    css: "",
  },

  "slide-mud": { // The riverbank selfie: the slippery-bank sign, the mud below
    svg: `<ellipse cx="50" cy="86" rx="44" ry="8" fill="${MUD}" ${S}/>` + sign(50, 22, `<g${A("tilt", { r: 8, d: 1.4, o: [50, 32] })}><circle cx="46" cy="24" r="2.2" fill="${DARK}"/><path d="M47 27l3 6 5 2M49 30l-6 3M50 33l-3 6" fill="none" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/></g><path d="M40 40q10-3 20 0" fill="none" stroke="${DARK}" stroke-width="1.8"/>`),
    css: "",
  },
};

/** The cards a player holds: each has its own card design (owner, 15 Oct). Card faces on a 100 × 140 grid. */
export const CARD_DESIGNS: Record<string, { frame: string; panel: string; pattern: string; art: string; corner: string }> = {
  bonus: { frame: "#fffdf6", panel: "#4b2377", pattern: "#5d2f8f", art: "card", corner: C.gold },
  jailPass: { frame: "#fffdf6", panel: "#3c8c50", pattern: "#4c9a5c", art: "boots", corner: C.yellow },
  snakeLeader: { frame: "#fffdf6", panel: "#1f7a6f", pattern: "#2a8c80", art: "snake-crown", corner: C.gold },
};

/** A held card's face: frame, its own coloured panel and pattern, its picture in the middle, corner marks. */
export function cardFace(kind: keyof typeof CARD_DESIGNS, label: string): string {
  const d = CARD_DESIGNS[kind], a = MODERN[d.art];
  const pattern = kind === "bonus" ? Array.from({ length: 6 }, (_, i) => `<path d="M${14 + i * 14} 16l4 4-4 4-4-4z" fill="${d.pattern}"/>`).join("")
    : kind === "jailPass" ? Array.from({ length: 7 }, (_, i) => `<path d="M10 ${20 + i * 16}q10-6 20 0t20 0 20 0 20 0" fill="none" stroke="${d.pattern}" stroke-width="3"/>`).join("")
    : Array.from({ length: 6 }, (_, i) => `<circle cx="${18 + (i % 3) * 32}" cy="${24 + Math.floor(i / 3) * 92}" r="7" fill="none" stroke="${d.pattern}" stroke-width="2.4"/>`).join("");
  return `<svg class="card-face" viewBox="0 0 100 140" role="img" aria-label="${esc(label)}">`
    + `<rect x="3" y="3" width="94" height="134" rx="10" fill="${d.frame}" ${S}/>`
    + `<rect x="10" y="10" width="80" height="120" rx="5" fill="${d.panel}"/>${pattern}`
    + `<rect x="16" y="36" width="68" height="68" rx="6" fill="${W}" ${S}/>`
    + `<svg x="16" y="36" width="68" height="68" viewBox="${a.box ?? "6 6 88 88"}">${a.svg}</svg>`
    + `<rect x="16" y="36" width="68" height="68" rx="6" fill="none" ${S}/>`
    + [[18, 18], [82, 122]].map(([x, y]) => `<path d="M${x} ${y - 5}l5 5-5 5-5-5z" fill="${d.corner}" ${S2}/>`).join("")
    + `</svg>`;
}

