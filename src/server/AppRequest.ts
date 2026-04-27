import * as Context from "effect/Context"

export const AppRequest = Context.Service<globalThis.Request>("app/AppRequest")
