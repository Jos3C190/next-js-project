"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import StatisticsManagement from "@/components/dashboard/statistics/StatisticsManagement"
import Layout from "@/components/dashboard/Layout"

export default function StatisticsPage() {
  const { user, hasAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Verificar si el usuario tiene acceso al módulo de estadísticas
    if (!hasAccess("statistics")) {
      router.push("/dashboard")
      return
    }
  }, [user, hasAccess, router])

  // Si no hay usuario o no tiene acceso, no mostrar nada
  if (!user || !hasAccess("statistics")) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400"></div>
      </div>
    )
  }

  return (
    <Layout>
      <StatisticsManagement />
    </Layout>
  )
}
