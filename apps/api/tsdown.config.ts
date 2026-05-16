import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm", "cjs"],
  checks: {
    legacyCjs: false,
  },
  outDir: "dist",
  sourcemap: true,
  clean: true,
  noExternal: (id) => id.startsWith("@flux/") || id.startsWith("effect-acp"),
  inlineOnly: false,
  banner: {
    js: "#!/usr/bin/env node\n",
  },
});
