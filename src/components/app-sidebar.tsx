import type { User } from "better-auth"
import * as React from "react"
import { Link } from "@tanstack/react-router"
import { BoxIcon, FrameIcon, TerminalIcon } from "lucide-react"

import type { NavItem } from "@/types/nav"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { appConfig } from "@/lib/config"

export const navItems: NavItem[] = [
  {
    title: "Inventory",
    icon: <BoxIcon />,
    items: [
      {
        title: "Stocks",
        to: "/inventory",
      },
      {
        title: "Products",
        to: "/inventory/products",
      },
      {
        title: "Purchase Orders",
        to: "/inventory/purchase-orders",
      },
    ],
  },
  {
    title: "Workshops",
    to: "/workshops",
    icon: <FrameIcon />,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/inventory" />}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{appConfig.name}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
