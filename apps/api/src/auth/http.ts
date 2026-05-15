import * as Effect from "effect/Effect";
import * as HttpRouter from "effect/unstable/http/HttpRouter";

import { AuthService } from "./Services/AuthService.ts";

export const BetterAuthRouterLive = HttpRouter.use((router) =>
  router.add(
    "*",
    "/api/auth*",
    Effect.gen(function* () {
      const auth = yield* AuthService;

      return yield* auth.handler;
    }),
  ),
);
