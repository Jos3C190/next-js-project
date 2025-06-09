"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Layout from "@/components/dashboard/Layout"
import UserManagement from "@/components/dashboard/users/UserManagement"

export default function UsersPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (isClient && !isAuthenticated) {
      router.push("/")
    }
    // Verificar si el usuario es admin
    if (isClient && isAuthenticated && user?.role !== "admin") {
      // Si es paciente, redirigir a my-appointments
      if (user?.role === "paciente") {
        router.push("/dashboard/my-appointments")
      } else {
        // Si es otro rol (odontologo), redirigir al dashboard
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, router, isClient, user])

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
      </div>
    )
  }

  // Solo renderizar si estamos autenticados y somos admin
  if (isClient && (!isAuthenticated || user?.role !== "admin")) {
    return null
  }

  return (
    <Layout>
      <UserManagement />
    </Layout>
  )
}
