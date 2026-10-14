# Board drawing data

Used by the game screen (`src/ui`).

| File | What |
|---|---|
| `layout.ts` | Where every square sits, in board units: Start…END, Home, Shortcut stones, ladder and snake paths. Long board = the paper spiral (archived transcription §8.4); short board = a 10 × 10 snakes-and-ladders grid. Tested in `test/layout.test.ts`. |
| `art.ts` | Animated storybook illustrations (inline SVG + CSS, transform/opacity only) per `icon` name; names without one yet show their line icon. |
| `icons.ts` | Line icons for every `icon` name in the board files (fallback and small UI icons). |
| `palette.ts` | Ink, paper, the paper's crayon colour per event square, region washes. |
| `sketch.ts` | Hand-drawn SVG primitives (wobbly boxes and lines, hatching, paper texture). |
