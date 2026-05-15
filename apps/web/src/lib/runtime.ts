import { Layer, ManagedRuntime } from "effect";

import { ApiClient } from "./api-client";

const appLayer = Layer.mergeAll(ApiClient.layer);

export const runtime = ManagedRuntime.make(appLayer);
