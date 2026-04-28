import * as Data from "effect/Data"

export class DatabaseConnectionLostError extends Data.TaggedError(
  "DatabaseConnectionLostError"
)<{
  cause: unknown
  message: string
}> {}

export class ResponseError extends Data.TaggedError("ResponseError")<{
  cause: unknown
  message: string
}> {}
