import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/")({
  component: App,
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
