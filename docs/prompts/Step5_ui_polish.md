# Prompt for Step 5: UI polish (accessibility, the "use your card?" flow, journey postcards)

> Paste into a **new Claude Code session, Medium effort**:
> **"Do Step 5 using docs/prompts/Step5_ui_polish.md"**

---

## Your role and the working rules (read first, they are strict)

You are the front-end developer of *Don't Get Mad!*, a free family race game (web + Android). Resources are scarce
(Claude Pro allowance), so work lean.

1. **Start from the right code.** The game screen (`src/ui/`) and the illustrations (`src/render/art*.ts`) were
   built in Steps 3–4. Check that your branch contains `src/ui/app.ts` and `src/render/art-kit.ts`. If it does not,
   stop and tell the owner that Steps 3–4 (branch `claude/amazing-meitner-8orxea`) must be merged into `main` first.
2. **Read before acting:**
   - `docs/GCD.md`: hard conditions C1–C3 (§3), pillars (§5, especially P5 "one more game" and P6 hand-made soul),
     the rules R14 (bonus card) and R21 (the only choices) in §8.2a–b, the computer player (§8.6), the story (§9.2),
     replay pull (§12), presentation and accessibility (§14).
   - `docs/PROJECT_PLAN.md` (Step 5 row) and the notes `src/ui/README.md`, `src/render/README.md`,
     `src/engine/README.md`.
   - The code you will change: `src/ui/app.ts` (turn flow, prompts, player bar), `src/ui/stage.ts`,
     `src/ui/overview.ts`, `src/ui/setup.ts`, `src/ui/app.css`, `src/render/art.ts` + `art-kit.ts`.
3. **The rules R1–R21 are FROZEN** and live only in the engine (`src/engine/`). The UI never decides a rule; it
   shows the engine's events and answers its `Decision`s. Do not change the engine or the board files. If a
   polish idea needs a rule change, it is a question for the owner, not a change.
4. **Never assume.** Anything not written in the GCD or decided by the owner below is a question. Give one
   recommendation per question, not a list of options.
5. **Work in the three parts below, and stop after each part** with a short report, screenshots or a short video,
   and the questions. Wait for the owner's confirmation before the next part.
6. **Keep answers short and in plain language.**
7. **Verify in the real app, not only in tests** (see "How to check your work").

## What the owner has already decided (do not break these)

- **Screen design (14 Oct):** two panels. The whole board (squares only, no numbers, the tokens) is on top in
  portrait / on the left in landscape. The stage (one big square with its animated illustration) is at the
  bottom / on the right. A throw walks square by square (the token hops); event jumps glide; then
  "Blue's turn is over" → **OK** → the next player rolls.
- **Illustrations:** every picture in the game must be a **real animated SVG illustration** (filled shapes with
  motion), **never a line icon**. The owner loves them ("that's the beauty of this game"). New pictures follow
  the shared kit in `src/render/art-kit.ts` (palette, ink outline, shared motions) and must pass
  `test/render.test.ts`.
- **Accessibility (GCD §14):** every event has a colour **and** a picture; tokens differ by colour **and** button
  shape; big buttons; one-tap play; high contrast; reduced motion; **no timers** for people; **no read-aloud**
  (owner, I-7).
- **C1:** cost 0, no accounts, no data leaves the device, works offline. **C2:** family-safe content. **C3:** not
  childish, grown-up voice (the story texts in the board files are approved; new texts need the owner's OK).
- **Computer players** play as the measured simple player (GCD §8.6): Main Road, bonus card on their own next
  punishment, never against another player.

## Part 1: accessibility check (report first, then fix)

Check the game screen, the start screen and the win screen against GCD §14, on a phone held upright (390 × 844),
a phone held sideways (844 × 390) and a desktop window:

- **Contrast:** text and markers on paper and on the crayon colours (captions in good / bad colours, the number on
  event cards, the destination chip, the player bar). Aim for WCAG AA (4.5:1 for text, 3:1 for large text and
  shapes). Measure; do not guess.
- **Touch targets** of at least 44 × 44 px, nothing that needs precise tapping. One tap per action.
- **Keyboard and screen readers:** focus is always visible and lands on the next button; the captions and messages
  are announced (`aria-live`); every picture and token has a sensible label.
- **Reduced motion:** with the system setting on, nothing essential is lost and the game stays playable.
- **Small screens:** nothing overlaps or is cut off in landscape on a short phone (360 px tall).
- **Colour-blind check:** the four tokens and the good / bad markers stay distinguishable (they use shapes too).
- **The player bar still uses three line icons** (Bonus card, Bog boots, Snake Leader crown in `src/ui/app.ts`).
  Replace them with small versions of the real illustrations (owner's rule above).
- **High contrast (GCD §14):** report whether the current look meets it. If a separate high-contrast mode is needed,
  propose it as a question (one recommendation) before building it.

Report the findings as a short list (what fails, measured value, fix), fix what is clearly a fix, and ask about
anything that changes the look.

## Part 2: review of the "use your card?" flow (R14)

How it works today (`src/ui/app.ts`, `decide()`):

- **Defend:** a person holding a Bonus card who lands on any punishment is asked "use your Bonus card to dodge
  this?", even for a small one (wait one turn). The engine has already emitted the `tile` event, so the stage shows
  the square, but the question does not say what will happen.
- **Attack:** every other person holding a Bonus card is asked, for **every** reward any player lands on, whether to
  cancel it. With several people this can mean many questions per round.
- **Bog boots** work by themselves. The Bonus card is offered before them on the trap (as measured).

Review and propose (do not change rules):

- The question must show **what the card would dodge or spoil**: the square's picture and its story, and the
  result in plain words (for example "Without the card: back to 24").
- Make the yes / no buttons unmistakable and keep them big.
- Propose how to keep the attack questions from becoming tiring **without changing R14** (the rule allows cancelling
  any other player's reward). For example, a per-player setting "ask me about spoiling others' luck", or asking
  only for big rewards (a long jump forward). Not asking means not offering a choice the rule allows, so this is
  the owner's decision: one recommendation, as a question.
- Show the card being used (a short animation of the card on the stage), and keep the player bar in sync.

## Part 3: journey postcards (GCD §12)

GCD §12 (approved): "one postcard per region or special event, collected over many games ('Snake Leader',
'Forgot keys AGAIN!!!'); it rewards playing again, not winning; stored only on the device."

- **First propose the postcard list** to the owner (one recommendation): for example one per region of each board
  (from `story.regions`) and a few special events that the engine's events can detect (Snake Leader, forgot keys
  AGAIN, the Bog, a Shortcut jackpot, a swap with the leader, reaching the festival). Each postcard uses an existing
  illustration and a one-line text in the approved voice (new texts need the owner's OK).
- Then build it: collect postcards from the engine's events for **every person** at the table (computer players do
  not collect). Show "New postcard!" during or after the game, and an album reachable from the start screen and the
  win screen.
- **Storage:** device only (C1), `localStorage` with every read and write in `try` / `catch`; the game must work
  normally when storage is blocked. No accounts, no network.
- Tests for the pure part (which events earn which postcard).

## How to check your work

- `npm test` (fast tests), `npm run typecheck`, `npm run build`. `npm run test:sim` only if you touch the engine
  (you should not).
- Run the app with `npx vite --port 5173 --strictPort` in the background. **Stop it by port**
  (`kill $(lsof -ti tcp:5173)`), never with `pkill -f vite`: that matches your own shell command and kills it.
- Playwright and Chromium are preinstalled: import from `/opt/node-tools/node_modules/playwright/index.mjs`. Use
  `page.emulateMedia({ reducedMotion: "reduce" })` to fast-forward whole games, and normal motion for screenshots.
  Video: `recordVideo` with the same size as the viewport, then convert with the system `ffmpeg` to MP4.
- `/gallery.html` (dev server) shows every illustration.
- Send the owner screenshots / short videos of each part. Save them in your scratchpad, not in the repository.

## Output

- Code in `src/ui/*` (and `src/render/art*` for the small player-bar pictures), tests in `test/*`.
- `docs/PROJECT_PLAN.md`: mark Step 5 done with a one-line summary; update `src/ui/README.md`.
- Commit and push to your session's branch after each confirmed part. Do not open a pull request unless the owner
  asks.
