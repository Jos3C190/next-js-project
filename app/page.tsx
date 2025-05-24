"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import dynamic from "next/dynamic"

// Importar LandingPage con carga dinámica para evitar problemas de SSR
const LandingPage = dynamic(() => import("@/components/LandingPage"), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  ),
})

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return <LandingPage />
}
