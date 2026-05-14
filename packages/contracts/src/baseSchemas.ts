import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

export const TrimmedString = Schema.Trim;
export const TrimmedNonEmptyString = TrimmedString.check(Schema.isNonEmpty());

export const NonNegativeInt = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));
export const PositiveInt = Schema.Int.check(Schema.isGreaterThanOrEqualTo(1));

export const IsoDateTime = Schema.String;
export type IsoDateTime = typeof IsoDateTime.Type;

/**
 * Construct a branded identifier. Enforces non-empty trimmed strings
 */
const makeEntityId = <Brand extends string>(brand: Brand) => {
  return TrimmedNonEmptyString.pipe(Schema.brand(brand));
};

/**
 * Domain schemas and inferred types for the application.
 * Each Zod schema is exported in PascalCase, followed by its inferred type with the same name.
 *
 * Schemas must align with corresponding database tables especially code tables for roles and statuses.
 */

export const intToBoolean = Schema.Int.pipe(
  Schema.decodeTo(
    Schema.Boolean,
    SchemaTransformation.transform({
      decode: (num) => num !== 0,
      encode: (bool) => (bool ? 1 : 0),
    }),
  ),
);

/**
 * Custom codec for ISO datetime strings. Can't use z.iso() because it expects 'T' separator,
 * but SQLite supports ISO strings without 'T' (e.g., "2023-01-01 12:00:00").
 */
export const isoDatetimeToDate = Schema.String.pipe(
  Schema.decodeTo(
    Schema.DateValid,
    SchemaTransformation.transform({
      decode: (str) => new Date(str),
      encode: (date) => date.toISOString(),
    }),
  ),
);

export const EmailSchema = Schema.String.check(
  Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Must be a valid email address" }),
);
export const PasswordSchema = Schema.String.pipe(
  Schema.check(Schema.isNonEmpty({ message: "Password cannot be empty" })),
  Schema.check(Schema.isMinLength(8, { message: "Password must be at least 8 characters long" })),
  Schema.check(Schema.isMaxLength(32, { message: "Password must be at most 32 characters long" })),
  // TODO: Add regex check for complexity (uppercase, lowercase, number, special chars
  // Schema.check(Schema.isPattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
);

export const EnvironmentValues = ["production", "development"] as const;
export const Environment = Schema.Literals(EnvironmentValues);
export type Environment = typeof Environment.Type;

export const CategoryId = makeEntityId("CategoryId");
export type CategoryId = typeof CategoryId.Type;

export const ProductId = makeEntityId("ProductId");
export type ProductId = typeof ProductId.Type;

export const SuccessSchema = Schema.Struct({
  message: Schema.String,
});

export const ParamsSchema = Schema.Struct({
  name: Schema.String,
});
