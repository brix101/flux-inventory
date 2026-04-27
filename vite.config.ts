import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

import neon from "./neon-vite-plugin.ts"

const config = defineConfig({
  plugins: [
    devtools(),
    neon,
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro({
      preset: "vercel",
    }),
  ],
})

export default config
