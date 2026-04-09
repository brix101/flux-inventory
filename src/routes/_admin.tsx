import { getSession } from '@/lib/auth.functions'
import {
  createFileRoute,
  notFound,
  Outlet,
  redirect,
} from '@tanstack/react-router'

export const Route = createFileRoute('/_admin')({
  beforeLoad: async () => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/login',
      })
    }

    if (session.user.role !== 'superadmin') {
      throw notFound()
    }

    return { user: session.user }
  },
  component: () => <Outlet />,
})
