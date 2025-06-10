"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Layout from "@/components/dashboard/Layout"
import MyPayments from "@/components/dashboard/patient/MyPayments"

export default function MyPaymentsPage() {
  const router = useRouter()
  const { isAuthenticated, userRole, isLoading, isHydrated } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && isHydrated && !isLoading) {
      if (!isAuthenticated || userRole !== "paciente") {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, userRole, router, isClient, isHydrated, isLoading])

  // Mostrar loading mientras se verifica la autenticación
  if (!isClient || !isHydrated || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Solo renderizar si estamos autenticados como paciente
  if (!isAuthenticated || userRole !== "paciente") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <MyPayments />
    </Layout>
  )
}
