import { LoginForm } from '@/components/login-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()
  return <LoginForm callbackURL={redirect ?? '/'} />
}
