import { authClient } from "~/lib/auth-client";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { TerminalIcon } from "lucide-react";
import z from "zod";

import { appConfig } from "~/lib/config";

const seachSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
  validateSearch: seachSchema,
  beforeLoad: async ({ search }) => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({ to: search.redirect || "/" });
    }

    return session;
  },
});

function RouteComponent() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <TerminalIcon className="size-4" />
            </div>
            {appConfig.name}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
