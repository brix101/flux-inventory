import type { User } from "better-auth"
import * as React from "react"
import {
  ArchiveIcon,
  ClipboardListIcon,
  PackageIcon,
  PaletteIcon,
  PlusIcon,
} from "lucide-react"

import type { NavItem } from "@/types/nav"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

export const navItems: Record<string, NavItem[]> = {
  inventory: [
    {
      title: "Inventory",
      to: "/inventory",
      icon: <ArchiveIcon />,
    },
    {
      title: "Products",
      to: "/inventory/products",
      icon: <PackageIcon />,
      more: [
        {
          title: "Add Product",
          to: "/inventory/products/new",
          icon: <PlusIcon />,
        },
      ],
    },
    {
      title: "Purchase Orders",
      to: "/inventory/purchase-orders",
      icon: <ClipboardListIcon />,
    },
  ],
  workshops: [
    {
      title: "Workshops",
      to: "/workshops",
      icon: <PaletteIcon />,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger className="-ml-1" render={<SidebarTrigger />} />
              <TooltipContent>Toggle sidebar</TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain name="Inventory" items={navItems.inventory} />
        <NavMain name="Workshops" items={navItems.workshops} />
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={user} /> */}</SidebarFooter>
    </Sidebar>
  )
}
