import { authClient } from "#/lib/auth-client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href != "/" ? location.href : undefined,
        },
      });
    }

    return { session };
  },
});

function RouteComponent() {
  return <Outlet />;
}
