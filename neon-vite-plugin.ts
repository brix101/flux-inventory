import { postgres } from "vite-plugin-neon-new"

export default postgres({
  seed: {
    type: "sql-script",
    path: "schema/0000_simple_cyclops.sql",
  },
  referrer: "flux",
  dotEnvKey: "DATABASE_URL",
})
