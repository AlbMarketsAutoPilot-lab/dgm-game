# Board drawing data

Used by the game screen (`src/ui`).

| File | What |
|---|---|
| `layout.ts` | Where every square sits, in board units: Start…END, Home, Shortcut stones, ladder and snake paths. Long board = the paper spiral (archived transcription §8.4); short board = a 10 × 10 snakes-and-ladders grid. Tested in `test/layout.test.ts`. |
| `art.ts`, `art-travel.ts`, `art-places.ts` | Animated storybook illustrations (filled SVG shapes + CSS motion, transform/opacity only), one per `icon` name in the board files (57). Review them all at `/gallery.html` (`npm run dev`). |
| `art-kit.ts` | Shared palette, ink outlines, the reusable motions (bob, sway, spin, puff, ripple, …) and scenery helpers (water, clouds, sun, wheels, trees, people). |
| `icons.ts` | Small line icons (player bar, safety net for an unknown name). |
| `palette.ts` | Ink, paper, the paper's crayon colour per event square, region washes. |
| `sketch.ts` | Hand-drawn SVG primitives (wobbly boxes and lines, hatching, paper texture). |
