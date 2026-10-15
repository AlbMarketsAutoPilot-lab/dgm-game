# The new choices, measured (owner, 15 Oct 2026)

Proposed: (1) the Bog boots are offered ("wear them?"), not worn by themselves; (2) waiting at Home or in the Bog
with at least one lantern, a player may spend a lantern to leave at once instead of throwing for a 6, then throws to
move. Computer players for every seat; 20,000 games per line; `npx vitest run --config vitest.measure.config.ts`.

## The Quick Trip (short board), 4 players

### 1. Everyone plays the same way

| Everyone… | Rounds: mean | median | 90% of games under | Won as the last one left | Players out per game | Lanterns lost per player | Round leaving Home |
|---|---|---|---|---|---|---|---|
| never spends (today's game; the computer) | 28.9 | 27 | 44 | 0.0% | 0.00 | 0.81 | 2.5 |
| spends at once, keeping 1 lantern spare (≥ 2) | 26.9 | 25 | 42 | 0.0% | 0.01 | 1.45 | 1.0 |
| spends at once, whenever it has 1 | 26.7 | 24 | 42 | 0.0% | 0.03 | 1.50 | 1.0 |
| spends instead of the 3rd throw (≥ 2) | 28.6 | 26 | 44 | 0.0% | 0.00 | 0.96 | 2.5 |
| spends only in the Bog (≥ 2) | 28.4 | 26 | 44 | 0.0% | 0.01 | 1.04 | 2.5 |
| spends only at Home (≥ 2) | 27.1 | 25 | 43 | 0.0% | 0.01 | 1.23 | 1.0 |
| never wears the Bog boots | 28.9 | 26 | 45 | 0.0% | 0.01 | 0.83 | 2.5 |

### 2. One player plays a way, the others never spend (fair share 25%; the player sits at each seat in turn)

| The one player… | Wins | Gain over the fair share |
|---|---|---|
| spends at once, keeping 1 lantern spare (≥ 2) | 26.7% | +1.7 points |
| spends at once, whenever it has 1 | 26.5% | +1.5 points |
| spends instead of the 3rd throw (≥ 2) | 25.2% | +0.2 points |
| spends only in the Bog (≥ 2) | 25.8% | +0.8 points |
| spends only at Home (≥ 2) | 26.0% | +1.0 points |
| never wears the Bog boots | 24.8% | -0.2 points |

## The Quick Trip (short board), 2 players

### 1. Everyone plays the same way

| Everyone… | Rounds: mean | median | 90% of games under | Won as the last one left | Players out per game | Lanterns lost per player | Round leaving Home |
|---|---|---|---|---|---|---|---|
| never spends (today's game; the computer) | 33.6 | 30 | 54 | 0.6% | 0.01 | 0.88 | 2.5 |
| spends at once, keeping 1 lantern spare (≥ 2) | 31.3 | 28 | 51 | 1.6% | 0.02 | 1.52 | 1.0 |
| spends at once, whenever it has 1 | 31.1 | 28 | 50 | 2.7% | 0.03 | 1.57 | 1.0 |
| spends instead of the 3rd throw (≥ 2) | 33.5 | 30 | 54 | 0.7% | 0.01 | 1.06 | 2.5 |
| spends only in the Bog (≥ 2) | 33.2 | 30 | 53 | 0.9% | 0.01 | 1.12 | 2.5 |
| spends only at Home (≥ 2) | 32.1 | 29 | 52 | 0.9% | 0.01 | 1.30 | 1.0 |
| never wears the Bog boots | 33.7 | 30 | 54 | 0.8% | 0.01 | 0.93 | 2.5 |

### 2. One player plays a way, the others never spend (fair share 50%; the player sits at each seat in turn)

| The one player… | Wins | Gain over the fair share |
|---|---|---|
| spends at once, keeping 1 lantern spare (≥ 2) | 51.2% | +1.2 points |
| spends at once, whenever it has 1 | 51.0% | +1.0 points |
| spends instead of the 3rd throw (≥ 2) | 50.3% | +0.3 points |
| spends only in the Bog (≥ 2) | 51.1% | +1.1 points |
| spends only at Home (≥ 2) | 51.1% | +1.1 points |
| never wears the Bog boots | 49.6% | -0.4 points |

## The Grand Journey (long board), 4 players

### 1. Everyone plays the same way

| Everyone… | Rounds: mean | median | 90% of games under | Won as the last one left | Players out per game | Lanterns lost per player | Round leaving Home |
|---|---|---|---|---|---|---|---|
| never spends (today's game; the computer) | 50.6 | 47 | 76 | 0.0% | 0.00 | 0.83 | 2.5 |
| spends at once, keeping 1 lantern spare (≥ 2) | 48.5 | 45 | 73 | 0.0% | 0.01 | 1.45 | 1.0 |
| spends at once, whenever it has 1 | 48.1 | 45 | 72 | 0.0% | 0.02 | 1.48 | 1.0 |
| spends instead of the 3rd throw (≥ 2) | 50.3 | 47 | 75 | 0.0% | 0.00 | 1.00 | 2.5 |
| spends only in the Bog (≥ 2) | 50.2 | 47 | 74 | 0.0% | 0.01 | 1.04 | 2.5 |
| spends only at Home (≥ 2) | 48.9 | 45 | 74 | 0.0% | 0.01 | 1.25 | 1.0 |
| never wears the Bog boots | 50.9 | 47 | 76 | 0.0% | 0.00 | 0.86 | 2.5 |

### 2. One player plays a way, the others never spend (fair share 25%; the player sits at each seat in turn)

| The one player… | Wins | Gain over the fair share |
|---|---|---|
| spends at once, keeping 1 lantern spare (≥ 2) | 25.8% | +0.8 points |
| spends at once, whenever it has 1 | 25.8% | +0.8 points |
| spends instead of the 3rd throw (≥ 2) | 25.2% | +0.2 points |
| spends only in the Bog (≥ 2) | 25.5% | +0.5 points |
| spends only at Home (≥ 2) | 25.6% | +0.6 points |
| never wears the Bog boots | 24.8% | -0.2 points |

## The Grand Journey (long board), 2 players

### 1. Everyone plays the same way

| Everyone… | Rounds: mean | median | 90% of games under | Won as the last one left | Players out per game | Lanterns lost per player | Round leaving Home |
|---|---|---|---|---|---|---|---|
| never spends (today's game; the computer) | 60.6 | 54 | 97 | 0.5% | 0.01 | 0.89 | 2.5 |
| spends at once, keeping 1 lantern spare (≥ 2) | 58.3 | 52 | 94 | 1.5% | 0.01 | 1.52 | 1.0 |
| spends at once, whenever it has 1 | 57.8 | 52 | 92 | 2.3% | 0.02 | 1.55 | 1.0 |
| spends instead of the 3rd throw (≥ 2) | 60.4 | 54 | 96 | 0.7% | 0.01 | 1.08 | 2.5 |
| spends only in the Bog (≥ 2) | 59.5 | 53 | 94 | 0.8% | 0.01 | 1.10 | 2.5 |
| spends only at Home (≥ 2) | 58.8 | 52 | 94 | 0.9% | 0.01 | 1.31 | 1.0 |
| never wears the Bog boots | 60.9 | 54 | 97 | 1.0% | 0.01 | 0.96 | 2.5 |

### 2. One player plays a way, the others never spend (fair share 50%; the player sits at each seat in turn)

| The one player… | Wins | Gain over the fair share |
|---|---|---|
| spends at once, keeping 1 lantern spare (≥ 2) | 50.7% | +0.7 points |
| spends at once, whenever it has 1 | 50.4% | +0.4 points |
| spends instead of the 3rd throw (≥ 2) | 49.8% | -0.2 points |
| spends only in the Bog (≥ 2) | 50.6% | +0.6 points |
| spends only at Home (≥ 2) | 50.4% | +0.4 points |
| never wears the Bog boots | 49.9% | -0.1 points |

