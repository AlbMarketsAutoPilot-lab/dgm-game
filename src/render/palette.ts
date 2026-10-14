// Colours of the paper board (GCD §14, P6): off-white paper, purple ink, crayon-coloured event squares.
import { BOARDS } from "../engine";
import type { Board, Tile } from "../engine";

export const INK = "#4b2377"; // purple ink: tile borders, numbers, icons
export const INK_SOFT = "rgba(75, 35, 119, 0.55)";
export const PAPER = "#f7f1e3";
export const PAPER_DARK = "#e9dfc8";
export const REWARD = "#2e8b3e"; // marker of a good square (with an up shape, not colour alone)
export const PUNISH = "#c0392b"; // marker of a bad square (with a down shape)

/** Crayon colours named in the transcription of the paper board. */
const CRAYON = {
  teal: "#2aa198",
  purple: "#9b59b6",
  lightBlue: "#7fc8f8",
  blue: "#3d74c4",
  yellowGreen: "#a8c94a",
  greyBrown: "#8d7b68",
  yellow: "#f2c230",
  red: "#d8433b",
  grey: "#9a9a9a",
  greyPurple: "#8e7fa6",
  orange: "#e8862f",
  orangeRed: "#e8562f",
  green: "#4caf50",
  brown: "#8a5a3c",
  darkRed: "#9e2a2b",
  pinkBrown: "#c4848a",
  pink: "#f08bb4",
  darkBlue: "#2a3f7a",
} as const;

/** Long board square → its crayon colour on paper (archived transcription §6). */
const PAPER_COLOURS: Record<number, string> = {
  5: CRAYON.teal, 10: CRAYON.purple, 15: CRAYON.lightBlue, 20: CRAYON.blue, 25: CRAYON.yellowGreen, 30: CRAYON.greyBrown,
  35: CRAYON.yellow, 40: CRAYON.red, 45: CRAYON.grey, 50: CRAYON.greyPurple, 55: CRAYON.purple, 60: CRAYON.orange,
  65: CRAYON.orangeRed, 70: CRAYON.orange, 75: CRAYON.green, 80: CRAYON.brown, 85: CRAYON.yellow, 90: CRAYON.teal,
  95: CRAYON.orange, 97: CRAYON.darkRed, 101: CRAYON.pinkBrown, 108: CRAYON.yellow, 113: CRAYON.orange, 118: CRAYON.green,
  123: CRAYON.teal, 128: CRAYON.purple, 133: CRAYON.orange, 138: CRAYON.orange, 143: CRAYON.yellow, 148: CRAYON.yellow,
  153: CRAYON.brown, 158: CRAYON.yellow, 163: CRAYON.yellow, 168: CRAYON.pink, 173: CRAYON.blue, 178: CRAYON.grey,
  183: CRAYON.brown, 188: CRAYON.blue, 193: CRAYON.orange, 198: CRAYON.purple, 202: CRAYON.darkBlue,
};

/** Shortcut squares (not on paper): the jackpot in green, the fall in the Bog's grey-brown. */
export const SHORTCUT_COLOURS = { R: CRAYON.green, P: CRAYON.greyBrown } as const;

/** Light washes behind the plain squares of each region (GCD §9.2), in the order of the journey. */
export const REGION_WASH = [
  "rgba(240, 160, 120, 0.13)", // Home Town
  "rgba(170, 200, 90, 0.16)", // Countryside
  "rgba(60, 140, 80, 0.13)", // Forest
  "rgba(80, 150, 210, 0.15)", // River & Lake
  "rgba(140, 140, 160, 0.15)", // Mountains
  "rgba(80, 190, 200, 0.15)", // Seaside
  "rgba(200, 120, 170, 0.13)", // Big City
  "rgba(242, 194, 48, 0.18)", // Festival Road
];

/** Crayon colour of an event square. The short board reuses the long board's events, so it reuses their colours. */
export function crayonFor(board: Board, square: number, tile: Tile): string {
  if (board.id === "long") return PAPER_COLOURS[square] ?? CRAYON.grey;
  const long = Object.entries(BOARDS.long.tiles).find(([, t]) => t.story === tile.story);
  return (long && PAPER_COLOURS[Number(long[0])]) ?? CRAYON.grey;
}

/** Index of the region a square belongs to. */
export function regionOf(board: Board, square: number): number {
  const i = board.story.regions.findIndex((r) => square >= r.from && square <= r.to);
  return i < 0 ? 0 : i;
}
