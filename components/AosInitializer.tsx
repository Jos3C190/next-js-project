"use client"

import { useEffect } from "react"

export default function AosInitializer() {
  useEffect(() => {
    // We'll use a simple flag to avoid multiple error logs
    let hasAttemptedLoad = false

    // Importación dinámica de AOS para evitar problemas de SSR
    const loadAos = async () => {
      if (hasAttemptedLoad) return

      hasAttemptedLoad = true

      try {
        // Try to load AOS, but don't break the app if it fails
        const AOS = (await import("aos")).default
        await import("aos/dist/aos.css")

        AOS.init({
          duration: 800,
          once: false,
          disable: "mobile", // Deshabilitar en dispositivos móviles para mejor rendimiento
        })
      } catch (error) {
        // Just log the error but don't break the app
        console.log("AOS animations disabled")
      }
    }

    // Only try to load AOS in client-side environments
    if (typeof window !== "undefined") {
      loadAos()
    }

    return () => {
      // No cleanup needed
    }
  }, [])

  return null
}
