# Step I: new rules, the guide, a new narrative and 4 new destinations (owner, 25 Nov 2026)

> **Status: planning approved (25 Nov 2026).** Part 1 is the owner's original prompt, kept as the record of the request.
> Part 2 is what the owner and Claude agreed, point by point, in the planning session. **Part 2 is what counts:** where
> it differs from Part 1, Part 2 wins (owner: "only what we agree here counts").

---

## Part 1: the owner's original prompt (as given)

Step I for the game "Don't Get Mad!" (repository AlbMarketsAutoPilot-lab/dgm-game). This is a big change: new rules, a guide figure, a new narrative and 4 new destinations. Work in approved phases only.

HOW TO WORK (the owner's rules; DGM has no CLAUDE.md):
* One step at a time. When I have to do something (Android Studio, Play Console, Partner Center, GitHub), give exactly ONE step with the exact clicks or Command Prompt line (I am on Windows) and what I should see. Stop. Continue only when I say "done", and check what I paste.
* No change, commit, push or PR without my approval. First explain the problem, the proposed change, its cost and risk, then ask. Every text a player sees (guide, popups, buttons, narrative) is shown to me for approval before it goes into the code.
* Never guess. Verify in the code, the docs or what I paste. If unsure what a screen shows, ASK me to paste it.
* I am on a limited plan: short plain answers, no repeated research, no long logs.
* Read first: docs/GCD.md (rules R1–R21 and the step H changes), docs/PROJECT_PLAN.md, docs/prompts/StepH_lanterns.md, docs/prompts/Step8_android_app.md, docs/prompts/StepF_google_play.md, src/engine/, data/board-short.json, src/ui/ (app.ts, tales.ts, guide.ts), tools/sim/, test/, tools/browser/.
* All square numbers below are on the 100-square board (data/board-short.json, END = 101).

FIRST TASK (no code): read the files, then give me
(1) a few lines on what you found,
(2) the list of conflicts, unclear points and risks in my list below (some I already know: square 79 says "landing on 97", probably 79; how the win time is measured with pauses, saved games and several humans; what Normal robots do now that lanterns are gone; the guide figure's gender "him/her"; what happens to postcards of removed areas and to saved games of the 202 board; how the "no reward/punishment ever lands on another one" rule fits each square),
(3) a phased plan with cost and risk per phase. My suggestion: A rules + engine + simulator + tests on the current 100 board, with a measurement report (chances, game length, waiting, lead changes, close finishes, how much strategy counts) before anything else; B board 100 redesign (areas, squares, narrative); C right-side guide popups and the left notifications; D destination choice screen + 4 destinations, one at a time; E leaderboard; F initial guide; G new Android and Windows versions.
Also save this whole prompt as docs/prompts/StepI_destinations.md, but only after my approval.

MY LIST (owner, 25 Nov 2026):
- Don't mention numbers anymore in the game. On the notification popups on the left just say "advance 13 squares" or "go back 10 squares", never "go to square 23" (keep square numbers as reference in the right-side panel with the zoomed view, just don't mention them).
- Remove the Easy/Normal selection. All robots are Normal from now on.
- A leaderboard with time to finish. Every time a human wins, the time is compared with the records. No server (no D1): keep the top 10 human win times on the device, whoever played. For example "Your win time ranks 1st, beating all previous records" or "Your win time ranks 3rd of all-time records".
- Lanterns removed completely as a concept.
- Bog boots removed completely as a concept.
- Three 6s (winning a lantern, stopping after three 6s) removed completely as a concept.
- All players start the game with 1 Bonus card, and earn more on the Bonus card squares.
- Remove completely the "three rolls" concept and any obligation after three rolls without a 6. A player rolls as many times as needed until they roll a 6. Every time a player needs a 6, they choose: use the Bonus card or roll for a 6. Without a Bonus card they just roll until they roll a 6.
- No stop after three 6s: as long as you roll a 6 you roll once more, however many times.
- Remove the River & Lake and Festival Road areas and spread the other areas over the board so that Home Town has the fewest squares and Big City the most. The River & Lake icon (the boat) is used from now on for Seaside, replacing Seaside's icon.
- Location matters: entering an area can give a one-time bonus or punishment (e.g. Forest: you get lost, lose a turn; Big City: traffic; elsewhere: you are gifted a roll of 6, or you bump the player in front of you). Propose 3 bonuses and 3 punishments per area.
- The Start square is now called "Home". Remove the text "a 6 to enter". You leave your home to start a trip, and you need a 6 for that; then you travel around your home town towards the countryside and so on.
- The Bonus card can unlock a blocking punishment or cancel a punishment (except Plot Twist and Bump). Cancelling another player's reward is removed completely.
- Punishments and rewards can never move a player more than 20 squares (except the square-69 jump and Plot Twist) and can never land on a square with another reward or punishment.
- Replace the Bog with the fallen tree, in the Forest area (if square 15 is not in the Forest, adjust). The fallen tree is no longer the moving roadblock: it is in this single place. You need to roll a 6 to clear it or you stay; only a Bonus card can replace the 6.
- Replace the fallen tree icon: the current one is ugly and unclear.
- Square 69 (Snake Leader) is too childish: replace it with something fitting its area. New concept: landing on 69 moves you to 97 (ignore the 20-square rule); on your next turn you must roll exactly 4 to win, otherwise you go back to 69 (a bump applies on 69 if another player is there). One chance to win, or back where you were.
- Square 32 stays as is and does not follow the "never lands on a reward/punishment" rule, so there are 2 chances for a Plot Twist.
- Square 100: "back to 82" becomes "back to 80 or less" (20-square rule) and applies to all players, not only the Snake Leader. Narrative fitting the area.
- Square 7 ("Not a Puddle: next turn you move exactly 1 square… one shoe is soaked") is bad: justify "next turn you move exactly 1 square" with something logical, fitting the area, not childish.
- Square 20 breaks the 20-square rule: adjust. And a balloon? Find something credible for the area.
- Square 40 breaks the 20-square rule: adjust.
- Square 45 becomes a Bonus card square like 30 (different narrative); Bog boots no longer exist.
- Squares 49 and 67 must change: repetitive, the Bog is gone, and they break the 20-square rule. Narrative fitting the area.
- Square 79 breaks the distance rule. It becomes a cards-and-strategy square: you must give one of your Bonus cards to another player (with more than 2 players you choose who). If you have none, you take one from another player (with more than 2 players you choose from whom). If nobody has a card to spare, nothing happens. Narrative fitting the area.
- Square 91 "Asleep on the Train": go back to 71 or less (20-square rule).
- The button on the right side is only for rolling the die. Every other button that shows next to "Roll die" (e.g. "Use Bonus card") becomes a popup that covers the right-side area (and the Roll die button), e.g. "Hey, you look in trouble! Would you like to use your Bonus card?" YES / NO. Same for the fallen tree: "You have a Bonus card! Use it, or wait to roll a 6?" Only after YES or NO does the popup close and "Roll die" becomes free (if the card was not used).
- Narrative in the right-side popups comes from a guide figure, like a wise man guiding you (all ages; like the mayors or advisers in city-building games). These popups show on the right side, blocking the die, and look different from today's left notification popups. Many can replace the left notifications, or co-exist without repeating information. Introduce the guide at the start ("I will be your guide on this trip to the Lantern Festival", "Don't just follow my advice, listen carefully"). The guide gives the areas importance: "Now you are entering the Forest! Ahead you will face falling trees, but you might also win a Bonus card… brace for changes". Guide popups appear only after the pieces have moved, so the travel and the "Don't get mad!" exclamations on the right are never covered. Decisions in guide popups are simple: yes or no.
- Remove the 202-square board completely. Keep only the 100-square board.
- Instead, 4 more destinations (you decide what to call them: maps, destinations, trips), each 100 squares. Before (or after, you decide) choosing the players, players choose a destination (e.g. a slideshow with images and a short summary of each trip). We always keep the Lantern Festival and add 4. Each destination has its own narrative, rewards and punishments, areas, guide and design (not all spirals: one might be a serpent or zig-zag). The rules stay the same, so players don't learn a new game: only the situations change.
- Update the initial game guide to the new rules. The guide figure can also give game tips during the game, e.g. "Did you know you need to roll a 6 to leave your home?"
- ATTENTION: revise the whole narrative. With popups split in two (left notifications, right guide), the narrative must fit each, be realistic, based on the areas (Home Town, Mountains, …) and on the purpose: the trip to the Lantern Festival. Make it more spiritual, dramatic and festive (all ages) so the guide can carry the tale. Test users find the current narrative very bad.

Start with the FIRST TASK only and wait for my answer.

---

## Part 2: the agreed decisions (owner, 25 Nov 2026)

All square numbers are on the 100-square board. Every text a player sees is still shown to the owner for approval
before it goes into the code.

### Rules

1. **No square numbers** anywhere in the game except on the zoomed square (the "→ 24" destination label stays there).
   This includes the box that opens when a square on the board is tapped. Texts say distances ("Go back 18 squares").
   Die numbers stay ("roll a 6", "needs exactly 4"). The hidden screen-reader labels keep the square numbers.
2. **One robot level** (Normal); the Easy/Normal choice is removed from the start screen. The robot: always rolls for a
   6 at Home and at the fallen tree (never the card there); uses its card on the first punishment it meets (area
   effects included); at the Swap Market gives to the player furthest behind and takes from the leader among the
   players holding a card. Measured in phase A against a simple player that exists only in the simulator.
3. **Removed completely:** lanterns (as a game item; the Lantern Festival and its lanterns stay as the destination),
   the Bog boots, the Bog, the moving fallen tree (back 10), the three-6s rule, the third-roll rule, the 202-square
   board, the Snake Leader.
4. **Bonus card.** Everyone starts with 1. More from squares 30, 45 and 85, the Seaside effect and the Swap Market.
   Uses: leave Home without a 6; get free from the fallen tree; cancel one of your own punishments (square 72 "others
   double", bad area effects and square 100 included). Never against: a bump, Plot Twist, the area swaps, the Swap
   Market, the Dragon Boat. Cancelling another player's reward is removed (the "Spoil it?" question and its "Don't ask
   me again" button go).
5. **Home** (was "Start"; the off-board Home and the Start square are one square on screen, called "Home"; the board
   label loses "a 6 to enter"). You need a 6 to leave: one roll per turn, no limit, nothing obligatory after any number
   of rolls. The 6 or the card only frees you; then you roll to move. A bumped player goes Home but needs **no** 6 to
   leave: a notification says so ("Back Home, but your bags are still packed…", text to approve), and the "needs 6"
   tag shows only when a 6 is really needed. A "free to go" popup shows after the freeing 6 or the card, at Home and at
   the fallen tree.
6. **Sixes:** every 6 rolls again, no limit; the rolls add up into one move. The 6 that frees you from Home or the tree
   does not move you and does not count toward the sixes postcards.
7. **Event moves** (fixed jumps): at most 20 squares, and never onto another event square. Exceptions: the Dragon Boat
   (69), Plot Twist (37) and "next good square" (32). Dice moves (the area effects' rolls, square 61) have no limit and
   trigger the square they end on, except the Forest's backward move. Swaps never trigger a square. No chaining.
8. **Areas:** Home Town Home–9 · Countryside 10–22 · Forest 23–38 · Mountains 39–56 · Seaside 57–76 · Big City 77–100.
   River & Lake and Festival Road are removed. Seaside's picture becomes the sailboat (River & Lake's).
9. **Area effects:** one fixed effect per area, the same for everyone and known in advance; once per player per area per
   game (entering again after a fall gives nothing). Triggered by your own move or your own square's jump into the
   area, never by another player's swap. Home Town has none. The square's own event happens first, then the area
   effect; it is told in the same "You have entered …" popup. The Bonus card cancels the bad ones (from that popup).

   | Area | Effect |
   |---|---|
   | Countryside | **Gifted 6:** you do not move 6 on its own; you roll again right away and move once by the total (6 + the new roll; a 6 keeps rolling, as any run of sixes). Does not count toward the sixes postcards. If the move carries you into the Forest, the Forest effect applies too. |
   | Forest | **Your next move goes backward.** If you roll a 6 you keep rolling and the whole total goes backward. Never further back than Home. No square event where you land; a bump does happen. A backward run of three or more 6s earns the sixes postcards. **If you are stuck at the fallen tree, the backward move applies right away on your next turn** (the tree blocks you going forward, not backward): you roll and go back, and that frees you from the tree. |
   | Mountains | **Your next roll counts double** (the whole total of a run of sixes). |
   | Seaside | **Swap with the player just in front of you** if within 20 squares; otherwise, or if you are leading: **a Bonus card**. |
   | Big City | **Swap with the player just behind you** if within 10 squares; otherwise, or if you are last: **lose your next turn**. |

10. **Fallen tree:** one fixed square at **27** (Forest), new picture. Landing on it by a roll: you are stuck. Each
    turn: roll for a 6, or use the Bonus card. A player stuck there can be bumped. (See the Forest effect above.)

### Squares

| Square | Area | New |
|---|---|---|
| 7 | Home Town | **The Candle Walk:** by old custom a traveller to the Lantern Festival carries a lit candle to the end of their street; next turn you move exactly 1 square. |
| 15 | Countryside | The Bog is removed. |
| 20 | Countryside | **The Village Bus:** forward to 36 (jumps over the tree; the Forest effect applies). |
| 30 / 45 / 85 | Forest / Mountains / Big City | Bonus card, each with its own story (45 was the Bog boots). |
| 32 | Forest | Unchanged ("next good square"; exception to the event-square rule). |
| 40 | Mountains | **Cable car:** forward to 56. The Mountain Lodge landmark moves to 56. |
| 49 | Mountains | **The Rockslide:** back to 31. |
| 54 | Mountains | Needs a new destination (its old one, 67, is no longer the Lodge): phase B. |
| 69 | Seaside | **The Dragon Boat:** forward to 97 (see below). |
| 74 | Seaside | **The Storm:** back to 57. |
| 79 | Big City | **The Swap Market** (new blue ◆ colour and icon): give one card if you hold one, otherwise take one; with 3–4 players you choose the player (only those who can receive / have a card are offered); with 2 players it is automatic; nothing happens if no card can move. The Bonus card cannot cancel it. |
| 91 | Big City | **Asleep on the Train:** back to 71 (exactly 20). |
| 100 | Big City | Back to 82, for **everyone**; new story for the Big City. |

Unchanged until the phase-B redesign: 10, 17, 37, 54 (destination), 61, 66, 72, 94, 96, 99.

**The Dragon Boat (69).** A festival dragon boat takes you to the festival pier (97). On your next **played** turn
(a missed turn waits) the die must show **exactly 4**: you win. Anything else (a 6 included, with no extra roll)
takes you back to 69, where a player standing there is bumped; 69's event does not happen again. A pending doubled roll
is ignored; the Bonus card cannot replace the 4 or cancel the return. If another player lands on 97 while you wait,
you are bumped Home and the deal ends; a player who swaps onto 97 (Plot Twist, area swaps) does not inherit the deal.

### Screens and the guide

- **The action area holds only "Roll die".** Every choice is a guide popup on the right that covers the die: the card
  at Home and at the fallen tree (**every turn** while a person holds a card; no card, no popup); the card on a
  punishment or a bad area effect; the Swap Market choice. "Skip this turn" and "Pass the die to …" become one-button
  popups. Robots get no popups.
- **Button labels (owner, 25 Nov):** plain YES / NO is **not** decided: when the question is "use the card or roll for a
  6?", YES or NO is unclear. Each button names its action (e.g. "Use my Bonus card" / "Roll for a 6"; "Use my Bonus
  card" / "Keep it"). The exact labels are approved with the texts.
- **Guide popups** (right) appear only after the pieces stop moving, so travel and the "Don't get mad!" moments are
  never covered. **Left notifications** keep only short facts and never repeat the guide.
- **The guide figure:** an adviser who travels with you (like the mayor or adviser of a city-building game); for the
  Lantern Festival an Asian wise man, respectful, no stereotypes; design approved later. He introduces himself at the
  start, announces every area and what lies ahead, and gives game tips once per device, to people only, never when his
  popup already says it; "How to play" resets the tips.
- **Opening guide:** 8 slides, rules only, no story words ("the last square", never "festival"); new screenshots.
  Slides: welcome · roll a 6 to leave Home or use the card · sixes add up, no limit · green ▲ / red ▼ / blue ◆, tap a
  square · the Bonus card · areas · bump (no 6 needed after) · the exact number to finish.
- **Player badge:** a Bonus card with the number held (a faded 0 when none) replaces the lantern badge. The card area
  under "…'s turn" keeps only the Bonus card slot.

### Leaderboard

One top 10 on the device, whoever played. Each person has a clock from leaving Home to the finish; it keeps running
after a bump. **Changed by the owner in phase E (26 Nov 2026):** the clock never pauses and is never saved: any
interruption voids the time for good (see "Owner decisions in phase E"). Only wins by people count (robots may play).
Columns: rank · player colour · time · date · number of players · destination. Messages for a top-10 time and for a
time outside the top 10: approved in phase E.

### Postcards

New: Fallen Tree; Sixes (3, 4, 5 and 6 in a row); The Dragon Boat; Straight Off the Boat (winning with the 4).
Removed from the album: Bog Boots, Three Sixes, The Bog, Snake Leader, River & Lake, Festival Road. One set per
destination; the album is sorted by destination.

### Destinations

The 202-square board is removed (saved games of it are dropped; its files and tests go; check that the store texts do
not mention 202 squares). Called **Destinations**: the Lantern Festival plus 4 new ones, 100 squares each, chosen
**first** (a slideshow with pictures and a short summary), then the players. Option (b): the same kinds of squares and
the same rules, but each destination places them its own way, with its own areas (starting from Home), area effects,
guide, board shape (not only spirals: e.g. a snake or zig-zag), narrative, pictures and postcards. Each is measured on
its own, one at a time.

### Narrative (phase B)

Voice first: 4–5 moments written in 2–3 styles (e.g. calm and wise / warm and festive / dramatic), the owner chooses.
Then area by area, each approved before the next. The guide carries the story; notifications carry the facts. All
ages, family rating, "spiritual" = wonder, light, journey and gratitude, not religion. No square numbers.

### Other

- The save version goes up: unfinished games are dropped, collected postcards are kept.
- Not in Step I: telling players about screen-reader support only after the owner tests a game with TalkBack.

### Owner decisions on the phase A plan (25 Nov 2026)

These change the points above where they differ (GCD R16, R20 updated).

- **Entering an area through an event gives no area effect.** An area effect happens only when your own plain roll takes
  you into the area, the first time you enter it that way. A green or red square's move (e.g. 17, 20, 49, 54, 61, 74,
  91) or another area's effect (the Countryside's gifted 6) that takes you into a new area gives nothing then, but the
  area is not used up: your first later entry by a plain roll still gives it. Reason (owner): an event never lands on
  another event. Square 32 stays the exception (it lands on a reward square).
  Example (owner): the Dragon Boat beats Big City, arriving at 97 by the boat gives no Big City effect.
- **Robots keep the three-throw rule:** at Home and at the fallen tree a robot rolls for a 6; after three throws without
  a 6, on its 3rd throw it must use its Bonus card, if it has one, and moves by that same throw in the same turn (as the
  v2 third throw works today). Not for people: they are never forced.
- **Defaults agreed with the plan:** two doubles do not stack (×2); a double also doubles a backward Forest move; the
  Forest backward move gives no area effect, and reaching Home that way needs no 6; a swap into an area gives no
  effect and does not count as entering; a player swapped off 97 loses the Dragon Boat deal; square 54 keeps → 67
  until phase B; the simulator's simple player uses its card at the first chance and picks the Swap Market partner at
  random; robot ties go to the next player in turn order.
- **Agreed after A2 (owner, 25 Nov 2026):** a roll into a new area whose square's event takes you out of it gives no
  effect from either area and uses neither up; a bumped player loses pending missed turns, a pending Forest backward
  move and being stuck at the tree, but keeps a pending "exactly 1" or double (as v2); square 7's "exactly 1" uses no
  roll, so a pending double or backward move waits; the Dragon Boat roll uses up (loses) a pending double; square 61's
  rolls and the Countryside's extra roll are not doubled (as 61 in v2).
- **Built side by side (phase A):** the v3 rules live next to v2 (src/engine/v3/, tools/sim/, data/lantern-festival.json),
  so the app keeps working; v2 code, the 202 board and their tests are deleted in phase C.

### Owner decisions in phase B (25–26 Nov 2026)

- **Square 54 → 65** (+11, measured best); squares 10, 17, 37, 61, 66, 72, 94, 96 and 99 unchanged; 32 and 37 stay linked.
- **Texts:** phase B also wrote the story moments tied to places; buttons, tips and leaderboard messages stay in C, E and F.
  Notifications come from shared patterns filled in from the board. The Village Bus promises no Forest effect (event
  entry gives none). Named plain squares are landmarks. Pictures are reused where possible.
- **The guide** is Mr. Lin, style A (calm and wise); he tells the story only to people, never for robots.
- **Each area's announcement is one text with a saying** that also tells its effect (no separate effect text).
- **Plot Twist when nobody is ahead:** no guide text, only the notification.
- **Pictures:** the falling-rocks sign follows China's official warning sign; the Dragon Boat and the Swap Market are
  drawn without people; the Forest's sign is a forest (not a compass).

### Owner decisions in phase C (26 Nov 2026)

Phase C (branch `claude/stepI-C`): the app plays the v3 rules on the Lantern Festival. Built in steps C1–C8, each
approved by the owner after seeing it.

- **Screens.** The action area holds only "Roll die". Mr. Lin's panel (right; on phones held upright the lower panel)
  covers the die after the pieces stop, holds every choice, and tells his story to people only; robots get none. On
  small and sideways phones, when his words do not fit, the panel covers the whole game screen. The left notifications
  use the approved patterns, for everyone. No square numbers on screen except the "→ 24" label.
- **Mr. Lin's figure** is the owner's own picture (`src/assets/guide/mr-lin.webp`, white background removed), in a round
  medallion at the top right of his panel, his name on its left, breathing gently. The panel has a little space around
  it in the colour around the board. His welcome and his area announcements play the "lantern-out" sound. The use
  rights of the tool that made the picture are to be checked by the owner before release (phase G).
- **Texts** (C2, all approved word for word, in `src/ui/app.ts`): the questions, buttons, notifications, labels and
  boxes. At Home and at the fallen tree Mr. Lin speaks in his own words ("To begin your journey, you may leave your fate
  to luck and hope to roll a 6. Or will you take your journey's fate into your own hands and use a Bonus card?"), with
  "Use Bonus card" / "No Bonus card this turn"; punishments "Use Bonus card" / "Keep my card". "The Lantern Festival"
  everywhere (finish square, start screen, the winner's postcard). The old welcome popup is gone.
- **Win popup:** "{p} made it!", Mr. Lin's finish story, "New game" · "Postcard album". A **Records** button (the
  ranking of finish times) comes with the leaderboard in phase E.
- **Board:** event squares are striped in their kind's colour (green ▲, red ▼, blue ◆ for the Swap Market); the area
  signs (`areaSign()`) say "Now entering"; the last arrow into the festival shows.
- **Squares 96 and 99** tell of the lantern's flame instead of keys: "The Flame Goes Out" and "Out Again!", with two new
  pictures (a lantern on the cobbles, no pole, no houses); the rules are unchanged.
- **Postcards** (17): the six areas (Forest shows the forest, Seaside the sailboat), The Lantern Festival, Fallen Tree,
  Three / Four / Five / Six Sixes (new dice pictures), The Dragon Boat, Straight Off the Boat, Dodged It!, Plot Twist,
  Out Again! (keeps the old "Forgot Keys AGAIN!!!" id). The v2-only postcards leave the album; collected ids stay.
- **Square 7** ("exactly 1 square"): that turn plays without a tap.
- **Saved games:** version 4; saves of the old version are dropped, collected postcards are kept.
- **Removed (C8):** the v2 engine, the 202- and old 100-square boards, their tests, the old story texts, "Spoil it?",
  the sounds lantern-on and bog. The v2 simulator and the paper boards are in `tools/sim/archive/v2/`.
- **Left for later phases:** "How to play" and its pictures still describe v2 (phase F, done); the leaderboard (phase E, done).

### Owner decisions in phase E (26 Nov 2026)

Phase E (branch `claude/stepI-E`): the Records, the device's 10 fastest win times. Built in steps E1–E6, each approved
by the owner.

- **The clock** (`src/ui/clock.ts`; owner: "any kind of interruption voids time"). A person's clock starts only when
  they leave Home and stops on the last square; a bump does not restart it. Only a game never interrupted from leaving
  Home to the last square gives a time. Any interruption stops every clock of the game at once and for good, with no
  pause, no restart and nothing kept in the saved game: the app hidden, minimised or closed, the window losing the focus
  (a click in another window on PC; a notification bar, call or system message on phones), the sound settings, "Leave
  game?" (even with "Stay"), a continued saved game, or a freeze of more than 5 seconds. Only the game's own popups are
  allowed. Robots are never timed. The time comes from the device's running timer, never from its clock time.
- **One clock per person** (owner: in another game fast clicks started two timers): a second start for the same person
  is refused at once, and a new game stops the previous game's clock.
- **The ranking** (`src/ui/records.ts`): stored only on this device, apart from the saved game and the postcards.
  Whole seconds; an equal newer time ranks below the older one; a time outside the top 10 is not written. Blocked or
  tampered storage gives no error. Time "12:34", "1:02:03" from an hour; date "26 Nov 2026" on every device. Records
  keep their destination's id and stay when a destination's board changes (one list or one per destination: decided in
  phase D). The saved game is unchanged (version 4).
- **Texts** (approved word for word; `RT` in `src/ui/records-page.ts`): the button "Records" (win popup: "New game" ·
  "Postcard album" · "Records"; start screen: next to "Postcards"), "Back", the title "Records", "The 10 fastest win
  times on this device.", "Only people's wins count, in games played from Home to the finish without interruption.",
  the columns "Rank · Player · Time · Date · Players · Destination", "No records yet. Win a game without interruption
  to set the first one." The win popup's line for a person's win: "Your win time, {t}, sets the first record." / "…,
  ranks 1st, beating all previous records." / "…, ranks {n} of all-time records." / "…, is not in the top 10 this
  time." / "Your win time is {t}. This device does not let the game keep records." / when the time was voided, only
  "Records count only games played without interruption." (no details). A robot's win: no line.
- **Screens:** the Records page is the album's full page with the Lantern Festival picture (reused). On phones under
  390 px each record shows on two lines, "1st ● Red 8:32" then "26 Nov 2026 · Players: 3 · The Lantern Festival" (three
  lines on a 280 px folded phone).
- **Privacy policy:** a row for the Records ("To show the Records"); effective 26 November 2026. Google Play's Data
  safety help says data processed only on the device is not "collected"; how Android's own backup is treated is checked
  in phase G.
- **Left for phase G:** whether the Android app tells the page it is hidden (the 5-second check covers it if not), on
  the owner's phone.

### Owner decisions in phase F (27 Nov 2026)

Phase F (branch `claude/stepI-F`): "How to play" for the v3 rules and Mr. Lin's game tips, plus the owner's fixes to
how his panel works. Built in steps F1–F8, each approved by the owner; every text and picture approved word for word
and after seeing it.

- **How to play** (`src/ui/guide.ts`): 8 pages, rules only, no story words ("the last square"): welcome · roll a 6 to
  leave Home or use the Bonus card · sixes add up, no limit · green ▲ / red ▼ / blue ◆ and tap a square · the Bonus
  card · areas · bump (no 6 needed after) · the exact number. Every page has a picture of the real game screen with
  its own hidden label (`src/assets/guide/`, made by `npm run guide:shots`): the start of a game; Blue's turn at Home;
  a 6 with "A six!" and "Roll again"; the Swap Market's box over the board; the players' card badges, Blue's circled
  and shown large below (owner); "Now entering · Mountains"; a bump with its two notifications; "needs exactly 3" with
  a 5 on the die. The picture box fits each picture (up to about a third of the screen), below "Skip"; on phones held
  sideways the card is wider so the smallest (653 × 280) needs no scrolling. No people drawn.
- **The Swap Market's box** (tapped on the board) is blue like its square; "blue ◆" on page 4 is blue.
- **Mr. Lin's tips** (`src/ui/tips.ts`, texts approved word for word): sixes, tap a square, bump, Bonus card, the exact
  number, the Records, in his own voice. Each once per device, to people only, never when he already speaks, at most one
  per turn. The sixes tip at the first "Roll again" after a 6 that moves; the others at the start of a "quiet turn" (a
  person's turn where he says nothing), in this order: the exact number (the last square 6 or fewer squares away, not
  on the boat) · bump (after this person bumped someone) · Bonus card (after a red square, the Forest's backward move
  or the Big City's lost turn met with no card) · tap a square · the Records (after "tap a square"). A bump or card tip
  waiting at the end of a game is forgotten. Opening "How to play" shows the tips again. Stored in `dgm.tips.v1`;
  blocked storage: no tips; tampered: read as none shown; never an error.
- **Talking time and game time** (owner: "lets say is game time and not talking time"). Every panel of Mr. Lin stays
  until one of its own buttons is tapped, and the game waits: his stories and tips close with **"I understand"**;
  choices keep their buttons; "Let's go" and "Skip this turn" stay. "Roll die" / "Roll again" are only in the action
  area beside the die, never in a popup. When a person taps "Roll die" (or the die), all notifications go at once, so
  the whole board is in view; notifications otherwise keep their few seconds; robots never clear them. The reading
  timer and the hourglass are gone.
- **"Pass the die to …"** (a one-button popup, as planned) holds Mr. Lin's words on where the player who just played
  stands (the destination's `standing` texts and each area's `at`, approved word for word, one sentence each; checked
  by the board check): "You stand in the Mountains, and 45 squares still lie between you and the festival lights. Red
  walks 10 squares ahead of you, and Green follows 5 squares behind." Also: at Home, at the fallen tree, on the Dragon
  Boat, leading, last, the others still at Home, nobody left Home; one square: "1 square still lies"
  (`src/ui/standing.ts`).
- **His words as a quote** (owner: so they read as said by Mr. Lin): where there is room, a cream card with a gold
  border and large gold quote marks; smaller when space is short; plain when it would not fit (nothing scrolls).
- **Privacy policy:** a row for the tips ("Which of Mr. Lin's tips have been shown" / "So each tip is shown only once,
  until "How to play" is opened again"); effective 27 November 2026.
- **Checks:** `test/tips.test.ts`, `test/standing.test.ts`; browser checks for the 8 pages at every size and real games
  (`tools/browser/tips.mjs`): tips, game time, the passing of the die, blocked storage.

### Owner decisions in the audit before phase G (27 Nov 2026)

A full audit of the game (code, logic in real games, every screen at 22 sizes): `docs/analysis/audit-2026-11-27.md`.
The owner approved fixing **every** finding in one batch ("no need for approval, you have my approval right now for
all corrections"), and asked to review the result afterwards. Changes to earlier decisions that this brought:

- **Mr. Lin's panel** shows the picture of what he speaks about (the game's own approved pictures: the square, the
  area, Home, the tree, the Dragon Boat, the festival) where there is room, and his words larger on big panels; his
  question alone (the fallen tree, Home after the first turn) is his quote too. It opens only once the square's stamps
  and the area sign have been seen (Part 2: his panel never covers them).
- **Notifications** no longer repeat what Mr. Lin has just said to a person (the Countryside's gifted 6, the Forest's
  backward move, the Mountains' double, the fallen tree, free to go, the Dragon Boat's 4); they still show for the
  others' turns. "1 square" instead of "1 squares". At the fallen tree, "The tree is still there…" is said once in a
  stay, not every turn.
- **The Swap Market** has no cheer and no "Lucky!" stamp when a player lands on it.
- **Records:** each record on two lines on phones up to 440 px wide (was: under 390 px).
- **The start screen** shows the Lantern Festival's picture where there is room.
- **The Android Back button** closes the postcard album, the Records and How to play first.
- The How to play pictures are made at 3× (the same approved pictures, sharper).

## Phased plan (approved)

S = 1 session, M = 2–3, L = 4+.

| Phase | What | Cost | Risk |
|---|---|---|---|
| A0 | Rewrite GCD rules R1–R21 with all of the above (text only) | S | Low |
| A | Engine + simulator + tests on board 100 with every agreed rule and square; measurement report (seats, game length, waiting at Home and the tree, lead changes, close finishes, card use, robot vs simple player). Decided (owner, 25 Nov 2026): keep both engines (src/engine and tools/sim/engine.mjs), change both the same way, and keep test/equivalence.test.ts comparing them game by game. Phase A starts in a new session | L | High: waiting and the harsh end may need fixes |
| B ✅ | Board redesign + full narrative (voice, squares, guide and notification texts, square 54, new pictures: tree, Dragon Boat, Swap Market, area signs); measure again. **Done 26 Nov 2026** (decisions below; GCD §9.3; `docs/analysis/stepI-A_measure.md`, "Phase B") | M–L | Medium |
| C ✅ | Screens: guide popups, notifications without numbers, Home square, card badge, start screen without board and level. **Done 26 Nov 2026** (decisions above) | M | Medium |
| E ✅ | Leaderboard (the Records). **Done 26 Nov 2026** (decisions above) | S–M | Low |
| F ✅ | Opening guide + in-game tips. **Done 27 Nov 2026** (decisions above) | S | Low |
| G | New Android (versionCode 4, 2.0.0) and Windows (2.0.0.0) versions, step by step on the owner's PC (after the audit of 27 Nov 2026) | M | Low–medium |
| D | Destination screen + new board shapes, then destinations 1–4 one at a time, each measured, each a later app update | L per destination | High cost, low rule risk |

Order: A0 → A → B → C → E → F → G (the improved Lantern Festival is released first), then D.
