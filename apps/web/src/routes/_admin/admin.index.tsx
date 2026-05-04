import React from "react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/_admin/admin/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user-stats"],
    queryFn: async () => {
      try {
        const { data: result, error: listError } =
          await authClient.admin.listUsers({
            query: {
              limit: 1000,
            },
          })

        if (listError)
          throw new Error(listError.message || "Failed to fetch users")
        return result
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to fetch users")
      }
    },
  })

  const stats = React.useMemo(() => {
    if (!data) return null

    const users = data.users

    return {
      totalUsers: data.total || users.length,
      activeUsers: users.filter((u: any) => !u.banned && u.emailVerified)
        .length,
      bannedUsers: users.filter((u: any) => u.banned).length,
      unverifiedUsers: users.filter((u: any) => !u.emailVerified).length,
    }
  }, [data])

  const statCards = [
    {
      name: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      name: "Active Users",
      value: stats?.activeUsers ?? 0,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-green-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      name: "Banned Users",
      value: stats?.bannedUsers ?? 0,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      ),
      color: "bg-red-500",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
    {
      name: "Unverified Users",
      value: stats?.unverifiedUsers ?? 0,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-yellow-500",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
  ]

  const quickActions = [
    {
      name: "View All Users",
      href: "/admin/users",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      name: "Add New User",
      href: "/admin/users/new",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Welcome to the admin dashboard</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="mb-4 h-10 w-10 rounded-lg bg-gray-200" />
              <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
              <div className="h-8 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Welcome to the admin dashboard</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="rounded-xl bg-white p-6 shadow-sm">
            <div
              className={`h-10 w-10 ${stat.bgColor} flex items-center justify-center rounded-lg ${stat.textColor} mb-4`}
            >
              {stat.icon}
            </div>
            <p className="text-sm text-gray-500">{stat.name}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
            >
              {action.icon}
              <span>{action.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
