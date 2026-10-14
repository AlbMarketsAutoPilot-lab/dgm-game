# dgm-game

"Don't Get Mad!" — a family board game drawn on paper, turned into a free web + Android game.

- [Game Concept Document](docs/GCD.md)
- [Project Plan](docs/PROJECT_PLAN.md)
- [Rules engine](src/engine/README.md)

## Develop

Node 22. `npm install`, then:

| Command | What |
|---|---|
| `npm run dev` | Local app (Vite) |
| `npm test` | Rule tests + game-by-game check against the simulator (`tools/sim/`) |
| `npm run test:sim` | Slow (~1 min): reproduces the published 100,000-game measurements |
| `npm run typecheck` / `npm run build` | TypeScript check / production build in `dist/` |
