"use client"

import { useAuth } from "@/context/AuthContext"
import { createDashboardApi } from "@/lib/api"

export function useAuthenticatedApi() {
  const { token, isAuthenticated, isHydrated } = useAuth()

  const api = token ? createDashboardApi(token) : null

  return {
    api,
    isAuthenticated,
    isHydrated,
    hasToken: !!token,
  }
}
