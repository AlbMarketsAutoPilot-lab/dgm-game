// Hero illustrations (owner, 15 Oct: "real feel, 3D, for young adults"): the pictures seen most often, redrawn as
// detailed scenes at dusk: 3/4 perspective, light sources that glow, depth. They replace the simpler first drawings.
// Flat colours are lit by the shared lighting pass (art.ts `light`); the glows use their own gradients (hx-…).
import { A, person, puffs, sparkle } from "./art-kit";

interface Art {
  svg: string;
  css: string;
  box?: string;
}

const E = `stroke="#4b2377" stroke-width="2"`; // soft edge after the lighting pass
const glowDefs = `<defs>
  <radialGradient id="hx-warm"><stop offset="0" stop-color="#fff3b0"/><stop offset=".35" stop-color="#ffc85a" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
  <radialGradient id="hx-win" cx=".4" cy=".4"><stop offset="0" stop-color="#fff6c8"/><stop offset=".6" stop-color="#ffc861"/><stop offset="1" stop-color="#e08a2c"/></radialGradient>
  <radialGradient id="hx-moon"><stop offset="0" stop-color="#fffbe6"/><stop offset=".25" stop-color="#fff2c0" stop-opacity=".9"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></radialGradient>
  <radialGradient id="hx-aura"><stop offset="0" stop-color="#fff2a8" stop-opacity=".95"/><stop offset=".5" stop-color="#f2c230" stop-opacity=".45"/><stop offset="1" stop-color="#f2c230" stop-opacity="0"/></radialGradient>
  <linearGradient id="hx-shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="hx-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d7f8a"/><stop offset="1" stop-color="#0d3440"/></linearGradient>
</defs>`;

/** A soft light glow (radius r) that breathes. */
const glow = (x: number, y: number, r: number, d = 2.4, dl = 0) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#hx-warm)" opacity=".75"${A("flicker", { d, dl })}/>`;


/** A glossy game token (the players' buttons) at (x, y). */
const token = (x: number, y: number, c: string, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${E}/>`
  + `<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="none" stroke="#1d0f33" stroke-opacity=".3" stroke-width="1.2"/>`
  + [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => `<circle cx="${x + a * r * 0.22}" cy="${y + b * r * 0.22}" r="${r * 0.11}" fill="#1d0f33" opacity=".6"/>`).join("")
  + `<path d="M${x - r * 0.6} ${y - r * 0.45}q${r * 0.4} ${-r * 0.5} ${r * 1.1} ${-r * 0.35}" fill="none" stroke="#fff" stroke-width="${r * 0.18}" stroke-linecap="round" opacity=".7"/>`;

/** The swamp at dusk: murky water, mist, reeds, fireflies (the Bog). */
const swamp = (`<path d="M-10 48Q30 42 60 46T110 44V110H-10z" fill="#3a4630"/>`
  + `<path d="M-10 56Q40 50 110 55V110H-10z" fill="#4f5d3a"/>`
  + `<ellipse cx="50" cy="80" rx="58" ry="20" fill="#3d4a33"/><ellipse cx="44" cy="76" rx="34" ry="6" fill="#7a8a6a" opacity=".35"/>`
  + `<path d="M-6 44q4-14 8-20M2 46q-2-12 2-24M94 44q-3-12 0-22" fill="none" stroke="#1f2a1c" stroke-width="2.2"/>`
  + `<path d="M8 50c-2-10 6-26 2-34M12 30c6-2 8-6 10-10M8 38c-5-2-7-5-9-9" fill="none" stroke="#1f2a1c" stroke-width="2.6" stroke-linecap="round"/>`
  + `<ellipse cx="50" cy="50" rx="60" ry="5" fill="#d8e4d0" opacity=".28"${A("drift", { x: 6, d: 6 })}/>`
  + [[84, 70], [90, 64], [12, 72]].map(([x, y], i) => `<g${A("sway", { r: 4, d: 2.4 + i * 0.4, o: [x, y + 16] })}><path d="M${x} ${y + 16}V${y}" stroke="#4a5a2a" stroke-width="1.4"/><rect x="${x - 1.4}" y="${y - 2}" width="2.8" height="7" rx="1.4" fill="#6b4f34"/></g>`).join("")
  + [[30, 36], [70, 30], [56, 58], [20, 60]].map(([x, y], i) => `<g${A("slide", { x: (i % 2 ? 6 : -5), y: -4, d: 2.6 + i * 0.5 })}><circle cx="${x}" cy="${y}" r="4" fill="url(#hx-warm)" opacity=".7"${A("flicker", { d: 0.9, dl: i * 0.3 })}/><circle cx="${x}" cy="${y}" r=".9" fill="#fff8c0"/></g>`).join(""));

const keyring = (x: number, y: number, rot: number) => `<g transform="translate(${x} ${y}) rotate(${rot})">`
  + `<circle cx="0" cy="0" r="6" fill="none" stroke="#c8ccd4" stroke-width="1.6"/>`
  + `<circle cx="9" cy="0" r="5" fill="#e0b84a" ${E}/><circle cx="9" cy="0" r="1.8" fill="#6b5320"/><path d="M14 -1.4h16v2.8h-3v3h-3v-3h-2v2h-3v-2h-5z" fill="#e0b84a" ${E}/>`
  + `<circle cx="-4" cy="9" r="4.4" fill="#b8bfca" ${E}/><path d="M-6 13l-6 13 2.4 1 2-4 1.6 .8 1-2-1.6-.8 2.4-5z" fill="#b8bfca" ${E}/></g>`;

const cafe = `<path d="M-10 -10H110V56H-10z" fill="#3b2a30" opacity=".55"/>` + glow(78, 14, 22, 3) + `<path d="M74 -10v18" stroke="#1d0f33" stroke-width="1"/><path d="M70 8h16l-3 6H73z" fill="#e8862f" ${E}/>`
  + `<path d="M-10 56L110 52V110H-10z" fill="#8a5a3c"/><path d="M-10 56L110 52" stroke="#5a3a26" stroke-width="1.4"/>`
  + `<path d="M-10 70L110 66M-10 86L110 82" stroke="#6e4426" stroke-width=".8" opacity=".6"/>`
  + `<ellipse cx="70" cy="70" rx="12" ry="4" fill="#f7f1e3" ${E}/><path d="M61 54h18l-2 15h-14z" fill="#f7f1e3" ${E}/><path d="M79 57q6 0 5 5t-6 4" fill="none" stroke="#f7f1e3" stroke-width="2.4"/><ellipse cx="70" cy="54.5" rx="9" ry="2" fill="#5a3320"/>`
  + puffs(70, 50, 3, "#e8e4dc", 3.4);

export const HERO: Record<string, Art> = {
  house: { // Home: a cottage at dusk, lights on, bags packed
    svg: glowDefs
      + `<circle cx="20" cy="20" r="16" fill="url(#hx-moon)"/><circle cx="20" cy="20" r="5.5" fill="#fff6d6"/>`
      + `<path d="M-10 74Q20 64 50 70T110 66V110H-10z" fill="#24493a"/>`
      + `<path d="M-10 82Q30 74 60 79T110 77V110H-10z" fill="#3d6b45"/>`
      // a pine behind the house
      + `<g${A("sway", { r: 1.5, d: 4, o: [86, 74] })}><path d="M86 34l9 15h-5l7 12h-5l7 13H73l7-13h-5l7-12h-5z" fill="#1f4a36" ${E}/></g>`
      // side wall (in shade), front gable wall (lit), roof
      + `<path d="M47 52L77 47V73L47 79z" fill="#b39a74" ${E}/>`
      + `<path d="M23 52H47V79H23z" fill="#ead6ae" ${E}/>`
      + `<path d="M35 36L66 31L79 48L47 53z" fill="#8c3a2c" ${E}/>`
      + `<path d="M38.5 40.5L69 35.5M42 44.8L72.5 39.8M45 49L76 44" fill="none" stroke="#5a2018" stroke-width="1.2" opacity=".55"/>`
      + `<path d="M20 54.5L35 35.5L50 54.5L47 54.5L35 39.5L23 54.5z" fill="#6e2a20" ${E}/>`
      + `<path d="M23 54.5L35 39.5L47 54.5z" fill="#d9c294"/>`
      // chimney with smoke
      + `<path d="M58 28H65V37L58 38.2z" fill="#6f4535" ${E}/><path d="M57 26.5H66V29H57z" fill="#4e3026" ${E}/>`
      + puffs(61.5, 25, 3, "#d8d4cc", 3.6)
      // round attic window, side windows (warm light), door with lamp
      + glow(35, 47, 7, 2.6) + `<circle cx="35" cy="47" r="3.2" fill="url(#hx-win)" ${E}/>`
      + glow(56, 61, 11, 2.2) + glow(70, 58.5, 11, 2.2, 0.8)
      + `<path d="M52 57.6L60 56.4V65L52 66.3z" fill="url(#hx-win)" ${E}/><path d="M56 57v8.6M52 61.9l8-1.3" stroke="#5a3a28" stroke-width="1.1"/>`
      + `<path d="M66 55.2L74 54V62.6L66 63.8z" fill="url(#hx-win)" ${E}/><path d="M70 54.6v8.6M66 59.5l8-1.3" stroke="#5a3a28" stroke-width="1.1"/>`
      + `<path d="M30 79V65q5-5 10 0v14z" fill="#5c3826" ${E}/><path d="M32 67q3-3 6 0v3h-6z" fill="url(#hx-win)"/><circle cx="38" cy="73" r=".9" fill="#f2c230"/>`
      + glow(43.5, 62, 7, 1.4) + `<circle cx="43.5" cy="62" r="1.6" fill="#fff3b0"/>`
      // light spilling on the grass, the path, a suitcase by the door, bushes
      + `<ellipse cx="62" cy="84" rx="16" ry="3" fill="#ffd27a" opacity=".22"/>`
      + `<path d="M31 79h9l7 21H22z" fill="#c9b08a" opacity=".85"/>`
      + `<g${A("bob", { a: 1, d: 2.2 })}><rect x="42" y="73" width="8" height="6.5" rx="1.2" fill="#3d74c4" ${E}/><path d="M44.5 73v-1.6h3V73" fill="none" stroke="#2a1640" stroke-width="1.2"/><path d="M42 76h8" stroke="#f2c230" stroke-width="1.2"/></g>`
      + `<ellipse cx="22" cy="80" rx="7" ry="4.5" fill="#2f5a35" ${E}/><ellipse cx="77" cy="74.5" rx="6" ry="4" fill="#2f5a35" ${E}/>`,
    css: "",
  },

  lanterns: { // The Festival of Lights
    svg: glowDefs
      + `<path d="M-10 84h12v-10h6v-6h8v8h10v-14h8v10h9v-6h7v12h10v-9h7v6h9v-12h8v10h16v26H-10z" fill="#0f2430"/>`
      + Array.from({ length: 9 }, (_, i) => {
        const x = 8 + i * 10.5, y = 62 + ((i * 37) % 18), s = 0.6 + ((i * 13) % 5) / 10;
        return `<g${A("move", { x: (i % 2 ? 4 : -3), y: -70, d: 7 + (i % 3), dl: i * 0.9 })}>`
          + `<circle cx="${x}" cy="${y}" r="${6 * s}" fill="url(#hx-warm)" opacity=".8"/>`
          + `<path d="M${x - 2.4 * s} ${y - 3 * s}h${4.8 * s}l${1 * s} ${6 * s}h${-6.8 * s}z" fill="#ffb347" stroke="#7a3b10" stroke-width=".6"/></g>`;
      }).join("")
      + `<path d="M-6 16Q50 40 106 16" fill="none" stroke="#2a1a10" stroke-width="1.2"/>`
      + [[12, 21.5, "#e8562f"], [31, 27.5, "#f2c230"], [50, 29.5, "#d8433b"], [69, 27.5, "#f2c230"], [88, 21.5, "#e8562f"]].map(([x, y, c], i) =>
        `<g${A("sway", { r: 6, d: 2 + (i % 2) * 0.6, o: [x as number, (y as number) - 4] })}>${glow(x as number, (y as number) + 6, 13, 2, i * 0.4)}`
        + `<path d="M${x} ${(y as number) - 4}v3" stroke="#2a1a10" stroke-width="1"/><ellipse cx="${x}" cy="${(y as number) + 6}" rx="7" ry="8.5" fill="${c}" ${E}/>`
        + `<path d="M${(x as number) - 7} ${(y as number) + 6}h14M${(x as number) - 5.5} ${(y as number) + 1}h11M${(x as number) - 5.5} ${(y as number) + 11}h11" stroke="#7a3b10" stroke-width=".7" opacity=".6"/>`
        + `<rect x="${(x as number) - 3}" y="${(y as number) - 3}" width="6" height="2" fill="#3a2f45"/><rect x="${(x as number) - 3}" y="${(y as number) + 14}" width="6" height="2" fill="#3a2f45"/></g>`).join("")
      + Array.from({ length: 7 }, (_, i) => `<circle cx="${10 + i * 13}" cy="${90 + (i % 2) * 1.5}" r="3" fill="#0a1820"/><path d="M${4 + i * 13} 102q6-11 12 0z" fill="#0a1820"/>`).join("")
      + sparkle(22, 50, 0.7) + sparkle(78, 46, 0.8, 0.8) + sparkle(50, 56, 0.6, 1.4),
    css: "",
  },

  signpost: { // Crossroads: the safe Main Road, or the Shortcut into the wild
    svg: glowDefs
      + `<path d="M-10 58Q25 50 50 55T110 52V110H-10z" fill="#2d5640"/>`
      + `<path d="M-10 52q12-7 22-3t16-2 18 4v6H-10z" fill="#1d3a33"/>`
      + Array.from({ length: 4 }, (_, i) => `<circle cx="${6 + i * 5}" cy="${52 - (i % 2)}" r=".9" fill="#ffd27a"${A("flicker", { d: 1.6, dl: i * 0.4 })}/>`).join("")
      + `<path d="M36 110L46 58H54L92 110z" fill="#c9b08a"/><path d="M50 58L58 58L110 76V92z" fill="#8a7a58" opacity=".9"/>`
      + `<ellipse cx="88" cy="66" rx="20" ry="4" fill="#cfe6e0" opacity=".35"${A("drift", { x: 4, d: 5 })}/>`
      // the post in 3/4: front face and shaded side
      + `<path d="M46 26h6v68h-6z" fill="#8a5a3c" ${E}/><path d="M52 26l3 -1.5v68l-3 1.5z" fill="#5a3a26" ${E}/>`
      + `<path d="M44.5 24.5h9l-1-3h-7z" fill="#4e3026" ${E}/>`
      // planks with thickness
      + `<g${A("tilt", { r: 2, d: 3, o: [49, 37] })}><path d="M54 32h28l7 6-7 6H54z" fill="#6b4b30" transform="translate(2 2)"/><path d="M54 32h28l7 6-7 6H54z" fill="#e0a84a" ${E}/>`
      + `<path d="M58 38h20" stroke="#7a4a20" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><text x="68" y="40" font-size="5.5" text-anchor="middle" fill="#4a2a10" font-family="Cinzel, serif">MAIN</text></g>`
      + `<g${A("tilt", { r: -3, d: 2.6, o: [47, 55] })}><path d="M45 50H17l-7 6 7 6h28z" fill="#5a3a26" transform="translate(2 2)"/><path d="M45 50H17l-7 6 7 6h28z" fill="#c76a3a" ${E}/>`
      + `<text x="29" y="58" font-size="5" text-anchor="middle" fill="#3a1608" font-family="Cinzel, serif">SHORTCUT?</text></g>`
      // a lantern hanging from the post
      + `<path d="M53 66h6v2" fill="none" stroke="#2a1a10" stroke-width="1"/>` + glow(59, 73, 10, 1.8)
      + `<g${A("sway", { r: 5, d: 2.2, o: [59, 68] })}><path d="M56.5 69h5l1 7h-7z" fill="#ffcf6b" ${E}/><path d="M56 68.2h6v1.4h-6zM56 76h6v1.4h-6z" fill="#3a2f45"/></g>`
      + `<path d="M24 92l2-5 2 5M70 96l2-6 2 6M84 88l2-4 2 4" fill="none" stroke="#1d3a33" stroke-width="1.6"/>`,
    css: "",
  },

  card: { // The Bonus card: a gold foil card, floating in its own light
    svg: glowDefs
      + `<circle cx="50" cy="50" r="44" fill="url(#hx-aura)"${A("pulse", { s: 1.08, d: 1.8, o: [50, 50] })}/>`
      + `<g${A("bob", { a: 3, d: 2.4 })}><g${A("sway", { r: 4, d: 3.2, o: [50, 50] })}>`
      + `<path d="M30 16l40 4-2 66-40-4z" fill="#3a1f5c" transform="translate(3 3)" opacity=".5"/>`
      + `<path d="M30 16l40 4-2 66-40-4z" fill="#f2c230" ${E}/>`
      + `<path d="M34 21l32 3.2-1.7 57.6-32-3.2z" fill="#4b2377" ${E}/>`
      + `<path d="M36.5 24.5l27 2.7-1.5 52-27-2.7z" fill="none" stroke="#f2c230" stroke-width="1.2" stroke-dasharray="2 2"/>`
      + `<circle cx="49.5" cy="51" r="13" fill="#2a1640" stroke="#f2c230" stroke-width="2"/>`
      + `<path d="M49.5 39l3.4 8.2 8.6.6-6.6 5.6 2.1 8.4-7.5-4.6-7.5 4.6 2.1-8.4-6.6-5.6 8.6-.6z" fill="#f2c230" stroke="#fff3b0" stroke-width=".8"${A("pulse", { s: 1.12, d: 1.2, o: [49.5, 51] })}/>`
      + `<path d="M40 30l2 2M60 31l-2 2M39 72l2-2M59 73l-2-2" stroke="#f2c230" stroke-width="1.6" stroke-linecap="round"/>`
      + `<path class="shine" d="M22 14h12l-6 76H16z" fill="url(#hx-shine)" opacity=".7"/>`
      + `</g></g>` + sparkle(16, 22) + sparkle(86, 30, 0.8, 0.7) + sparkle(82, 82, 0.7, 1.2) + sparkle(18, 78, 0.6, 1.8),
    css: `.art-card .shine { animation: card-shine-sweep 3.2s ease-in-out infinite; }
      @keyframes card-shine-sweep { 0%, 40% { transform: translateX(-10px); opacity: 0; } 55% { opacity: .8; } 80%, 100% { transform: translateX(70px); opacity: 0; } }`,
  },

  boots: { // Bog boots: yellow wellies standing in a puddle, ready for anything
    svg: glowDefs
      + `<ellipse cx="50" cy="84" rx="42" ry="9" fill="#5a4630" ${E}/><ellipse cx="50" cy="83" rx="32" ry="6" fill="#7fa6b0" opacity=".85"/>`
      + `<ellipse cx="50" cy="83" rx="20" ry="3.4" fill="none" stroke="#cfe6f0" stroke-width=".9"${A("ripple", { s: 1.5, d: 2.6, o: [50, 83] })}/>`
      + [[26, 0, "#f2c230"], [52, 0.5, "#f2c230"]].map(([x, dl, c]) => `<g${A("hop", { a: 5, d: 1.8, dl: dl as number })}>`
        + `<path d="M${x} 24h17l1 36q1 4 5 5l10 3q4 1.5 4 6v4H${(x as number) - 1}z" fill="${c}" ${E}/>`
        + `<path d="M${(x as number) - 1} 78h37v4H${(x as number) - 1}z" fill="#3a2f45" ${E}/>`
        + `<path d="M${(x as number) - 1} 22h19v6H${(x as number) - 1}z" fill="#e8862f" ${E}/>`
        + `<path d="M${(x as number) + 3} 30v40" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`
        + `<path d="M${(x as number) + 6} 30v26" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".35"/></g>`).join("")
      + [[20, 76], [80, 74], [70, 80]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#6a5238"${A("hop", { a: 6, d: 1.8, dl: i * 0.3 })}/>`).join("")
      + sparkle(86, 22) + sparkle(14, 30, 0.7, 0.9),
    css: "",
  },

  "snake-crown": { // The sea snake: a friendly giant arching out of the bay, wearing its crown
    svg: glowDefs
      + `<path d="M-10 58H110V110H-10z" fill="url(#hx-sea)"/>`
      + `<ellipse cx="70" cy="60" rx="30" ry="2" fill="#ffd27a" opacity=".5"/>`
      + `<g${A("bob", { a: 2.5, d: 2.6 })}>`
      + `<path d="M8 66q8-26 20 0M34 66q9-30 22 0" fill="none" stroke="#1f5f6e" stroke-width="10" stroke-linecap="round"/>`
      + `<path d="M8 66q8-26 20 0M34 66q9-30 22 0" fill="none" stroke="#3aa6a0" stroke-width="6" stroke-linecap="round"/>`
      + `<path d="M8 66q8-26 20 0M34 66q9-30 22 0" fill="none" stroke="#bff0d8" stroke-width="1.6" stroke-dasharray="1.5 3.5" stroke-linecap="round"/>`
      + `<path d="M60 66q2-30 14-34" fill="none" stroke="#1f5f6e" stroke-width="11" stroke-linecap="round"/><path d="M60 66q2-30 14-34" fill="none" stroke="#3aa6a0" stroke-width="7" stroke-linecap="round"/>`
      + `<ellipse cx="78" cy="31" rx="11" ry="8" fill="#3aa6a0" ${E}/><ellipse cx="83" cy="34" rx="6" ry="3.5" fill="#7fd1b9"/>`
      + `<circle cx="78" cy="28" r="2.6" fill="#fff"/><circle cx="78.6" cy="28.3" r="1.3" fill="#1d0f33"${A("blink", {})}/>`
      + `<path d="M84 36q4 2 6 1" fill="none" stroke="#1d0f33" stroke-width="1" stroke-linecap="round"/>`
      + `<g${A("bob", { a: 2, d: 1.4 })}>${glow(76, 18, 10, 1.6)}<path d="M69 23l1.5-9 4.5 5 2.5-7 2.5 7 4.5-5 1.5 9z" fill="#f2c230" ${E}/><circle cx="77" cy="16" r="1.3" fill="#d8433b"/></g>`
      + `</g>`
      + [62, 70, 78].map((y, i) => `<path d="M-20 ${y}q5-3 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0" fill="none" stroke="#9fd8e0" stroke-width="1.2" opacity="${0.7 - i * 0.15}"${A("wave", { d: 2 + i * 0.6 })}/>`).join("")
      + sparkle(30, 22, 0.8) + sparkle(56, 14, 0.6, 1),
    css: "",
  },

  "hay-cart": { // The hay cart: a wooden cart in 3/4 view, rolling through the fields at sunset
    svg: glowDefs
      + `<path d="M-10 60Q30 52 60 58T110 55V110H-10z" fill="#6f8f3c"/><path d="M-10 70Q40 62 110 68V110H-10z" fill="#a8b84a"/>`
      + `<path d="M-10 60l20-5 10 4 18-6 12 5" fill="none" stroke="#4a6a2c" stroke-width="1"/>`
      + `<g${A("bob", { a: 1.2, d: 0.7 })}>`
      // hay: a rounded heap with straw strokes
      + `<path d="M18 52q2-22 30-24 26-1 34 22z" fill="#e9c35a" ${E}/>`
      + Array.from({ length: 14 }, (_, i) => `<path d="M${24 + i * 4} ${48 - (i % 3) * 5}l${(i % 2 ? 3 : -2)} -6" stroke="#b8862a" stroke-width="1" stroke-linecap="round"/>`).join("")
      + `<path d="M30 34q8-6 18-5" fill="none" stroke="#fff3b0" stroke-width="2" stroke-linecap="round" opacity=".7"/>`
      // the cart box: front face and side
      + `<path d="M14 50h58v12H14z" fill="#9a6338" ${E}/><path d="M72 50l12-4v12l-12 4z" fill="#6e4426" ${E}/>`
      + `<path d="M14 56h58M72 56l12-4" stroke="#5a3a20" stroke-width="1"/>`
      + `<path d="M84 52l12 4" stroke="#5a3a20" stroke-width="2.4" stroke-linecap="round"/>`
      + `</g>`
      + [[26, 66, 9], [64, 66, 9], [80, 61, 6.5]].map(([x, y, r], i) => `<g${A("spin", { d: 1.6, o: [x, y] })}><ellipse cx="${x}" cy="${y}" rx="${r * 0.85}" ry="${r}" fill="#6b4f34" ${E}/>`
        + `<path d="M${x} ${y - r}v${2 * r}M${x - r * 0.85} ${y}h${1.7 * r}M${x - r * 0.6} ${y - r * 0.7}l${1.2 * r} ${1.4 * r}M${x + r * 0.6} ${y - r * 0.7}l${-1.2 * r} ${1.4 * r}" stroke="#c9a46a" stroke-width="${i === 2 ? 1 : 1.4}"/>`
        + `<ellipse cx="${x}" cy="${y}" rx="${r * 0.22}" ry="${r * 0.25}" fill="#c9a46a"/></g>`).join("")
      + `<ellipse cx="48" cy="77" rx="38" ry="3" fill="#3a2a10" opacity=".25"/>`
      + Array.from({ length: 3 }, (_, i) => `<path d="M${30 + i * 18} 30l2 -3" stroke="#e9c35a" stroke-width="1.4" stroke-linecap="round"${A("fall", { d: 2.2, dl: i * 0.7, x: -14, y: 30 })}/>`).join(""),
    css: "",
  },

  steps: { // The porch: the front door ajar, warm light, bags on the step
    svg: glowDefs
      + `<path d="M-10 -10H110V64H-10z" fill="#d9c294"/><path d="M-10 -10H110V4H-10z" fill="#8c3a2c"/>`
      + `<path d="M34 12h32v52H34z" fill="#4e3026" ${E}/><path d="M37 15h26v49H37z" fill="url(#hx-win)"/>`
      + `<path d="M37 15l12 4v45H37z" fill="#7a3b2a" ${E}/><circle cx="46" cy="42" r="1.1" fill="#f2c230"/>`
      + `<path d="M37 64L23 100H77L63 64z" fill="#ffd27a" opacity=".22"/>`
      + `<path d="M26 64h48l3 6H23z" fill="#c4935e" ${E}/><path d="M23 70h54v5H23z" fill="#8a5a3c" ${E}/>`
      + `<path d="M18 75h64l3 6H15z" fill="#b8854f" ${E}/><path d="M15 81h70v5H15z" fill="#7a4a2c" ${E}/>`
      + `<path d="M8 86h84l3 7H5z" fill="#a8764a" ${E}/><path d="M5 93h90v8H5z" fill="#6a3f24" ${E}/>`
      + glow(80, 26, 12, 1.6) + `<path d="M77 22h6l-1 7h-4z" fill="#fff3b0" ${E}/><path d="M76 21h8v1.6h-8z" fill="#3a2f45"/>`
      + `<path d="M12 64h12l-2 10h-8z" fill="#b5543a" ${E}/><g${A("sway", { r: 4, d: 3, o: [18, 64] })}><path d="M18 64c-6-4-8-12-4-16 2 6 4 8 4 16zM18 64c5-6 10-8 12-6-3 4-7 6-12 6zM18 64c0-8 2-14 6-16 0 6-2 12-6 16z" fill="#3c8c50" ${E}/></g>`
      + `<g${A("bob", { a: 1, d: 2 })}><rect x="54" y="72" width="13" height="10" rx="3" fill="#d8433b" ${E}/><path d="M57 72v-3h7v3" fill="none" stroke="#2a1640" stroke-width="1.4"/><path d="M54 77h13" stroke="#8a2a20" stroke-width="1.2"/></g>`,
    css: "",
  },

  stones: { // Stepping stones across the Bog
    svg: glowDefs + swamp
      + [[22, 88, 15, 5.5], [46, 76, 11, 4], [64, 66, 8, 3], [78, 58, 5.5, 2]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y + ry * 0.5}" rx="${rx}" ry="${ry}" fill="#2a3324"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#a8a090" ${E}/><ellipse cx="${x - rx * 0.25}" cy="${y - ry * 0.35}" rx="${rx * 0.45}" ry="${ry * 0.3}" fill="#fff" opacity=".35"/>`).join("")
      + `<g${A("hop", { a: 4, d: 2.2 })}><ellipse cx="46" cy="71" rx="4.5" ry="3.4" fill="#5aa04a" ${E}/><circle cx="44" cy="68.6" r="1.6" fill="#5aa04a" ${E}/><circle cx="48" cy="68.6" r="1.6" fill="#5aa04a" ${E}/><circle cx="44" cy="68.4" r=".6" fill="#1d0f33"/><circle cx="48" cy="68.4" r=".6" fill="#1d0f33"/></g>`,
    css: "",
  },

  "boot-in-mud": { // The Bog: one boot, slowly going under
    svg: glowDefs + swamp
      + `<ellipse cx="50" cy="80" rx="26" ry="7" fill="#4a3826" ${E}/><ellipse cx="48" cy="78.5" rx="17" ry="3.6" fill="#6a5238"/>`
      + `<g${A("tilt", { r: 7, d: 2.6, o: [50, 80] })}><path d="M41 44h15v32H41z" fill="#3d7a46" ${E}/><path d="M39 42h19v5H39z" fill="#2a5a33" ${E}/><path d="M44 48v26" stroke="#fff" stroke-width="2" opacity=".4" stroke-linecap="round"/></g>`
      + `<path d="M24 80q26 9 52 0q-4 6-26 7t-26-7z" fill="#3a2a1a"/>`
      + [[30, 79], [70, 80], [60, 76]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${2.4 - i * 0.4}" fill="#8a7050" ${E}${A("puff", { d: 2.6, dl: i * 0.8, x: 0, y: -10, s: 1.3 })}/>`).join(""),
    css: "",
  },

  "swap-arrows": { // Plot twist: two travellers trade places in a flash
    svg: glowDefs
      + `<circle cx="50" cy="50" r="40" fill="url(#hx-aura)" opacity=".55"/>`
      + `<g${A("spin", { d: 3.2, o: [50, 50] })}>`
      + `<path d="M22 50A28 28 0 0 1 78 50" fill="none" stroke="#fff3b0" stroke-width="3" stroke-dasharray="2 5" stroke-linecap="round" opacity=".8"/>`
      + `<path d="M78 50A28 28 0 0 1 22 50" fill="none" stroke="#fff3b0" stroke-width="3" stroke-dasharray="2 5" stroke-linecap="round" opacity=".8"/>`
      + `<path d="M72 34l7 3 1-8M28 66l-7-3-1 8" fill="none" stroke="#f2c230" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
      + token(22, 50, "#3d74c4", 11) + token(78, 50, "#d8433b", 11) + `</g>`
      + sparkle(50, 22, 1.1) + sparkle(50, 80, 0.9, 0.8),
    css: "",
  },

  "crossed-bed": { // What booking? A lodge desk at night, the neon says it all
    svg: glowDefs
      + `<path d="M-10 -10H110V70H-10z" fill="#4a2f2a"/><path d="M-10 60H110V110H-10z" fill="#3a2420"/>`
      + `<path d="M8 10h84v22H8z" fill="#1d1218" ${E}/>`
      + `<text x="50" y="26" font-size="10" text-anchor="middle" fill="#ff5a4a" font-family="Cinzel, serif" letter-spacing="1"${A("flicker", { d: 0.35 })}>NO VACANCY</text>`
      + `<rect x="8" y="10" width="84" height="22" fill="none" stroke="#ff5a4a" stroke-opacity=".5" stroke-width="1"/>`
      + `<path d="M60 38h30v18H60z" fill="#6e4426" ${E}/>` + Array.from({ length: 6 }, (_, i) => `<circle cx="${64 + (i % 3) * 10}" cy="${42 + Math.floor(i / 3) * 8}" r="1" fill="#c9a46a"/>`).join("")
      + `<path d="M84 44l1 5" stroke="#e0b84a" stroke-width="1.6"/>`
      + `<path d="M-10 64H100l6 8H-10z" fill="#9a6338" ${E}/><path d="M-10 72H106V100H-10z" fill="#6e4426" ${E}/>`
      + `<path d="M0 78h96M0 90h96" stroke="#4e3026" stroke-width="1" opacity=".6"/>`
      + glow(22, 56, 14, 2.6) + `<path d="M17 46h10l3 8H14z" fill="#3c8c50" ${E}/><path d="M22 54v10" stroke="#c9a46a" stroke-width="1.6"/>`
      + `<ellipse cx="44" cy="64" rx="6" ry="1.6" fill="#8d99a6"/><path d="M39 64q5-9 10 0z" fill="#d6dbe2" ${E}/><circle cx="44" cy="54.5" r="1" fill="#d6dbe2"/>`
      + `<path d="M56 63l12-2 4 3-12 2z" fill="#f7f1e3" ${E}/>`,
    css: "",
  },

  key: { // Forgot your keys: there they are, on the café table, next to your coffee
    svg: glowDefs + cafe + keyring(28, 72, -12) + sparkle(40, 66, 0.8),
    css: "",
  },

  "two-keys": { // Forgot your keys AGAIN!!!
    svg: glowDefs + cafe + keyring(24, 70, -12) + keyring(42, 82, 20)
      + `<g${A("hop", { a: 4, d: 0.9 })}><text x="22" y="40" font-size="20" fill="#ff5a4a" font-family="Cinzel, serif" font-weight="700">!!!</text></g>`,
    css: "",
  },

  "snake-down": { // The undertow: the current pulls a swim ring all the way back
    svg: glowDefs
      + `<path d="M-10 36Q50 30 110 34V110H-10z" fill="url(#hx-sea)"/>`
      + `<path d="M-10 36Q50 30 110 34" fill="none" stroke="#9fd8e0" stroke-width="1" opacity=".6"/>`
      + Array.from({ length: 8 }, (_, i) => `<path d="M${100 - (i % 4) * 8} ${44 + i * 7}h${10 + (i % 3) * 6}" stroke="#bfe6f0" stroke-width="1.4" stroke-linecap="round" opacity=".7"${A("move", { x: -70, d: 1.6 + (i % 3) * 0.4, dl: i * 0.25 })}/>`).join("")
      + `<path d="M58 70a16 7 0 1 0 1 0" fill="none" stroke="#9fd8e0" stroke-width="1.2" opacity=".6"${A("spin", { d: 2.4, o: [58, 70], r: -360 })}/>`
      + `<g${A("slide", { x: -26, y: 6, d: 2.8 })}><g${A("bob", { a: 2, d: 0.8 })}><ellipse cx="66" cy="58" rx="12" ry="5.5" fill="#d8433b" ${E}/><ellipse cx="66" cy="57" rx="6" ry="2.4" fill="#1f5560"/>`
      + `<path d="M56 55l3 4M73 54l-2 5M66 52.6v2" stroke="#fff" stroke-width="3"/></g></g>`
      + `<path d="M22 62l-8 4 8 4" fill="none" stroke="#fff3b0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".8"${A("slide", { x: -6, d: 0.9 })}/>`
      + `<ellipse cx="88" cy="88" rx="9" ry="4" fill="#3a4a50" ${E}/><ellipse cx="14" cy="94" rx="12" ry="5" fill="#3a4a50" ${E}/>`,
    css: "",
  },

  "big-clock": { // The station clock: waiting, minute by minute
    svg: glowDefs
      + `<path d="M-10 30Q50 -10 110 30V110H-10z" fill="#2a3a48" opacity=".7"/><path d="M4 110V44Q50 6 96 44V110" fill="none" stroke="#1d2a36" stroke-width="5"/>`
      + `<path d="M50 4v14" stroke="#3a2f45" stroke-width="2.4"/><path d="M40 16h20" stroke="#3a2f45" stroke-width="3"/>`
      + glow(50, 46, 34, 3)
      + `<circle cx="50" cy="46" r="25" fill="#b8892a" ${E}/><circle cx="50" cy="46" r="21" fill="#fff8e6" ${E}/>`
      + Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<path d="M${(50 + Math.sin(a) * 17).toFixed(1)} ${(46 - Math.cos(a) * 17).toFixed(1)}L${(50 + Math.sin(a) * 19.5).toFixed(1)} ${(46 - Math.cos(a) * 19.5).toFixed(1)}" stroke="#2a1640" stroke-width="${i % 3 ? 1 : 2}"/>`; }).join("")
      + `<g${A("spin", { d: 6, o: [50, 46] })}><path d="M50 46V31" stroke="#2a1640" stroke-width="1.6" stroke-linecap="round"/></g>`
      + `<g${A("spin", { d: 72, o: [50, 46] })}><path d="M50 46l7 5" stroke="#2a1640" stroke-width="2.6" stroke-linecap="round"/></g>`
      + `<circle cx="50" cy="46" r="1.8" fill="#b8892a"/>`
      + person(22, 76, "#3d74c4", 0.9) + person(80, 78, "#9b59b6", 0.85),
    css: "",
  },

  puddle: { // Not a puddle: a city street, a streetlamp in the water, one unlucky shoe
    svg: glowDefs
      + `<path d="M-10 52H110V110H-10z" fill="#3a3f4a"/><path d="M-10 52H110" stroke="#2a2f38" stroke-width="2"/>`
      + `<path d="M12 -10v60" stroke="#2a2f38" stroke-width="3"/><path d="M12 6h10" stroke="#2a2f38" stroke-width="2.4"/>` + glow(22, 12, 14, 2.2) + `<path d="M18 8h8l-2 6h-4z" fill="#fff3b0" ${E}/>`
      + `<ellipse cx="54" cy="80" rx="40" ry="11" fill="#5a7a90" ${E}/><ellipse cx="54" cy="80" rx="40" ry="11" fill="url(#hx-sea)" opacity=".7"/>`
      + `<ellipse cx="26" cy="78" rx="5" ry="2" fill="#ffd27a" opacity=".7"/><path d="M26 76v-10" stroke="#ffd27a" stroke-width="1" opacity=".4"/>`
      + `<ellipse cx="60" cy="80" rx="14" ry="3.4" fill="none" stroke="#cfe6f0" stroke-width="1"${A("ripple", { s: 1.8, d: 1.8, o: [60, 80] })}/>`
      + `<g${A("bob", { a: 2, d: 1.2 })}><path d="M52 50h10l1 22q6 1 10 4v3H52z" fill="#5a3a28" ${E}/><path d="M52 79h21v2.4H52z" fill="#1d1a24"/></g>`
      + [[48, 70], [76, 68], [70, 62], [44, 64]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#cfe6f0"${A("hop", { a: 8, d: 1.2, dl: i * 0.2 })}/>`).join(""),
    css: "",
  },

  "sleeping-face": { // Asleep on the train: night outside, lights streaking past, one traveller out cold
    svg: glowDefs
      + `<path d="M-10 -10H110V110H-10z" fill="#3a2a3a"/>`
      + `<rect x="8" y="12" width="64" height="46" rx="8" fill="#0f2430" ${E}/>`
      + Array.from({ length: 6 }, (_, i) => `<circle cx="${70 - (i % 3) * 6}" cy="${24 + i * 5}" r="1.3" fill="#ffd27a"${A("move", { x: -60, d: 1.2 + (i % 3) * 0.5, dl: i * 0.3 })}/>`).join("")
      + `<path d="M8 48q20-8 34-2t30-4v16H8z" fill="#18323a"/>`
      + `<rect x="8" y="12" width="64" height="46" rx="8" fill="none" stroke="#8d99a6" stroke-width="3"/>`
      + glow(86, 10, 16, 2.6) + `<path d="M80 4h12l-3 8h-6z" fill="#e8862f" ${E}/>`
      + `<path d="M58 40q24-6 40 4v70H54z" fill="#8a3b4a" ${E}/>`
      + `<g${A("bob", { a: 1.2, d: 2.6 })}><path d="M56 104q-2-26 8-34 10-6 22 0 8 8 6 34z" fill="#3d74c4" ${E}/>`
      + `<ellipse cx="66" cy="58" rx="10" ry="11" fill="#f5c9a0" ${E} transform="rotate(-18 66 58)"/>`
      + `<path d="M56 54q2-14 16-12 8 2 6 10-6-6-22 2z" fill="#3b2a22"/>`
      + `<path d="M60 60q3 2 6 0" fill="none" stroke="#2a1640" stroke-width="1.2" stroke-linecap="round"/><path d="M63 67q2 1 4 0" fill="none" stroke="#a0604a" stroke-width="1"/></g>`
      + [0, 1, 2].map((i) => `<text x="${40 + i * 6}" y="${40 - i * 6}" font-size="${6 + i * 2}" fill="#fff3b0" font-family="Cinzel, serif"${A("puff", { d: 3, dl: i, x: 4, y: -12, s: 1.2 })}>z</text>`).join(""),
    css: "",
  },

  maze: { // Lost in the alleys: a narrow lane at night, signs pointing every way
    svg: glowDefs
      + `<path d="M-10 -10H110V110H-10z" fill="#1a2430"/>`
      + `<path d="M-10 -10L42 34V74L-10 110z" fill="#5a3f3a" ${E}/><path d="M110 -10L58 34V74L110 110z" fill="#4a3532" ${E}/>`
      + `<path d="M42 34h16v40H42z" fill="#0f1820"/>` + glow(50, 50, 10, 2)
      + `<path d="M42 74L-10 110H110L58 74z" fill="#3a3f4a"/>`
      + [[10, 20], [24, 34], [10, 56], [26, 52]].map(([x, y], i) => `<path d="M${x} ${y}l8 ${-3 + i % 2}v9l-8 ${3 - i % 2}z" fill="${i % 2 ? "#ffc861" : "#2a2a36"}" ${E}${i % 2 ? A("flicker", { d: 1.8, dl: i * 0.4 }) : ""}/>`).join("")
      + [[88, 22], [76, 36], [90, 54]].map(([x, y], i) => `<path d="M${x} ${y}l-8 ${-3 + i % 2}v9l8 ${3 - i % 2}z" fill="${i !== 1 ? "#ffc861" : "#2a2a36"}" ${E}/>`).join("")
      + `<g${A("tilt", { r: 8, d: 1.4, o: [34, 70] })}><path d="M34 70V52" stroke="#3a2f45" stroke-width="2"/><path d="M34 52h14l3 3-3 3H34z" fill="#c76a3a" ${E}/><path d="M34 60H22l-3 3 3 3h12z" fill="#e0a84a" ${E}/></g>`
      + `<ellipse cx="60" cy="92" rx="14" ry="3" fill="#5a7a90" opacity=".6"/>`
      + `<g${A("bob", { a: 1, d: 1.6 })}><path d="M72 86q2-8 8-8 5 0 6 4l2-3 1 4q2 3 0 6-6 2-16 1z" fill="#0a0e14"/><path d="M73 86q-6 2-7-4" fill="none" stroke="#0a0e14" stroke-width="2" stroke-linecap="round"/></g>`
      + `<circle cx="84" cy="81" r=".8" fill="#ffd27a"/>`,
    css: "",
  },

  "park-bench": { // Through the park: a lamp, a bench, leaves drifting down
    svg: glowDefs
      + `<path d="M-10 58Q50 52 110 58V110H-10z" fill="#2f5a3a"/><path d="M30 110L46 58H56L80 110z" fill="#b8a07a" opacity=".8"/>`
      + `<path d="M-6 58c0-20 10-30 20-30s16 14 14 30z" fill="#1f4430"/><path d="M70 58c0-24 12-34 22-34s20 14 18 34z" fill="#1f4430"/>`
      + `<path d="M24 22v52" stroke="#2a2f38" stroke-width="2.4"/><path d="M20 20h8l-1 6h-6z" fill="#fff3b0" ${E}/>` + glow(24, 22, 18, 2.4)
      + `<ellipse cx="24" cy="76" rx="16" ry="4" fill="#ffd27a" opacity=".25"/>`
      + `<path d="M56 64h32l-4 5H52z" fill="#a0683f" ${E}/><path d="M57 54h32l-1 4H56z" fill="#b8784a" ${E}/><path d="M58 59h32l-1 4H57z" fill="#a86c42" ${E}/>`
      + `<path d="M55 69v10M84 69v10M88 58v12" stroke="#2a2f38" stroke-width="2"/>`
      + Array.from({ length: 5 }, (_, i) => `<path d="M${14 + i * 18} ${10 + (i % 2) * 8}q2-2 4 0-2 2-4 0z" fill="${i % 2 ? "#e8862f" : "#d8a83a"}" stroke="#7a3b10" stroke-width=".5"${A("fall", { d: 4 + i * 0.6, dl: i * 0.8, x: 10, y: 60 })}/>`).join(""),
    css: "",
  },

  duck: { // The duck bridge: six ducks in a row, not moving, ever
    svg: glowDefs
      + `<path d="M-10 70H110V110H-10z" fill="url(#hx-sea)"/>`
      + [74, 82, 90].map((y, i) => `<path d="M-20 ${y}q5-2 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0" fill="none" stroke="#9fd8e0" stroke-width="1" opacity="${0.6 - i * 0.15}"${A("wave", { d: 2.4 + i * 0.5 })}/>`).join("")
      + `<path d="M-10 52H110V60Q50 30 -10 60z" fill="#8d8478" ${E}/><path d="M-10 60Q50 30 110 60V70Q50 44 -10 70z" fill="#6e665c" ${E}/>`
      + `<path d="M-10 52H110" stroke="#5a5248" stroke-width="2"/>`
      + Array.from({ length: 6 }, (_, i) => { const x = 10 + i * 15.5; return `<g${A("bob", { a: 0.8, d: 1.6 + (i % 3) * 0.3, dl: i * 0.2 })}><ellipse cx="${x}" cy="47" rx="6" ry="4" fill="#8a6a48" ${E}/><circle cx="${x + 4.5}" cy="42" r="2.8" fill="#2f7a45" ${E}/><path d="M${x + 7} 42.6l3 .6-3 .8z" fill="#e8a02f"/><circle cx="${x + 5.2}" cy="41.4" r=".5" fill="#1d0f33"/><path d="M${x - 2} 46q3-2 6 0" fill="none" stroke="#5a4028" stroke-width=".8"/></g>`; }).join(""),
    css: "",
  },

  "door-key": { // Did you lock the door? The key, the lock, the doubt
    svg: glowDefs
      + `<path d="M-10 -10H110V110H-10z" fill="#c9b48c"/><path d="M20 4h60v106H20z" fill="#4e3026" ${E}/>`
      + `<path d="M25 9h50v101H25z" fill="#7a2f2a" ${E}/><path d="M31 16h38v36H31zM31 60h38v44H31z" fill="none" stroke="#5a2018" stroke-width="1.6"/>`
      + glow(88, 20, 16, 1.6) + `<path d="M84 14h8l-1 9h-6z" fill="#fff3b0" ${E}/>`
      + `<path d="M60 52h12v18H60z" fill="#c8a24a" ${E}/><circle cx="66" cy="58" r="2" fill="#2a1a10"/><path d="M65 59h2v4h-2z" fill="#2a1a10"/>`
      + `<g${A("tilt", { r: 30, d: 1.2, o: [66, 59] })}><circle cx="78" cy="59" r="5" fill="#e0b84a" ${E}/><circle cx="78" cy="59" r="1.8" fill="#6b5320"/><path d="M73 58h-7v2h7z" fill="#e0b84a"/></g>`
      + `<g${A("bob", { a: 3, d: 1.4 })}>${glow(40, 36, 12, 1.4)}<text x="40" y="42" font-size="18" text-anchor="middle" fill="#fff3b0" font-family="Cinzel, serif" font-weight="700">?</text></g>`,
    css: "",
  },

  shoelace: { // Shoelace situation: a trainer on the pavement, the lace escaping
    svg: glowDefs
      + `<path d="M-10 40H110V110H-10z" fill="#5a5e68"/>`
      + Array.from({ length: 5 }, (_, i) => `<path d="M-10 ${50 + i * 12}H110" stroke="#454952" stroke-width="1"/>`).join("") + `<path d="M30 40L10 110M70 40L90 110" stroke="#454952" stroke-width="1"/>`
      + `<path d="M18 74q4-22 22-24l22-4q10 0 14 10l14 6q6 3 4 10H18z" fill="#f7f1e3" ${E}/>`
      + `<path d="M18 74h76v6q-38 4-76 0z" fill="#d8433b" ${E}/><path d="M40 52l22-4q8 0 12 8" fill="none" stroke="#3d74c4" stroke-width="3"/>`
      + `<path d="M44 56l4 6M50 54l4 6M56 52l4 6" stroke="#8d99a6" stroke-width="1.6"/>`
      + `<g${A("sway", { r: 10, d: 1.6, o: [56, 56] })}><path d="M56 56q-6 14 -20 18t-24 -2M58 56q10 10 4 22t6 12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g>`
      + glow(88, 12, 18, 2.6),
    css: "",
  },

  "traffic-light": { // The green wave: every light down the avenue turns green
    svg: glowDefs
      + `<path d="M-10 -10H110V110H-10z" fill="#141c2a"/>`
      + `<path d="M50 40L-10 110H110z" fill="#2c3240"/><path d="M50 40v70" stroke="#e8e4dc" stroke-width="1.4" stroke-dasharray="4 5"/>`
      + `<path d="M-10 60L44 38V20L-10 10zM110 60L56 38V20L110 10z" fill="#1d2534"/>`
      + Array.from({ length: 8 }, (_, i) => `<rect x="${i % 2 ? 60 + (i >> 1) * 8 : 34 - (i >> 1) * 9}" y="${22 + (i >> 1) * 6}" width="3" height="4" fill="#ffd27a" opacity=".7"/>`).join("")
      + [[20, 30, 1.2], [36, 40, 0.8], [46, 44, 0.5]].map(([x, y, k], i) => `<path d="M${x} ${y}v${30 * k}" stroke="#2a2f38" stroke-width="${2 * k}"/><rect x="${x - 4 * k}" y="${y - 14 * k}" width="${8 * k}" height="${16 * k}" rx="${2 * k}" fill="#2a2f38" ${E}/>`
        + `<circle cx="${x}" cy="${y - 4 * k}" r="${2.6 * k}" fill="#4cff7a"${A("flicker", { d: 1.2, dl: i * 0.3 })}/><circle cx="${x}" cy="${y - 4 * k}" r="${8 * k}" fill="#4cff7a" opacity=".25"/>`
        + `<circle cx="${x}" cy="${y - 10 * k}" r="${2.2 * k}" fill="#4a2020"/>`).join("")
      + Array.from({ length: 4 }, (_, i) => `<path d="M${60 + i * 6} ${80 + i * 5}l20 -12" stroke="${i % 2 ? "#ff5a4a" : "#fff3b0"}" stroke-width="1.6" stroke-linecap="round"${A("move", { x: -40, y: 26, d: 1 + i * 0.2, dl: i * 0.3 })}/>`).join(""),
    css: "",
  },

  "ice-cream": { // Ice cream break: three scoops in front of a glowing gelato window
    svg: glowDefs
      + `<path d="M-10 -10H110V110H-10z" fill="#3a2a3a"/><path d="M4 8h92v60H4z" fill="#ffd9a8" ${E}/><path d="M4 8h92v60H4z" fill="url(#hx-warm)" opacity=".6"/>`
      + Array.from({ length: 6 }, (_, i) => `<path d="M${8 + i * 15} 8l7 10 8-10" fill="${i % 2 ? "#d8433b" : "#f7f1e3"}" ${E}/>`).join("")
      + `<path d="M4 68h92v42H4z" fill="#5a3a40"/>`
      + `<g${A("sway", { r: 3, d: 2.4, o: [50, 96] })}><path d="M38 60l12 40 12-40z" fill="#d8a24a" ${E}/><path d="M41 64l18 10M44 74l12 6M39 62l20 0M42 70l16-6M46 80l8-6" stroke="#a8742a" stroke-width="1" opacity=".7"/>`
      + `<circle cx="42" cy="54" r="10" fill="#f4b6c8" ${E}/><circle cx="58" cy="54" r="10" fill="#9fdcc0" ${E}/><circle cx="50" cy="40" r="11" fill="#7a4a30" ${E}/>`
      + `<path d="M36 60q2 6 4 0M58 62q1 5 3 0" fill="#f4b6c8"/><circle cx="50" cy="28" r="2.6" fill="#d8433b" ${E}/>`
      + `<path d="M44 34q3-4 7-4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".6"/></g>`,
    css: "",
  },

  ticket: { // The Fair ticket: gold foil, perforated, very much not in your pocket
    svg: glowDefs
      + Array.from({ length: 7 }, (_, i) => `<circle cx="${8 + i * 15}" cy="${12 + (i % 2) * 6}" r="6" fill="${["#e8562f", "#f2c230", "#3d74c4", "#9b59b6"][i % 4]}" opacity=".35"/>`).join("")
      + `<circle cx="50" cy="52" r="40" fill="url(#hx-aura)" opacity=".5"/>`
      + `<g${A("bob", { a: 3, d: 2 })}><g transform="rotate(-14 50 52)">`
      + `<path d="M14 34h72v36H14z" fill="#3a1f5c" transform="translate(2 3)" opacity=".5"/>`
      + `<path d="M14 34h56a4 4 0 0 0 0 0h16v36H14z" fill="#f2c230" ${E}/><path d="M66 34v36" stroke="#8a6a00" stroke-width="1.2" stroke-dasharray="2 2"/>`
      + `<path d="M18 38h44v28H18z" fill="none" stroke="#8a6a00" stroke-width="1"/>`
      + `<text x="40" y="52" font-size="9" text-anchor="middle" fill="#4b2377" font-family="Cinzel, serif" font-weight="700">FAIR</text>`
      + `<text x="40" y="61" font-size="4.2" text-anchor="middle" fill="#4b2377" font-family="Cinzel, serif">ADMIT ONE</text>`
      + `<text x="76" y="56" font-size="5" text-anchor="middle" fill="#4b2377" font-family="Cinzel, serif" transform="rotate(-90 76 52)">Nº 0042</text>`
      + `<path class="shine" d="M10 30h8l-4 44H6z" fill="url(#hx-shine)" opacity=".7"/></g></g>`
      + sparkle(18, 80, 0.8) + sparkle(84, 26, 0.7, 0.9),
    css: `.art-ticket .shine { animation: card-shine-sweep 3.6s ease-in-out infinite; }`,
  },
};
