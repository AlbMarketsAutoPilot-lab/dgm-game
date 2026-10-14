# Market & Audience Report — Don't Get Mad!

**Step 1b** · 14 Oct 2026 · Method: web research of public sources (no paid reports).
Every number below comes from a listed source. Where a source is weak (an ad agency, a vendor, or a company's own statement), it is marked **(weak)**. Text marked **Recommendation** is design reasoning, not data.

---

## 1. Which game family are we in?

Our game is a **roll-and-move race game**, like *Ludo* / *Mensch ärgere Dich nicht*, combined with **Snakes & Ladders**: 202 numbered tiles, ladders, snakes and event tiles. This is one of the biggest and oldest game families:

| Fact | Number | Source |
|---|---|---|
| *Mensch ärgere Dich nicht* (since 1914) copies sold | ~70 million (older figure) · 100 million (publisher's figure for the 110th anniversary) | [Wikipedia][madn], [Vienna.at][madn110] |
| *Ludo King* (mobile Ludo) downloads | crossed **1 billion** in 2024 | [Wikipedia][ludoking] |
| *Ludo King* active users (2020) | 32 million daily, 142 million monthly | [afaqs][afaqs] |
| Average play time per day, *Ludo King* | ~45 minutes | [Wikipedia][ludoking] |
| Online board games market | USD 2.28 billion (2025) → 3.52 billion (2031) | [Mordor Intelligence][mordor] (estimate) |
| Mobile games overall | USD 103 billion in 2025, 55% of the games market, ~3 billion players | [Newzoo via PocketGamer][newzoo] |
| Physical board games market growth | +USD 5.17 billion, 9.5% a year (2024–2029). Mobile apps and digitisation are named as both a driver and a challenge. | [Technavio][technavio] |

**Conclusion:** the game family is proven at a very large scale. The digital version of the classic (*Ludo King*) reached a billion downloads, so demand for a simple race game on phones is real.

## 2. Who plays these games? Target categories

### Category A — Families with young children (about 4–8 years)
- **Evidence:** in randomised studies, playing a **linear board game with numbered squares** for about 1 hour (four 15–20 minute sessions) improved preschoolers' counting, number reading, comparing magnitudes and number-line estimation. The gains lasted 9 weeks. The same game with colours instead of numbers did **not** help. ([Siegler & Ramani, IES/WWC][wwc], [Ramani et al. 2012][ramani12], [Education Week][edweek])
- The WWC review rated it as meeting standards **without reservations**, based on 1 randomised study of 88 children. Most of the evidence comes from one research group.
- **Why it fits us:** our board *is* a numbered linear race (1 → 202). That is exactly the type of game these studies used.

### Category B — Young adults playing casual mobile games with friends
- About **70% of *Ludo King* users are 18–34**, according to the developer's CEO **(weak — company statement)**. An ad agency gives 34% aged 18–24, 40% aged 25–34 and 77% male **(weak — ad seller)**. ([afaqs][afaqs], [The Media Ant][mediaant])
- During the pandemic the game also gained players aged **45+** ([Wikipedia][ludoking]).
- **Conclusion:** the digital race game is **not only for kids**. Its biggest audience is young adults playing *socially* with friends and family.

### Category C — Grandparents and intergenerational play
- In a 2025 study of 11 older-adult–child pairs, the older adults showed more prosocial behaviour, and **competitive** play produced *more* prosocial behaviour than cooperative play. Older players also reported real effort or difficulty. ([PMC12235071][pmc-intergen])
- A board game designed for conversation between generations improved intergenerational communication and health literacy. The sample was small (31 older adults). ([PMC12761915][pmc-dialogue])
- **Cognitive health:** the PAQUID study (3,675 people followed for 20 years) found **15% lower dementia risk** in board-game players (HR 0.85). However, after adjusting for starting cognition and depression the effect was **no longer significant** (HR 0.96). Board-game players did show slower decline and less depression. ([Dartigues et al., BMJ Open 2013][paquid])
- **Conclusion:** the strong evidence is for **social connection across ages**. Claims that the game "protects the brain" are **not** supported well enough to use in marketing.

### Category D — Players with disabilities (inclusive play)
- The Game Accessibility Guidelines rank measures by reach, impact and cost. Their **basic** tier includes: *never convey essential information by colour alone*, *let players remap controls*, and *keep controls simple*. ([Game Accessibility Guidelines][gag])
- **Why it fits us:** a roll-and-move game needs only **one input (tap to roll)**, so it can be fully one-handed, slow-paced and readable aloud.

### Category E — "Thinking" players (the intellectual niche)
- Quantic Foundry's Board Game Motivation Profile (about 41,000 respondents) groups motivations into clusters, including **Social Fun** (a good time with friends; prefers accessible games) and **Strategy** (with *Need to Win*) and **Conflict** (with *Social Manipulation*). ([Quantic Foundry][qf], [QF board profile][qf2])
- Our v0 simulation shows that today the game is **pure luck with no decisions** (cards are auto-used, and switching them off changes almost nothing — see [SIM_REPORT_v0](SIM_REPORT_v0.md)). As it stands, it serves **Social Fun** but offers nothing to **Strategy** players.

## 3. Summary: segment fit

| Category | Size / evidence | Fit of current paper rules | Main thing missing |
|---|---|---|---|
| A. Young families | Strong learning evidence for numbered linear boards | ✅ good (numbered race, stories) | Long games (median 50 rounds), too much waiting at Start |
| B. Young adults, social mobile | Largest digital audience (weak data) | ⚠️ medium | Quick sessions, playing with friends, fun "take that" moments |
| C. Grandparents + grandchildren | Good social evidence; cognitive evidence weak | ✅ good (luck makes ages equal) | Big text, slow pace, read-aloud |
| D. Disabilities | Clear guidelines | ✅ possible (one tap) | Colour + shape, audio, contrast, reduced motion |
| E. Thinking players | Known motivation cluster | ❌ poor | Real choices that matter but stay simple |

## 4. Recommendations (input for Step 1c — design reasoning, not data)

### 4.1 Social niche (A, B, C)
1. **Two game lengths:** a *Short trip* (fewer tiles) and the *Grand tour* (the full board). The simulator will tune both to target lengths that you choose (see §6).
2. **Pass-and-play on one phone** first; it costs nothing (no servers). Online play would need a server, which conflicts with cost 0, so leave it for later.
3. **Keep the comeback feeling.** In v0, a player last at halfway still wins 17%. Keep that, so younger or weaker players always have a chance against older ones (category C).
4. **Short, funny shared stories** on event tiles (the paper board's "Forgot keys again!!!" style) that make the table laugh together. These are the social glue.
5. **"Take that" moments with a soft landing:** keep swap and double-throw style tiles, but cap how many turns anyone can lose in a row, so nobody gets bored or upset (v0: 29% of players had 10+ turns without moving).

### 4.2 Intellectual niche (E, and older A)
1. **Cards become choices, not automatic.** Hold up to 2 cards; decide *when* to play them, e.g. "skip a punishment", "re-roll", "move ±1". This adds decisions without adding reading.
2. **Fork paths:** at a few places, choose a safe route or a risky shortcut. The simulator must show that both routes have about the same chance of winning, so the choice is interesting but not a trap.
3. **Optional "Thinker" mode:** roll 2 dice and choose which one to use. Off by default, so the base game stays simple.
4. **Learning layer for kids (category A):** say the tile number aloud on each step and count the steps (the Siegler & Ramani effect depends on the **numbers**, so tiles must stay numbered).

### 4.3 Inclusive by default (C, D)
- One-tap play; big buttons; **every special tile = colour + icon**; tokens differ by **shape** as well as colour (as the real buttons do); read-aloud; high contrast; reduced motion; no timers.

### 4.4 Store and policy (Google Play)
- If children are a target audience, the app must follow Google Play's **Families Policy** (child-safety laws such as COPPA/GDPR, no precise location, no sending children's device identifiers). Apps that comply can apply for **Teacher Approved**. ([TechCrunch][tc-families]) *Check the current policy text in the Play Console before publishing — the sources are from 2019–2020.*
- Our plan already fits: **no ads, no accounts, no data collected, works offline.**

## 5. Limitations
- No paid market reports were used, so the demographic numbers for *Ludo King* come from company and agency statements **(weak)**.
- The learning evidence (Category A) comes mostly from one research group, with small samples.
- No source sized "mobile race games" separately, so the figures above describe the wider market.

## 6. Decisions needed from you before Step 1c
1. **Primary target:** A (families with young kids) + C (grandparents) as the core, with E as an optional mode? *(Recommendation)*
2. **Target game length** for the *Short* and *Grand* modes (in rounds or minutes).
3. **Learning layer** (numbers read aloud): yes or no?

---

## Sources
[madn]: https://en.wikipedia.org/wiki/Mensch_%C3%A4rgere_Dich_nicht
[madn110]: https://www.vienna.at/mensch-argere-dich-nicht-kultspiel-wird-110-jahre/8531680
[ludoking]: https://en.wikipedia.org/wiki/Ludo_King
[afaqs]: https://www.afaqs.com/news/mktg/ludo-king-grew-400-in-2020-vikash-jaiswal-gametion-technologies
[mediaant]: https://www.themediaant.com/digital/ludo-king-app-advertising
[mordor]: https://www.mordorintelligence.com/es/industry-reports/global-online-board-games-market
[newzoo]: https://www.pocketgamer.biz/newzoo-revises-2025-global-games-market-growth-forecast-to-1889bn
[technavio]: https://technavio.com/report/global-board-games-market-analysis-share-2018
[wwc]: https://ies.ed.gov/ncee/wwc/study/78079
[ramani12]: https://education.umd.edu/sites/default/files/uploads/Ramani%20et%20al.%2C%202012%20%281%29.pdf
[edweek]: https://www.edweek.org/education/study-board-games-boost-preschoolers-math-skills/2009/08
[pmc-intergen]: https://pmc.ncbi.nlm.nih.gov/articles/PMC12235071/
[pmc-dialogue]: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12761915/
[paquid]: https://bmjopen.bmj.com/content/3/8/e002998
[gag]: https://gameaccessibilityguidelines.com/
[qf]: https://quanticfoundry.com/2016/09/21/board-game-profile-v2/
[qf2]: https://quanticfoundry.com/2016/08/03/board-game-profile/
[tc-families]: https://techcrunch.com/?p=2443737

- [Mensch ärgere Dich nicht — Wikipedia][madn] · [Vienna.at — 110 years][madn110]
- [Ludo King — Wikipedia][ludoking] · [afaqs — Ludo King grew 400% in 2020][afaqs] · [The Media Ant — Ludo King advertising][mediaant]
- [Mordor Intelligence — online board games market][mordor] · [Newzoo via PocketGamer][newzoo] · [Technavio — board games market][technavio]
- [IES What Works Clearinghouse — linear number board game][wwc] · [Ramani, Siegler & Hitti 2012][ramani12] · [Education Week 2009][edweek]
- [Intergenerational play study (PMC12235071)][pmc-intergen] · [Intergenerational dialogue board game (PMC12761915)][pmc-dialogue] · [Dartigues et al., BMJ Open 2013][paquid]
- [Game Accessibility Guidelines][gag] · [Quantic Foundry board game profile v2][qf] · [Quantic Foundry board game profile][qf2]
- [TechCrunch — Google Play kids' apps policy][tc-families]
