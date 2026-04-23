import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { UserAvatar } from "@/components/user-avatar"
import { getSession } from "@/server/auth/auth.functions"

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href !== "/" ? location.href : undefined },
      })
    }
    return { user: session.user }
  },
  component: () => <RouteComponent />,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" collapsible="icon" user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full justify-between px-4">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger className="-ml-1" render={<SidebarTrigger />} />
                <TooltipContent>Toggle sidebar</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserAvatar user={user} />
            </div>
          </div>
        </header>
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
