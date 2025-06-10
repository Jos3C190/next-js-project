"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, CheckCircle, Clock, XCircle, ChevronDown } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface AppointmentStatus {
  status: string
  count: number
  percentage: number
  label: string
}

interface AppointmentSummary {
  totalAppointments: number
  completionRate: number
  cancellationRate: number
}

interface AppointmentStatusResponse {
  success: boolean
  data: {
    period: string
    year: number
    statusDistribution: AppointmentStatus[]
    summary: AppointmentSummary
  }
}

const AppointmentStatusChart: React.FC = () => {
  const { token } = useAuth()
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStatus[]>([])
  const [summary, setSummary] = useState<AppointmentSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [month, setMonth] = useState<number | null>(null)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
  const months = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completada":
        return <CheckCircle className="h-4 w-4" />
      case "pendiente":
        return <Clock className="h-4 w-4" />
      case "cancelada":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completada":
        return "text-green-500"
      case "pendiente":
        return "text-yellow-500"
      case "cancelada":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "completada":
        return "bg-green-100 dark:bg-green-900/20"
      case "pendiente":
        return "bg-yellow-100 dark:bg-yellow-900/20"
      case "cancelada":
        return "bg-red-100 dark:bg-red-900/20"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        // Construir la URL con los parámetros de filtro
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/appointment-status?year=${year}`
        if (month !== null) {
          url += `&month=${month}`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data: AppointmentStatusResponse = await response.json()

        if (data.success && data.data) {
          setAppointmentStats(data.data.statusDistribution)
          setSummary(data.data.summary)
          setError(null)
        } else {
          throw new Error("Formato de respuesta inválido")
        }
      } catch (err) {
        console.error("Error fetching appointment data:", err)
        setError("Error al cargar datos de citas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointmentData()
  }, [token, year, month])

  const handleYearChange = (selectedYear: number) => {
    setYear(selectedYear)
    setShowYearDropdown(false)
  }

  const handleMonthChange = (selectedMonth: number | null) => {
    setMonth(selectedMonth)
    setShowMonthDropdown(false)
  }

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 h-[500px] transition-colors duration-200">
      {/* Encabezado con filtros */}
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">Estado de Citas</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Distribución por estado</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Filtro de año */}
          <div className="relative">
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-[hsl(var(--secondary))] rounded-md hover:bg-[hsl(var(--secondary))]/80"
            >
              Año: {year}
              <ChevronDown className="h-4 w-4" />
            </button>
            {showYearDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md shadow-lg z-10">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => handleYearChange(y)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--accent))] ${
                      y === year ? "bg-[hsl(var(--accent))]" : ""
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtro de mes */}
          <div className="relative">
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-[hsl(var(--secondary))] rounded-md hover:bg-[hsl(var(--secondary))]/80"
            >
              Mes: {month ? months.find((m) => m.value === month)?.label : "Todos"}
              <ChevronDown className="h-4 w-4" />
            </button>
            {showMonthDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                <button
                  onClick={() => handleMonthChange(null)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--accent))] ${
                    month === null ? "bg-[hsl(var(--accent))]" : ""
                  }`}
                >
                  Todos los meses
                </button>
                {months.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => handleMonthChange(m.value)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--accent))] ${
                      m.value === month ? "bg-[hsl(var(--accent))]" : ""
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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

      {/* Datos de citas */}
      {!isLoading && !error && appointmentStats.length > 0 && summary && (
        <div className="h-[280px] flex flex-col justify-center">
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{summary.totalAppointments}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Total de citas</p>
          </div>

          <div className="space-y-2">
            {appointmentStats.map((stat, index) => (
              <motion.div
                key={stat.status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 ${getStatusBgColor(stat.status)} rounded-lg hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center space-x-3">
                  <div className={getStatusColor(stat.status)}>{getStatusIcon(stat.status)}</div>
                  <span className="font-medium text-[hsl(var(--foreground))]">{stat.label}</span>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-[hsl(var(--foreground))]">{stat.count}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.percentage.toFixed(1)}%</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Resumen de tasas */}
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-[hsl(var(--secondary))] rounded-lg">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Tasa de completadas</p>
              <p className="text-base font-bold text-green-500">{summary.completionRate.toFixed(1)}%</p>
            </div>
            <div className="text-center p-2 bg-[hsl(var(--secondary))] rounded-lg">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Tasa de cancelación</p>
              <p className="text-base font-bold text-red-500">{summary.cancellationRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Sin datos */}
      {!isLoading && !error && appointmentStats.length === 0 && (
        <div className="h-[380px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-[hsl(var(--muted-foreground))]">No hay datos disponibles</p>
            <p className="text-sm mt-2 text-[hsl(var(--muted-foreground))]">
              No se encontraron citas para el período seleccionado
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentStatusChart
