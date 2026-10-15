// Development page (npm run dev → /gallery.html): every illustration on its square card, for review.
import "@fontsource/patrick-hand";
import "./ui/app.css";
import { ART, artCss, artFor } from "./render/art";

const style = document.createElement("style");
style.textContent = artCss() + `
  body { background: #f7f1e3; }
  #gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 18px; padding: 16px; }
  figure { margin: 0; text-align: center; font-size: 15px; color: #4b2377; }
  .card { --card: 180px; margin: 0 auto 4px; }`;
document.head.append(style);
document.querySelector("#gallery")!.innerHTML = Object.keys(ART).sort().map((name) =>
  `<figure><div class="card ev" style="--c:#e8c25a"><div class="cart">${artFor(name, name)}</div></div><figcaption>${name}</figcaption></figure>`).join("");

// ?postcards: DRAFT for the owner's approval (Step 5, part 3), not in the game: the proposed postcards and their look.
if (new URLSearchParams(location.search).has("postcards")) {
  const LIST: [string, string, string, string][] = [ // picture, title, line, how you get it
    ["house", "Home Town", "Wish you were here. Actually, you were. You just left.", "Set off from Home"],
    ["sheep", "Countryside", "Fresh air, open fields and a traffic jam of sheep.", "Reach the Countryside"],
    ["train", "Forest", "Tall trees, no signal, and one train actually on time.", "Reach the Forest"],
    ["sailboat", "River & Lake", "Water everywhere, and not one boat waited for us.", "Reach the River & Lake"],
    ["cabin", "Mountains", "The view was worth every step. Mostly.", "Reach the Mountains"],
    ["waves", "Seaside", "Salt in the air, sand in everything.", "Reach the Seaside"],
    ["traffic-light", "Big City", "Bright lights, green lights, no parking.", "Reach the Big City"],
    ["bunting", "Festival Road", "Almost there. You can hear the music.", "Reach Festival Road"],
    ["lanterns", "Festival of Lights", "Made it. Lanterns up!", "Win a game"],
    ["snake-crown", "Snake Leader", "I rode a sea serpent. Ask me how.", "Become the Snake Leader"],
    ["two-keys", "Forgot Keys AGAIN!!!", "Same keys. Same café. Same look from the waiter.", "Land on Forgot your keys AGAIN"],
    ["boot-in-mud", "The Bog", "Greetings from the Bog. Send boots.", "Get stuck in the Bog"],
    ["rope-swing", "Shortcut Jackpot", "Took the Shortcut. It worked. Nobody believes me.", "Hit the jackpot on the Shortcut"],
    ["swap-arrows", "Plot Twist", "Swapped places with the leader. Still smiling.", "Swap places with the leader"],
    ["boots", "Bog Boots", "Walked straight through the Bog. Didn't even look down.", "Bog boots save you"],
    ["lantern", "Three Sixes", "Three sixes in a row. The lantern lit itself.", "Throw three 6s in a row"],
  ];
  style.textContent += `
    body { background: #f7f1e3; } #gallery { grid-template-columns: repeat(2, 330px); justify-content: center; gap: 16px; }
    .pc { position: relative; width: 330px; aspect-ratio: 3 / 2; display: grid; grid-template-columns: 42% 1fr; gap: 10px; padding: 10px;
      background: #fffdf6; border: 3px solid #4b2377; border-radius: 12px; box-shadow: 0 5px 0 rgba(75, 35, 119, .25); color: #4b2377; }
    .pc .pic { border: 3px solid #4b2377; border-radius: 8px; overflow: hidden; background: #f7f1e3; align-self: center; aspect-ratio: 1; }
    .pc .pic .art { width: 100%; height: 100%; display: block; }
    .pc .side { position: relative; display: flex; flex-direction: column; justify-content: center; border-left: 2px dashed rgba(75, 35, 119, .35); padding-left: 10px; }
    .pc h3 { margin: 0; font-weight: normal; font-size: 1.3rem; line-height: 1.05; }
    .pc p { margin: 6px 0 0; font-size: 1rem; line-height: 1.2; }
    .pc .post { position: absolute; right: 0; top: 0; width: 30px; height: 36px; border: 2px dashed #4b2377; border-radius: 3px; background: #f2c230; }
    .pc .mark { position: absolute; right: 22px; top: 22px; width: 34px; height: 34px; border: 2px solid rgba(75, 35, 119, .45); border-radius: 50%; }
    .pc.locked { background: #efe5cf; }
    .pc.locked .pic { opacity: .18; filter: grayscale(1); }
    .pc.locked h3 { opacity: .6; } .pc.locked .post { background: #e0d6c0; }
    .pc .how { font-size: .9rem; opacity: .8; }
    figure figcaption { margin-top: 4px; }`;
  const pc = ([icon, title, line, how]: [string, string, string, string], locked: boolean) =>
    `<div class="pc${locked ? " locked" : ""}"><div class="pic">${artFor(icon, title)}</div><div class="side"><span class="post"></span><span class="mark"></span>`
    + `<h3>${locked ? "?" : title}</h3><p${locked ? ` class="how"` : ""}>${locked ? how : line}</p></div></div>`;
  document.querySelector("#gallery")!.innerHTML = LIST.map((x, i) => `<figure>${pc(x, false)}<figcaption>${i + 1}. ${x[1]} — get it: ${x[3]}</figcaption></figure>`).join("")
    + `<figure>${pc(LIST[5], true)}<figcaption>not collected yet (in the album)</figcaption></figure>`;
}
