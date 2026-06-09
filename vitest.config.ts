import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["e2e/**", "test-results/**"],
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: [
      {
        find: /^astro:env\/client$/,
        replacement: path.resolve(__dirname, "./tests/env/client.ts"),
      },
      {
        find: /^astro:env\/server$/,
        replacement: path.resolve(__dirname, "./tests/env/server.ts"),
      },
      {
        find: /^@\//,
        replacement: path.resolve(__dirname, "./src/") + "/",
      },
    ],
  },
});
