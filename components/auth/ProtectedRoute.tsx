"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isHydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Solo redirigir si:
    // 1. La hidratación está completa
    // 2. No está cargando
    // 3. No está autenticado
    // 4. Esperamos un poco para asegurar que la verificación se complete
    if (isHydrated && !isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.push("/")
      }, 100) // Pequeño delay para permitir que la autenticación se complete

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, isHydrated, router])

  // Mostrar loading mientras se hidrata, se verifica la autenticación, o durante el delay
  if (!isHydrated || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado después de la hidratación y carga, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
