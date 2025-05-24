"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Layout from "@/components/dashboard/Layout"
import MyAppointments from "@/components/dashboard/patient/MyAppointments"

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { isAuthenticated, userRole } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (isClient && (!isAuthenticated || userRole !== "paciente")) {
      router.push("/")
    }
  }, [isAuthenticated, userRole, router, isClient])

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  // Solo renderizar si estamos autenticados como paciente
  if (isClient && (!isAuthenticated || userRole !== "paciente")) {
    return null
  }

  return (
    <Layout>
      <MyAppointments />
    </Layout>
  )
}
