import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import { config } from "dotenv";
import * as Layer from "effect/Layer";

import { HttpLive } from "./http.ts";

config({ path: [".env.local", ".env"] });

Layer.launch(HttpLive).pipe(NodeRuntime.runMain);
