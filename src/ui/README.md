# Game screen (Steps 3–5, owner's design of 14 Oct)

Two panels: **the whole board** (top in portrait, left in landscape) and **the stage** (bottom / right).

- **Whole board** (`overview.ts`): the squares only, no numbers (event squares in their crayon colour), the
  Shortcut stones, Home and END, the fallen tree, and every token. The token whose turn it is has a turning ring.
- **Stage** (`stage.ts`): one big square at a time with its number, illustration (`src/render/art.ts`) and story.
  A throw walks square by square: from 7 with a 2 the stage shows 7, the token hops over 8 and lands on 9. If 9
  sends it back to 6, the row glides back to 6 (long jumps glide past a blur).
- **Turn** (`app.ts`): "Blue's turn" → **Roll the die** → the die tumbles (sixes: throw again, the throws add up)
  → the move → what the square does → "Blue's turn is over" → **OK** → the next player. Choices (road at a
  crossroads, the Bonus card) are asked with big buttons. Computer players (GCD §8.6) roll and choose by themselves.
- **Start screen** (`setup.ts`): the journey, 2–4 players, person or computer per seat. After a win: Play again /
  New game.

Every rule comes from the engine (`src/engine`); this folder only shows its events in order.
Accessibility: every token has its own colour and button shape; big buttons; no timers for people; with the system
setting "reduce motion" the animations are skipped.
