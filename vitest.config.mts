import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    expect: {
      requireAssertions: true,
    },
    restoreMocks: true,
    server: {
      deps: {
        // next-intl's ESM middleware imports `next/server`, which Node's
        // native ESM resolver can't resolve — let Vite process it instead.
        // https://next-intl.dev/docs/environments/testing#vitest
        inline: ["next-intl"],
      },
    },
  },
});
