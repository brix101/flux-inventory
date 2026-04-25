import type { User } from "better-auth"
import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  ArchiveIcon,
  ClipboardListIcon,
  FactoryIcon,
  PackageIcon,
  PaletteIcon,
  PlusIcon,
  ShoppingCartIcon,
  TagsIcon,
  TerminalIcon,
} from "lucide-react"

import type { NavItem } from "@/types/nav"
import { NavMain } from "@/components/nav-main"
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
        {
          title: "Add Category",
          to: "/inventory/categories/new",
          icon: <PlusIcon />,
        },
        {
          title: "Add Supplier",
          to: "/inventory/suppliers/new",
          icon: <PlusIcon />,
        },
      ],
    },
    {
      title: "Purchase Orders",
      to: "/inventory/purchase-orders",
      icon: <ShoppingCartIcon />,
    },
    {
      title: "Requests",
      to: "/inventory/requests",
      icon: <ClipboardListIcon />,
    },
    {
      title: "Categories",
      to: "/inventory/categories",
      icon: <TagsIcon />,
    },
    {
      title: "Suppliers",
      to: "/inventory/suppliers",
      icon: <FactoryIcon />,
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
            <SidebarMenuButton size="lg" render={<Link to="/inventory" />}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <TerminalIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">{appConfig.name}</span>
              </div>
            </SidebarMenuButton>
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
