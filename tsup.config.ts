import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "es2020",
  // Declarations come from `tsc` (see tsconfig.build.json) — tsup's bundled
  // dts plugin does not support the TypeScript version this repo builds with.
  dts: false,
  clean: true,
  minify: false,
  sourcemap: true,
  treeshake: true,
});
