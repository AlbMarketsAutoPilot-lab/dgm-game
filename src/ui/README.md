# Game screen (Steps 3–5, owner's design of 14–15 Oct)

**Look (owner, 15 Oct):** grown-up, not childish: a night-teal journey to the Festival of Lights, glass panels, gold
serif titles (Cinzel), a clean body font (Inter), lit illustrations at dusk, glossy tokens and die, trading cards.
Fonts are bundled (`@fontsource`), so the game still works offline (C1).

Two areas plus the players:

- **Whole board = the info area** (`overview.ts`): a labyrinth spiral of plain paper squares filling the whole panel
  (layout in `src/render/layout.ts`), thin ink walls between the rings, no numbers, no colours, no lines, no legend.
  Good squares have a green frame and ▲, bad squares a red frame and ▼. The Shortcuts run inside wider walls as small
  stones. Start is four squares long at the top left (everyone waits there); the festival (gold, a star) is in the
  middle. **Tap any square** to see its tale, what it does and which throw gets the current player there; on the long
  board the first tap zooms in ("Whole board" zooms out). Small die faces mark the squares reachable with one die.
- **Stage = the action area** (`stage.ts`): the big square with its animated illustration, the token hopping square
  by square, jumps gliding; sparks, a stamp ("Lucky!", "Don't get mad!"), a jolt for bad luck, confetti for the win,
  the Bonus card flying in when it is played. Above it, whose turn it is and their hand of cards: Bonus card and
  Bog boots are always shown (grey until held, glowing when held), plus the Snake Leader crown; tap a card to see what
  it does and where to get it. Below it, the die (tap it) and one big action button.
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
