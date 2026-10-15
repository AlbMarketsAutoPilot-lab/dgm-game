# Prompt for Step 5b: the "spoil their luck?" setting, and a more grown-up narrative

> Paste into a **new Claude Code session, Medium effort**:
> **"Do Step 5b using docs/prompts/Step5b_spoil_setting_and_narrative.md"**

---

## Your role and the working rules (read first, they are strict)

You are the front-end developer and writer of *Don't Get Mad!*, a free family race game (web + Android). Resources are
scarce (Claude Pro allowance), so work lean.

1. **Never change anything without the owner's approval.** Not the design, not a text, not a behaviour, not "a small
   improvement" you noticed. Propose first (with a screenshot or a table), wait for "approved", then build exactly what
   was approved. If you find a bug while working, report it with your proposed fix and wait. This is the owner's most
   important rule; breaking it has cost a lot of time before.
2. **Read before acting:**
   - `docs/GCD.md`: hard conditions C1–C3 (§3), the rules R14 (bonus card) and R21 in §8.2a–b, the computer player
     (§8.6), the story and its voice (§9.2), presentation (§14).
   - `src/ui/README.md`, `src/render/README.md`, `src/engine/README.md`.
   - The code you will touch: `src/ui/app.ts` (`decide()` / `choose()`, the turn flow), `src/ui/setup.ts` (start
     screen), `src/ui/tales.ts` (the narrative), `src/ui/postcards.ts` (postcard lines), `data/board-long.json` and
     `data/board-short.json` (only the `story` texts).
3. **The rules R1–R21 stay FROZEN** and live only in the engine (`src/engine/`). Do not change the engine. In the board
   files you may change **only** `story` texts (never `cat`, `type`, `to`, `turns`, `then`, `icon` or any rule field);
   `npm test` checks that the rule fields stay identical.
4. **Do not change the design.** The look of the game (paper, purple ink, fonts, layout, the approved pictures, the
   popups, the stamps) is approved as it is. New things adapt to it.
5. **Work in the two parts below, and stop after each part** for the owner's approval. Keep answers short and in plain
   language. Give one recommendation per question, not a list of options.
6. **Verify in the real app, not only in tests** (see "How to check your work").

## What is already decided (do not break)

- Everything delivered in Step 5 (see `docs/PROJECT_PLAN.md`, Step 5 row): labyrinth whole board, popups for every
  story moment, player avatars, the card designs, the grown-up pictures (`src/render/art-modern.ts`), the stamps on the
  square (never in popups), the journey postcards.
- **Computer players** play as the measured simple player (GCD §8.6): they never use the Bonus card against another
  player, so they are never asked anything.
- **C1** cost 0, no accounts, nothing leaves the device. **C2** family-safe: no violence, crime, alcohol, gambling or
  other risky content. **C3** not childish.

## Part A: the "spoil their luck?" setting (R14, the attack use of the Bonus card)

How it works today (`src/ui/app.ts`): every **person** holding a Bonus card is asked, for **every** reward any other
player lands on, "Spoil Blue's luck?" (`bonusAttack` decision). With several people holding cards this can mean many
questions per round, which slows the game and becomes tiring.

R14 allows cancelling any other player's reward, so **not asking means not offering a choice the rule allows**: this is
the owner's decision, and R14 itself must not change.

1. **Measure first:** with the engine (`npm run test:sim` helpers or a small script, not the UI), how many attack
   questions a person gets per game on each board, today. Report the number.
2. **Propose one recommendation** to the owner, with a screenshot mock-up of where it would appear. Ideas to weigh (pick
   one and explain why in two lines):
   - a per-person switch on the start screen, e.g. "Ask me about spoiling others' luck: always / big luck only / never";
   - asking only for big rewards (a jump forward of N squares or more, the Shortcut jackpot, the swap with the leader);
   - remembering "never ask me again this game" from a button in the question itself.
   Whatever is proposed: the default must keep today's behaviour unless the owner decides otherwise, and a person who
   chose "never" simply keeps the card (the engine gets `false`, exactly as "Let it go").
3. After approval: build it, keep it on the device only if it is remembered between games (`localStorage` in
   `try` / `catch`, the game works when storage is blocked), and add tests for the pure part (which rewards count as
   "big", what the engine is answered).

## Part B: the narrative is unfrozen (owner, 15 Oct): a little more grown-up

The owner unfroze the story texts: they should feel **a bit more 18+** (young adults 18–34 first), while staying within
C2 (family-safe) and still readable for a child. The voice of GCD §9.2 stays the base: dry humour from moments every
adult has lived; now a little sharper, more knowing, more self-aware. No baby talk, no exclamation-mark cheerfulness,
nothing a 6-year-old would need explained to enjoy, and nothing a parent would object to.

What counts as "the narrative" (all of it may change, **texts only**):

- the one-liners in the board files (`story` of each square and of the rule elements in `story`);
- the tales in `src/ui/tales.ts` (`SQUARE_TALES`, `SHORTCUT_TALES`, `SNAKE_BACK`, `MOMENTS`);
- the postcard lines in `src/ui/postcards.ts`;
- the card texts in `src/ui/app.ts` (`CARD_INFO`) and the stamp words in `src/ui/stage.ts`.

Process (each step waits for the owner's "approved"):

1. **Voice sample first:** rewrite 5 texts of different kinds (a good square, a bad square, the Bog, a rule moment such
   as "A Lantern Goes Out", a postcard line) and show them as a table: *now* → *proposed*. Ask the owner to approve the
   voice before writing more.
2. **Then all texts, in batches of about 15**, each batch as a table *now* → *proposed*, grouped by region of the
   journey. The owner may approve, change or reject each line.
3. **Apply only the approved lines.** The outcome lines (what a square does) are never written by hand: they come from
   `outcome()` in `src/ui/tales.ts` and stay as they are.
4. Record the decision in `docs/GCD.md` §9.2 (one dated line: "Owner, <date>: narrative unfrozen and rewritten,
   a little more grown-up; texts in …") and keep the old texts findable in the git history (no archive file needed).

## How to check your work

- `npm test` (fast tests), `npm run typecheck`, `npm run build`. Do not run or change `npm run test:sim` rules.
- Run the app with `npx vite --port 5173 --strictPort` in the background. **Stop it by port**
  (`kill $(lsof -ti tcp:5173)`), never with `pkill -f vite`.
- Playwright and Chromium are preinstalled: import from `/opt/node-tools/node_modules/playwright/index.mjs`. Add
  `?fast` to the address to fast-forward whole games; use normal speed for screenshots of stamps and animations.
- `/gallery.html` shows every picture; `/gallery.html?postcards` every postcard.
- Send the owner screenshots of each proposal and of the result. Save them in your scratchpad, not in the repository.

## Output

- Part A: code in `src/ui/*`, tests in `test/*`. Part B: texts in the files listed above, a line in `docs/GCD.md` §9.2.
- `docs/PROJECT_PLAN.md`: add a Step 5b row (with this prompt) and mark it done with a one-line summary; update
  `src/ui/README.md` if behaviour changed.
- Commit and push to your session's branch after each approved part. Open a pull request only when the owner asks.
