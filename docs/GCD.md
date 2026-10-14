# Don't Get Mad! — Game Concept Document (GCD)

> **Status:** Draft v0.1 — transcribed from 25 photos of the hand-drawn paper board and cards.
> **Rule for all future work:** this file (and later `src/data/board.json`) is the single source of truth.
> Nothing may be invented. Anything marked ⚠️ is **not confirmed** and must be answered in §9 before it is coded.

---

## 1. Vision

A digital version of a family board game drawn by hand on paper by a parent and their daughter.
It keeps the look and spirit of the original: off-white paper, purple-ink tiles, crayon-coloured special squares, ladders, snakes and little hand-written stories ("Forgot keys again!!!", "You won lottery, go to bank").

## 2. Hard conditions

| # | Condition | What it means for the design |
|---|-----------|------------------------------|
| C1 | **Cost 0, always** | Free tools only. No paid hosting, no paid APIs, no ads, no in-app purchases, no accounts/servers. Runs fully offline in the browser. |
| C2 | **For all ages, as inclusive as possible** | Large touch targets, readable font, colour **plus** shape/icon on every special tile and token, optional read-aloud of tile texts, reduced-motion option, no reading required to play (icons + audio), no violence, no timers that pressure players. |

## 3. Platforms

1. **Web browser** (desktop + mobile), installable as a PWA, works offline.
2. **Android app**, built from the same web code (wrapper). See §8 for the cost-0 distribution question.

## 4. Components (from photo 22)

- **1 standard six-sided die** (1–6).
- **Player tokens = buttons**: black, yellow, light-blue flower-shaped, white. → 4 players. Digital tokens will be colourful buttons with different shapes/holes so they are distinguishable without colour.

## 5. Core game loop (confirmed from board)

1. Players take turns rolling one die.
2. All tokens begin on **Start**. Text on Start: **"You need 6"** to leave.
3. The token moves forward tile by tile (Start → 1 → 2 … → 202 → END).
4. If it ends on a special tile, that tile's rule is applied (§6).
5. First player to reach **END** wins.

Details not written on the board (exact roll for END, capturing, extra throw on 6, etc.) are open questions in §9.

## 6. Tile catalogue (all special tiles)

Every tile 1–202 that is **not** listed below is a normal tile with no rule.
Colour = crayon colour on the paper. Source = photo number(s) where the text is readable.
✅ = text clearly readable · ⚠️ = needs confirmation (see §9).

| Tile | Colour | Text on board (as written) | Effect (literal) | Target | Status | Source |
|---|---|---|---|---|---|---|
| Start | – | "You need 6" | Need a 6 to leave Start | – | ✅ | 7, 12 |
| 5 | teal | "Skip 1 turn" | Skip 1 turn | – | ✅ | 7, 11 |
| 10 | purple | "Back to start" | Go back to Start | Start | ✅ | 6, 8 |
| 15 | light blue | "Next time advance just 1 square" | Next turn move only 1 square | – | ✅ | 6, 8 |
| 20 | blue | "Go to 33" | Jump to 33 | 33 | ✅ | 6, 8 |
| 25 | yellow-green | "Skip a turn" | Skip 1 turn | – | ✅ | 8 |
| 30 | grey-brown | "PRISON — Get out with 6" | Prison; leave only with a 6 | – | ✅ | 9, 11 |
| 35 | yellow | "Go to 66" | Jump to 66 | 66 | ⚠️ Q3 | 10, 11 |
| 40 | red | "Go upstairs" + ladder | Ladder | 103 | ✅ | 10, 11 |
| 45 | grey | "Throw two times" | Throw two times | – | ⚠️ Q17 | 1, 10 |
| 50 | grey-purple | "HOSPITAL — Stay here 3 night (times)" | Stay 3 turns | – | ⚠️ Q11 | 1, 11 |
| 55 | purple | "Fly to Airport 71" | Jump to 71 | 71 | ✅ | 11, 15 |
| 60 | orange | "You can skip a punishment" | Receive **Skip Punishment** card | – | ⚠️ Q5 | 11, 15, 24 |
| 65 | orange-red | "Go to nearest reward and do it" | Move to nearest reward tile, apply it | nearest reward | ⚠️ Q6 | 11, 12, 24 |
| 70 | orange | "(Lost) your flight is broke(n), go back to 55" | Jump back to 55 | 55 | ⚠️ Q4 | 7, 12 |
| 71 | – | "AIRPORT" | Label only | – | ✅ | 7, 12 |
| 75 | green | "Change place with the one in front" | Swap position with the player ahead | player ahead | ⚠️ Q18 | 7, 12 |
| 80 | brown | "Go downstairs" + ladder | Ladder | 135 (Hotel) | ✅ | 6, 11, 12 |
| 85 | yellow | "You won lottery. Go to bank" | Jump to Bank | 102 | ✅ | 6, 8 |
| 90 | teal | "Free jail pass" | Receive **Free Jail Pass** card (also cards in photos 16, 17) | – | ✅ | 6, 16, 17 |
| 95 | orange | "There is a robbery! Wait 1 turn here" | Skip 1 turn | – | ⚠️ Q12 | 9, 13 |
| 97 | dark red | "POLICE — Go in prison" (arrow to 30) | Jump to Prison | 30 | ✅ | 9, 11 |
| 101 | pink-brown | "Bank was robbed, go to 86" | Jump to 86 | 86 | ✅ | 10, 11 |
| 102 | – | "BANK $" | Label only | – | ✅ | 10 |
| 103 | – | (top of ladder from 40) | Ladder end | – | ✅ | 10 |
| 108 | yellow | "Get some vacation. Go to hotel" | Jump to Hotel | 135 | ✅ | 1, 10 |
| 113 | orange | "Go downstairs, do punishment" + ladder | Ladder down to Hospital | 50 | ✅ | 1, 14, 19 |
| 118 | green | "Advance to 124" | Jump to 124 | 124 | ✅ | 11, 15, 24 |
| 123 | teal | "Throw 3 times in a row and move at the total of all throws" | Roll 3×, move the sum | – | ⚠️ Q16 | 15, 24 |
| 128 | purple | "Go to nearest punishment and do it" | Move to nearest punishment tile, apply it | nearest punishment | ⚠️ Q6 | 7, 12 |
| 133 | orange | "Your hotel reservation is cancelled. Go to 109" | Jump back to 109 | 109 | ✅ | 7, 12 |
| 135 | – | "HOTEL" | Label only | – | ✅ | 6, 12 |
| 138 | orange | "Follow the snake" | Snake (goes **forward**) | 195 | ✅ | 6, 18, 25 |
| 143 | yellow | "The other players double what they throw!" | Other players' throws ×2 | – | ⚠️ Q7 | 6, 25 |
| 148 | yellow | "Go in prison again" (arrow) | Jump to Prison | 30 | ✅ | 9, 20 |
| 153 | brown | "Skip one turn" | Skip 1 turn | – | ✅ | 1, 10 |
| 158 | yellow | "Follow the snake" | Snake down | 48 | ✅ | 1, 19 |
| 163 | yellow | "Throw one more time!!" | Extra throw | – | ✅ | 14, 23 |
| 168 | pink | "You are invited to a party. Go to 179" | Jump to Party | 179 | ✅ | 12, 18 |
| 173 | blue | "Got new car. Go fast to work 184" | Jump to Work | 184 | ✅ | 12, 18 |
| 178 | grey | "You forgot invitation. Go back to 16?" (last digit overwritten) | Jump back | 167 or 168 | ⚠️ Q2 | 6, 25 |
| 179 | – | "PARTY" (stars) | Label only | – | ✅ | 6, 18 |
| 183 | brown | "Car was stolen! Go to police 97 — No prison" | Jump to 97, **without** the prison effect | 97 | ⚠️ Q19 | 3, 9 |
| 184 | – | "WORK" | Label only | – | ✅ | 3, 9 |
| 188 | blue | "Go downstairs" + ladder | Ladder down | 157 | ✅ | 2, 20, 23 |
| 193 | orange | "Forgot keys! Back to work!" | Jump back to Work | 184 | ✅ | 2, 18 |
| 195 | – | "!SNAKE LEADER!" (end of snake from 138) | Become **Snake Leader** (green card, photo 4) | – | ⚠️ Q22 | 2, 4, 18 |
| 198 | purple | "Forgot keys again!!! Back to work 184 and skip two turns" | Jump to 184 + skip 2 turns | 184 | ✅ | 2, 3, 25 |
| 202 | – | "Sorry, follow the snake if snake brought you to 195" | Snake down, **only** for a player who came via the 138 snake | 165 (board) / 162 (card) | ⚠️ Q1 | 2, 4, 20, 23 |
| END | – | "END" | Finish | – | ✅ | 2, 11 |

### 6.1 Ladders & snakes summary

| Kind | From → To | Direction |
|---|---|---|
| Ladder "Go upstairs" | 40 → 103 | forward |
| Ladder "Go downstairs" | 80 → 135 | forward |
| Ladder "Go downstairs, do punishment" | 113 → 50 | backward |
| Ladder "Go downstairs" | 188 → 157 | backward |
| Snake | 138 → 195 | forward |
| Snake | 158 → 48 | backward |
| Snake (conditional) | 202 → 165 ⚠️ | backward |

### 6.2 Places (story labels)

Start · Prison (30) · Police (97) · Hospital (50) · Airport (71) · Bank (102) · Hotel (135) · Party (179) · Work (184) · Snake Leader (195) · END.

## 7. Cards (inventory)

Transcribed from the paper cards. All upside-down in the photos; read as best as possible.

| Card | Text (as written) | Given by | Use | Status |
|---|---|---|---|---|
| **Free Jail Pass** | "Get out of jail free. You landed in 90, you get a free jail pass." / "You landed on square 90 you get free jail pass." | Tile 90 | Avoid / leave Prison | ✅ text · ⚠️ Q10 usage |
| **Skip Punishment** | "You can skip a punishment until you landed in 6? and you can skip a punishment … other person has … reward … skip a" (photo 5, partly unreadable) | Tile 60 | Ignore one punishment tile | ⚠️ Q5 |
| **Skip a Reward / others skip a punishment** | "You have skip a reward and others have skip a punishment" (photo 21) | ⚠️ unknown | ⚠️ unknown | ⚠️ Q5 |
| **Snake Leader** | "You are Snake Leader. If 202 go to 162" (photo 4) | Tile 195 | Applies the 202 rule | ⚠️ Q1, Q22 |

## 8. Digital design

### 8.1 Look & feel
- Off-white textured paper background, fold lines, purple ink tile borders with slightly wobbly hand-drawn corners.
- Special tiles filled with crayon-style hatching in their real colours (§6).
- Ladders and snakes drawn as on paper (the 138 snake is orange/purple, the 158 snake blue/purple, the 202 snake dark blue line).
- Tokens: four colourful buttons (black, yellow, light-blue flower, white) — each with a distinct shape/hole pattern.
- Board layout follows the paper path (§8.4) so it feels like the real board.

### 8.2 Required features (from the brief)
- All tiles Start…202…END with the rules in §6.
- Step-by-step token animation (tile by tile, not teleport). Ladders/snakes animate along their drawing.
- Smooth camera: follow active token, pinch/scroll zoom, drag to pan.
- Card inventory per player; when landing on a penalty tile the player is asked whether to use a card.
- Local "pass-and-play" for 2–4 players; optional simple computer players.

### 8.3 Inclusivity (C2)
- Every special tile has an icon (prison bars, plane, bank $, hotel, party star, car, key, snake, ladder, hospital cross).
- Read-aloud of the tile text using the browser's built-in speech (free, offline on most devices).
- Big "Roll" button, large font, high-contrast mode, reduced-motion mode (shorter animations).
- UI languages: English first; others via a translation file (⚠️ Q20 which languages).
- No timers, no losing lives, no ads, no data collected.

### 8.4 Board path layout (as drawn — used to place tiles on screen)

| Segment | Tiles | Direction on paper |
|---|---|---|
| Top row | Start, 1 → 19 | left → right |
| Right column | 20 → 36 | top → bottom |
| Bottom row | 37 → 55 | right → left |
| Left column | 56 → 70 | bottom → top |
| Row 2 | 71 → 88 | left → right |
| Column | 89 → 101 | top → bottom |
| Row | 102 → 116 | right → left |
| Column | 117 → 127 | bottom → top |
| Row 4 | 128 → 141 | left → right |
| Column | 142 → 150 | top → bottom |
| Row | 151 → 161 | right → left |
| Column | 162 → 168 | bottom → top |
| Row | 169 → 178 | left → right |
| Column | 179 → 183 | top → bottom |
| Row | 184 → 187 (Work) → 188 → 190 | right → left |
| Column | 191 → 193 | bottom → top |
| Row | 194 → 198 | left → right |
| Column | 199 → 200 | top → bottom |
| Row | 201 → 202 | right → left |
| END | above 202 | – |

### 8.5 Technology (all free)
- **TypeScript + Vite**, HTML5 **Canvas** for the board, plain DOM for menus.
- Rules engine = pure TypeScript functions + `board.json` data, covered by unit tests (**Vitest**).
- **PWA** (offline) hosted on **GitHub Pages** (free).
- **Android** via **Capacitor** (free), APK built by **GitHub Actions** (free for this use).
- ⚠️ Q21: Google Play Store has a one-time **$25** developer fee — this breaks C1. Free options: APK download from GitHub Releases, F-Droid, or "Install app" from the PWA.

## 9. Open questions (must be answered before coding the rule)

| # | Question |
|---|---|
| Q1 | Tile 202: the board snake ends at **165**, the green card says **162**. Which one? And if a player reaches 202 *without* coming via the 138 snake, does nothing happen? |
| Q2 | Tile 178 "go back to 16?": is it **167** or **168**? (168 would then send the player to Party 179.) |
| Q3 | Tile 35: is the target **66**? |
| Q4 | **Chained rules:** after a jump, does the new tile's rule also apply? Example: 70 → 55 → would 55 then fly you to 71? |
| Q5 | Pink card (photo 5) and purple card (photo 21): what exactly do they say/do, and which tiles give them? Can a Skip Punishment card be kept and used later? |
| Q6 | Which tiles are **rewards** and which are **punishments**? (Needed for 65, 128 and the Skip Punishment card.) "Nearest" = forward, backward or either? |
| Q7 | Tile 143 "others double what they throw": for their next throw only, or longer? |
| Q8 | Tile 15 "next time advance just 1 square": next turn moves exactly 1, whatever the die shows? |
| Q9 | Start: after rolling a 6, does the token move 6 squares, or just go to tile 1? Does a 6 give an extra throw anywhere? |
| Q10 | Prison 30: landing on 30 by a normal roll also means prison? After a 6 do you move 6 from 30? Is the Free Jail Pass used automatically or by choice? |
| Q11 | Hospital 50: "stay 3 times" = skip 3 turns? Also when landing there by a normal roll? |
| Q12 | Tile 95 "wait 1 turn here" = same as skip 1 turn? |
| Q13 | END: exact roll needed? If the roll is too big, bounce back, stay, or just finish? |
| Q14 | Two tokens on the same tile: share it, or does one get sent back (classic "Don't Get Mad" capture)? |
| Q15 | Players: 2–4? One token per player? |
| Q16 | Tile 123: after moving the total, does the tile you land on apply? |
| Q17 | Tile 45 "throw two times": one move with the sum, or two separate moves? |
| Q18 | Tile 75 "change place with the one in front": the nearest player ahead on the board? If nobody is ahead? |
| Q19 | Tile 183: go to 97 but the police "go in prison" does **not** apply — correct? |
| Q20 | Which UI languages? |
| Q21 | Android distribution: free APK/PWA only, or pay $25 for Google Play? |
| Q22 | Snake Leader (195): anything else besides the 202 rule? |
