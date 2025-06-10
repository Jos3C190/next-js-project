"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, TrendingUp } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface PatientData {
  month: string
  patients: number // Este será newPatients del API
  growth: number // Este será growthPercentage del API
}

const PatientGrowthChart = () => {
  const { token } = useAuth()
  const [patientData, setPatientData] = useState<PatientData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        // Llamada real al endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/patient-growth`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.success && result.data && result.data.months) {
          // Transformar los datos del API al formato que necesita el componente
          const transformedData: PatientData[] = result.data.months.map((monthData: any) => ({
            month: monthData.month.substring(0, 3), // "Enero" -> "Ene"
            patients: monthData.newPatients,
            growth: monthData.growthPercentage,
          }))

          setPatientData(transformedData)
          console.log("Patient growth data loaded:", transformedData)
        } else {
          throw new Error("Formato de respuesta inválido")
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching patient data:", err)
        const errorMessage = err instanceof Error ? err.message : "Error desconocido"
        setError(`Error al cargar datos de pacientes: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientData()
  }, [token])

  const maxPatients = Math.max(...patientData.map((d) => d.patients), 1)

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 h-[500px] transition-colors duration-200">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">Crecimiento de Pacientes</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Nuevos pacientes por mes</p>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="h-[380px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
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

      {/* Gráfico */}
      {!isLoading && !error && (
        <div className="h-[380px] flex items-end justify-between space-x-4">
          {patientData.map((data, index) => {
            const heightPercent = Math.max(10, (data.patients / maxPatients) * 100)
            const isPositiveGrowth = data.growth >= 0

            return (
              <div key={data.month} className="flex flex-col items-center group flex-1">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-xs rounded py-2 px-3 pointer-events-none border border-[hsl(var(--border))] z-10">
                  <div className="text-center">
                    <p className="font-medium">{data.patients} nuevos pacientes</p>
                    <p className={`text-xs ${isPositiveGrowth ? "text-green-500" : "text-red-500"}`}>
                      {isPositiveGrowth ? "+" : ""}
                      {data.growth}% crecimiento
                    </p>
                  </div>
                </div>

                {/* Indicador de crecimiento */}
                <div
                  className={`mb-2 flex items-center text-xs ${isPositiveGrowth ? "text-green-500" : "text-red-500"}`}
                >
                  <TrendingUp className={`h-3 w-3 mr-1 ${!isPositiveGrowth ? "rotate-180" : ""}`} />
                  {Math.abs(data.growth)}%
                </div>

                {/* Barra */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent * 2.5}px` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full bg-blue-400 hover:bg-blue-500 transition-all rounded-t-sm cursor-pointer"
                  style={{ minHeight: "10px" }}
                />

                {/* Etiquetas */}
                <span className="text-xs mt-2 text-[hsl(var(--muted-foreground))] font-medium">{data.month}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{data.patients}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PatientGrowthChart
