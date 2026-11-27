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
const train = (x: number, colour: string) => `<path d="M${x} 50h46q12 0 14 14v14H${x}z" fill="${colour}" ${S}/><path d="M${x + 1.3} 72h57.4v4.7H${x + 1.3}z" fill="#00000022"/>`
  + `<path d="M${x + 46} 54h6q6 1 7.5 9H${x + 46}z" fill="${GLASS}" ${S2}/>` + [0, 1, 2].map((i) => `<rect x="${x + 5 + i * 13}" y="55" width="9" height="8" rx="1.5" fill="${GLASS}" ${S2}/>`).join("")
  + `<path d="M${x} 68h60" stroke="${W}" stroke-width="2.4"/>` + `<circle cx="${x + 10}" cy="80" r="3.4" fill="${DARK}" ${S2}/><circle cx="${x + 48}" cy="80" r="3.4" fill="${DARK}" ${S2}/>`;
const lanternShape = (x: number, y: number, k: number, colour: string) => `<path d="M${x} ${y - 13 * k}v${3 * k}" ${S2}/><rect x="${x - 4 * k}" y="${y - 10 * k}" width="${8 * k}" height="${2.6 * k}" rx="1" fill="${DARK}" ${S2}/>`
  + `<ellipse cx="${x}" cy="${y}" rx="${9 * k}" ry="${8 * k}" fill="${colour}" ${S}/><path d="M${x - 4.5 * k} ${y - 6.9 * k}q${-2 * k} ${6.9 * k} 0 ${13.8 * k}M${x + 4.5 * k} ${y - 6.9 * k}q${2 * k} ${6.9 * k} 0 ${13.8 * k}" fill="none" stroke="#00000033" stroke-width="1.4"/>`
  + `<rect x="${x - 4 * k}" y="${y + 7.4 * k}" width="${8 * k}" height="${2.6 * k}" rx="1" fill="${DARK}" ${S2}/>`;
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

  sheep: { // Rush hour, rural edition: the sheep-crossing sign
    svg: sign(50, 24, `<g${A("hop", { a: 2, d: 1.4 })}><path d="M41 39q0-5 5-5h7q6 0 6 5t-6 5h-7q-5 0-5-5z" fill="${DARK}"/><circle cx="60" cy="36" r="3" fill="${DARK}"/><path d="M44 43v4M48 43v4M53 43v4M57 43v4" stroke="${DARK}" stroke-width="1.8"/></g>`),
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

  "fallen-tree": { // Fallen tree across the road
    svg: `<path d="M6 76H94" ${S}/><path d="M12 86H88" stroke="${GREY}" stroke-width="2.6" stroke-dasharray="8 6"/>`
      + `<path d="M14 66l62-18 4 10-62 18z" fill="#8a5a3c" ${S}/><path d="M17 72l62-18" stroke="#6b4428" stroke-width="2"/>`
      + `<ellipse cx="16" cy="71" rx="5" ry="6" fill="#d8b98a" ${S}/><ellipse cx="16" cy="71" rx="2" ry="2.6" fill="none" stroke="#a0683f" stroke-width="1.2"/>`
      + `<g${A("sway", { r: 3, d: 2.8, o: [76, 52] })}><circle cx="82" cy="44" r="12" fill="${LEAF}" ${S}/><circle cx="70" cy="40" r="8" fill="#5f9e63" ${S}/></g>`
      + [0, 1].map((i) => `<path d="M${60 + i * 16} 24q3-3 6 0-3 3-6 0z" fill="${LEAF}" ${S2}${A("fall", { d: 3.2, dl: i * 1.4, x: -8, y: 40 })}/>`).join(""),
    css: "",
  },

  pier: { // River Pier: wooden boards on posts, a bollard, a lamp
    svg: sea(70) + `<rect x="6" y="56" width="70" height="6" fill="#a0683f" ${S}/><path d="M14 62v24M34 62v24M54 62v24M72 62v24" ${S}/>`
      + `<path d="M64 56v-6h6v6" fill="${DARK}" ${S2}/><path d="M20 56V26" ${S}/><path d="M14 22h12l-2 6h-8z" fill="#ffd27a" ${S2}/>`,
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

  "big-clock": { // Waiting: the station clock on its bracket
    svg: `<path d="M50 6v14M38 20h24" ${S}/><circle cx="50" cy="50" r="28" fill="${GREY}" ${S}/><circle cx="50" cy="50" r="23" fill="${W}" ${S}/>`
      + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => `<path d="M50 ${i % 3 ? 29 : 28}v${i % 3 ? 3 : 5}" stroke="${INK}" stroke-width="${i % 3 ? 1.4 : 2.4}" transform="rotate(${a} 50 50)"/>`).join("")
      + `<g${A("spin", { d: 4, o: [50, 50] })}><path d="M50 50V32" stroke="${C.red}" stroke-width="1.6" stroke-linecap="round"/></g><g${A("spin", { d: 48, o: [50, 50] })}><path d="M50 50l9 6" ${S}/></g><circle cx="50" cy="50" r="2.4" fill="${DARK}"/>`,
    css: "",
  },

  "swap-arrows": { // Plot twist: two arrows trading places
    svg: `<g${A("spin", { d: 4, o: [50, 50] })}><path d="M24 44a27 27 0 0 1 46-14" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M24 44a27 27 0 0 1 46-14" fill="none" stroke="${C.deep}" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M64 20l10 12-14 4z" fill="${C.deep}" ${S2}/>`
      + `<path d="M76 56a27 27 0 0 1-46 14" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M76 56a27 27 0 0 1-46 14" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M36 80L26 68l14-4z" fill="${C.red}" ${S2}/></g>`,
    css: "",
  },

  "ice-cream": { // Ice cream break: a cone, two scoops
    svg: `<g${A("tilt", { r: 4, d: 2.4, o: [50, 88] })}><path d="M36 48h28L50 88z" fill="#d8a24a" ${S}/><path d="M57 49.3h5.2L50 84z" fill="#b8862a"/><path d="M40 56l14 10M46 52l12 9M42 64l8-6" stroke="#a8742a" stroke-width="1.2"/>`
      + `<circle cx="42" cy="44" r="10" fill="#f4b6c8" ${S}/><circle cx="58" cy="44" r="10" fill="#9fdcc0" ${S}/><circle cx="50" cy="32" r="10" fill="#8a5a3c" ${S}/><path d="M36 50q2 5 4 0" fill="#f4b6c8" ${S2}/></g>`,
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

  lantern: { // A Lantern (lifeline)
    svg: `<path d="M50 8v8" ${S}/><g${A("sway", { r: 6, d: 2.4, o: [50, 10] })}>${lanternShape(50, 46, 2.6, C.yellow)}<ellipse cx="50" cy="46" rx="8" ry="10" fill="#fff6c8"${A("flicker", { d: 1.2 })}/></g>`,
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

  "train-back": { // Missed your stop: the train, going back
    svg: `<path d="M4 84H96" ${S}/><path d="M4 88H96" stroke="${GREY}" stroke-width="2" stroke-dasharray="3 4"/><g${A("slide", { x: -6, d: 1.6 })}>${train(20, C.deep)}</g>`
      + `<path d="M70 30q-20-16-40 0" fill="none" ${S} stroke-width="3"/><path d="M30 22v8h8" fill="none" ${S} stroke-width="3"/>`,
    css: "",
  },

  sailboat: { // A free boat ride: a sailboat in the wind
    svg: sea(70) + `<g${A("bob", { a: 2, d: 1.8 })}><path d="M18 64h62l-8 10H26z" fill="#a0683f" ${S}/><path d="M50 16v48" ${S}/>`
      + `<g${A("sway", { r: 3, d: 2, o: [50, 60] })}><path d="M50 18l26 40H50z" fill="${W}" ${S}/><path d="M48 24L26 58h22z" fill="${C.red}" ${S}/></g></g>`,
    css: "",
  },

  "sleeping-face": { // Asleep on the train: the seat, the window, a sleep mask
    svg: `<rect x="10" y="14" width="56" height="40" rx="8" fill="#2a3f7a" ${S}/><circle cx="52" cy="26" r="5" fill="#fff6c8" ${S2}/>`
      + [0, 1].map((i) => `<path d="M${16 + i * 22} 46l10-8 10 8" fill="none" stroke="#4a5f9a" stroke-width="2.4"${A("slide", { x: -8, d: 1.4, dl: i * 0.5 })}/>`).join("")
      + `<path d="M58 30h22q8 0 8 8v50H58z" fill="${C.purple}" ${S}/><path d="M80 31.3q6.7.7 6.7 6.7v48.7H80z" fill="#7d4593"/>`
      + `<g${A("bob", { a: 1.5, d: 2.6 })}><path d="M26 62h28q4 0 4 4t-4 4H26q-4 0-4-4t4-4z" fill="${DARK}" ${S}/><path d="M30 66q4 3 8 0M44 66q4 3 8 0" fill="none" stroke="${W}" stroke-width="1.6"/></g>`,
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

