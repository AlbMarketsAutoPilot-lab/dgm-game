// Animated storybook illustrations for the event squares (GCD §14: every event has a colour and an icon; P6 the
// hand-made look). Each one is inline SVG on a 100 × 100 grid with its own CSS animation (transform and opacity
// only, so it stays light on phones). Animations run only while the square is on screen and stop entirely with
// the system setting "reduce motion" (see board.css).
//
// First set (style sample for the owner). Names without an illustration yet fall back to their line icon,
// gently moving (`artFor`).
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
  balloon: {
    svg: `
      <g class="cloud c1"><path d="M6 80c0-5 6-7 9-4 2-5 10-5 12 0 4-1 7 2 6 6H8c-1 0-2-1-2-2z" fill="#fff" ${S2}/></g>
      <g class="cloud c2"><path d="M66 30c0-4 5-6 8-3 2-4 8-4 10 0 3-1 6 2 5 5H67c-1 0-1-1-1-2z" fill="#fff" ${S2}/></g>
      <g class="float">
        <path d="M50 8C31 8 21 22 24 37c2 10 12 18 18 26h16c6-8 16-16 18-26C79 22 69 8 50 8z" fill="#e8562f" ${S}/>
        <path d="M50 8c-8 6-10 30-6 55h12c4-25 2-49-6-55z" fill="#f2c230" ${S}/>
        <path d="M26 31c15 4 33 4 48 0" fill="none" ${S2} opacity=".55"/>
        <path d="M44 63l2 9M56 63l-2 9" fill="none" ${S2}/>
        <rect x="41" y="72" width="18" height="12" rx="2.5" fill="#a0683f" ${S}/>
        <path d="M41 77h18" ${S2}/>
      </g>`,
    css: `
      .art-balloon .float { animation: balloon-float 3.2s ease-in-out infinite alternate; }
      .art-balloon .c1 { animation: drift 7s ease-in-out infinite alternate; }
      .art-balloon .c2 { animation: drift 9s ease-in-out infinite alternate-reverse; }
      @keyframes balloon-float { from { transform: translateY(4px) rotate(-3deg); } to { transform: translateY(-4px) rotate(3deg); } }
      @keyframes drift { from { transform: translateX(-5px); } to { transform: translateX(6px); } }`,
  },

  "boot-in-mud": { // The Bog
    svg: `
      <ellipse cx="50" cy="76" rx="42" ry="15" fill="#7a5c3e" ${S}/>
      <ellipse cx="44" cy="73" rx="26" ry="7" fill="#9a7650"/>
      <g class="boot">
        <path d="M38 24h17v28l14 6c4 2 5 5 4 9H38z" fill="#4c8a4f" ${S}/>
        <path d="M38 67h35" ${S}/>
        <path d="M43 33h8M43 41h8" ${S2}/>
      </g>
      <path d="M10 76c9 6 23 9 40 9s31-3 40-9c-7 3-17 5-40 5s-33-2-40-5z" fill="#6b4f34" ${S2}/>
      <circle class="bub b1" cx="24" cy="74" r="3.4" fill="#b08b62" ${S2}/>
      <circle class="bub b2" cx="76" cy="75" r="2.8" fill="#b08b62" ${S2}/>
      <circle class="bub b3" cx="62" cy="71" r="2.2" fill="#b08b62" ${S2}/>`,
    css: `
      .art-boot-in-mud .boot { transform-origin: 50% 100%; animation: boot-sink 2.6s ease-in-out infinite alternate; }
      .art-boot-in-mud .bub { animation: bubble 2.8s ease-out infinite; }
      .art-boot-in-mud .b2 { animation-delay: .9s; } .art-boot-in-mud .b3 { animation-delay: 1.8s; }
      @keyframes boot-sink { from { transform: rotate(-6deg) translateY(0); } to { transform: rotate(5deg) translateY(4px); } }
      @keyframes bubble { 0% { transform: translateY(0) scale(.3); opacity: 0; } 25% { opacity: 1; } 100% { transform: translateY(-22px) scale(1.15); opacity: 0; } }`,
  },

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

  duck: {
    svg: `
      <rect x="0" y="70" width="100" height="30" fill="#7fc8f8" opacity=".55"/>
      <g class="duck d1">
        <path d="M24 66c-4-10 4-14 12-12 6 1 10 2 14-2-4-4-3-12 4-15 7-3 14 2 13 9l9 3c-3 4-7 4-10 4 3 8-2 16-14 17-11 1-24 2-28-4z" fill="#f2c230" ${S}/>
        <path d="M66 43l10 3-9 3" fill="#e8862f" ${S2}/>
        <circle cx="60" cy="42" r="2" fill="${INK}"/>
        <path d="M34 60c6 5 14 5 19 0" fill="none" ${S2}/>
      </g>
      <g class="wave"><path d="M-20 72q5-5 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0" fill="none" stroke="#3d74c4" stroke-width="3" stroke-linecap="round"/></g>
      <g class="wave w2"><path d="M-20 84q5-4 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0" fill="none" stroke="#3d74c4" stroke-width="2.4" stroke-linecap="round" opacity=".7"/></g>`,
    css: `
      .art-duck .d1 { transform-origin: 50% 90%; animation: duck-bob 1.8s ease-in-out infinite alternate; }
      .art-duck .wave { animation: wave 1.6s linear infinite; }
      .art-duck .w2 { animation-duration: 2.4s; animation-direction: reverse; }
      @keyframes duck-bob { from { transform: translateY(1px) rotate(-4deg); } to { transform: translateY(-2px) rotate(4deg); } }
      @keyframes wave { from { transform: translateX(0); } to { transform: translateX(20px); } }`,
  },

  fog: {
    svg: `
      <path d="M22 84V52M78 84V48" ${S}/>
      <path d="M12 64l10-20 10 20zM68 60l10-22 10 22z" fill="#3c8c50" ${S}/>
      <path d="M4 84h92" ${S}/>
      <rect class="fog f1" x="-14" y="30" width="80" height="13" rx="6.5" fill="#fff" opacity=".92" ${S2}/>
      <rect class="fog f2" x="34" y="50" width="80" height="13" rx="6.5" fill="#fff" opacity=".92" ${S2}/>
      <rect class="fog f3" x="-6" y="68" width="72" height="12" rx="6" fill="#fff" opacity=".92" ${S2}/>`,
    css: `
      .art-fog .f1 { animation: fog-drift 5s ease-in-out infinite alternate; }
      .art-fog .f2 { animation: fog-drift 6.5s ease-in-out infinite alternate-reverse; }
      .art-fog .f3 { animation: fog-drift 4.2s ease-in-out infinite alternate; }
      @keyframes fog-drift { from { transform: translateX(-8px); } to { transform: translateX(12px); } }`,
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

  "snake-crown": { // the Snake Leader
    svg: `
      <path d="M14 86c18 0 22-14 36-14s18-12 6-17-10-16 8-17" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 86c18 0 22-14 36-14s18-12 6-17-10-16 8-17" fill="none" stroke="#e8862f" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 86c18 0 22-14 36-14s18-12 6-17-10-16 8-17" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round"/>
      <g class="tongue"><path d="M78 38h8l3-3M86 38l3 3" fill="none" stroke="#d8433b" stroke-width="2" stroke-linecap="round"/></g>
      <ellipse cx="68" cy="38" rx="11" ry="8.5" fill="#e8862f" ${S}/>
      <circle cx="71" cy="35" r="2.6" fill="#fff"/><circle cx="72" cy="35" r="1.3" fill="${INK}"/>
      <g class="crown"><path d="M57 29l2-13 7 7 4-10 4 10 7-7 2 13z" fill="#f2c230" ${S}/><circle cx="70" cy="23" r="2.4" fill="#d8433b"/></g>
      <path class="spark s1" d="M88 10l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff6b0" ${S2}/>
      <path class="spark s2" d="M48 10l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill="#fff6b0" ${S2}/>`,
    css: `
      .art-snake-crown .tongue { transform-origin: 0% 50%; animation: tongue 2.2s infinite; }
      .art-snake-crown .crown { animation: crown-bob 1.6s ease-in-out infinite alternate; }
      .art-snake-crown .spark { animation: sparkle 1.8s ease-in-out infinite; }
      .art-snake-crown .s2 { animation-delay: -.9s; }
      @keyframes tongue { 0%, 70%, 100% { transform: scaleX(0); } 78%, 90% { transform: scaleX(1); } }
      @keyframes crown-bob { from { transform: translateY(0) rotate(-3deg); } to { transform: translateY(-2px) rotate(3deg); } }
      @keyframes sparkle { 0%, 100% { transform: scale(.3) rotate(0); opacity: 0; } 50% { transform: scale(1) rotate(45deg); opacity: 1; } }`,
  },

  key: {
    svg: `
      <g class="jingle">
        <circle cx="32" cy="42" r="15" fill="#f2c230" ${S}/>
        <circle cx="32" cy="42" r="5" fill="#f7f1e3" ${S2}/>
        <path d="M47 42h38M77 42v12M68 42v9" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M47 42h38M77 42v12M68 42v9" fill="none" stroke="#f2c230" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <path class="bang" d="M86 70v12M86 89v.5" fill="none" stroke="#d8433b" stroke-width="5" stroke-linecap="round"/>`,
    css: `
      .art-key .jingle { transform-origin: 32% 42%; transform-box: view-box; animation: jingle 1.4s ease-in-out infinite; }
      .art-key .bang { animation: bang 1.4s ease-in-out infinite; }
      @keyframes jingle { 0%, 100% { transform: rotate(0); } 15% { transform: rotate(-14deg); } 30% { transform: rotate(10deg); } 45% { transform: rotate(-6deg); } 60% { transform: rotate(0); } }
      @keyframes bang { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.25); } }`,
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

const keyOnly = ART.key.svg.replace(/<path class="bang"[^>]*\/>/, "");
ART["two-keys"] = { // "Forgot your keys AGAIN!!!"
  svg: `<g transform="translate(2 0) scale(.75)">${keyOnly}</g>`
    + `<g class="k2" transform="translate(16 30) scale(.75)">${keyOnly}</g>`
    + `<path class="bang" d="M80 22v13M80 42v.5M89 22v13M89 42v.5" fill="none" stroke="#d8433b" stroke-width="5" stroke-linecap="round"/>`,
  css: `
    .art-two-keys .jingle { transform-origin: 32% 42%; transform-box: view-box; animation: jingle 1.2s ease-in-out infinite; }
    .art-two-keys .k2 .jingle { animation-delay: -.5s; }
    .art-two-keys .bang { animation: bang 1.2s ease-in-out infinite; }`,
};

/** Every illustration's CSS, to inject once. */
export function artCss(): string {
  return Object.values(ART).map((a) => a.css).join("\n");
}

/** Whether `name` has its own illustration (otherwise `artFor` draws the line icon). */
export const hasArt = (name: string): boolean => name in ART;

/** Inline SVG for an icon name: its illustration, or its line icon with a gentle bob until it has one. */
export function artFor(name: string, label: string): string {
  const a = ART[name];
  if (a) return `<svg class="art art-${name}" viewBox="${a.box ?? "6 6 88 88"}" role="img" aria-label="${label}">${a.svg}</svg>`;
  const d = ICONS[name] ?? ICONS.card;
  return `<svg class="art art-icon" viewBox="0 0 24 24" role="img" aria-label="${label}"><path class="bob" d="${d}" fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
