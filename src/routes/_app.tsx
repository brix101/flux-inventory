import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router"

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

const routeMap = {
  "/inventory": "Inventory",
  "/inventory/products": "Products",
  "/inventory/purchase-orders": "Purchase Orders",
  "/workshops": "Workshops",
}

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const {
    location: { pathname },
  } = useRouterState()

  console.log(pathname)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" collapsible="icon" user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full justify-between px-4">
            <div className="text-lg font-semibold">
              {routeMap[pathname as keyof typeof routeMap] || "Dashboard"}
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
