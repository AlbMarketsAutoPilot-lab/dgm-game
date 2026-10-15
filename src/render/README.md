# Board drawing data

Used by the game screen (`src/ui`).

| File | What |
|---|---|
| `layout.ts` | Where every square sits on the whole board, in board units: a labyrinth spiral (square 1 top left, clockwise inwards to the festival in the middle), walls between the rings, the Shortcut stones inside the walls, the Start pad and the legend, the cable cars and rivers. Tested in `test/layout.test.ts`. |
| `art.ts`, `art-travel.ts`, `art-places.ts` | Animated illustrations (filled SVG shapes + CSS motion, transform/opacity only), one per `icon` name in the board files (57). `art.ts` also lights them all (`light()`: gradients for every colour, soft thin edges, a sheen and a vignette, a dusk sky behind; `artDefs()` is added to the page once). Review them at `/gallery.html` (`npm run dev`). |
| `art-hero.ts` | The pictures seen most often, redrawn as detailed dusk scenes (3/4 perspective, glowing lights, depth): Home, the festival, crossroads, cards, the Bog, keys, … They replace the first drawings of the same name. |
| `art-kit.ts` | Shared palette, ink outlines, the reusable motions (bob, sway, spin, puff, ripple, …) and scenery helpers (water, clouds, sun, wheels, trees, people). |
| `icons.ts` | Small line icons (only a safety net for an unknown name). |
| `palette.ts` | Ink, paper, the paper's crayon colour per event square, region washes. |
| `sketch.ts` | Hand-drawn SVG primitives (wobbly boxes and lines, hatching, paper texture). |
