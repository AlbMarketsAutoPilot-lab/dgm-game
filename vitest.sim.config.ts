import { defineConfig } from "vitest/config";

// Slow check (about a minute): the TypeScript engine reproduces the published 100,000-game measurements exactly.
export default defineConfig({
  test: {
    include: ["test/**/*.sim.ts"],
    testTimeout: 300_000,
  },
});
