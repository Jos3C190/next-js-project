"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Layout from "@/components/dashboard/Layout"
import PaymentManagement from "@/components/dashboard/payments/PaymentManagement"

export default function PaymentsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (isClient && !isAuthenticated) {
      router.push("/")
    }
    // Redirigir a pacientes a my-appointments
    if (isClient && isAuthenticated && user?.role === "paciente") {
      router.push("/dashboard/my-appointments")
    }
    // Redirigir a odontólogos al dashboard
    if (isClient && isAuthenticated && user?.role === "odontologo") {
      router.push("/dashboard")
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
      <PaymentManagement />
    </Layout>
  )
}
