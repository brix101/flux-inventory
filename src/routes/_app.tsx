import React from "react"
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router"

import { AppSidebar, navItems } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
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
  const {
    location: { pathname },
  } = useRouterState()

  const locations = React.useMemo(() => {
    const routes: (typeof navItems)[number][] = []

    const findRoute = (items: typeof navItems): boolean => {
      for (const item of items) {
        if (item.to === pathname) {
          routes.push(item)
          return true
        }
        if (item.items && findRoute(item.items)) {
          routes.unshift(item)
          return true
        }
      }
      return false
    }

    findRoute(navItems)
    return routes
  }, [pathname])

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" collapsible="icon" user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Tooltip>
              <TooltipTrigger className="-ml-1" render={<SidebarTrigger />} />
              <TooltipContent>Toggle sidebar</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                {locations.map((location, index) => {
                  if (index === locations.length - 1) {
                    return (
                      <BreadcrumbItem key={location.to}>
                        <BreadcrumbPage>{location.title}</BreadcrumbPage>
                      </BreadcrumbItem>
                    )
                  }

                  return (
                    <React.Fragment key={location.to}>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink render={<Link to={location.to} />}>
                          {location.title}
                        </BreadcrumbLink>
                      </BreadcrumbItem>

                      <BreadcrumbSeparator className="hidden md:block" />
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
