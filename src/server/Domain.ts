import * as Schema from "effect/Schema";


export const EnvironmentValues = ["production", "development"] as const;
export const Environment = Schema.Literals(EnvironmentValues);
export type Environment = typeof Environment.Type;