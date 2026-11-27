// Illustrations, part 2: vehicles and moments on the move (each tells its square's story; see board files).
import { A, C, INK, S, S2, cloud, ground, pine, puffs, sun, water, wheel } from "./art-kit";

type Art = { svg: string; css: string; box?: string };

/** A small steam train, facing right; `back` = reversing to the left; `steam` = puffing. */
function train(body: string, back = false, steam = true): string {
  return `<path d="M0 84h100" ${S}/><path d="M8 84v4M24 84v4M40 84v4M56 84v4M72 84v4M88 84v4" ${S2}/>`
    + `<g${A("bob", { a: 1, d: 0.35 })}>`
    + `<rect x="30" y="46" width="34" height="28" rx="3" fill="${body}" ${S}/>`
    + `<path d="M60 74V30h22v44z" fill="${body}" ${S}/><rect x="56" y="25" width="30" height="7" rx="2" fill="${C.dark}" ${S2}/>`
    + `<rect x="65" y="36" width="12" height="12" rx="2" fill="${C.glass}" ${S2}/>`
    + `<rect x="16" y="52" width="16" height="22" rx="4" fill="${C.dark}" ${S}/>`
    + `<path d="M33 46V32h9v14" fill="${C.dark}" ${S}/><path d="M16 74l-6 7h20z" fill="${C.grey}" ${S2}/>`
    + `<circle cx="22" cy="60" r="3.4" fill="${C.yellow}" ${S2}${A("flicker", { d: 0.8 })}/>`
    + `</g>` + wheel(40, 77, 7.5, C.dark, 0.7, back) + wheel(56, 77, 7.5, C.dark, 0.7, back) + wheel(73, 77, 7.5, C.dark, 0.7, back)
    + (steam ? puffs(37, 28, 4, C.white, 2.2) : "");
}

export const TRAVEL: Record<string, Art> = {
  tractor: { // "A farmer offers a lift. Don't overthink it."
    svg: cloud(8, 10, 0.9) + ground(82)
      + `<g${A("bob", { a: 1.6, d: 0.32 })}>`
      + `<rect x="12" y="50" width="38" height="20" rx="4" fill="${C.red}" ${S}/><path d="M18 56h26M18 62h26" ${S2} opacity=".5"/>`
      + `<path d="M48 70V30h24v40z" fill="${C.red}" ${S}/><rect x="44" y="25" width="32" height="6" rx="2" fill="${C.dark}" ${S2}/>`
      + `<rect x="53" y="35" width="15" height="13" rx="2" fill="${C.glass}" ${S2}/>`
      + `<circle cx="60" cy="44" r="4.5" fill="${C.skin}" ${S2}/><path d="M54 41h12l-2-5h-8z" fill="${C.yellow}" ${S2}/>`
      + `<rect x="22" y="38" width="5" height="12" fill="${C.dark}" ${S2}/></g>`
      + puffs(24, 34, 3, C.grey, 2) + wheel(64, 70, 14, C.dark, 1.1) + wheel(24, 74, 9, C.dark, 0.75),
    css: "",
  },

  "hay-cart": { // "Hay cart to the forest. Not glamorous, but fast."
    svg: ground(84)
      + `<g${A("bob", { a: 1.4, d: 0.42 })}>`
      + `<path d="M12 56c4-18 18-26 32-24 6-9 24-9 32 2 9 2 13 11 11 22z" fill="${C.gold}" ${S}/>`
      + `<path d="M24 46l6 4M40 38l4 7M58 37l2 7M72 43l-3 6M50 48l3 5" fill="none" ${S2}/>`
      + `<rect x="8" y="56" width="82" height="12" rx="2" fill="${C.brown}" ${S}/><path d="M28 56v12M50 56v12M70 56v12" ${S2}/>`
      + `<path d="M90 62l10 4" ${S}/></g>`
      + wheel(28, 74, 10, C.brown, 0.9) + wheel(72, 74, 10, C.brown, 0.9)
      + [0, 1, 2].map((i) => `<path d="M${70 + i * 4} ${36 + i * 3}l5-2" stroke="${C.gold}" stroke-width="2.5" stroke-linecap="round"${A("move", { x: -26, y: -8, d: 1.8, dl: i * 0.6 })}/>`).join(""),
    css: "",
  },

  "train-back": { // "Missed your stop. Back to the seaside."
    svg: `<g${A("slide", { x: -6, d: 0.9 })}>${train(C.deep, true)}</g>`
      + `<g${A("bob", { a: 3, d: 0.5 })}><path d="M86 14H66M72 8l-6 6 6 6" fill="none" stroke="${C.red}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    css: "",
  },

  sailboat: { // "Free boat ride to the Harbour. Best day ever."
    svg: sun(82, 18, 7) + water(74)
      + `<g${A("tilt", { r: 5, d: 1.8, o: [50, 76], rev: true })}>`
      + `<path d="M16 66h66l-10 12H26z" fill="${C.brown}" ${S}/><path d="M50 66V12" ${S}/>`
      + `<path d="M52 14v46h28z" fill="${C.white}" ${S}/><path d="M48 20v40H24z" fill="${C.yellow}" ${S}/>`
      + `<g${A("sway", { r: 14, d: 0.5, o: [50, 12] })}><path d="M50 12l13 3.5-13 3.5z" fill="${C.red}" ${S2}/></g>`
      + `</g>`,
    css: "",
  },

  "sleeping-face": { // "Fell asleep on the train. Woke up at the river."
    svg: `<rect x="8" y="8" width="84" height="66" rx="8" fill="${C.glass}" ${S}/>`
      + `<g${A("move", { x: -70, d: 2.2 })}>${pine(96, 72, 0.7, false)}</g>`
      + `<g${A("move", { x: -70, d: 2.2, dl: 1.1 })}>${pine(96, 72, 0.5, false)}</g>`
      + `<rect x="4" y="58" width="36" height="40" rx="6" fill="${C.red}" ${S}/>`
      + `<g${A("tilt", { r: 14, d: 2.2, o: [42, 84] })}>`
      + `<circle cx="42" cy="58" r="16" fill="${C.skin}" ${S}/><path d="M26 54c0-14 30-16 32-2-8-4-22-6-32 2z" fill="${C.brown}" ${S2}/>`
      + `<path d="M33 60q3 3 6 0M45 60q3 3 6 0" fill="none" ${S2}/><ellipse cx="42" cy="68" rx="2.6" ry="2" fill="${INK}"/>`
      + `</g>`
      + [10, 8, 6].map((s, i) => `<text x="${62 + i * 6}" y="${46 - i * 8}" font-size="${s + 4}" fill="${C.purple}"${A("puff", { x: 8, y: -14, d: 2.4, dl: i * 0.8, s: 1.1 })}>Z</text>`).join(""),
    css: "",
  },

};
