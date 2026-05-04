import type { QueryClient } from "@tanstack/react-query"
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { TanStackDevtools } from "@tanstack/react-devtools"
import {
  createRootRouteWithContext,
  ErrorComponent,
  HeadContent,
  Scripts,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

import type { TRPCRouter } from "@/integrations/trpc/router"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools"
import { appConfig } from "@/lib/config"
import appCss from "../styles.css?url"

interface MyRouterContext {
  queryClient: QueryClient

  trpc: TRPCOptionsProxy<TRPCRouter>
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        label: appConfig.name,
        description: appConfig.description,
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  errorComponent: ErrorComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans wrap-anywhere antialiased selection:bg-[rgba(79,184,178,0.24)]">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
            requireUrlFlag: import.meta.env.PROD,
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
