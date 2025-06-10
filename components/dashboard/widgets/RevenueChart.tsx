"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"

// Definición de tipos para la estructura de datos
interface Week {
  week: number
  amount: number
}

interface Month {
  monthName: string
  amount: number
  weeks?: Week[]
}

interface RevenueData {
  data: {
    months: Month[]
  }
}

interface ChartData {
  labels: string[]
  values: number[]
}

// Opciones de filtro
const filterOptions = [
  { id: "year", label: "Año actual" },
  { id: "semester", label: "Último semestre" },
  { id: "quarter", label: "Último trimestre" },
  { id: "month", label: "Último mes" },
]

// Obtener el mes actual (0-indexed)
const currentMonth = new Date().getMonth()

const RevenueChart = () => {
  // Obtener el hook de autenticación
  const { user, token } = useAuth()

  // Estado para el filtro seleccionado
  const [selectedFilter, setSelectedFilter] = useState<string>("year")
  // Estado para controlar el menú desplegable
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  // Estado para almacenar los datos del API
  const [apiData, setApiData] = useState<RevenueData | null>(null)
  // Estado para almacenar los datos procesados del gráfico
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    values: [],
  })
  // Estado para controlar la carga
  const [isLoading, setIsLoading] = useState<boolean>(true)
  // Estado para controlar errores
  const [error, setError] = useState<string | null>(null)

  // Función para procesar los datos del API según el filtro seleccionado
  const processChartData = (apiData: RevenueData | null, filter: string): ChartData => {
    if (!apiData || !apiData.data || !apiData.data.months) {
      return {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      }
    }

    const months = apiData.data.months
    const currentMonthIndex = new Date().getMonth() // 0-indexed (0 = January)

    switch (filter) {
      case "year":
        return {
          labels: months.map((m: Month) => m.monthName),
          values: months.map((m: Month) => m.amount || 0),
        }
      case "semester": {
        // Get the last 6 months
        const lastSixMonths: Month[] = []
        for (let i = 0; i < 6; i++) {
          // Calculate month index going backwards from current month
          const monthIndex = (currentMonthIndex - i + 12) % 12
          if (months[monthIndex]) {
            lastSixMonths.unshift(months[monthIndex])
          }
        }
        return {
          labels: lastSixMonths.map((m: Month) => m.monthName),
          values: lastSixMonths.map((m: Month) => m.amount || 0),
        }
      }
      case "quarter": {
        // Get the last 3 months
        const lastThreeMonths: Month[] = []
        for (let i = 0; i < 3; i++) {
          // Calculate month index going backwards from current month
          const monthIndex = (currentMonthIndex - i + 12) % 12
          if (months[monthIndex]) {
            lastThreeMonths.unshift(months[monthIndex])
          }
        }
        return {
          labels: lastThreeMonths.map((m: Month) => m.monthName),
          values: lastThreeMonths.map((m: Month) => m.amount || 0),
        }
      }
      case "month": {
        // Use the current month (0-indexed in JavaScript, but 1-indexed in our data)
        const currentMonthData = months[currentMonthIndex]
        if (!currentMonthData || !currentMonthData.weeks) {
          // Si no hay datos, crear un fallback más realista
          // Un mes típicamente tiene 4-5 semanas, nunca 6
          const currentDate = new Date()
          const year = currentDate.getFullYear()
          const month = currentDate.getMonth()

          // Obtener el primer y último día del mes
          const firstDay = new Date(year, month, 1)
          const lastDay = new Date(year, month + 1, 0)

          // Calcular semanas de forma más precisa
          // Una semana nueva comienza cada lunes
          const firstWeekDay = firstDay.getDay() // 0 = domingo, 1 = lunes, etc.
          const daysInMonth = lastDay.getDate()

          // Calcular número de semanas (máximo 5)
          let weeksInMonth: number
          if (firstWeekDay === 1) {
            // Si el mes comienza en lunes
            weeksInMonth = Math.ceil(daysInMonth / 7)
          } else {
            // Días de la primera semana parcial + días restantes divididos en semanas completas
            const daysInFirstWeek = 8 - firstWeekDay // Días hasta el próximo lunes
            const remainingDays = daysInMonth - daysInFirstWeek
            weeksInMonth = 1 + Math.ceil(remainingDays / 7)
          }

          // Limitar a máximo 5 semanas
          weeksInMonth = Math.min(weeksInMonth, 5)

          const fallbackLabels: string[] = []
          const fallbackValues: number[] = []
          for (let i = 1; i <= weeksInMonth; i++) {
            fallbackLabels.push(`Semana ${i}`)
            fallbackValues.push(0)
          }

          return {
            labels: fallbackLabels,
            values: fallbackValues,
          }
        }

        // Filtrar semanas válidas y ordenarlas (máximo 5 semanas)
        const validWeeks = currentMonthData.weeks
          .filter((w: Week) => w.week > 0 && w.week <= 5)
          .sort((a: Week, b: Week) => a.week - b.week)

        return {
          labels: validWeeks.map((w: Week) => `Semana ${w.week}`),
          values: validWeeks.map((w: Week) => w.amount || 0),
        }
      }
      default:
        return {
          labels: months.map((m: Month) => m.monthName),
          values: months.map((m: Month) => m.amount || 0),
        }
    }
  }

  // Efecto para cargar los datos del API
  useEffect(() => {
    const fetchRevenueData = async () => {
      // No hacer nada si no hay token
      if (!token) {
        console.log("No token available, skipping revenue data fetch")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Verificar si tenemos la URL del API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) {
          throw new Error("URL del API no configurada")
        }

        console.log("Fetching revenue data from:", `${apiUrl}/api/dashboard/revenue-chart`)
        console.log("Using token:", token ? "Token available" : "No token")

        const response = await fetch(`${apiUrl}/api/dashboard/revenue-chart`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = (await response.json()) as RevenueData
        console.log("Revenue data received:", data)

        setApiData(data)
        const processedData = processChartData(data, selectedFilter)
        setChartData(processedData)
        setError(null)
      } catch (err) {
        console.error("Error fetching revenue data:", err)
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos")

        // Usar datos de ejemplo en caso de error
        const fallbackData: ChartData = {
          labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
          values: [4000, 3000, 5000, 2780, 1890, 2390, 3490, 4000, 5000, 6000, 7000, 9000],
        }
        setChartData(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRevenueData()
  }, [token, selectedFilter]) // Dependencia del token y del filtro seleccionado

  // Efecto para procesar los datos cuando cambia el filtro
  useEffect(() => {
    if (apiData) {
      const processedData = processChartData(apiData, selectedFilter)
      setChartData(processedData)
    }
  }, [selectedFilter, apiData])

  // Encontrar el valor máximo para calcular las alturas relativas
  const maxValue = Math.max(...chartData.values, 1) // Mínimo 1 para evitar división por cero

  return (
    <motion.div
      whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
      className="bg-[hsl(var(--card))] rounded-lg shadow-md p-4 sm:p-6 h-full min-h-[350px] sm:min-h-[400px] lg:min-h-[500px] transition-colors duration-200"
    >
      {/* Encabezado con filtro */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-medium text-[hsl(var(--foreground))]">Ingresos Mensuales</h3>

        {/* Menú desplegable para filtros */}
        <div className="relative">
          <button
            className="flex items-center text-xs sm:text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--card-hover))] px-2 sm:px-3 py-2 rounded-md transition-colors duration-200 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-red-400" />
            <span className="truncate">{filterOptions.find((option) => option.id === selectedFilter)?.label}</span>
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-2 flex-shrink-0" />
          </button>

          {/* Opciones del menú desplegable */}
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-1 w-full sm:w-48 bg-[hsl(var(--card))] rounded-md shadow-lg z-10 border border-[hsl(var(--border))]"
            >
              <ul className="py-1">
                {filterOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedFilter === option.id
                          ? "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
                          : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
                      }`}
                      onClick={() => {
                        setSelectedFilter(option.id)
                        setIsDropdownOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="h-[280px] sm:h-[320px] lg:h-[380px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-red-400"></div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !isLoading && (
        <div className="h-[280px] sm:h-[320px] lg:h-[380px] flex items-center justify-center">
          <div className="text-red-500 text-center px-4">
            <p className="text-sm sm:text-lg font-medium">Error al cargar datos</p>
            <p className="text-xs sm:text-sm mt-2">{error}</p>
            <p className="text-[10px] sm:text-xs mt-2 text-[hsl(var(--muted-foreground))]">
              Mostrando datos de ejemplo
            </p>
          </div>
        </div>
      )}

      {/* Contenedor del gráfico */}
      {!isLoading && (
        <div className="h-[280px] sm:h-[320px] lg:h-[380px] flex items-end justify-between px-2 sm:px-0">
          {chartData.labels.length === 0 ? (
            <div className="w-full text-center text-[hsl(var(--muted-foreground))]">
              No hay datos disponibles para este período
            </div>
          ) : (
            chartData.labels.map((label, index) => {
              // Calcular altura relativa con un mínimo para visibilidad
              const heightPercent = Math.max(10, (chartData.values[index] / maxValue) * 100)
              const value = chartData.values[index]

              return (
                <div key={`${label}-${index}`} className="flex flex-col items-center group relative">
                  {/* Tooltip responsivo */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-[10px] sm:text-xs rounded py-1 px-2 pointer-events-none border border-[hsl(var(--border))] whitespace-nowrap left-1/2 transform -translate-x-1/2 z-20">
                    ${typeof value === "number" ? value.toFixed(2) : "0.00"}
                  </div>

                  {/* Barra con ancho responsivo */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.min(heightPercent * (window.innerWidth < 640 ? 1.5 : window.innerWidth < 1024 ? 2 : 2.5), window.innerWidth < 640 ? 120 : window.innerWidth < 1024 ? 160 : 200)}px`,
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="w-4 sm:w-6 lg:w-8 bg-red-400 hover:bg-red-500 transition-all rounded-t-sm cursor-pointer"
                    style={{
                      minHeight: "10px",
                    }}
                  />
                  <span className="text-[10px] sm:text-xs mt-1 sm:mt-2 text-[hsl(var(--muted-foreground))] font-medium text-center leading-tight">
                    {label}
                  </span>
                  <span className="text-[9px] sm:text-xs text-[hsl(var(--muted-foreground))] text-center">
                    ${typeof value === "number" ? value.toFixed(2) : "0.00"}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}
    </motion.div>
  )
}

export default RevenueChart
