import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

import { EmailSchema, isoDatetimeToDate } from "./baseSchemas.ts";

export const UserRoleValues = ["user", "manager", "admin"] as const;
export const UserRole = Schema.String.pipe(
  Schema.decodeTo(
    Schema.Literals(UserRoleValues),
    SchemaTransformation.transform({
      decode: (str) =>
        UserRoleValues.includes(str as (typeof UserRoleValues)[number])
          ? (str as (typeof UserRoleValues)[number])
          : "user",
      encode: (role) => role,
    }),
  ),
);
export type UserRole = typeof UserRole.Type;

export const MemberRoleValues = ["member", "owner", "admin"] as const;
export const AssignableMemberRoleValues = ["member", "manager", "admin"] as const;
export const MemberRole = Schema.Literals(MemberRoleValues);
export type MemberRole = typeof MemberRole.Type;

export const User = Schema.Struct({
  id: Schema.NonEmptyString.pipe(Schema.brand("UserId")),
  name: Schema.String,
  email: EmailSchema,
  emailVerified: Schema.Boolean,
  image: Schema.NullishOr(Schema.String),
  role: Schema.NullishOr(UserRole),
  banned: Schema.NullishOr(Schema.Boolean),
  banReason: Schema.NullishOr(Schema.String),
  banExpires: Schema.NullishOr(Schema.Date),
  // stripeCustomerId: Schema.NullishOr(Schema.String),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
export type User = typeof User.Type;

export const Session = Schema.Struct({
  id: Schema.NonEmptyString.pipe(Schema.brand("SessionId")),
  expiresAt: Schema.Date,
  token: Schema.NonEmptyString,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  ipAddress: Schema.NullishOr(Schema.String),
  userAgent: Schema.NullishOr(Schema.String),
  userId: Schema.NonEmptyString.pipe(Schema.brand("UserId")),
  impersonatedBy: Schema.NullishOr(Schema.NonEmptyString.pipe(Schema.brand("UserId"))),
  activeOrganizationId: Schema.NullishOr(
    Schema.NonEmptyString.pipe(Schema.brand("OrganizationId")),
  ),
});
export type Session = typeof Session.Type;

export const UserInfo = Schema.Struct({
  user: User,
  session: Session,
});
export type UserInfo = typeof UserInfo.Type;
