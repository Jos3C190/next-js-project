"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useAuth } from "@/context/AuthContext"

// Importar DashboardApp con carga dinámica y sin SSR
const DashboardApp = dynamic(() => import("@/components/dashboard/DashboardApp"), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Cargando dashboard...</p>
    </div>
  ),
})

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false)
  const { userRole, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirigir pacientes a sus citas
  useEffect(() => {
    if (isClient && isAuthenticated && !isLoading && userRole === "paciente") {
      router.push("/dashboard/my-appointments")
    }
  }, [isClient, isAuthenticated, isLoading, userRole, router])

  // Don't rely on AOS for any critical functionality
  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  // Si es paciente, mostrar loading mientras redirige
  if (userRole === "paciente") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Redirigiendo a tus citas...</p>
      </div>
    )
  }

  return <DashboardApp />
}
