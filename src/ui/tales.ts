// The journey's narrative (owner, 15 Oct: "make it real narrative", for young adults first and kids too).
// Owner, 16 Oct: one short sentence each (the popups came too fast to read); popups show the rule first.
// One short tale per event square (keyed by its picture, so the short board reuses the long board's tales), and per
// rule moment. The board files keep their approved one-liners; the game tells these.
// What the square DOES is never written here: `outcome()` derives it from the engine's tile, so it always matches
// the rules.
import type { Board, Pos, Tile } from "../engine";
import { esc } from "../render/html";

export interface Tale {
  title: string;
  text: string;
}

/** Event squares, by picture name. */
export const SQUARE_TALES: Record<string, Tale> = {
  shoelace: { title: "Shoelace Situation", text: "Your shoelace comes undone. You stop to tie it." },
  "door-key": { title: "Did You Lock the Door?", text: "You did. You go back to check anyway." },
  puddle: { title: "Not a Puddle", text: "It was a small lake. One shoe is soaked." },
  tractor: { title: "Farm Taxi", text: "A farmer offers you a ride on his trailer. Hop on!" },
  sheep: { title: "Rush Hour, Rural Edition", text: "Two hundred sheep cross the lane. You wait." },
  "boot-in-mud": { title: "The Bog", text: "The mud grabs your boots and won't let go." },
  "hay-cart": { title: "The Hay Cart", text: "A hay cart rolls past. You ride along, goat included." },
  balloon: { title: "Up, Up and Away", text: "A balloon pilot has one seat left. Up you go!" },
  bicycle: { title: "Gravity Bike", text: "A bike at the top of the hill. Gravity does the rest." },
  fog: { title: "The Fog", text: "Thick fog. You sit down and wait for it to clear." },
  train: { title: "The On-Time Train", text: "The train is on time, for once. Window seat!" },
  card: { title: "A Kind Stranger", text: "A stranger hands you a card: \"You'll know when to use it.\"" },
  signpost: { title: "Local Knowledge", text: "A local points the way. Locals are always right." },
  "broken-train": { title: "Cancelled", text: "Your train is cancelled. Back to the last station." },
  "swap-arrows": { title: "Plot Twist", text: "A mixed-up ticket puts you on the leader's train." },
  "cable-car": { title: "The Cable Car", text: "The cable car glides up over the treetops." },
  sailboat: { title: "Free Boat Ride", text: "A sailor has a spare seat, and the wind is perfect." },
  boots: { title: "Bog Boots", text: "Bright yellow boots. The Bog won't stop you next time." },
  "big-clock": { title: "The Ferry Timetable", text: "You just missed the ferry. The next one leaves \"shortly\"." },
  "slide-mud": { title: "The Riverbank Selfie", text: "Perfect photo, wet riverbank. Splash: into the Bog." },
  "boat-leaving": { title: "Missed the Boat", text: "The boat pulls away just as you reach the harbour." },
  suitcase: { title: "Spontaneous Weekend", text: "A shuttle bus takes you straight up the mountain." },
  "ski-lift": { title: "Free Ski Lift", text: "The lift attendant waves you through for free." },
  sledge: { title: "Sledge Run", text: "Forty seconds of screaming, one perfect landing." },
  "phone-map": { title: "Trusting the App", text: "The app says turn left. The app is wrong." },
  "crossed-bed": { title: "What Booking?", text: "No booking under your name. The nearest bed is back at Base Camp." },
  "snake-crown": { title: "The Sea Snake", text: "A friendly sea snake offers you a ride. It will remember this favour." },
  "ice-cream": { title: "Ice Cream Break", text: "Three flavours, one cone. Everyone else catches up." },
  ferry: { title: "Wrong Ferry", text: "Wrong harbour! The ferry drops you at the edge of the Bog." },
  waves: { title: "Waiting for the Tide", text: "The road is under water. You wait for the tide." },
  "snake-down": { title: "The Undertow", text: "The current carries you a long, long way back." },
  "traffic-light": { title: "The Green Wave", text: "Every traffic light turns green as you arrive." },
  bunting: { title: "Saved You a Spot", text: "Friends saved you a spot at the Fair. Run!" },
  scooter: { title: "The Last E-Scooter", text: "One e-scooter left, battery at 12%. Enough!" },
  ticket: { title: "The Ticket", text: "Your ticket is on a café table, eleven streets back." },
  "sleeping-face": { title: "Asleep on the Train", text: "You nod off for a second and wake up at the river." },
  "train-back": { title: "Missed Your Stop", text: "You missed your stop. The train goes all the way back." },
  key: { title: "Forgot Your Keys", text: "Your keys are at Central Station, next to your coffee." },
  "two-keys": { title: "Forgot Your Keys AGAIN!!!", text: "You had them. Now they're gone again." },
};

/** The last square of each board: only the Snake Leader's ride back. */
export const SNAKE_BACK: Tale = { title: "The Sea Snake Returns", text: "The sea snake is back for its ride. A deal is a deal." };

/** Rule moments (R1–R21) and places. `{p}` = the player, `{o}` = another player, `{n}` = a number. */
export const MOMENTS = {
  home: { title: "Home", text: "Bags packed, door locked. A 6 gets you on the road." },
  start: { title: "Start", text: "Where the journey begins, and where bumped players come back." },
  end: { title: "The Festival of Lights", text: "Lanterns, music and everyone you love. The journey ends here." },
  win: { title: "{p} made it!", text: "{p} walks into the Festival of Lights. Well done!" },
  nobody: { title: "Nobody made it", text: "The road was too long this time. Maybe next game." },
  porch: { title: "Still on the Porch", text: "No 6 yet. Still on the porch." },
  stones: { title: "Still Stuck", text: "No 6. The mud holds on." },
  leaveHome: { title: "Off You Go!", text: "A 6! Off you go. Throw again to move." },
  leaveBog: { title: "Free!", text: "A 6! The Bog lets go. Throw again to move." },
  paidHome: { title: "A Lantern for the Road", text: "{p} spends a lantern to set off at once. Now throw to move." },
  paidBog: { title: "A Lantern for a Way Out", text: "{p} spends a lantern to get out of the Bog. Now throw to move." },
  thirdThrow: { title: "Third Time Lucky", text: "No 6 in three throws: you set off anyway with this throw." },
  lanternLost: { title: "A Lantern Goes Out", text: "Three throws without a 6: one of {p}'s spare lanterns goes out." },
  shield: { title: "Lantern Shield!", text: "{p} spends a spare lantern. The bad luck is cancelled." },
  lastLantern: { title: "Your Last Lantern", text: "You can't spend your last lantern: you need it to light at the festival. Keep rolling till you get a 6." },
  lanternWon: { title: "Lantern Relit!", text: "Three 6s in a row light one of {p}'s lanterns again." },
  tree: { title: "Fallen Tree", text: "A fallen tree blocks the road. Back you go." },
  bogged: { title: "Stuck in the Bog", text: "The mud closes round your ankles." },
  boots: { title: "Bog Boots!", text: "Your Bog boots carry you straight through." },
  capture: { title: "Bump!", text: "{p} lands on {o}'s square." },
  swap: { title: "Swap!", text: "{p} and {o} trade places." },
  overshoot: { title: "Too Far!", text: "The festival is right there, but you need exactly {n}." },
  wait: { title: "Waiting", text: "{p} sits this turn out." },
  doubled: { title: "Ice Cream Break", text: "While {p} eats ice cream, everyone else's next throw counts double." },
  snakeLeader: { title: "Snake Leader", text: "{p} rode the sea snake and wears its crown." },
  bonusDefend: { title: "Dodged!", text: "{p} plays the Bonus card. The bad luck slides off." },
  bonusAttack: { title: "Spoiled!", text: "{p} plays the Bonus card on {o}. That luck is cancelled." },
} satisfies Record<string, Tale>;

/** A moment's text with its names and numbers filled in (as text: escaped, S3). */
export const fill = (s: string, v: { p?: string; o?: string; n?: number | string }) =>
  s.replace(/\{p\}/g, esc(v.p)).replace(/\{o\}/g, esc(v.o)).replace(/\{n\}/g, esc(v.n));

/** What a square does, in plain words, from the engine's tile. */
export function outcome(board: Board, t: Tile): string {
  const place = (n: number) => (n === 0 ? "Start" : `square ${n}`);
  const trap = board.story.trap.tile;
  switch (t.type) {
    case "skip": return t.turns === 1 ? "Miss your next turn." : `Miss ${t.turns} turns.`;
    case "hospital": return `Miss ${t.turns} turns.`;
    case "prison": return "Stuck in the Bog: roll a 6 to get out, or spend a spare lantern.";
    case "slowNext": return "Next turn you move exactly 1 square, whatever you roll.";
    case "card": return t.card === "jailPass" ? "You get Bog boots: walk straight through the Bog, once." : "You get a Bonus card: cancel your own bad luck, or another player's good luck, once.";
    case "doubleOthers": return "Every other player doubles their next throw.";
    case "extraRoll": return "Throw again!";
    case "rollSum": return `Throw ${t.dice} times and move the total.`;
    case "nearest": return t.target === "R" ? "Move ahead to the next good square, and it works for you." : "Move ahead to the next bad square, and it gets you.";
    case "swapLeader": return "Swap places with the leader.";
    case "jump": {
      const where = t.to === trap ? "the Bog" : place(t.to!);
      let s = t.requires === "snakeLeader" ? `Only the Snake Leader: back to ${where}. Everyone else is safe here.` : `${t.cat === "R" ? "Jump ahead" : "Back"} to ${where}.`;
      if (t.then === "prison") s += " Stuck there: roll a 6 to get out, or spend a spare lantern.";
      if (t.then === "hospital") s += " Then miss 3 turns.";
      if (t.then === "skip2") s += " Then miss 2 turns.";
      if (t.grant === "snakeLeader") s += " You become the Snake Leader.";
      return s;
    }
  }
}

/** What a square does, as a computer player's note says it (owner, 16 Oct: rules only, no story): "stuck until a 6". */
export function brief(board: Board, t: Tile): string {
  const place = (n: number) => (n === 0 ? "Start" : `square ${n}`);
  switch (t.type) {
    case "skip": case "hospital": return t.turns === 1 ? "misses the next turn" : `misses ${t.turns} turns`;
    case "prison": return "stuck until a 6";
    case "slowNext": return "moves just 1 square next turn";
    case "card": return t.card === "jailPass" ? "gets the Bog boots" : "gets a Bonus card";
    case "doubleOthers": return "everyone else's next throw counts double";
    case "extraRoll": return "throws again";
    case "rollSum": return `throws ${t.dice} times and moves the total`;
    case "nearest": return t.target === "R" ? "moves ahead to the next good square" : "moves ahead to the next bad square";
    case "swapLeader": return "swaps places with the leader";
    case "jump": {
      const where = t.to === board.story.trap.tile ? "the Bog" : place(t.to!);
      let s = t.requires === "snakeLeader" ? `the snake wants its ride back: back to ${where}` : `${t.cat === "R" ? "jumps ahead" : "back"} to ${where}`;
      if (t.then === "prison") s += ", stuck until a 6";
      if (t.then === "hospital") s += ", then misses 3 turns";
      if (t.then === "skip2") s += ", then misses 2 turns";
      if (t.grant === "snakeLeader") s += ", becomes the Snake Leader";
      return s;
    }
  }
}

/** The tale of an event square. */
export function taleOf(board: Board, pos: Pos): { tale: Tale; tile: Tile; icon: string } | null {
  const t = board.tiles[pos];
  if (!t) return null;
  const icon = t.icon ?? "card";
  const tale = t.requires === "snakeLeader" ? SNAKE_BACK : SQUARE_TALES[icon] ?? { title: "On the Road", text: esc(t.story ?? t.text) }; // board text: escaped (S3)
  return { tale, tile: t, icon };
}
