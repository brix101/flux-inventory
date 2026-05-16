import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: Outlet,
  beforeLoad: () => {
    throw redirect({
      to: "/inventory",
    });
  },
});
