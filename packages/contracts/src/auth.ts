import * as Schema from "effect/Schema";

import { intToBoolean, isoDatetimeToDate } from "./baseSchemas.ts";

const emailSchema = Schema.String.check(Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
export const EnvironmentValues = ["production", "development"] as const;
export const Environment = Schema.Literals(EnvironmentValues);
export type Environment = typeof Environment.Type;

export const UserRoleValues = ["user", "manager", "admin"] as const;
export const UserRole = Schema.Literals(UserRoleValues);
export type UserRole = typeof UserRole.Type;

export const MemberRoleValues = ["member", "owner", "admin"] as const;
export const AssignableMemberRoleValues = ["member", "manager", "admin"] as const;
export const MemberRole = Schema.Literals(MemberRoleValues);
export type MemberRole = typeof MemberRole.Type;

export const User = Schema.Struct({
  id: Schema.NonEmptyString.pipe(Schema.brand("UserId")),
  name: Schema.String,
  email: emailSchema,
  emailVerified: intToBoolean,
  image: Schema.NullishOr(Schema.String),
  role: UserRole,
  banned: intToBoolean,
  banReason: Schema.NullishOr(Schema.String),
  banExpires: Schema.NullishOr(isoDatetimeToDate),
  // stripeCustomerId: Schema.NullishOr(Schema.String),
  createdAt: isoDatetimeToDate,
  updatedAt: isoDatetimeToDate,
});
export type User = typeof User.Type;

export const Session = Schema.Struct({
  id: Schema.NonEmptyString.pipe(Schema.brand("SessionId")),
  expiresAt: isoDatetimeToDate,
  token: Schema.NonEmptyString,
  createdAt: isoDatetimeToDate,
  updatedAt: isoDatetimeToDate,
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
