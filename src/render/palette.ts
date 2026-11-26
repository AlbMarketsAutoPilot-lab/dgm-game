// Colours of the paper board (GCD §14, P6): off-white paper, purple ink, crayon-coloured event squares.

export const INK = "#4b2377"; // purple ink: tile borders, numbers, icons
export const INK_SOFT = "rgba(75, 35, 119, 0.55)";
export const PAPER = "#f7f1e3";
export const PAPER_DARK = "#e9dfc8";
export const REWARD = "#2e8b3e"; // marker of a good square (with an up shape, not colour alone)
export const PUNISH = "#c0392b"; // marker of a bad square (with a down shape)
export const SWAP = "#2f6fc4"; // Step I (owner, 25 Nov 2026): the Swap Market's blue, with a ◆ shape

/** Light washes behind the plain squares of each v3 area (GCD §8.2a R15), in the order of the journey. */
export const AREA_WASH = [
  "rgba(240, 160, 120, 0.13)", // Home Town
  "rgba(170, 200, 90, 0.16)", // Countryside
  "rgba(60, 140, 80, 0.13)", // Forest
  "rgba(140, 140, 160, 0.15)", // Mountains
  "rgba(80, 190, 200, 0.15)", // Seaside
  "rgba(200, 120, 170, 0.13)", // Big City
];

/** The colour of a v3 square's kind: green ▲ reward, red ▼ punishment, blue ◆ the Swap Market. */
export const catColour = (cat: "R" | "P" | "S"): string => (cat === "R" ? REWARD : cat === "P" ? PUNISH : SWAP);
