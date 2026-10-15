# U7: sounds and music, the list (for the owner, 15 Oct 2026)

Sound and vibration are **off until a player switches them on** (one switch on the start screen and in the game:
"Sound: off / on"). Every sound below already has its moment in the game: the engine tells the screen when each one
happens, so adding a sound is only a file and one line.

## What is needed

### Sound effects (short, played on top of everything)

| # | Name of the file | When it plays | How it should feel | Length |
|---|---|---|---|---|
| 1 | `dice-roll` | The die tumbles | A wooden die rattling in a hand or a cup, then landing on a table | 0.4–0.7 s |
| 2 | `dice-land` | The die stops (only if 1 has no landing) | One soft knock on wood | 0.1–0.2 s |
| 3 | `step` | The token hops one square (plays once per square) | A light tap or pop, not tiring when it plays 12 times in a row | under 0.1 s |
| 4 | `six` | A 6 ("A 6! Roll again!") | A short, happy rising chime | 0.5–1 s |
| 5 | `good` | Landing on a good square (green ▲) | Bright, positive: a sparkle or two notes going up | 0.5–1 s |
| 6 | `bad` | Landing on a bad square (red ▼) | A friendly "oh no": two notes going down, a slide whistle, a cartoon "boing" (comic, never scary) | 0.5–1 s |
| 7 | `bump` | A player lands on another and sends them back to Start | A comic bump or "boing" | 0.3–0.6 s |
| 8 | `jump-up` | A ride forward (balloon, train, cable car…) | A whoosh going up | 0.5–1 s |
| 9 | `jump-down` | Sent back (snake, wrong ferry, fallen tree…) | A whoosh or slide going down | 0.5–1 s |
| 10 | `bog` | Stuck in the Bog | A muddy squelch or gurgle | 0.4–0.8 s |
| 11 | `card` | A Bonus card or Bog boots is won, or a card is played | A card flick or paper shuffle | 0.2–0.5 s |
| 12 | `lantern-out` | A lantern goes out | A soft "pff" of a candle blown out | 0.3–0.6 s |
| 13 | `lantern-on` | Three 6s light a lantern again | A match striking, then a warm chime | 0.5–1 s |
| 14 | `postcard` | A new postcard is collected | A stamp being pressed on paper | 0.2–0.4 s |
| 15 | `tap` | Any button (optional, very quiet) | A soft click | under 0.1 s |
| 16 | `win` | Someone reaches the Festival of Lights | A short festive fanfare, fireworks or bells | 2–4 s |
| 17 | `out` | A player's last lantern goes out | A gentle sad trombone or falling notes (comic) | 1–2 s |

### Music (optional, quieter than the effects, its own switch)

| # | Name of the file | When | How it should feel | Length |
|---|---|---|---|---|
| M1 | `music-menu` | Start screen, album, guide | Cheerful, light, acoustic (ukulele, glockenspiel, whistling); a journey about to begin | 30–90 s, loops without a gap |
| M2 | `music-game` | During the game | Calm, unhurried, never tiring after an hour; same family as M1 | 1–3 min, loops without a gap |
| M3 | `music-win` | The win screen (instead of 16 if music is on) | A festival: lanterns, a small band | 5–15 s |

### Vibration (phones; no file needed)

A short buzz for a 6, a double buzz for a bump or bad luck, a long one for the win. Same switch as sound.

## The files

- **Format:** MP3 (every browser and the Android app play it). Effects mono, 44.1 kHz, 96–128 kbps; music stereo,
  128 kbps. Effects under 50 KB each, music under 2 MB each: the whole game stays small and works offline.
- **Volume:** all effects at about the same loudness (normalised), no silence at the start of a file (so it plays the
  moment the event happens).
- **Licence (important):** only sounds we may use in a free game without asking anyone: **CC0 / public domain**, or
  bought with a licence for games, or made by you. Please keep a note of where each file came from; I will list them
  on an "About" line in the game and in `docs/` (CC0 needs no credit, but it is fair to give it).

## Where to find them (free, CC0)

I could not download them myself: this session's network settings block the sound websites (kenney.nl,
freesound.org, opengameart.org, pixabay.com). If you prefer that I fetch them, add those hosts under **Allowed
domains** in the environment's network settings (Edit environment → Network access), and I will pick, trim and
normalise them, and show you the list to approve. Good sources:

| Source | Licence | Good for |
|---|---|---|
| Kenney "Casino Audio" (kenney.nl) | CC0 | 1, 2 (real dice rolls), 11 (cards) |
| Kenney "Interface Sounds" (kenney.nl) | CC0 | 3, 14, 15 |
| Kenney "Music Jingles" (kenney.nl) | CC0 | 4, 5, 6, 16, 17, M3 |
| Kenney "Impact Sounds" (kenney.nl) | CC0 | 7, 10 |
| freesound.org, filter "Creative Commons 0" | CC0 (check each) | 8, 9, 10, 12, 13 |
| opengameart.org, filter "CC0" | CC0 (check each) | M1, M2 (search "cozy", "acoustic", "loop") |

A third way, needing no files at all: I can make the short effects (3, 4, 5, 6, 15, 7) in the game itself with the
browser's sound synthesiser. They would sound clean and simple ("bleep" style) rather than real dice and paper.
Real recordings suit the hand-made look better, so I recommend files at least for 1, 11, 14 and 16.

## How you can send them

Put the files in a folder `public/sounds/` with the names above (any you don't have, leave out: the game plays
nothing for that moment), or attach them here. I then add the switch, the sounds and the vibration, test them on the
screen sizes and in the browser tests, and show you before publishing.
