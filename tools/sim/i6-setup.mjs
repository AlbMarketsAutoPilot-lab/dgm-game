// Step I-6 settings shared by the measurement scripts.
// N3 two roads, tuned so that always taking the wild road is neither better nor worse (checked in i6.mjs).
// Forks sit over the weakest stretches of the paper board (85, 90, 95 and 163-178). The safe road is the paper squares.
export const FORKS = [
  { at: 82, merge: 96, len: 13, tiles: { 2: { cat: "R", type: "jump", to: 100, text: "Wild road: shortcut over the hill" }, 5: { cat: "P", type: "jump", to: 30, then: "prison", text: "Wild road: lost, into the trap" } } },
  { at: 160, merge: 180, len: 19, tiles: { 3: { cat: "R", type: "jump", to: 185, text: "Wild road: shortcut over the hill" }, 7: { cat: "P", type: "jump", to: 30, then: "prison", text: "Wild road: lost, into the trap" } } },
];

// The rules the owner approved in I-6 (14 Oct 2026): waiting stairs, 3 lifelines, the roadblock as a game event and the two roads.
// ("Spend a lifeline" was rejected by the owner after I-6.4.)
export const APPROVED = { stairs: true, lifelines: 3, roadblock: { back: 10, range: 10 }, forks: FORKS };
