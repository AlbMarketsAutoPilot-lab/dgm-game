# Game screen (Steps 3–5, owner's design of 14–15 Oct)

Two areas plus the players:

- **Whole board = the info area** (`overview.ts`): a labyrinth spiral of plain paper squares (layout in
  `src/render/layout.ts`), ink walls between the rings, no numbers and no crayon colours. Good squares have a green frame
  and ▲, bad squares a red frame and ▼. The paper's ladders and snakes are cable cars (forward) and rivers (back). The
  Shortcuts run inside the walls as stepping stones. A big Start pad (Home and Start, room for four tokens), the
  festival in the middle, a legend. **Tap any square** (or stone, or pad) to see its tale and what it does, and which
  throw gets the current player there. Small die faces mark the squares the current player can reach with one die.
- **Stage = the action area** (`stage.ts`): the big square with its animated illustration, the token hopping square
  by square, jumps gliding; sparks, a stamp ("Lucky!", "Don't get mad!"), a jolt for bad luck, confetti for the win,
  the Bonus card flying in when it is played. Above it, whose turn it is, their lanterns and their cards (tap a card
  to see what it does). Below it, the die (tap it) and one big action button.
- **Popups** (`popup.ts`) over the whole board: every story moment, choice and the win. A story popup stays until the
  next one replaces it, or until it is closed with ✕; the moments earlier in the same turn are listed under it. A
  choice is explained in the popup; its buttons wait in the action area.
- **Players** (`app.ts`): round avatars on top (portrait) or on the right (landscape), with lanterns and cards; tap one
  for everything about that player (place, squares to go, cards, waiting, a tip for the next throw).
- **Narrative** (`tales.ts`): a tale per event square, Shortcut stone and rule moment, for young adults first. What a
  square does is always derived from the engine's tile (`outcome()`), never written by hand.
- **Turn** (`app.ts`): Roll (or tap the die) → the move → what happens → "Pass the die to Red ▶". Computer players
  (GCD §8.6) play by themselves. No auto-focus: the game is played by tapping, not by holding Enter.

Every rule comes from the engine (`src/engine`); this folder only shows its events and answers its decisions.
Accessibility: tokens differ by colour and shape, good/bad by colour and ▲/▼, big buttons, no timers for people,
"reduce motion" stops the animations (reading pauses stay). `?fast` in the address fast-forwards games (testing).
