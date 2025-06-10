"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface MonthlyComparison {
  metric: string
  currentMonth: number
  previousMonth: number
  change: number
  isPositive: boolean
  icon: React.ReactNode
}

const MonthlyComparisonChart = () => {
  const { token } = useAuth()
  const [comparisons, setComparisons] = useState<MonthlyComparison[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        // Simular datos de comparación mensual
        const mockData: MonthlyComparison[] = [
          {
            metric: "Nuevos Pacientes",
            currentMonth: 67,
            previousMonth: 58,
            change: 15.5,
            isPositive: true,
            icon: <TrendingUp className="h-5 w-5" />,
          },
          {
            metric: "Citas Completadas",
            currentMonth: 142,
            previousMonth: 156,
            change: -9.0,
            isPositive: false,
            icon: <Calendar className="h-5 w-5" />,
          },
          {
            metric: "Ingresos ($)",
            currentMonth: 15240,
            previousMonth: 13890,
            change: 9.7,
            isPositive: true,
            icon: <TrendingUp className="h-5 w-5" />,
          },
          {
            metric: "Tratamientos Iniciados",
            currentMonth: 89,
            previousMonth: 76,
            change: 17.1,
            isPositive: true,
            icon: <TrendingUp className="h-5 w-5" />,
          },
        ]

        setComparisons(mockData)
        setError(null)
      } catch (err) {
        console.error("Error fetching comparison data:", err)
        setError("Error al cargar datos de comparación")
      } finally {
        setIsLoading(false)
      }
    }

    fetchComparisonData()
  }, [token])

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 transition-colors duration-200">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">Comparación Mensual</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Mes actual vs mes anterior</p>
        </div>
        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !isLoading && (
        <div className="h-40 flex items-center justify-center">
          <div className="text-red-500 text-center">
            <p className="text-lg font-medium">Error al cargar datos</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      )}

      {/* Comparaciones */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={comparison.metric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-4 bg-[hsl(var(--secondary))] rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    comparison.isPositive
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  }`}
                >
                  {comparison.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <span className={`text-sm font-bold ${comparison.isPositive ? "text-green-500" : "text-red-500"}`}>
                  {comparison.isPositive ? "+" : ""}
                  {comparison.change.toFixed(1)}%
                </span>
              </div>

              <h4 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">{comparison.metric}</h4>

              <div className="space-y-1">
                <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                  {comparison.metric.includes("Ingresos")
                    ? `$${comparison.currentMonth.toLocaleString()}`
                    : comparison.currentMonth.toLocaleString()}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Anterior:{" "}
                  {comparison.metric.includes("Ingresos")
                    ? `$${comparison.previousMonth.toLocaleString()}`
                    : comparison.previousMonth.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MonthlyComparisonChart
