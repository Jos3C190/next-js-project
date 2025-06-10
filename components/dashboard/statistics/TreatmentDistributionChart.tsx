"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface TreatmentType {
  name: string
  count: number
  percentage: number
  color: string
}

const TreatmentDistributionChart = () => {
  const { token } = useAuth()
  const [treatments, setTreatments] = useState<TreatmentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTreatmentData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/treatment-distribution`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          // Mapear los datos del API al formato esperado por el componente
          const mappedTreatments: TreatmentType[] = result.data.treatments.map((treatment: any, index: number) => ({
            name: treatment.type,
            count: treatment.count,
            percentage: Math.round(treatment.percentage),
            color: getColorForTreatment(treatment.type, index),
          }))

          setTreatments(mappedTreatments)
          console.log("Treatment distribution data loaded:", mappedTreatments)
        } else {
          throw new Error("Invalid response format")
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching treatment data:", err)
        setError(err instanceof Error ? err.message : "Error al cargar datos de tratamientos")
      } finally {
        setIsLoading(false)
      }
    }

    // Función auxiliar para asignar colores consistentes
    const getColorForTreatment = (type: string, index: number): string => {
      const colorMap: { [key: string]: string } = {
        Ortodoncia: "bg-blue-400",
        Limpieza: "bg-green-400",
        Blanqueamiento: "bg-yellow-400",
        Extracción: "bg-red-400",
        Otro: "bg-purple-400",
        Otros: "bg-purple-400",
      }

      const defaultColors = ["bg-indigo-400", "bg-pink-400", "bg-teal-400", "bg-orange-400"]

      return colorMap[type] || defaultColors[index % defaultColors.length] || "bg-gray-400"
    }

    fetchTreatmentData()
  }, [token])

  const totalTreatments = treatments.reduce((sum, t) => sum + t.count, 0)

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 h-[500px] transition-colors duration-200">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">Distribución de Tratamientos</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Tipos de tratamientos más comunes</p>
        </div>
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="h-[380px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !isLoading && (
        <div className="h-[380px] flex items-center justify-center">
          <div className="text-red-500 text-center">
            <p className="text-lg font-medium">Error al cargar datos</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      )}

      {/* Gráfico de barras horizontales */}
      {!isLoading && !error && (
        <div className="h-[380px] space-y-4">
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{totalTreatments}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Total de tratamientos</p>
          </div>

          <div className="space-y-4">
            {treatments.map((treatment, index) => (
              <motion.div
                key={treatment.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">{treatment.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[hsl(var(--foreground))]">{treatment.count}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] ml-2">({treatment.percentage}%)</span>
                  </div>
                </div>

                <div className="w-full bg-[hsl(var(--secondary))] rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${treatment.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-3 rounded-full ${treatment.color} group-hover:opacity-80 transition-opacity`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TreatmentDistributionChart
