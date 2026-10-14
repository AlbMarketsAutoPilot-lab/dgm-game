// Illustrations, part 3: places, landmarks and the little everyday things of the journey.
import { A, C, INK, S, S2, circ, cloud, falling, ground, person, pine, puffs, sparkle, sun, water, waves } from "./art-kit";

type Art = { svg: string; css: string; box?: string };

const lantern1 = (x: number, y: number, k: number, cls: string) =>
  `<g${cls}><path d="M${x} ${y}v${6 * k}" ${S2}/><rect x="${x - 6 * k}" y="${y + 6 * k}" width="${12 * k}" height="${3 * k}" rx="1" fill="${C.red}" ${S2}/>`
  + `<path d="M${x - 8 * k} ${y + 9 * k}h${16 * k}l${-2 * k} ${22 * k}h${-12 * k}z" fill="${C.yellow}" ${S}/>`
  + `<ellipse cx="${x}" cy="${y + 20 * k}" rx="${4.5 * k}" ry="${7 * k}" fill="#fff6b0"${A("flicker", { d: 0.9 })}/>`
  + `<path d="M${x - 4 * k} ${y + 31 * k}l${-1 * k} ${5 * k}M${x + 4 * k} ${y + 31 * k}l${k} ${5 * k}" ${S2}/></g>`;

export const PLACES: Record<string, Art> = {
  puddle: { // "Ankle-deep puddle. Next turn: one careful step."
    svg: cloud(8, 6, 1.2, 6) + falling("rain", 7, 2.4)
      + `<ellipse cx="50" cy="74" rx="42" ry="14" fill="${C.water}" ${S}/>`
      + `<ellipse cx="38" cy="74" rx="10" ry="4" fill="none" stroke="${C.deep}" stroke-width="2"${A("ripple", { d: 2, s: 2.2 })}/>`
      + `<ellipse cx="66" cy="76" rx="8" ry="3" fill="none" stroke="${C.deep}" stroke-width="2"${A("ripple", { d: 2, dl: 1, s: 2.2 })}/>`
      + `<g${A("hop", { a: 7, d: 1.6 })}><path d="M54 30h12v20l11 4c2 1 3 3 2 6H54z" fill="${C.yellow}" ${S}/><path d="M54 56h25" ${S2}/></g>`,
    css: "",
  },

  waves: { // "Waiting for the tide. Wait one turn."
    svg: sun(80, 20, 8) + `<path d="M-5 68h110v40H-5z" fill="${C.sand}" ${S}/>`
      + `<g${A("slide", { x: 14, d: 3.2 })}><path d="M-30 44h92c6 0 8 6 4 11s2 10-4 13H-30z" fill="${C.water}" ${S}/>${waves(52)}</g>`
      + `<g${A("tilt", { r: 7, d: 1.6, o: [78, 70] })}><path d="M64 62h28l-6 8H70z" fill="${C.brown}" ${S}/><path d="M78 62V44l10 14z" fill="${C.white}" ${S2}/></g>`
      + `<path d="M20 84c3-3 6-3 8 0M36 90c3-3 6-3 8 0" fill="none" ${S2}/>`,
    css: "",
  },

  stones: { // stepping stones in the mud (and the Shortcut's plain stones)
    svg: `<rect x="-5" y="30" width="110" height="75" fill="${C.mud}"/>`
      + [[22, 78, 0], [50, 62, 0.8], [76, 46, 1.6]].map(([x, y, dl]) =>
        `<ellipse cx="${x}" cy="${y + 2}" rx="18" ry="5" fill="none" stroke="#b08b62" stroke-width="2"${A("ripple", { d: 2.6, dl, s: 1.5 })}/>`
        + `<ellipse cx="${x}" cy="${y}" rx="14" ry="7" fill="${C.grey}" ${S}/><path d="M${x - 7} ${y - 2}q5-3 10 0" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>`).join("")
      + `<g${A("hop", { a: 12, d: 1.4 })}><ellipse cx="50" cy="54" rx="9" ry="6" fill="${C.leaf}" ${S2}/>`
      + `<circle cx="46" cy="49" r="3" fill="#fff" ${S2}/><circle cx="54" cy="49" r="3" fill="#fff" ${S2}/><circle cx="46" cy="49" r="1.2" fill="${INK}"/><circle cx="54" cy="49" r="1.2" fill="${INK}"/></g>`,
    css: "",
  },

  steps: { // the porch steps at Home
    svg: `<rect x="48" y="6" width="56" height="74" fill="${C.cream}" ${S}/><rect x="62" y="28" width="24" height="52" rx="2" fill="${C.red}" ${S}/>`
      + `<circle cx="81" cy="56" r="2" fill="${C.yellow}" ${S2}/>`
      + `<rect x="4" y="84" width="84" height="12" fill="${C.brown}" ${S}/><rect x="16" y="76" width="72" height="8" fill="${C.brown}" ${S}/><rect x="28" y="68" width="60" height="8" fill="${C.brown}" ${S}/>`
      + `<rect x="10" y="68" width="12" height="16" fill="${C.orange}" ${S2}/>`
      + `<g${A("sway", { r: 8, d: 1.8, o: [16, 68] })}><path d="M16 68c-6-8-4-16 0-20 4 4 6 12 0 20zM16 66c4-6 10-8 12-6-2 4-6 6-12 6z" fill="${C.leaf}" ${S2}/></g>`
      + `<g${A("hop", { a: 6, d: 1.2 })}><path d="M40 62c0-6 10-6 10 0z" fill="${C.deep}" ${S2}/><circle cx="48" cy="58" r="1" fill="${INK}"/><path d="M50 60l3 1-3 1" fill="${C.orange}"/></g>`,
    css: "",
  },

  "fallen-tree": { // "Fallen tree. Nobody's moving it. Back ten squares."
    svg: ground(80)
      + `<g${A("shake", { r: 1.2, d: 2.2, o: [40, 76] })}>`
      + `<path d="M6 76l64-26 7 10-64 26z" fill="${C.brown}" ${S}/><ellipse cx="9" cy="81" rx="5" ry="6" fill="${C.cream}" ${S2}/>`
      + `<path d="M46 60l6-14M30 66l-4-10" ${S} stroke-width="3"/>`
      + `<path d="${circ(76, 44, 14)}${circ(62, 40, 10)}${circ(86, 56, 10)}" fill="${C.leaf}" ${S2}/></g>`
      + [0, 1, 2].map((i) => `<ellipse cx="${60 + i * 10}" cy="${30 + i * 4}" rx="3" ry="1.8" fill="${C.leaf}" ${S2}${A("fall", { y: 44, x: -8, d: 2.8, dl: i * 0.9 })}/>`).join(""),
    css: "",
  },

  "flat-path": { // "The Main Road. Boring, but it works."
    svg: `<path d="M-5 30h110v75H-5z" fill="${C.grass}" ${S}/>` + sun(80, 14, 6) + cloud(10, 6, 0.9)
      + `<path d="M40 30h20l34 74H6z" fill="#cfc6b6" ${S}/>`
      + `<path d="M50 32V104" stroke="#fff" stroke-width="3.2" stroke-dasharray="6 9"${A("dash", { d: 0.7 })}/>`,
    css: "",
  },

  "joining-paths": { // "The two roads meet again."
    svg: ground(30, C.grass)
      + `<path d="M14 104C14 64 50 60 50 34V-4M86 104C86 64 50 60 50 34" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>`
      + `<path d="M14 104C14 64 50 60 50 34V-4M86 104C86 64 50 60 50 34" fill="none" stroke="${C.sand}" stroke-width="11" stroke-linecap="round"/>`
      + `<path d="M14 104C14 64 50 60 50 34V-4M86 104C86 64 50 60 50 34" fill="none" stroke="${C.orange}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"${A("dash", { d: 0.8, rev: true })}/>`
      + `<circle cx="30" cy="40" r="3" fill="${C.pink}" ${S2}/><circle cx="74" cy="46" r="3" fill="${C.yellow}" ${S2}/>`,
    css: "",
  },

  compass: { // "Shortcuts never work. Into the Bog."
    svg: `<circle cx="50" cy="52" r="33" fill="${C.gold}" ${S}/><circle cx="50" cy="52" r="26" fill="${C.white}" ${S}/>`
      + `<text x="50" y="35" text-anchor="middle" font-size="9" fill="${INK}">N</text>`
      + `<path d="M50 28v3M50 73v3M26 52h3M71 52h3" ${S2}/>`
      + `<g class="needle"><path d="M50 30l6 22H44z" fill="${C.red}" ${S2}/><path d="M50 74l6-22H44z" fill="${C.grey}" ${S2}/><circle cx="50" cy="52" r="3" fill="${INK}"/></g>`
      + `<text x="10" y="24" font-size="20" fill="${C.purple}"${A("bob", { a: 4, d: 0.7 })}>?</text>`
      + `<text x="80" y="22" font-size="16" fill="${C.purple}"${A("bob", { a: 4, d: 0.9, dl: 0.3 })}>?</text>`,
    css: `.art-compass .needle { transform-box: view-box; transform-origin: 50px 52px; animation: needle 3s ease-in-out infinite; }
      @keyframes needle { 0% { transform: rotate(0); } 20% { transform: rotate(160deg); } 35% { transform: rotate(110deg); } 60% { transform: rotate(-130deg); } 80% { transform: rotate(-60deg); } 100% { transform: rotate(0); } }`,
  },

  maze: { // "Lost in the alleys. Somehow, the Bog."
    svg: `<rect x="10" y="10" width="80" height="80" rx="4" fill="${C.cream}" ${S}/>`
      + `<path d="M10 30h30M50 10v30h20M30 50v40M30 50h40M70 50v20h20M50 70v20M10 70h10" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`
      + `<g class="walker"><circle cx="20" cy="20" r="5.5" fill="${C.red}" ${S2}/></g>`
      + `<text x="74" y="34" font-size="16" fill="${C.purple}"${A("pulse", { s: 1.3, d: 0.6 })}>?</text>`,
    css: `.art-maze .walker { animation: maze-walk 5s ease-in-out infinite; }
      @keyframes maze-walk { 0% { transform: translate(0, 0); } 15% { transform: translate(20px, 0); } 30% { transform: translate(20px, 20px); } 45% { transform: translate(40px, 20px); } 60% { transform: translate(40px, 0); } 75% { transform: translate(20px, 0); } 100% { transform: translate(0, 0); } }`,
  },

  signpost: { // crossroads, and "A local knows a shortcut: next good square!"
    svg: ground(86) + `<rect x="46" y="18" width="8" height="70" fill="${C.brown}" ${S}/>`
      + `<g${A("sway", { r: 4, d: 1.6, o: [50, 30] })}><path d="M52 22h30l8 8-8 8H52z" fill="${C.yellow}" ${S}/><path d="M58 30h20" ${S2}/></g>`
      + `<g${A("sway", { r: 4, d: 1.9, o: [50, 52], rev: true })}><path d="M48 44H20l-8 8 8 8h28z" fill="${C.orange}" ${S}/><path d="M22 52h20" ${S2}/></g>`
      + `<g${A("hop", { a: 5, d: 1.3 })}><path d="M44 18c0-6 10-6 10 0z" fill="${C.deep}" ${S2}/><circle cx="52" cy="14" r="1" fill="${INK}"/><path d="M54 16l3 1-3 1" fill="${C.orange}"/></g>`,
    css: "",
  },

  "park-bench": { // "Through the park. Wait, it actually worked!"
    svg: ground(80) + `<rect x="13" y="42" width="8" height="38" fill="${C.brown}" ${S}/>`
      + `<g${A("sway", { r: 3, d: 2.6, o: [17, 70] })}><path d="${circ(17, 30, 15)}${circ(6, 40, 9)}${circ(28, 40, 9)}" fill="${C.leaf}" ${S2}/></g>`
      + `<rect x="40" y="46" width="52" height="6" rx="2" fill="${C.brown}" ${S}/><rect x="40" y="55" width="52" height="6" rx="2" fill="${C.brown}" ${S}/>`
      + `<rect x="37" y="64" width="58" height="6" rx="2" fill="${C.brown}" ${S}/><path d="M44 70v10M88 70v10M44 52v12M88 52v12" ${S} stroke-width="3"/>`
      + `<g${A("hop", { a: 6, d: 1.1 })}><path d="M58 64c0-7 12-7 12 0z" fill="${C.red}" ${S2}/><circle cx="67" cy="59" r="1.1" fill="${INK}"/><path d="M70 61l3 1-3 1" fill="${C.orange}"/></g>`
      + sparkle(78, 22) + sparkle(56, 14, 0.7, 0.9),
    css: "",
  },

  pier: { // River Pier (landmark)
    svg: water(66) + `<path d="M-5 56h66v7H-5z" fill="${C.brown}" ${S}/><path d="M8 63v30M28 63v30M48 63v30" ${S} stroke-width="4"/>`
      + `<path d="M14 56V24" ${S} stroke-width="3"/><rect x="9" y="16" width="10" height="9" rx="2" fill="${C.yellow}" ${S2}${A("flicker", { d: 1 })}/>`
      + person(40, 34, C.deep, 0.9) + `<path d="M44 44l30-24" ${S}/><path d="M74 20l4 46" stroke="${INK}" stroke-width="1"/>`
      + `<g${A("bob", { a: 3, d: 1 })}><circle cx="78" cy="66" r="4" fill="${C.red}" ${S2}/><path d="M74 66h8" stroke="#fff" stroke-width="2"/></g>`,
    css: "",
  },

  anchor: { // Harbour (landmark)
    svg: water(74) + `<path d="M50 4v16" ${S}/>`
      + `<g${A("sway", { r: 6, d: 2, o: [50, 6] })}>`
      + `<circle cx="50" cy="24" r="5" fill="none" stroke="${INK}" stroke-width="4"/>`
      + `<rect x="46" y="29" width="8" height="44" rx="2" fill="${C.steel}" ${S}/><rect x="34" y="35" width="32" height="7" rx="3" fill="${C.steel}" ${S}/>`
      + `<path d="M24 60c4 14 14 18 26 18s22-4 26-18" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`
      + `<path d="M24 60c4 14 14 18 26 18s22-4 26-18" fill="none" stroke="${C.steel}" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M17 58l10 1-6 8zM83 58l-10 1 6 8z" fill="${C.steel}" ${S2}/></g>`
      + `<g${A("drift", { x: 10, d: 4 })}><path d="M70 18q4-4 8 0q4-4 8 0" fill="none" ${S2}/></g>`,
    css: "",
  },

  tent: { // Base Camp (landmark)
    svg: `<path d="M-5 72l34-44 20 24 18-30 38 50z" fill="${C.grey}" ${S}/><path d="M23 36l6-8 6 8-6-2zM61 30l6-8 7 10-7-3z" fill="${C.snow}" ${S2}/>`
      + ground(84) + `<path d="M20 84L48 40l28 44z" fill="${C.orange}" ${S}/><path d="M42 84l6-24 6 24z" fill="${C.dark}" ${S2}/>`
      + `<path d="M48 40V26" ${S}/><g${A("sway", { r: 16, d: 0.6, o: [48, 26] })}><path d="M48 26l12 4-12 4z" fill="${C.red}" ${S2}/></g>`
      + `<path d="M74 92l16-5M74 87l16 5" stroke="${C.dbrown}" stroke-width="4" stroke-linecap="round"/>`
      + `<path d="M82 88c-8-4-6-12 0-18 6 6 8 14 0 18z" fill="${C.orange}" ${S2}${A("flicker", { d: 0.3 })}/>`
      + `<path d="M82 88c-4-2-3-6 0-9 3 3 4 7 0 9z" fill="${C.yellow}"${A("pulse", { s: 1.25, d: 0.25, o: [82, 88] })}/>`
      + sparkle(12, 14, 0.7) + sparkle(88, 10, 0.6, 0.9),
    css: "",
  },

  cabin: { // Mountain Lodge (landmark)
    svg: `<path d="M-5 60l30-36 22 24 20-28 38 44z" fill="${C.grey}" ${S}/>` + ground(86, C.snow)
      + `<rect x="68" y="22" width="8" height="18" fill="${C.dbrown}" ${S2}/>` + puffs(72, 18, 3, C.white, 3)
      + `<rect x="24" y="52" width="52" height="34" fill="${C.brown}" ${S}/><path d="M24 60h52M24 68h52M24 76h52" ${S2} opacity=".5"/>`
      + `<path d="M16 54L50 28l34 26z" fill="${C.dbrown}" ${S}/><path d="M22 50L50 28l28 22c-8-4-12 0-16-2s-8-6-12-4-8 4-12 2-6 2-10 4z" fill="${C.snow}" ${S2}/>`
      + `<rect x="44" y="64" width="12" height="22" fill="${C.dark}" ${S2}/>`
      + `<rect x="28" y="60" width="11" height="10" fill="#ffd95a" ${S2}${A("flicker", { d: 1.4 })}/><rect x="61" y="60" width="11" height="10" fill="#ffd95a" ${S2}${A("flicker", { d: 1.4, dl: 0.7 })}/>`
      + pine(10, 88, 0.55) + pine(90, 88, 0.6) + falling("snow", 5, 4),
    css: "",
  },

  station: { // Forest Station, Hill Station (landmarks)
    svg: ground(84) + `<rect x="20" y="46" width="60" height="38" fill="${C.cream}" ${S}/>`
      + `<path d="M12 48L50 22l38 26z" fill="${C.red}" ${S}/>`
      + `<circle cx="50" cy="37" r="7" fill="${C.white}" ${S2}/>`
      + `<path d="M50 37v-5" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"${A("spin", { d: 4, o: [50, 37] })}/><path d="M50 37h3.5" stroke="${INK}" stroke-width="2" stroke-linecap="round"${A("spin", { d: 48, o: [50, 37] })}/>`
      + `<rect x="43" y="60" width="14" height="24" fill="${C.deep}" ${S2}/>`
      + `<rect x="26" y="56" width="11" height="11" fill="#ffd95a" ${S2}${A("flicker", { d: 1.5 })}/><rect x="63" y="56" width="11" height="11" fill="#ffd95a" ${S2}${A("flicker", { d: 1.5, dl: 0.8 })}/>`
      + `<path d="M90 84V56" ${S}/><circle cx="90" cy="54" r="4" fill="#fff6b0" ${S2}${A("flicker", { d: 0.8 })}/>`,
    css: "",
  },

  "big-clock": { // Central Station (landmark)
    svg: `<rect x="45" y="62" width="10" height="34" fill="${C.steel}" ${S}/><rect x="36" y="92" width="28" height="6" rx="2" fill="${C.steel}" ${S2}/>`
      + `<circle cx="50" cy="38" r="31" fill="${C.deep}" ${S}/><circle cx="50" cy="38" r="25" fill="${C.white}" ${S}/>`
      + Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6, c = Math.cos(a), s = Math.sin(a);
        return `<path d="M${(50 + c * 20).toFixed(1)} ${(38 + s * 20).toFixed(1)}L${(50 + c * 23).toFixed(1)} ${(38 + s * 23).toFixed(1)}" ${S2}/>`;
      }).join("")
      + `<path d="M50 38V18" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"${A("spin", { d: 5, o: [50, 38] })}/>`
      + `<path d="M50 38h12" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"${A("spin", { d: 60, o: [50, 38] })}/><circle cx="50" cy="38" r="3" fill="${C.red}" ${S2}/>`
      + `<g${A("hop", { a: 4, d: 1.5 })}><path d="M12 92c0-7 12-7 12 0z" fill="${C.grey}" ${S2}/><circle cx="21" cy="87" r="1.1" fill="${INK}"/></g>`,
    css: "",
  },

  bunting: { // The Fair (landmark), "Friends saved you a spot at the Fair!"
    svg: `<path d="M62 54l-16 42M62 54l16 42" ${S} stroke-width="3.5"/>`
      + `<g${A("spin", { d: 12, o: [62, 54] })}><circle cx="62" cy="54" r="26" fill="none" ${S}/>`
      + Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4, x = 62 + Math.cos(a) * 26, y = 54 + Math.sin(a) * 26;
        return `<path d="M62 54L${x.toFixed(1)} ${y.toFixed(1)}" ${S2}/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${[C.red, C.yellow, C.deep, C.leaf][i % 4]}" ${S2}/>`;
      }).join("") + `</g><circle cx="62" cy="54" r="4" fill="${C.dark}"/>`
      + `<path d="M-2 12Q50 36 102 12" fill="none" ${S2}/>`
      + [[8, 15], [24, 21], [40, 24], [56, 24], [72, 21], [88, 16]].map(([x, y], i) =>
        `<path d="M${x - 6} ${y}h12l-6 12z" fill="${[C.red, C.yellow, C.deep, C.leaf, C.pink, C.orange][i]}" ${S2}${A("sway", { r: 10, d: 0.7, dl: i * 0.15, o: [x, y] })}/>`).join(""),
    css: "",
  },

  "swap-arrows": { // "Plot twist! Swap places with the leader."
    svg: `<path d="M24 42C36 20 64 20 76 42" fill="none" ${S} stroke-dasharray="4 6"/><path d="M76 42l2-10M76 42l-9-4" ${S}/>`
      + `<path d="M76 74C64 96 36 96 24 74" fill="none" ${S} stroke-dasharray="4 6"/><path d="M24 74l-2 10M24 74l9 4" ${S}/>`
      + `<g class="t1"><circle cx="24" cy="58" r="12" fill="${C.deep}" ${S}/><path d="${circ(21, 55, 1.6)}${circ(27, 55, 1.6)}${circ(21, 61, 1.6)}${circ(27, 61, 1.6)}" fill="${C.paper}"/></g>`
      + `<g class="t2"><circle cx="76" cy="58" r="12" fill="${C.red}" ${S}/><path d="${circ(73, 55, 1.6)}${circ(79, 55, 1.6)}${circ(73, 61, 1.6)}${circ(79, 61, 1.6)}" fill="${C.paper}"/></g>`
      + sparkle(50, 58, 1.1),
    css: `.art-swap-arrows .t1 { animation: swap-a 3s ease-in-out infinite; }
      .art-swap-arrows .t2 { animation: swap-b 3s ease-in-out infinite; }
      @keyframes swap-a { 0%, 15% { transform: translate(0, 0); } 32% { transform: translate(26px, -26px); } 50%, 65% { transform: translate(52px, 0); } 82% { transform: translate(26px, 26px); } 100% { transform: translate(0, 0); } }
      @keyframes swap-b { 0%, 15% { transform: translate(0, 0); } 32% { transform: translate(-26px, 26px); } 50%, 65% { transform: translate(-52px, 0); } 82% { transform: translate(-26px, -26px); } 100% { transform: translate(0, 0); } }`,
  },

  "phone-map": { // "You trust the map app again. Next bad square."
    svg: `<rect x="26" y="6" width="48" height="88" rx="9" fill="${C.dark}" ${S}/><rect x="30" y="14" width="40" height="68" rx="3" fill="#e3f0d0"/>`
      + `<path d="M30 40h40M48 14v68M30 64h40" stroke="#fff" stroke-width="4"/>`
      + `<path d="M36 76C40 60 60 64 58 46S44 30 52 22" fill="none" stroke="${C.red}" stroke-width="3" stroke-dasharray="4 4"${A("dash", { d: 0.9 })}/>`
      + `<g${A("hop", { a: 5, d: 1 })}><path d="M52 30c-5-5-7-8-7-11a7 7 0 0 1 14 0c0 3-2 6-7 11z" fill="${C.red}" ${S2}/><circle cx="52" cy="19" r="2.4" fill="#fff"/></g>`
      + `<circle cx="50" cy="88" r="2.4" fill="${C.grey}"/>`,
    css: "",
  },

  "ice-cream": { // "Ice cream break. Everyone else doubles their next throw."
    svg: sun(84, 14, 6)
      + `<g${A("tilt", { r: 5, d: 1.6, o: [50, 92], rev: true })}>`
      + `<path d="M34 52l16 42 16-42z" fill="#e9b26b" ${S}/><path d="M40 60l18 18M48 54l14 14M38 66l14-12M44 76l14-12" stroke="${C.dbrown}" stroke-width="1.4" opacity=".6"/>`
      + `<circle cx="40" cy="47" r="12" fill="${C.pink}" ${S}/><circle cx="60" cy="47" r="12" fill="#9be3b5" ${S}/><circle cx="50" cy="31" r="13" fill="#8a5a3c" ${S}/>`
      + `<path d="M36 57c0 7 4 7 4 0" fill="${C.pink}" ${S2}${A("pulse", { s: 1.4, d: 0.9, o: [38, 57] })}/>`
      + `<circle cx="52" cy="15" r="4.5" fill="${C.red}" ${S2}/><path d="M53 11c1-4 4-6 7-6" fill="none" ${S2}/></g>`
      + sparkle(18, 24) + sparkle(80, 40, 0.8, 0.8),
    css: "",
  },

  ticket: { // "Forgot your Fair ticket. Go back for it."
    svg: [0, 1, 2].map((i) => `<path d="M${76 + i * 3} ${30 + i * 14}h16" ${S2}${A("move", { x: -18, d: 0.9, dl: i * 0.3 })}/>`).join("")
      + `<g${A("slide", { x: -10, y: -8, d: 1.3 })}><g transform="rotate(-14 48 52)">`
      + `<path d="M14 34h68v8a6 6 0 0 0 0 12v8H14v-8a6 6 0 0 0 0-12z" fill="${C.yellow}" ${S}/>`
      + `<path d="M64 36v26" stroke="${INK}" stroke-width="2" stroke-dasharray="3 3"/>`
      + `<text x="38" y="53" text-anchor="middle" font-size="14" fill="${INK}">FAIR</text>`
      + `<path d="M73 42l1.5 3 3.5.5-2.5 2.5.6 3.5-3.1-1.6-3.1 1.6.6-3.5-2.5-2.5 3.5-.5z" fill="${C.red}"/>`
      + `</g></g>`,
    css: "",
  },

  suitcase: { // "Spontaneous weekend off. Straight to the Mountain Lodge."
    svg: sun(84, 16, 6) + `<ellipse cx="50" cy="90" rx="30" ry="4" fill="${INK}" opacity=".18"/>`
      + `<g${A("hop", { a: 6, d: 1.1 })}>`
      + `<path d="M40 30v-8h20v8" fill="none" ${S} stroke-width="4"/>`
      + `<rect x="16" y="30" width="68" height="50" rx="7" fill="${C.teal}" ${S}/><path d="M30 30v50M70 30v50" stroke="${C.dbrown}" stroke-width="4"/>`
      + `<circle cx="46" cy="50" r="7" fill="${C.yellow}" ${S2}/><rect x="52" y="60" width="12" height="9" rx="2" fill="${C.pink}" ${S2}/><path d="M38 64l4 6 6-8" fill="none" stroke="${C.red}" stroke-width="2.4"/>`
      + `<g${A("sway", { r: 14, d: 0.8, o: [84, 40] })}><path d="M84 40l6 10" ${S2}/><rect x="86" y="48" width="9" height="12" rx="2" fill="${C.white}" ${S2}/></g>`
      + `</g>`,
    css: "",
  },

  "crossed-bed": { // "Lodge booking? What booking? Back to Base Camp."
    svg: `<rect x="12" y="34" width="8" height="46" rx="2" fill="${C.brown}" ${S}/><rect x="12" y="60" width="76" height="14" rx="3" fill="${C.white}" ${S}/>`
      + `<rect x="40" y="52" width="48" height="16" rx="4" fill="${C.deep}" ${S}/><ellipse cx="30" cy="56" rx="9" ry="5" fill="${C.white}" ${S2}/>`
      + `<path d="M16 74v8M84 74v8" ${S} stroke-width="3.5"/>`
      + `<g${A("pulse", { s: 1.15, d: 0.6, o: [50, 46] })}><path d="M28 24l44 44M72 24L28 68" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M28 24l44 44M72 24L28 68" stroke="${C.red}" stroke-width="8" stroke-linecap="round"/></g>`,
    css: "",
  },

  "door-key": { // "Wait… did you lock the door? Back home."
    svg: `<rect x="-5" y="4" width="110" height="96" fill="${C.cream}"/>`
      + `<rect x="22" y="14" width="42" height="78" rx="3" fill="${C.red}" ${S}/><rect x="28" y="22" width="30" height="26" rx="2" fill="none" ${S2}/><rect x="28" y="54" width="30" height="30" rx="2" fill="none" ${S2}/>`
      + `<circle cx="56" cy="52" r="3.5" fill="${C.yellow}" ${S2}/>`
      + `<g${A("tilt", { r: 80, d: 0.9, o: [62, 60] })}><path d="M62 60h16M74 60v5M70 60v4" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M62 60h16M74 60v5M70 60v4" stroke="${C.gold}" stroke-width="2.4" stroke-linecap="round"/><circle cx="83" cy="60" r="5" fill="${C.gold}" ${S2}/></g>`
      + `<g${A("pulse", { s: 1.2, d: 0.7, o: [82, 24] })}><path d="M70 28c0-10 24-10 24 0s-14 8-16 10l2-6c-6 0-10-1-10-4z" fill="${C.white}" ${S2}/><text x="82" y="31" text-anchor="middle" font-size="12" fill="${C.purple}">?</text></g>`,
    css: "",
  },

  shoelace: { // "Shoelace untied. Again. Wait one turn."
    svg: `<path d="M0 84h100" ${S}/>`
      + `<path d="M8 72V58l16-4 10 6 12-6c14 0 36 6 42 14v4z" fill="${C.red}" ${S}/><rect x="6" y="72" width="84" height="8" rx="3" fill="${C.white}" ${S}/>`
      + `<path d="M30 58l6 6M38 56l6 6" ${S2} stroke="${C.white}"/>`
      + `<g${A("sway", { r: 20, d: 0.8, o: [44, 56] })}><path d="M44 56c4-12 14-14 15-7s-9 6-11 2M44 56c-2 9 4 15 11 18" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M44 56c4-12 14-14 15-7s-9 6-11 2M44 56c-2 9 4 15 11 18" fill="none" stroke="${C.white}" stroke-width="2.4" stroke-linecap="round"/></g>`
      + `<text x="72" y="36" font-size="13" fill="${C.purple}"${A("bob", { a: 3, d: 0.9 })}>sigh</text>`,
    css: "",
  },

  card: { // "A kind stranger slips you a Bonus card."
    svg: `<g${A("bob", { a: 4, d: 1.4 })}><g${A("sway", { r: 7, d: 2, o: [50, 50] })}>`
      + `<rect x="27" y="14" width="46" height="66" rx="7" fill="${C.purple}" ${S}/><rect x="33" y="20" width="34" height="54" rx="4" fill="${C.gold}" ${S2}/>`
      + `<path d="M50 30l5 10 11 1.5-8 7.5 2 11-10-5.5-10 5.5 2-11-8-7.5 11-1.5z" fill="${C.red}" ${S2}${A("pulse", { s: 1.15, d: 0.8, o: [50, 46] })}/>`
      + `</g></g>` + sparkle(18, 20) + sparkle(84, 30, 0.8, 0.7) + sparkle(80, 82, 0.7, 1.2),
    css: "",
  },

  boots: { // "Bog boots. Mud? Never heard of it."
    svg: `<ellipse cx="50" cy="86" rx="40" ry="8" fill="${C.mud}" ${S}/>`
      + `<g${A("hop", { a: 7, d: 1 })}><path d="M18 22h16v42l13 5c3 1 4 4 3 8H18z" fill="${C.yellow}" ${S}/><rect x="16" y="20" width="20" height="6" rx="2" fill="${C.orange}" ${S2}/></g>`
      + `<g${A("hop", { a: 7, d: 1, dl: 0.5 })}><path d="M54 22h16v42l13 5c3 1 4 4 3 8H54z" fill="${C.red}" ${S}/><rect x="52" y="20" width="20" height="6" rx="2" fill="${C.orange}" ${S2}/></g>`
      + sparkle(86, 20) + sparkle(46, 12, 0.7, 0.9),
    css: "",
  },

  lantern: { // a Lantern (lifeline)
    svg: `<path d="M10 10Q50 22 90 10" fill="none" ${S2}/>` + lantern1(50, 16, 1.9, A("sway", { r: 6, d: 2.2, o: [50, 16] })),
    css: "",
  },

  "snake-down": { // "Wrong snake. This one goes all the way back." / the Snake Leader's ride back
    svg: `<g${A("sway", { r: 6, d: 1.2, o: [46, 8] })}>`
      + `<path d="M46 8c-18 6-18 18 0 24s18 18 0 24-16 14-4 24" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>`
      + `<path d="M46 8c-18 6-18 18 0 24s18 18 0 24-16 14-4 24" fill="none" stroke="${C.deep}" stroke-width="10" stroke-linecap="round"/>`
      + `<path d="M46 8c-18 6-18 18 0 24s18 18 0 24-16 14-4 24" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round"/>`
      + `<ellipse cx="44" cy="84" rx="11" ry="8.5" fill="${C.deep}" ${S}/><circle cx="40" cy="86" r="2.6" fill="#fff"/><circle cx="48" cy="86" r="2.6" fill="#fff"/><circle cx="40" cy="87" r="1.2" fill="${INK}"/><circle cx="48" cy="87" r="1.2" fill="${INK}"/>`
      + `<g class="tongue"><path d="M44 92v7l-3 3M44 99l3 3" fill="none" stroke="${C.red}" stroke-width="2" stroke-linecap="round"/></g>`
      + `</g><g${A("bob", { a: 4, d: 0.6, rev: true })}><path d="M80 26v40M72 58l8 10 8-10" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    css: `.art-snake-down .tongue { transform-origin: 50% 0%; animation: tongue-down 2.2s infinite; }
      @keyframes tongue-down { 0%, 70%, 100% { transform: scaleY(0); } 78%, 90% { transform: scaleY(1); } }`,
  },
};

