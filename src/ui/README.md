# Game screen (Steps 3–5, owner's design of 14–15 Oct)

Two areas plus the players:

- **Whole board = the info area** (`overview.ts`): a labyrinth spiral of plain paper squares filling the whole panel
  (layout in `src/render/layout.ts`), thin ink walls between the rings, no numbers, no colours, no lines, no legend.
  Good squares have a green frame and ▲, bad squares a red frame and ▼. (No Shortcut and no stair steps since the owner's
  rules of 15 Oct; their screen code was removed, C2; a board with a Shortcut is refused.) Start is four squares long at the top left (everyone waits there); the festival (gold, a star) is in the
  middle. **Tap any square** to see its tale, what it does and which throw gets the current player there; on the long
  board the first tap zooms in ("Whole board" zooms out). Small die faces 1–5 mark where one throw stops (a 6 always
  throws again; a doubled throw marks 2, 4 … 10 squares; none on the Puddle). The tokens are page elements laid over
  the drawing, so their glide runs on the graphics chip (P1, owner approved 15 Oct: the whole board was repainted on
  every frame of every hop before).
- **Stage = the action area** (`stage.ts`): the big square with its animated illustration, the token hopping square
  by square, jumps gliding; sparks, a stamp ("Lucky!", "Don't get mad!"), a jolt for bad luck, confetti for the win,
  the Bonus card flying in when it is played. Above it, whose turn it is and their hand of cards: Bonus card and
  Bog boots are always shown (grey until held, glowing when held), plus the Snake Leader crown; tap a card to see what
  it does and where to get it. Below it, the die (tap it) and one big action button.
- **Popups** (`popup.ts`) over the whole board: every story moment, choice and the win. A story popup stays until the
  next one replaces it, or until it is closed with ✕; the moments earlier in the same turn are listed under it. A
  choice is explained in the popup; its buttons wait in the action area.
- **Players** (`app.ts`): round avatars on top (portrait) or on the right (landscape), with lanterns and cards (a computer player wears a small robot badge); tap one
  for everything about that player (place, squares to go, cards, waiting, a tip for the next throw).
- **Narrative** (`tales.ts`): a tale per event square and rule moment, for young adults first. What a
  square does is always derived from the engine's tile (`outcome()`), never written by hand.
- **Turn** (`app.ts`): Roll (or tap the die) → the move → what happens. A person throws every die themselves: after a
  6 a popup ("A 6! Roll again!") and a "Roll again" button; "Throw 1 of 3" on the sledge square. The die is passed ("Pass the die to Red ▶") only from one person to another; computer players
  (GCD §8.6) play by themselves. A line under "Blue's turn" says what the turn is about (At Home: roll a 6…, Stuck in
  the Bog…, Needs exactly 4…); a waiting player is told why ("landed on …, which says miss turns"). The game opens
  with the first player drawn at random (the avatars light up in turn and stop on them; "Red starts!"; U3, owner
  approved 15 Oct), then "You need a 6 to enter". Only the newest story moment is shown (no list of earlier ones, owner).
- **Continue and Leave** (`save.ts`, U1 / U2, owner approved 15 Oct): after every turn the seed, the first player and
  every answer given to the engine are saved on this device; "Continue game" on the start screen plays the game again
  up to that turn (a changed board file or engine version refuses the save instead). Reloading mid-turn brings back
  the start of that turn with the same throws. "Leave" (players' bar) asks first, then goes to the start screen; the
  game stays saved. A finished game is no longer saved.
- **Die** (`dice.ts`): the total beside the die is exactly the squares walked; the 6 that lets you in (or out of the
  Bog) is shown apart ("6 to enter · 2", R15).
- **Regions** (`stage.ts`): a plain square shows its region's postcard picture; a signboard "Now entering ·
  Countryside" when a token reaches a new region. Everyone's avatar shows "needs 4" when an exact throw of 1–5 wins.
- **Spoil question** (`spoil.ts`, R14, owner Step 5b): a person holding a Bonus card is asked "Spoil Blue's luck?"
  for each reward another player lands on: "Spoil it!", "Let it go", or "Don't ask me again this game" (from then
  on that person's answer is "Let it go"; for this game only, saved with the game). Also in a computer player's turn. No auto-focus: the game is played by tapping, not by holding Enter.

- **Stamps** (`stage.ts`): a big word on the square for the big moments ("Woohoo!", "Ouch!", "Bump!", "Dodged it!",
  "New postcard!", …), one at a time; never in the popups (owner).
- **Journey postcards** (`postcards.ts`, GCD §12): 8 regions + 8 special moments, earned by the people at the table
  (not computer players) from the engine's events, kept only on this device (`localStorage`, every access in
  try / catch; blocked storage = no album, same game). "New postcard!" stamp when one is earned; the win popup names
  the new ones; the album opens from the start screen ("Postcards · 5 / 16") and the win popup.

**Choices** (owner, 15 Oct): at Home or in the Bog with a lantern left, a person picks "Roll for a 6" or "Spend a
lantern and go"; the Bog boots are offered ("Wear your Bog boots?"), as the Bonus card is. A story popup stays up long
enough to read (about 4 words a second, 1.5–5 s) before the next one replaces it, with an hourglass turning where the
buttons go meanwhile.

**How to play** (`guide.ts`, owner 15 Oct): four short pages, once per device before the start screen, and from "How
to play" on the start screen (texts: draft for the owner's approval). **Keyboard** (U5): Escape closes the popup on
top, the album and the guide; the whole board is one Tab stop, the arrow keys walk the road, Enter / Space tells what a
square does. All text from data is escaped once, in `src/render/html.ts` (S3).

**Sound and music** (`sound.ts`, `sound-switch.ts`, U7, sounds chosen by the owner 15 Oct): 16 effects and two
music pieces in `src/assets/sounds/` (CC0, sources in `CREDITS.txt`), part of the game's package like its scripts
and fonts: the Android app carries them, and the offline worker stores them with every other file when the game is
installed, so sound works fully offline. Two switches, both **on by default** (owner, 15 Oct), each mutes at will, the choice kept on the device:
sound effects (with a buzz on phones) and music. On the start screen beside "Let's go!", and in the game behind the
speaker beside the die. Web Audio; the sound starts, and all sounds are prepared, at the first tap (browsers allow sound only then); the game never waits for a
sound; quiet when the app is in the background.

**Every screen size** (owner, 15 Oct): all sizes in `app.css` are rem, and the root size grows on big screens (PC).
A popup that does not fit over the board moves over everything above the controls (or the whole screen, when it has
its own buttons), then gets compact with only its words scrolling; its buttons are never cut (`popup.ts`, `fit`). The
start screen fits without scrolling in one column (portrait) or two (wider than tall). The turn panel sizes itself by
its own width (container query). Checked at 19 sizes from 280 × 653 to 2560 × 1440: see
`docs/analysis/audit-code-2026-10-15.md` §6.

Every rule comes from the engine (`src/engine`); this folder only shows its events and answers its decisions.
Accessibility: tokens differ by colour and shape, good/bad by colour and ▲/▼, big buttons, no timers for people,
"reduce motion" stops the animations (reading pauses stay). `?fast` in the address fast-forwards games (testing; development and the browser-test build only, S4).

**Offline and install (Step 7):** `public/manifest.webmanifest` (name, colours, icons in `public/icons/`, drawn from the
four tokens) and `public/sw.js` (only in the built game: pages network-first, everything else cache-first; the page
hands over the files it loaded before the worker took charge). `.github/workflows/pages.yml` tests, builds and
publishes `dist/` to GitHub Pages on every push to `main`. The worker touches only its own caches (`dgm-…`): on GitHub
Pages all projects of an account share one address. The built page carries a Content-Security-Policy (only the
game's own files; `vite.config.ts`, S1). `.github/workflows/checks.yml` runs typecheck, all tests, the 100,000-game
check and the build on every push and pull request, and weekly (C1).
