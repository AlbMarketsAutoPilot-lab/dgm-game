// The journey's narrative (owner, 15 Oct: "make it real narrative", for young adults first and kids too).
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
  shoelace: { title: "Shoelace Situation", text: "Your left shoelace has been plotting this since breakfast. You kneel on the pavement to double-knot it while a jogger overtakes you with visible smugness." },
  "door-key": { title: "Did You Lock the Door?", text: "Two streets later the thought lands like a bucket of cold water. Did you lock it? You did. You definitely did. You walk all the way back anyway, because otherwise you'll think about it all week." },
  puddle: { title: "Not a Puddle", text: "It looked like a puddle. It was a small lake with ambitions. One shoe is now heavier, colder and noticeably sadder than the other." },
  tractor: { title: "Farm Taxi", text: "A farmer pulls up, nods once and points at the trailer. No small talk, no questions, just diesel and wind in your hair. Honestly, the best taxi you've ever had." },
  sheep: { title: "Rush Hour, Rural Edition", text: "Two hundred sheep cross the lane at their own pace. The dog in charge gives you a look that says: you'll wait. You wait." },
  "boot-in-mud": { title: "The Bog", text: "One step off the path and the ground swallows your boots with a satisfied gurgle. Locals say the Bog lets you go when it's ready. Locals also say it's never ready." },
  "hay-cart": { title: "The Hay Cart", text: "Glamorous? No. Is a goat staring at you the whole ride? Yes. But the cart rolls straight through the countryside while everyone else walks, and you arrive smelling faintly of summer." },
  balloon: { title: "Up, Up and Away", text: "A balloon pilot is one passenger short and very long on enthusiasm. Minutes later the fields shrink to a patchwork quilt and the whole forest drifts by beneath your feet." },
  bicycle: { title: "Gravity Bike", text: "Someone left a rental bike at the top of the hill with a note: 'please return to the bottom'. You're happy to help. Gravity does the rest." },
  fog: { title: "The Fog", text: "The fog rolls in so thick you can't see your own feet. Your map app shows a blue dot spinning in a grey void. You sit on a log, eat your sandwich and wait for the world to come back." },
  train: { title: "The On-Time Train", text: "The board at Forest Station says 'on time', and against all life experience, it is. You get a window seat and watch the pines rush past like a screensaver." },
  card: { title: "A Kind Stranger", text: "A woman at the bus stop presses a card into your hand. 'You'll know when to use it,' she says, and disappears into the crowd. Mysterious. Slightly theatrical. Extremely useful." },
  signpost: { title: "Local Knowledge", text: "A man walking his dog overhears you arguing with your map. 'Not that way,' he says, 'this way.' He's right. Locals are always right." },
  "broken-train": { title: "Cancelled", text: "The screen flickers: CANCELLED. No reason, no apology, just a replacement bus that leaves from the station you left an hour ago." },
  "swap-arrows": { title: "Plot Twist", text: "A wrong platform, a swapped ticket and a stroke of absurd luck: you and the leader end up on each other's train. Neither of you can explain it. Only one of you is smiling." },
  "cable-car": { title: "The Cable Car", text: "The cable car glides up over the treetops, quiet as a held breath. Below you: the river, the lake, the whole valley. Above you: the Mountain Lodge and a very good hot chocolate." },
  sailboat: { title: "Free Boat Ride", text: "A sailor with a spare seat and a suspicious amount of sea shanties offers you a ride. The wind is perfect. The harbour arrives far too soon." },
  boots: { title: "Bog Boots", text: "Bright yellow boots, two sizes too big and absolutely perfect. Next time the Bog tries to swallow you, it gets a mouthful of rubber instead." },
  "big-clock": { title: "The Ferry Timetable", text: "The river ferry left four minutes ago. The next one, says a timetable last updated in another decade, leaves 'shortly'. You sit on the pier and watch the clock." },
  "slide-mud": { title: "The Riverbank Selfie", text: "The light was perfect. The angle was perfect. The riverbank was wet. The photo is now a blur of sky, and the Bog is your new postcode." },
  "boat-leaving": { title: "Missed the Boat", text: "You reach the harbour just in time to watch the boat pull away. Someone on deck waves. You wave back, because what else can you do?" },
  suitcase: { title: "Spontaneous Weekend", text: "You look at your bag, look at the calendar, and decide life is short. A shuttle bus takes you straight up the mountain, no questions asked." },
  "ski-lift": { title: "Free Ski Lift", text: "The lift attendant waves you through without a ticket. Every little helps, and the view is free too." },
  sledge: { title: "Sledge Run", text: "Three seconds of courage, forty seconds of screaming and one perfect landing in deep snow. You'd do it again. Right now, in fact." },
  "phone-map": { title: "Trusting the App", text: "The app says 'turn left'. You know it's wrong. You've always known. You turn left anyway, because the little blue arrow sounded so confident." },
  "crossed-bed": { title: "What Booking?", text: "The lodge receptionist types, frowns, types again. 'There's no booking under that name.' The nearest free bed is all the way back at Base Camp." },
  "snake-crown": { title: "The Sea Snake", text: "A huge, friendly sea snake surfaces beside the pier and offers you a ride along the coast. You'd be mad to refuse. Hold on tight. It will remember this favour." },
  "ice-cream": { title: "Ice Cream Break", text: "Three flavours, one cone, zero regrets. While you queue and choose, and choose again, everyone else quietly makes up ground." },
  ferry: { title: "Wrong Ferry", text: "It said 'Harbour'. It meant the other harbour. The ferry chugs back across the bay and drops you, of all places, at the edge of the Bog." },
  waves: { title: "Waiting for the Tide", text: "The causeway is under water. The tide table says soon. The seagulls laugh at you in a way that feels personal." },
  "snake-down": { title: "The Undertow", text: "You only went in for a paddle. The current had other plans and carries you a long, long way back, past everything you were proud of." },
  "traffic-light": { title: "The Green Wave", text: "Every traffic light turns green as you arrive, as if the city rolled out a carpet just for you. Don't question it. Keep moving." },
  bunting: { title: "Saved You a Spot", text: "Your phone buzzes: 'We're at the Fair, front row, come NOW.' Friends who save you a spot are rare. Run." },
  scooter: { title: "The Last E-Scooter", text: "One scooter left on the whole street, battery at 12%. That's enough. You zoom across the city like the main character you are." },
  ticket: { title: "The Ticket", text: "At the gate you pat every pocket twice. The ticket is on the café table, eleven streets back, under your empty cup." },
  "sleeping-face": { title: "Asleep on the Train", text: "You close your eyes for one second. You open them at the river, the carriage empty, a conductor gently tapping your shoulder." },
  "train-back": { title: "Missed Your Stop", text: "The announcement was a whisper; you were deep in a podcast. The train rolls on and on, all the way back to the seaside." },
  key: { title: "Forgot Your Keys", text: "Festival lights already glow on the horizon when you reach for your keys. Nothing. They're at Central Station, next to your half-finished coffee." },
  "two-keys": { title: "Forgot Your Keys AGAIN!!!", text: "You went back. You had them. And now they're gone again. The café staff recognise you and don't even say anything. They just point." },
};

/** The last square of each board: only the Snake Leader's ride back. */
export const SNAKE_BACK: Tale = { title: "The Sea Snake Returns", text: "The festival is right there when the sea snake surfaces beside you. It gave you a ride once. A deal is a deal." };

/** Rule moments (R1–R21) and places. `{p}` = the player, `{o}` = another player, `{n}` = a number. */
export const MOMENTS = {
  home: { title: "Home", text: "Bags packed, lights off, door locked (probably). The Festival of Lights is a long way off. A 6 gets you out of the door." },
  start: { title: "Start", text: "The first step of the journey. Everyone who has left home waits here, and anyone bumped off the road comes back here too." },
  end: { title: "The Festival of Lights", text: "Thousands of lanterns rise over the square. Music, food stalls and everyone you love. This is where the journey ends." },
  win: { title: "{p} made it!", text: "Thousands of lanterns rise over the square as {p} walks into the Festival of Lights. Music, food stalls, and a very well-earned sit-down." },
  winLast: { title: "{p} wins!", text: "Everyone else's lanterns have gone out. {p} is the last one still on the road, and the festival is theirs." },
  nobody: { title: "Nobody made it", text: "All the lanterns went out. The festival will have to wait for another night." },
  porch: { title: "Still on the Porch", text: "No 6. You check the weather, retie a shoe, go back for a jumper. The door is still open behind you." },
  stones: { title: "Still Stuck", text: "No 6. The mud holds on with a little gurgle. The Bog is patient. So are you. Mostly." },
  leaveHome: { title: "Off You Go!", text: "A 6! The door clicks shut behind you and the road opens up. Throw again." },
  leaveBog: { title: "Free!", text: "A 6! The Bog lets go with a disappointed slurp. Throw again." },
  paidHome: { title: "A Lantern for the Road", text: "{p} doesn't wait for a 6: one lantern is traded for an early start, and off {p} goes. Now throw to move." },
  paidBog: { title: "A Lantern for a Way Out", text: "{p} doesn't wait for a 6: one lantern lights the way out of the mud. Now throw to move." },
  thirdThrow: { title: "Third Time Lucky", text: "Three throws and still no 6, but you're not waiting any longer. You set off anyway, and that third throw moves you." },
  lanternLost: { title: "A Lantern Goes Out", text: "Three throws without a 6. One of {p}'s lanterns flickers and goes dark. Look after the ones that are left." },
  lanternNone: { title: "Last Light", text: "Attention! {p} has no lanterns left. One more slip and the journey is over." },
  lanternWon: { title: "Lantern Relit!", text: "Three 6s in a row. Something like that doesn't go unnoticed: one of {p}'s lanterns flares back to life." },
  out: { title: "Lights Out", text: "{p}'s last lantern goes out. The journey ends here, but the festival will still be there next time." },
  tree: { title: "Fallen Tree", text: "A tree lies across the road. Nobody is moving it, nobody has a saw, and there's no way round. Back you go." },
  bogged: { title: "Stuck in the Bog", text: "The mud closes round your ankles. A 6 will get you out, or a lantern spent." },
  boots: { title: "Bog Boots!", text: "The Bog tries its usual trick, and gets a mouthful of yellow rubber. Your Bog boots carry you straight through." },
  capture: { title: "Bump!", text: "{p} lands right where {o} was standing. Apologies are made, luggage is picked up, and {o} goes back to Start." },
  swap: { title: "Swap!", text: "{p} and {o} trade places. One of you will be telling this story for weeks." },
  overshoot: { title: "Too Far!", text: "The festival is right there, but you'd walk straight past it. You need exactly {n}." },
  wait: { title: "Waiting", text: "{p} sits this turn out." },
  doubled: { title: "Ice Cream Break", text: "While {p} enjoys the ice cream, every other traveller's next throw counts double." },
  snakeLeader: { title: "Snake Leader", text: "{p} rode the sea snake and wears its crown now. Careful: on the very last square, the snake wants its ride back." },
  bonusDefend: { title: "Dodged!", text: "{p} plays the Bonus card. The bad luck slides right off." },
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
    case "prison": return "Stuck in the Bog: a 6 gets you out, or spend a lantern.";
    case "slowNext": return "Next turn you move exactly 1 square, whatever you roll.";
    case "card": return t.card === "jailPass" ? "You get Bog boots: when the Bog would catch you, you can wear them and walk straight through, once." : "You get a Bonus card. With this card you have the power to cancel a punishment for yourself or cancel a reward for another player. Use any time at your will.";
    case "doubleOthers": return "Every other player doubles their next throw.";
    case "extraRoll": return "Throw again!";
    case "rollSum": return `Throw ${t.dice} times and move the total.`;
    case "nearest": return t.target === "R" ? "Move ahead to the next good square, and it works for you." : "Move ahead to the next bad square, and it gets you.";
    case "swapLeader": return "Swap places with the leader.";
    case "jump": {
      const where = t.to === trap ? "the Bog" : place(t.to!);
      let s = t.requires === "snakeLeader" ? `Only the Snake Leader: back to ${where}. Everyone else is safe here.` : `${t.cat === "R" ? "Jump ahead" : "Back"} to ${where}.`;
      if (t.then === "prison") s += " Stuck there: a 6 gets you out, or spend a lantern.";
      if (t.then === "hospital") s += " Then miss 3 turns.";
      if (t.then === "skip2") s += " Then miss 2 turns.";
      if (t.grant === "snakeLeader") s += " You become the Snake Leader.";
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
