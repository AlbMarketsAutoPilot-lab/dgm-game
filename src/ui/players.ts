// The four tokens: glossy buttons, each with its own colour AND shape (GCD §8.1, §14: never colour alone).
import { light } from "../render/art";

export interface PlayerStyle {
  name: string;
  colour: string;
  /** A darker shade for text on paper. */
  text: string;
  shape: "round" | "flower" | "square" | "hexagon";
}

export const PLAYERS: PlayerStyle[] = [
  { name: "Blue", colour: "#3d74c4", text: "#24508f", shape: "round" },
  { name: "Red", colour: "#d8433b", text: "#a5261f", shape: "flower" },
  { name: "Green", colour: "#3c9d4f", text: "#24702f", shape: "square" },
  { name: "Yellow", colour: "#f2c230", text: "#8a6a00", shape: "hexagon" },
];

const INK = "#4b2377";

function outline(shape: PlayerStyle["shape"]): string {
  switch (shape) {
    case "round": return `<circle cx="50" cy="50" r="40"/>`;
    case "square": return `<rect x="12" y="12" width="76" height="76" rx="18"/>`;
    case "hexagon": return `<path d="M50 8l37 21v42L50 92 13 71V29z"/>`;
    case "flower": {
      let d = "";
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3, x = 50 + Math.cos(a) * 24, y = 50 + Math.sin(a) * 24;
        d += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20"/>`;
      }
      return d + `<circle cx="50" cy="50" r="28"/>`;
    }
  }
}

/** A token as inline SVG (100 × 100): the button, its rim and four thread holes. `hidden`: the name is written next to it. */
export function tokenSvg(seat: number, cls = "token", hidden = false): string {
  const p = PLAYERS[seat], o = outline(p.shape);
  return light(`<svg class="${cls}" viewBox="0 0 100 100" ${hidden ? `aria-hidden="true"` : `role="img" aria-label="${p.name}"`}>`
    + `<g fill="${INK}" transform="translate(3 4)" opacity=".25">${o}</g>`
    + `<g fill="${p.colour}" stroke="${INK}" stroke-width="5" stroke-linejoin="round">${o}</g>`
    + `<g fill="${p.colour}">${o}</g>`
    + `<circle cx="50" cy="50" r="22" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="3"/>`
    + [[42, 42], [58, 42], [42, 58], [58, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="#f7f1e3" stroke="${INK}" stroke-width="2"/>`).join("")
    + `<path d="M26 32q10-14 26-15" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="6" stroke-linecap="round"/>`
    + `<ellipse cx="62" cy="76" rx="16" ry="6" fill="#000" opacity=".12"/></svg>`);
}
