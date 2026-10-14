// Illustrations, part 2: vehicles and moments on the move (each tells its square's story; see board files).
import { A, C, INK, S, S2, circ, cloud, falling, ground, person, pine, puffs, sparkle, sun, water, wheel } from "./art-kit";

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

  bicycle: { // "It's all downhill from here. Throw twice, add up."
    svg: `<path d="M-5 38L105 82V105H-5z" fill="${C.grass}" ${S}/>`
      + `<g${A("bob", { a: 1.2, d: 0.28 })}><g transform="translate(8 12) scale(.86) rotate(21 50 56)">`
      + wheel(28, 64, 13, "none", 0.5) + wheel(72, 64, 13, "none", 0.5)
      + `<path d="M28 64l14-20h22l8 20M42 44l12 20H28M54 44l-3-9M46 35h10M64 44l3-9h6" fill="none" stroke="${INK}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="M28 64l14-20h22l8 20M42 44l12 20H28M54 44l-3-9M46 35h10M64 44l3-9h6" fill="none" stroke="${C.red}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="M51 33l8-16" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M51 33l8-16" stroke="${C.deep}" stroke-width="4" stroke-linecap="round"/>`
      + `<path d="M58 22l9 10M51 34l9 12-3 8" fill="none" ${S} stroke-width="3"/>`
      + `<circle cx="61" cy="12" r="6" fill="${C.skin}" ${S2}/><path d="M55 10c1-6 11-7 12 0z" fill="${C.yellow}" ${S2}/>`
      + `</g></g>`
      + [0, 1, 2].map((i) => `<path d="M${10 + i * 4} ${18 + i * 8}h14" ${S2}${A("move", { x: -14, d: 0.7, dl: i * 0.23 })}/>`).join(""),
    css: "",
  },

  train: { svg: cloud(70, 8, 0.8) + train(C.red), css: "" }, // "Forest Station. A train that's actually on time!"

  "train-back": { // "Missed your stop. Back to the seaside."
    svg: `<g${A("slide", { x: -6, d: 0.9 })}>${train(C.deep, true)}</g>`
      + `<g${A("bob", { a: 3, d: 0.5 })}><path d="M86 14H66M72 8l-6 6 6 6" fill="none" stroke="${C.red}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    css: "",
  },

  "broken-train": { // "Train cancelled. Of course."
    svg: `<rect x="8" y="6" width="84" height="20" rx="3" fill="${C.dark}" ${S}/>`
      + `<text x="50" y="21" text-anchor="middle" font-size="13" fill="#ff6b5e"${A("flicker", { d: 0.5 })}>CANCELLED</text>`
      + `<g${A("shake", { r: 1.5, d: 0.6, o: [50, 84] })}>${train(C.deep, false, false)}</g>`,
    css: "",
  },

  scooter: { // "Last e-scooter in town. Zoom to Central Station!"
    svg: `<path d="M0 86h100" ${S}/>`
      + `<g${A("bob", { a: 1.4, d: 0.25 })}>`
      + `<path d="M20 78h48" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M20 78h48" stroke="${C.teal}" stroke-width="4.5" stroke-linecap="round"/>`
      + `<path d="M66 78L77 28" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M66 78L77 28" stroke="${C.teal}" stroke-width="3.6" stroke-linecap="round"/>`
      + `<path d="M70 28h16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M40 72l4-8h-4l4-8" fill="none" stroke="${C.yellow}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"${A("flicker", { d: 0.4 })}/>`
      + `</g>` + wheel(22, 82, 7, C.dark, 0.35) + wheel(70, 82, 7, C.dark, 0.35)
      + [0, 1, 2].map((i) => `<path d="M${4 + i * 3} ${40 + i * 12}h16" ${S2}${A("move", { x: -16, d: 0.6, dl: i * 0.2 })}/>`).join(""),
    css: "",
  },

  ferry: { // "Wrong ferry. All the way back to the Bog."
    svg: water(72)
      + `<g${A("bob", { a: 2, d: 1.3 })}>`
      + `<path d="M8 62h84l-9 15H17z" fill="${C.white}" ${S}/><path d="M12 68h76" stroke="${C.red}" stroke-width="3"/>`
      + `<rect x="24" y="44" width="50" height="18" rx="2" fill="${C.white}" ${S}/>`
      + [33, 43, 53, 63].map((x) => `<circle cx="${x}" cy="53" r="3.2" fill="${C.glass}" ${S2}/>`).join("")
      + `<rect x="58" y="30" width="10" height="14" fill="${C.red}" ${S2}/><rect x="58" y="33" width="10" height="3" fill="${C.dark}"/>`
      + `</g>` + puffs(63, 26, 3, C.grey, 2.6)
      + `<text x="20" y="36" font-size="22" fill="${C.purple}" ${S2} stroke-width="1"${A("bob", { a: 4, d: 0.8 })}>?</text>`,
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

  "boat-leaving": { // "Missed the boat. Literally. Back to the Pier."
    svg: water(66)
      + `<rect x="-4" y="58" width="38" height="7" fill="${C.brown}" ${S}/><path d="M6 65v22M26 65v22" ${S} stroke-width="3.5"/>`
      + person(16, 36, C.purple)
      + `<g${A("sway", { r: 28, d: 0.35, o: [20, 46] })}><path d="M20 46l9-10" fill="none" ${S} stroke-width="3.2"/></g>`
      + `<g${A("slide", { x: 16, y: -3, d: 3 })}>`
      + `<path d="M50 58h38l-6 10H56z" fill="${C.red}" ${S}/><rect x="58" y="47" width="20" height="11" fill="${C.white}" ${S2}/>`
      + `<rect x="69" y="38" width="6" height="9" fill="${C.dark}" ${S2}/>${puffs(72, 34, 2, C.grey, 2)}</g>`,
    css: "",
  },

  "ski-lift": { // "Free ski lift. Every little helps."
    svg: `<path d="M-5 94L105 42V105H-5z" fill="${C.snow}" ${S}/>` + pine(16, 92, 0.55) + pine(86, 60, 0.55)
      + `<path d="M-2 28L102 8" ${S}/>`
      + `<g${A("slide", { x: 34, y: -6.5, d: 3.4 })}>`
      + `<path d="M28 23v20" ${S}/><circle cx="28" cy="23" r="2.4" fill="${INK}"/>`
      + `<path d="M17 43h22v4H17zM17 43V31" fill="${C.red}" ${S}/>`
      + person(27, 32, C.orange, 0.8) + `<path d="M15 48h26" ${S}/>`
      + `</g>` + falling("snow", 6, 3.6),
    css: "",
  },

  sledge: { // "Sledge run! Throw three times, add them all up."
    svg: `<path d="M-5 30L105 82V105H-5z" fill="${C.snow}" ${S}/>` + pine(84, 66, 0.5)
      + `<g${A("slide", { x: 14, y: 6.5, d: 1.1 })}><g transform="rotate(25 46 56)">`
      + `<path d="M24 66h42c4 0 7-3 7-7" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
      + `<rect x="28" y="55" width="36" height="7" rx="2" fill="${C.red}" ${S2}/><path d="M34 62v4M58 62v4" ${S2}/>`
      + person(44, 38, C.deep) + `<path d="M40 44h10l4 4" stroke="${C.yellow}" stroke-width="3" stroke-linecap="round" fill="none"/>`
      + `</g></g>`
      + [0, 1, 2].map((i) => `<circle cx="${24 + i * 4}" cy="${52 + i * 2}" r="2.4" fill="${C.snow}" ${S2}${A("puff", { x: -12, y: -8, d: 0.9, dl: i * 0.3 })}/>`).join(""),
    css: "",
  },

  "rope-swing": { // "Rope swing over the river. Worth it!"
    svg: water(78)
      + `<path d="M-6 13C20 7 52 9 76 15" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M-6 13C20 7 52 9 76 15" stroke="${C.brown}" stroke-width="5.5" stroke-linecap="round" fill="none"/>`
      + `<path d="${circ(8, 8, 9)}${circ(20, 4, 8)}${circ(70, 12, 8)}" fill="${C.leaf}" ${S2}/>`
      + `<g${A("sway", { r: 24, d: 1.25, o: [50, 12] })}>`
      + `<path d="M50 12v34" ${S}/><path d="M44 66L50 46l6 20" fill="none" ${S} stroke-width="3"/>` + person(50, 60, C.orange)
      + `</g>` + sparkle(80, 40, 0.9) + sparkle(18, 48, 0.7, 0.8),
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

  "slide-mud": { // "Riverbank selfie. Slipped. Straight into the Bog."
    svg: `<path d="M-5 26L76 76H-5z" fill="${C.grass}" ${S}/><ellipse cx="76" cy="82" rx="30" ry="12" fill="${C.mud}" ${S}/>`
      + `<g${A("slide", { x: 26, y: 16, d: 1.5 })}><g transform="rotate(-62 34 46)">${person(34, 32, C.teal)}`
      + `<rect x="42" y="22" width="7" height="11" rx="1.5" fill="${C.dark}" ${S2}/></g></g>`
      + [0, 1, 2, 3].map((i) => `<circle cx="${68 + i * 5}" cy="76" r="2.6" fill="${C.mud}" ${S2}${A("puff", { x: (i - 1.5) * 8, y: -16, d: 1.2, dl: i * 0.3, s: 1 })}/>`).join("")
      + `<circle cx="50" cy="24" r="5" fill="#fff6b0"${A("flicker", { d: 0.3 })}/>`,
    css: "",
  },
};
