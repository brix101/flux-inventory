import { getSession } from '@/lib/auth.functions'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import z from 'zod'

const seachSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth')({
  validateSearch: seachSchema,
  component: RouteComponent,
  beforeLoad: async ({ search }) => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: search.redirect || '/' })
    }

    return session
  },
})

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
