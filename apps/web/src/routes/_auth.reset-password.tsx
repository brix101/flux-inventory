import { createFileRoute } from "@tanstack/react-router";
import * as Schema from "effect/Schema";

import { ResetPasswordForm } from "~/components/update-password-form";

const searchSchema = Schema.Struct({
  token: Schema.String,
});

export const Route = createFileRoute("/_auth/reset-password")({
  component: RouteComponent,
  validateSearch: Schema.toStandardSchemaV1(searchSchema),
});

function RouteComponent() {
  const { token } = Route.useSearch();

  return <ResetPasswordForm token={token} />;
}
