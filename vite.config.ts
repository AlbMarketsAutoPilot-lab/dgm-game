import { defineConfig } from "vitest/config";

export default defineConfig({
  // Relative asset paths, so the build works on GitHub Pages and inside the Android app (Steps 7–8).
  base: "./",
  test: {
    include: ["test/**/*.test.ts"],
  },
});
