"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface AppointmentStatus {
  status: string
  count: number
  percentage: number
  icon: React.ReactNode
  color: string
}

const AppointmentStatusChart = () => {
  const { token } = useAuth()
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        // Simular datos de estado de citas
        const mockData: AppointmentStatus[] = [
          {
            status: "Completadas",
            count: 85,
            percentage: 60,
            icon: <CheckCircle className="h-4 w-4" />,
            color: "text-green-500",
          },
          {
            status: "Pendientes",
            count: 42,
            percentage: 30,
            icon: <Clock className="h-4 w-4" />,
            color: "text-yellow-500",
          },
          {
            status: "Canceladas",
            count: 14,
            percentage: 10,
            icon: <XCircle className="h-4 w-4" />,
            color: "text-red-500",
          },
        ]

        setAppointmentStats(mockData)
        setError(null)
      } catch (err) {
        console.error("Error fetching appointment data:", err)
        setError("Error al cargar datos de citas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointmentData()
  }, [token])

  const totalAppointments = appointmentStats.reduce((sum, stat) => sum + stat.count, 0)

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 h-[500px] transition-colors duration-200">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">Estado de Citas</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Distribución por estado</p>
        </div>
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="h-[380px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
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

      {/* Gráfico circular simulado con tarjetas */}
      {!isLoading && !error && (
        <div className="h-[380px] flex flex-col justify-center">
          <div className="text-center mb-8">
            <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{totalAppointments}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Total de citas</p>
          </div>

          <div className="space-y-4">
            {appointmentStats.map((stat, index) => (
              <motion.div
                key={stat.status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-[hsl(var(--secondary))] rounded-lg hover:bg-[hsl(var(--secondary))]/80 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={stat.color}>{stat.icon}</div>
                  <span className="font-medium text-[hsl(var(--foreground))]">{stat.status}</span>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-[hsl(var(--foreground))]">{stat.count}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.percentage}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentStatusChart
