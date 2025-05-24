"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  createDashboardApi,
  type DashboardStats,
  type RecentAppointment,
  type Activity,
  type Appointment,
} from "@/lib/api"

interface DashboardData {
  stats: DashboardStats | null
  recentAppointments: RecentAppointment[]
  activities: Activity[]
  appointments: Appointment[]
}

export function useDashboardData() {
  const { token, isAuthenticated, isHydrated } = useAuth()

  const [data, setData] = useState<DashboardData>({
    stats: null,
    recentAppointments: [],
    activities: [],
    appointments: [],
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  const loadDashboardData = useCallback(async () => {
    if (!isHydrated || !isAuthenticated || !token) {
      setIsLoading(false)
      return
    }

    try {
      setError(null)

      // Solo mostrar loading en la primera carga
      if (!hasInitialized) {
        setIsLoading(true)
      }

      // Crear instancia de API con token
      const api = createDashboardApi(token)

      // Cargar todos los datos en paralelo
      const [statsResult, appointmentsResult, activitiesResult, allAppointmentsResult] = await Promise.allSettled([
        api.getStats(),
        api.getRecentAppointments(5),
        api.getActivity(), // Remover el límite fijo de 10
        api.getAllAppointments(),
      ])

      // Procesar resultados
      const newData: DashboardData = {
        stats: statsResult.status === "fulfilled" ? statsResult.value : null,
        recentAppointments: appointmentsResult.status === "fulfilled" ? appointmentsResult.value.appointments : [],
        activities: activitiesResult.status === "fulfilled" ? activitiesResult.value.activities : [],
        appointments: allAppointmentsResult.status === "fulfilled" ? allAppointmentsResult.value.data : [],
      }

      setData(newData)

      // Verificar si hubo errores
      const errors = [statsResult, appointmentsResult, activitiesResult, allAppointmentsResult]
        .filter((result) => result.status === "rejected")
        .map((result) => (result as PromiseRejectedResult).reason)

      if (errors.length > 0) {
        console.warn("Algunos datos del dashboard fallaron al cargar:", errors)
        setError(`Error al cargar algunos datos: ${errors.length} de 4 servicios fallaron`)
      }
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error)
      setError("Error al cargar los datos del dashboard")
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [isHydrated, isAuthenticated, token, hasInitialized])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const refreshData = useCallback(() => {
    setHasInitialized(false) // Esto permitirá mostrar loading en refresh manual
    loadDashboardData()
  }, [loadDashboardData])

  return {
    ...data,
    isLoading,
    error,
    refreshData,
    isHydrated,
    hasInitialized,
    isReady: isHydrated && hasInitialized,
  }
}
