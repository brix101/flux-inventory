import { Schema } from "effect";

export const CursorSchema = Schema.Struct({
  id: Schema.String,
  // Schema.Any or Schema.Unknown is used here because 'value' could be a string, number, or boolean depending on what you sort by
  value: Schema.optional(Schema.Unknown),
});

export type Cursor = typeof CursorSchema.Type;

// 2. Create a decoder that takes a JSON string from the URL and validates it against CursorSchema
export const CursorFromString = Schema.fromJsonString(CursorSchema);

export const PaginationMeta = Schema.Struct({
  total: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  // page: Schema.Number.check(Schema.isGreaterThanOrEqualTo(1)),
  pageSize: Schema.Number.check(Schema.isGreaterThanOrEqualTo(1)),
  // totalPages: Schema.Number.check(Schema.isGreaterThanOrEqualTo(1)),
  // nextPage: Schema.NullOr(Schema.Number.check(Schema.isGreaterThanOrEqualTo(1))),
  hasMore: Schema.Boolean,
  nextCursor: Schema.NullOr(Schema.String),
});

export const SearchParams = Schema.Struct({
  cursor: Schema.optionalKey(Schema.String).pipe(
    Schema.annotate({
      title: "Cursor",
      description: "A base64 encoded cursor string for pagination",
    }),
  ),
  pageSize: Schema.optionalKey(Schema.NumberFromString).pipe(
    Schema.annotate({
      title: "Page Size",
      description: "The number of items per page defaults to 20",
    }),
  ),
  // Added to support the dynamic sorting we built earlier
  sortBy: Schema.optionalKey(Schema.String).pipe(
    Schema.annotate({
      title: "Sort By",
      description: "The column to sort the results by (e.g., 'name')",
    }),
  ),
});
