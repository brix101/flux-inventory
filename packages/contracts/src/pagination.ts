import { Effect, Schema, SchemaGetter, SchemaTransformation } from "effect";

export const CursorSchema = Schema.Struct({
  id: Schema.String,
  value: Schema.optional(Schema.Unknown),
});

export type Cursor = typeof CursorSchema.Type;

export const CursorFromString = Schema.fromJsonString(CursorSchema);

export const PaginationMeta = Schema.Struct({
  total: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  page: Schema.Number.check(Schema.isGreaterThanOrEqualTo(1)),
  size: Schema.Number.check(Schema.isGreaterThanOrEqualTo(1)),
  totalPages: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  nextPage: Schema.NullOr(Schema.Number.check(Schema.isGreaterThanOrEqualTo(1))),
});

const ValidSortString = Schema.Union([
  Schema.String.check(Schema.isNonEmpty()),
  Schema.TemplateLiteral([Schema.String.check(Schema.isNonEmpty()), ".asc"]),
  Schema.TemplateLiteral([Schema.String.check(Schema.isNonEmpty()), ".desc"]),
]);

export const SortBySchema = Schema.Union([
  ValidSortString,
  Schema.Tuple([Schema.String, Schema.Literals(["asc", "desc"])]),
]).pipe(
  Schema.decodeTo(Schema.Tuple([Schema.String, Schema.Literals(["asc", "desc"])]), {
    decode: SchemaGetter.transform((input: unknown): readonly [string, "asc" | "desc"] => {
      if (typeof input === "string") {
        const parts = input.split(".");
        const column = parts[0] ?? "";
        const order = (parts[1] as "asc" | "desc" | undefined) ?? "asc";
        return [column, order] as const;
      }
      return input as readonly [string, "asc" | "desc"];
    }),
    encode: SchemaGetter.transform(
      ([column, order]: readonly [string, "asc" | "desc"]) => `${column}.${order}`,
    ),
  }),
);

export const SearchParamsSchema = Schema.Struct({
  page: Schema.optionalKey(Schema.Number).pipe(
    Schema.withDecodingDefaultTypeKey(Effect.succeed(1)),
  ),
  size: Schema.optionalKey(Schema.Number).pipe(
    Schema.withDecodingDefaultTypeKey(Effect.succeed(20)),
  ),
  sort: Schema.optionalKey(Schema.String).pipe(
    Schema.withDecodingDefaultTypeKey(Effect.succeed("createdAt.desc")),
  ),
  q: Schema.optionalKey(Schema.String),
});

export type SearchParams = typeof SearchParamsSchema.Type;
