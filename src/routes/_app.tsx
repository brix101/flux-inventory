import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UserDropdown } from "@/components/user-dropdown"
import { getSession } from "@/lib/auth.functions"

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
              {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-lg"> */}
              {/*   <TerminalIcon className="size-4" /> */}
              {/* </div> */}
              {/* <div className="grid flex-1 text-left text-sm leading-tight"> */}
              {/*   <span className="truncate font-medium">{appConfig.name}</span> */}
              {/* </div> */}
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserDropdown user={user} />
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
