import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "./core"),
      "@services": path.resolve(__dirname, "./services"),
      "@features": path.resolve(__dirname, "./features"),
      "@app": path.resolve(__dirname, "./app"),
    },
  },
});