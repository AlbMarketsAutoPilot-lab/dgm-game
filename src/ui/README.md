# Game screen (Steps 3–9, H; rewritten for Step I, the v3 rules, in the audit of 27 Nov 2026)

Every rule comes from the engine (`src/engine/v3`); this folder only shows its events, in order, and answers its
questions (`app.ts`). Rules: `docs/GCD.md` §8.2a; every decision of Step I: `docs/prompts/StepI_destinations.md`, Part 2.

- **Whole board = the info area** (`overview.ts`): a labyrinth spiral of plain paper squares (layout in
  `src/render/layout.ts`), no numbers; green ▲ good squares, red ▼ bad squares, the blue ◆ Swap Market. Home is the long
  square at the top left, the Lantern Festival the golden plaza in the middle. **Tap any square** for what it does
  (`squareInfo`) and, when the next move is one plain throw, which face gets the current player there. Small die faces
  1–5 mark where one throw stops (a 6 always rolls again; a doubled roll marks 2, 4 … 10; none while a 6, exactly 1
  square or a backward move waits: `turn-info.ts`). The tokens are page elements over the drawing (P1).
- **Stage = the action area** (`stage.ts`): the big square with its picture, the token hopping square by square, an
  event's move gliding; sparks, stamps ("Woohoo!", "Ouch!", "Bump!", "Dodged it!", "New postcard!"), the area sign "Now
  entering · Countryside". Above it "Blue's turn", the round and the turn line (`T.where`), and the Bonus card slot; below
  it the die and **only "Roll die"** (or "Roll again" after a 6 that rolls again). A person's tap clears the
  notifications (game time).
- **Mr. Lin's panel** (`guide-panel.ts`): covers the stage and the die, and holds every choice and his story of a
  person's turn (never for robots): the card at Home and at the tree, the card on a punishment or a bad area effect,
  the Swap Market's partner, "Skip this turn", "Pass the die to …" with his words on where the player stands
  (`standing.ts`). It waits for its own button ("I understand" for stories and tips) and opens only once the square's
  stamps and the area sign have been seen. Where there is room it shows the picture of what he speaks about and his
  words as his quote (a cream card with gold quote marks), larger on big panels; smaller, then plain, when space is
  short; on small screens it covers the whole game screen, and nothing scrolls.
- **Notifications** (`notes.ts`): short facts on the left over the board, for everyone (robots included), from the
  destination file's approved patterns; never what Mr. Lin has just said to a person. They fade after a few seconds.
- **Players** (`app.ts`, `render`): round avatars on top (portrait) or on the right (landscape), each with its Bonus
  cards (a faded 0 when none), a robot badge for computer players, and "needs 6" / "needs N" when a 6 or an exact
  face is needed. Tap one for everything about that player.
- **Tips** (`tips.ts`): Mr. Lin's six tips, once per device, to people only, at most one per turn; "How to play"
  shows them again.
- **Continue and Leave** (`save.ts`, U1 / U2): after every turn the seed, the first player and every answer given
  to the engine are saved on this device (version 4); "Continue game" plays the game again up to that turn. "Leave"
  asks first; once left, nothing more of that game happens.
- **The win clock and the Records** (`clock.ts`, `records.ts`, `records-page.ts`): a person's time from leaving Home
  to the finish, only in a game never interrupted; the 10 fastest on this device.
- **Journey postcards** (`postcards.ts`, GCD §12): 17 for the Lantern Festival (6 areas, 11 moments), earned by the
  people at the table from the engine's events, kept only on this device.
- **How to play** (`guide.ts`): eight pages, rules only, each with a picture of the real game screen
  (`src/assets/guide/`, made by `npm run guide:shots`), once per device before the start screen and from "How to play".
- **Start screen** (`setup.ts`): the Lantern Festival's picture where there is room, 2–4 players, each a person or a
  computer player, Continue, Postcards, Records, How to play, the sound switches.
- **Sound and music** (`sound.ts`, `sound-switch.ts`, U7): 17 sounds in `src/assets/sounds/` (CC0, `CREDITS.txt`),
  part of the package; two switches, on by default, kept on the device; the game never waits for a sound.
- **Every screen size**: all sizes in `app.css` are rem; the root size grows on big screens and on tablets held
  upright. Checked at 22 sizes, from a folded phone (280 × 653, and 653 × 280 sideways) to 2560 × 1440
  (`tools/browser/screens.mjs`).
- **Keyboard** (U5): Escape closes the popup on top, the album, the Records and the guide; the board is one Tab stop,
  the arrow keys walk the road, Enter / Space tells what a square does. All text from data is escaped once, in
  `src/render/html.ts` (S3). `?fast` fast-forwards games (development and the browser-test build only, S4).
- **Offline and install (Step 7):** `public/manifest.webmanifest` and `public/sw.js` (only in the built game; it touches
  only its own caches). The built page carries a Content-Security-Policy (`vite.config.ts`, S1).
  `.github/workflows/checks.yml` runs the type check, all tests and the build on every push and pull request.
