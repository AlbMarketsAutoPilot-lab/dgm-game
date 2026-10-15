// DRAFT for the owner's review (15 Oct), not used by the game yet: three pictures redrawn as grown-up subjects in
// the clean outlined style of the owner's examples (flat colours, one shaded side, the game's ink outline).
// Compare them with the current ones at /gallery.html?compare (npm run dev).
import { A, C, S, S2 } from "./art-kit";

interface Art {
  svg: string;
  css: string;
  box?: string;
}

const GLASS = "#bfe2ff", WALL = "#fffdf6", SHADE = "#e4dfd3", ROOF = "#8d8a96", DARK = "#5f5a6b";

export const MODERN: Record<string, Art> = {
  house: { // Home: a modern two-storey house, the upper floor reaching out over the door
    svg: `<defs><clipPath id="mh-glass"><rect x="20" y="31" width="24" height="17"/></clipPath></defs>`
      + `<path d="M6 84H94" ${S}/>`
      // ground floor
      + `<rect x="34" y="52" width="46" height="32" fill="${WALL}" ${S}/><rect x="72" y="53.3" width="6.7" height="29.4" fill="${SHADE}"/>`
      + `<rect x="42" y="60" width="12" height="24" fill="${ROOF}" ${S}/><circle cx="51" cy="72" r="1.2" fill="${DARK}"/>`
      + `<rect x="61" y="60" width="8" height="13" fill="${DARK}" ${S}/><rect x="61" y="60" width="8" height="13" fill="#ffd27a"${A("flicker", { d: 3.2 })}/>`
      // upper floor, cantilevered to the left
      + `<rect x="16" y="26" width="46" height="26" fill="${WALL}" ${S}/><rect x="54" y="27.3" width="6.7" height="23.4" fill="${SHADE}"/>`
      + `<rect x="20" y="31" width="24" height="17" fill="${GLASS}" ${S}/>`
      + `<g clip-path="url(#mh-glass)"><path d="M10 50l10-22h5L15 50z" fill="#fff" opacity=".7"${A("slide", { x: 34, d: 3.6 })}/></g>`
      + `<path d="M26 31v17M32 31v17M38 31v17" ${S2}/><rect x="20" y="31" width="24" height="17" fill="none" ${S}/>`
      + `<rect x="48" y="32" width="8" height="12" fill="${DARK}" ${S}/>`
      // flat roof
      + `<rect x="12" y="19.5" width="54" height="7" rx="2.5" fill="${ROOF}" ${S}/><rect x="56" y="20.8" width="8.6" height="4.4" fill="#76737f"/>`
      // plants
      + `<g${A("sway", { r: 2.5, d: 3, o: [16, 84] })}><path d="M9 84c-2-14 4-20 7-20s9 6 7 20z" fill="${C.leaf}" ${S}/><path d="M16 70v14" ${S2}/></g>`
      + `<g${A("sway", { r: 2, d: 3.6, dl: 0.6, o: [27, 84] })}><path d="M22 84c-1-9 2-13 5-13s6 4 5 13z" fill="#5f9e63" ${S}/></g>`
      + `<g${A("sway", { r: 2, d: 3.3, dl: 0.3, o: [87, 84] })}><path d="M81 84c-1-11 3-16 6-16s7 5 6 16z" fill="${C.leaf}" ${S}/><path d="M87 72v12" ${S2}/></g>`,
    css: "",
  },

  signpost: { // Crossroads: a real road sign where the road splits
    svg: `<path d="M6 30H94" stroke="none"/>`
      + `<path d="M-4 96L30 62H44L22 96z" fill="#b8b2a6" ${S}/><path d="M104 96L62 62H50L74 96z" fill="#b8b2a6" ${S}/>`
      + `<path d="M28 86l6-8M36 75l4-5" stroke="${WALL}" stroke-width="2.4" stroke-linecap="round"/><path d="M80 86l-6-8M70 75l-4-5" stroke="${WALL}" stroke-width="2.4" stroke-linecap="round"/>`
      + `<path d="M6 62H94" ${S}/>`
      + `<rect x="47" y="18" width="6" height="66" rx="1" fill="#a8a3b0" ${S}/><rect x="50.4" y="19.3" width="1.6" height="63.4" fill="#8d8a96"/>`
      // the Main Road sign (green) and the Shortcut sign (brown), arrow-shaped like real road signs
      + `<path d="M53 22H82l8 8-8 8H53z" fill="#3c8c50" ${S}/><path d="M54.3 34.8H81.5l3.2-3.2" fill="none" stroke="#2f6e3f" stroke-width="2.6"/>`
      + `<text x="69" y="33.6" font-size="8.4" text-anchor="middle" fill="${WALL}" font-family="Patrick Hand, sans-serif" letter-spacing=".4">MAIN ROAD</text>`
      + `<g${A("tilt", { r: 3, d: 2.6, o: [47, 46] })}><path d="M47 42H18l-8 8 8 8h29z" fill="#a0683f" ${S}/><path d="M45.7 54.8H18.5l-3.2-3.2" fill="none" stroke="#7d4f2e" stroke-width="2.6"/>`
      + `<text x="30" y="53.6" font-size="8.4" text-anchor="middle" fill="${WALL}" font-family="Patrick Hand, sans-serif" letter-spacing=".4">SHORTCUT</text></g>`
      + `<rect x="43" y="82" width="14" height="4" rx="1" fill="${ROOF}" ${S}/>`,
    css: "",
  },

  card: { // The Bonus card: a playing card with the festival lantern as its emblem, a second card behind it
    svg: `<defs><clipPath id="mc-face"><rect x="30" y="16" width="44" height="66" rx="6"/></clipPath></defs>`
      + `<g${A("bob", { a: 2.5, d: 2.6 })}>`
      + `<rect x="22" y="22" width="44" height="66" rx="6" fill="#6a3d9a" ${S} transform="rotate(-10 44 55)"/>`
      + `<g${A("tilt", { r: 3, d: 3.4, o: [52, 49] })}>`
      + `<rect x="30" y="16" width="44" height="66" rx="6" fill="${WALL}" ${S}/>`
      + `<rect x="35" y="21" width="34" height="56" rx="3" fill="#4b2377"/><rect x="66" y="21" width="3" height="56" fill="#3a1a5e"/>`
      + `<rect x="38" y="24" width="28" height="50" rx="2" fill="none" stroke="${C.gold}" stroke-width="1.2"/>`
      // the emblem: a lantern
      + `<path d="M52 33v4" stroke="${C.gold}" stroke-width="1.6"/><path d="M46.5 37h11l-1.5 3h-8z" fill="${C.gold}"/>`
      + `<path d="M47 40h10l2 16H45z" fill="${C.yellow}" stroke="${C.gold}" stroke-width="1"/><path d="M45 56h14l-1.5 3h-11z" fill="${C.gold}"/>`
      + `<ellipse cx="52" cy="48" rx="2.6" ry="4" fill="#fff6c8"${A("flicker", { d: 1.4 })}/>`
      + `<path d="M40 28l2 2-2 2-2-2zM64 70l2 2-2 2-2-2z" fill="${C.gold}"/>`
      + `<g clip-path="url(#mc-face)"><path d="M14 90l22-80h7L21 90z" fill="#fff" opacity=".35"${A("slide", { x: 60, d: 3.8 })}/></g>`
      + `</g></g>`,
    css: "",
  },
};
