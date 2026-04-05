import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  target: "es2020",
  platform: "neutral",
  external: ["@abdokouta/react-di", "react", "@upstash/redis"],
  splitting: false,
  skipNodeModulesBundle: true,
  outExtension({ format }) {
    return { js: format === "esm" ? ".mjs" : ".js" };
  },
});
