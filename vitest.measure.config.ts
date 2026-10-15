import { defineConfig } from "vitest/config";

// Measurements of proposed rule changes (not tests): `npx vitest run --config vitest.measure.config.ts`.
export default defineConfig({
  test: { include: ["tools/measure/*.measure.ts"], testTimeout: 3_600_000 },
});
