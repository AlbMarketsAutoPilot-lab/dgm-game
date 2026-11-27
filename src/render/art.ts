// Animated storybook illustrations for the event squares (GCD §14: every event has a colour and an icon; P6 the
// hand-made look). Each one is inline SVG on a 100 × 100 grid with its own CSS animation (transform and opacity
// only, so it stays light on phones). Animations run only while the square is on screen and stop entirely with
// the system setting "reduce motion" (see board.css).
//
// Part 1 (this file): the first set, approved by the owner. Part 2 `art-travel.ts`, part 3 `art-places.ts`, shared
// pieces and motions in `art-kit.ts`. Every icon name in the board files has an illustration (test/render.test.ts).
import { KIT_CSS } from "./art-kit";
import { PLACES } from "./art-places";
import { TRAVEL } from "./art-travel";
import { MODERN } from "./art-modern";
import { LANTERN_ART, areaSign } from "./art-lantern";
import { esc } from "./html";
import { ICONS } from "./icons";

const INK = "#4b2377";
const S = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
const S2 = `stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;

interface Art {
  svg: string;
  css: string;
  /** The part of the 100 × 100 grid to show (default a little cropped, so the drawing fills its window). */
  box?: string;
}

export const ART: Record<string, Art> = {

  sheep: {
    svg: `
      <path d="M4 84h92" ${S}/>
      <path d="M14 84l3-7 3 7M78 84l3-6 3 6" fill="none" ${S2}/>
      <g class="sheep">
        <path d="M38 66v16M48 67v15M60 67v15M68 66v16" ${S} stroke-width="4"/>
        <path d="M32 58c-6-2-6-12 1-13 0-7 9-10 14-6 4-5 13-4 15 2 7-2 13 4 11 10 6 2 6 11-1 12-2 6-10 7-14 4-5 4-13 4-16-1-6 2-11-2-10-8z" fill="#fffdf6" ${S}/>
        <g class="head">
          <ellipse cx="26" cy="55" rx="10" ry="8" fill="#3a2f45" ${S}/>
          <path d="M30 48l7-4" ${S} stroke-width="3.4"/>
          <ellipse class="eye" cx="22.5" cy="53.5" rx="1.8" ry="2" fill="#fff"/>
        </g>
      </g>`,
    css: `
      .art-sheep .sheep { animation: sheep-bob 1.3s ease-in-out infinite alternate; }
      .art-sheep .head { transform-origin: 90% 60%; animation: sheep-nod 2.4s ease-in-out infinite; }
      .art-sheep .eye { animation: blink 3.6s infinite; }
      @keyframes sheep-bob { from { transform: translateY(0); } to { transform: translateY(-2px); } }
      @keyframes sheep-nod { 0%, 60%, 100% { transform: rotate(0); } 75% { transform: rotate(-12deg); } 85% { transform: rotate(4deg); } }
      @keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 94% { transform: scaleY(.1); } }`,
  },



  "cable-car": {
    svg: `
      <path d="M0 92l26-40 16 18 20-32 38 54z" fill="#b8b2a6" ${S}/>
      <path d="M20 61l6-9 6 8-6-2zM55 46l7-8 7 10-7-3z" fill="#fff" ${S2}/>
      <path d="M-2 30L102 12" ${S}/>
      <g class="car">
        <path d="M50 21v10" ${S}/>
        <circle cx="50" cy="21" r="2.6" fill="${INK}"/>
        <rect x="35" y="31" width="30" height="21" rx="5" fill="#d8433b" ${S}/>
        <rect x="39" y="35" width="9" height="8" rx="1.5" fill="#bfe6ff" ${S2}/>
        <rect x="52" y="35" width="9" height="8" rx="1.5" fill="#bfe6ff" ${S2}/>
      </g>`,
    css: `
      .art-cable-car .car { animation: cable 4.8s ease-in-out infinite alternate; }
      @keyframes cable { from { transform: translate(-24px, 4.3px); } to { transform: translate(24px, -4.3px); } }`,
  },

  "traffic-light": {
    svg: `
      <path d="M50 94V72" ${S} stroke-width="5"/>
      <rect x="35" y="8" width="30" height="64" rx="8" fill="#3a2f45" ${S}/>
      <circle cx="50" cy="23" r="8" fill="#5c2525" ${S2}/>
      <circle cx="50" cy="40" r="8" fill="#5c4c22" ${S2}/>
      <circle cx="50" cy="57" r="8" fill="#22512f" ${S2}/>
      <circle class="lamp red" cx="50" cy="23" r="7" fill="#ff5b4d"/>
      <circle class="lamp amber" cx="50" cy="40" r="7" fill="#ffc53a"/>
      <circle class="lamp green" cx="50" cy="57" r="7" fill="#4cdc6a"/>
      <circle class="halo" cx="50" cy="57" r="14" fill="#4cdc6a" opacity=".25"/>`,
    css: `
      .art-traffic-light .lamp, .art-traffic-light .halo { animation: 4.8s step-end infinite; }
      .art-traffic-light .red { animation-name: lamp-red; }
      .art-traffic-light .amber { animation-name: lamp-amber; }
      .art-traffic-light .green, .art-traffic-light .halo { animation-name: lamp-green; }
      @keyframes lamp-red { 0% { opacity: 1; } 20% { opacity: 0; } 100% { opacity: 0; } }
      @keyframes lamp-amber { 0% { opacity: 0; } 15% { opacity: 1; } 20% { opacity: 0; } }
      @keyframes lamp-green { 0% { opacity: 0; } 20% { opacity: 1; } 100% { opacity: 1; } }`,
  },

  lanterns: { // END: the Festival of Lights
    svg: `
      <path d="M2 16Q50 36 98 16" fill="none" ${S2}/>
      ${[[22, 22, 1], [50, 26, 1.2], [78, 22, 1]].map(([x, y, k], i) => `
      <g class="lan l${i}" style="transform-origin:${x}px ${y}px">
        <path d="M${x} ${y}v${6 * k}" ${S2}/>
        <rect x="${x - 6 * k}" y="${y + 6 * k}" width="${12 * k}" height="${3 * k}" rx="1" fill="#e8562f" ${S2}/>
        <path d="M${x - 8 * k} ${y + 9 * k}h${16 * k}l${-2 * k} ${22 * k}h${-12 * k}z" fill="#f2c230" ${S}/>
        <ellipse class="glow" cx="${x}" cy="${y + 20 * k}" rx="${4.5 * k}" ry="${7 * k}" fill="#fff6b0"/>
        <path d="M${x - 4 * k} ${y + 31 * k}l${-1 * k} ${5 * k}M${x + 4 * k} ${y + 31 * k}l${1 * k} ${5 * k}" ${S2}/>
      </g>`).join("")}`,
    css: `
      .art-lanterns .lan { animation: lantern-swing 2.6s ease-in-out infinite alternate; transform-box: view-box; }
      .art-lanterns .l1 { animation-delay: -.9s; } .art-lanterns .l2 { animation-delay: -1.7s; }
      .art-lanterns .glow { animation: glow 1.3s ease-in-out infinite alternate; }
      @keyframes lantern-swing { from { transform: rotate(-7deg); } to { transform: rotate(7deg); } }
      @keyframes glow { from { opacity: .45; } to { opacity: 1; } }`,
  },

  house: { // Home / Start
    svg: `
      <path d="M4 88h92" ${S}/>
      <rect x="64" y="20" width="9" height="20" fill="#a0683f" ${S}/>
      <circle class="smoke m1" cx="68" cy="16" r="4" fill="#fff" ${S2}/>
      <circle class="smoke m2" cx="68" cy="16" r="5" fill="#fff" ${S2}/>
      <circle class="smoke m3" cx="68" cy="16" r="4.5" fill="#fff" ${S2}/>
      <path d="M18 50L50 22l32 28z" fill="#d8433b" ${S}/>
      <rect x="24" y="50" width="52" height="38" fill="#f7e2b8" ${S}/>
      <rect x="44" y="64" width="13" height="24" rx="1.5" fill="#8a5a3c" ${S}/>
      <rect class="win" x="29" y="58" width="11" height="10" fill="#ffd95a" ${S2}/>
      <rect class="win w2" x="61" y="58" width="11" height="10" fill="#ffd95a" ${S2}/>`,
    css: `
      .art-house .smoke { animation: smoke 3s ease-out infinite; opacity: 0; }
      .art-house .m2 { animation-delay: 1s; } .art-house .m3 { animation-delay: 2s; }
      .art-house .win { animation: window 2.2s ease-in-out infinite alternate; }
      .art-house .w2 { animation-delay: -1.1s; }
      @keyframes smoke { 0% { transform: translate(0, 0) scale(.5); opacity: 0; } 20% { opacity: .95; } 100% { transform: translate(10px, -16px) scale(1.4); opacity: 0; } }
      @keyframes window { from { opacity: .7; } to { opacity: 1; } }`,
  },
};

Object.assign(ART, TRAVEL, PLACES);

// The grown-up redraws (owner, 15 Oct: "all new icons", except these three, which keep their first drawing).
const KEEP = new Set(["cable-car", "maze", "swap-arrows"]);
for (const [name, a] of Object.entries(MODERN)) if (!KEEP.has(name)) ART[name] = a;
// The Lantern Festival's new pictures (Step I phase B10, owner-approved 26 Nov 2026), under new names.
for (const [name, a] of Object.entries(LANTERN_ART)) ART[name] = a;

/** Every illustration's CSS (and the shared motions), to inject once. */
export function artCss(): string {
  return KIT_CSS + Object.values(ART).map((a) => a.css).join("\n");
}

/** Whether `name` has its own illustration (otherwise `artFor` draws the line icon). */
export const hasArt = (name: string): boolean => name in ART;

/** Inline SVG for an icon name: its illustration (the line icon only as a safety net for an unknown name). */
export function artFor(name: string, label: string): string {
  const a = ART[name];
  if (a) return `<svg class="art art-${name}" viewBox="${a.box ?? "6 6 88 88"}" role="img" aria-label="${esc(label)}">${a.svg}</svg>`;
  const d = ICONS[name] ?? ICONS.card;
  return `<svg class="art art-icon" viewBox="0 0 24 24" role="img" aria-label="${esc(label)}"><path class="bob" d="${d}" fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** An area's sign (owner, 26 Nov 2026): the wooden board with the area's picture inside (src/render/art-lantern.ts). */
export function areaSignFor(name: string, label: string): string {
  const a = ART[name], inner = a ? `<g class="art-${name}">${a.svg}</g>` : "";
  return `<svg class="art area-sign" viewBox="0 0 100 100" role="img" aria-label="${esc(label)}">${areaSign(inner)}</svg>`;
}
