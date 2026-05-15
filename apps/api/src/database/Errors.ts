import * as Data from "effect/Data";

export class DatabaseConnectionLostError extends Data.TaggedError("DatabaseConnectionLostError")<{
  cause: unknown;
  message: string;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly type:
    | "unique_violation"
    | "foreign_key_violation"
    | "connection_error"
    | "unknown_error";
  readonly cause: unknown;
}> {
  public override get message(): string {
    if (this.cause instanceof Error) {
      return this.cause.message;
    }

    if (this.cause && typeof this.cause === "object" && "message" in this.cause) {
      return String(this.cause.message);
    }

    return String(this.cause);
  }

  public override toString(): string {
    return `DatabaseError [${this.type}]: ${this.message}`;
  }
}
