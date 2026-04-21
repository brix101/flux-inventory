import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"

import type { NavItem } from "@/types/nav"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  const {
    location: { pathname },
  } = useRouterState()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Apps</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items && item.items.length > 0) {
            const isActive = item.items.some((sub) => sub.to === pathname)

            return (
              <Collapsible
                key={item.title}
                defaultOpen={isActive}
                render={<SidebarMenuItem />}
              >
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {item.items.length ? (
                  <>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuAction className="aria-expanded:rotate-90" />
                      }
                    >
                      <ChevronRightIcon />
                      <span className="sr-only">Toggle</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              render={
                                <Link
                                  to={subItem.to}
                                  activeOptions={{
                                    exact: true,
                                  }}
                                />
                              }
                              className="[&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground [&.active]:font-medium"
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </Collapsible>
            )
          }

          return (
            <SidebarMenuButton
              key={item.title}
              tooltip={item.title}
              render={
                <Link
                  to={item.to}
                  activeOptions={{
                    exact: true,
                  }}
                />
              }
              className="[&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground [&.active]:font-medium"
            >
              {item.icon}
              <span>{item.title}</span>
            </SidebarMenuButton>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
