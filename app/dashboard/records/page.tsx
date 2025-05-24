"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Layout from "@/components/dashboard/Layout"
import MedicalRecordManagement from "@/components/dashboard/records/MedicalRecordManagement"

export default function RecordsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (isClient && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router, isClient])

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  // Solo renderizar si estamos autenticados
  if (isClient && !isAuthenticated) {
    return null
  }

  return (
    <Layout>
      <MedicalRecordManagement />
    </Layout>
  )
}
