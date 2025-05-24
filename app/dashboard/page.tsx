"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

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

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't rely on AOS for any critical functionality
  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return <DashboardApp />
}
