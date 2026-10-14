# Board rendering (Step 3)

Draws the boards as on paper (GCD §14, P6) on an HTML canvas. No game logic here: it reads the board files through
the engine (`src/engine`).

| File | What |
|---|---|
| `layout.ts` | Where everything sits, in **board units** (1 unit = distance between neighbouring squares): squares, END, Home, Shortcut stones, ladder and snake paths. Pure geometry, tested in `test/layout.test.ts`. `pointOf(layout, pos, stair)` gives the centre of any engine `Pos` (incl. stair steps) for tokens. |
| `board.ts` | `paintBoard(ctx, layout)` paints in board units; `renderBoard(board, pxPerUnit)` returns a bitmap on paper (cache it; Step 4 draws it through the camera). |
| `sketch.ts` | Hand-drawn primitives: wobbly ink boxes, crayon hatching, handwriting, paper texture. Seeded, so the board looks the same every time. |
| `icons.ts` | One line icon per `icon` name in the board files (24 × 24 SVG paths). |
| `palette.ts` | Ink, paper, the paper's crayon colour per event square, region washes. |

## The two layouts

- **The Grand Journey (long):** the paper path, an inward square spiral (archived transcription §8.4): Start → 19
  along the top, 20 → 36 down the right, … 201 → 202 in the middle, END above 202. Rings are one square apart; the
  Shortcuts run in the corridor between two rings, beside the Main Road they replace. The seven paper drawings:
  ladders 40, 80, 113, 188 and snakes 138, 158, 202.
- **The Quick Trip (short):** designed in Step 3 as the classic snakes-and-ladders grid: 10 rows of 10 winding upwards,
  1 bottom left, 100 top left, END above 100, rows 1.6 apart so the two Shortcuts each have a corridor. Portrait, so
  the whole board fits a phone held upright. Its ladders and snakes are those of the same paper events (balloon,
  cable car, missed stop, wrong snake, Snake Leader).

## How a square reads

Purple wobbly box with its number; event squares have the paper's crayon colour, an icon on a paper disc, a
green up-chevron (good) or red down-chevron (bad), so the meaning never depends on colour alone, and the destination
of a jump (`→ 33`). Landmarks show their icon and name; crossroads a signpost; meeting squares two joining paths.
Numbers and icons are painted above the ladders and snakes, with a paper halo.
