import type { LinkProps } from "@tanstack/react-router"

export type NavItem = LinkProps & {
  title: string
  icon?: React.ReactNode
  items?: Omit<NavItem, "icon">[]
}
