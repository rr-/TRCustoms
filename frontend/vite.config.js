/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/tests/**/*.test.{ts,tsx}"],
    // happy-dom stands up ~3x faster than jsdom; threads start cheaper than
    // forks; and skipping per-file isolation reuses one environment per worker.
    // Our tests are leak-safe (per-test query clients + afterEach cleanup), so
    // together these cut the suite roughly in half.
    pool: "threads",
    isolate: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Framework code shared by every route stays in one long-lived chunk
          // so navigating between lazy pages never re-downloads it.
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "@tanstack/react-query",
          ],
        },
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "src",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
});
