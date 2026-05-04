import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/")({
  component: App,
  loader: () => {
    throw redirect({
      to: "/inventory",
    })
  },
})

function App() {
  const { user } = Route.useRouteContext()
  return (
    <main className="">
      Welcome, {user.name}!
      <Outlet />
    </main>
  )
}
