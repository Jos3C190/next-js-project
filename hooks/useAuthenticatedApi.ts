"use client"

import { useAuth } from "@/context/AuthContext"
import { createDashboardApi } from "@/lib/api"

export function useAuthenticatedApi() {
  const { token, isAuthenticated, isHydrated } = useAuth()

  const api = token ? createDashboardApi(token) : null

  const apiCall = async (callback: (token: string) => Promise<any>): Promise<any> => {
    if (!token) {
      throw new Error("No authentication token available")
    }
    return callback(token)
  }

  return {
    api,
    apiCall,
    isAuthenticated,
    isHydrated,
    hasToken: !!token,
  }
}
