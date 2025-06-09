"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import ReportsManagement from "@/components/dashboard/reports/ReportsManagement"
import Layout from "@/components/dashboard/Layout"

export default function ReportsPage() {
  const { user, hasAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Verificar si el usuario tiene acceso al módulo de reportes
    if (!hasAccess("reports")) {
      router.push("/dashboard")
      return
    }
  }, [user, hasAccess, router])

  if (!user || !hasAccess("reports")) {
    return null
  }

  return (
    <Layout>
      <ReportsManagement />
    </Layout>
  )
}
