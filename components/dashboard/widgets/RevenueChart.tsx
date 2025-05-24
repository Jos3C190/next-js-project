"use client"

import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"

// Datos completos para diferentes períodos
const allData = {
  year: {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    values: [4000, 3000, 5000, 2780, 1890, 2390, 3490, 4000, 5000, 6000, 7000, 9000],
  },
  semester: {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    values: [4000, 3000, 5000, 2780, 1890, 2390],
  },
  quarter: {
    labels: ["Ene", "Feb", "Mar"],
    values: [4000, 3000, 5000],
  },
  month: {
    labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    values: [1200, 1500, 1300, 1800],
  },
}

// Opciones de filtro
const filterOptions = [
  { id: "year", label: "Año actual" },
  { id: "semester", label: "Último semestre" },
  { id: "quarter", label: "Último trimestre" },
  { id: "month", label: "Último mes" },
]

const RevenueChart = () => {
  // Estado para el filtro seleccionado
  const [selectedFilter, setSelectedFilter] = useState("year")
  // Estado para controlar el menú desplegable
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Obtener datos según el filtro seleccionado
  const { labels, values } = allData[selectedFilter as keyof typeof allData]

  // Encontrar el valor máximo para calcular las alturas relativas
  const maxValue = Math.max(...values)

  return (
    <motion.div
      whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
      className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 h-[500px] transition-colors duration-200"
    >
      {/* Encabezado con filtro */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">Ingresos Mensuales</h3>

        {/* Menú desplegable para filtros */}
        <div className="relative">
          <button
            className="flex items-center text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--card-hover))] px-3 py-2 rounded-md transition-colors duration-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Calendar className="h-4 w-4 mr-2 text-red-400" />
            {filterOptions.find((option) => option.id === selectedFilter)?.label}
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>

          {/* Opciones del menú desplegable */}
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-1 w-48 bg-[hsl(var(--card))] rounded-md shadow-lg z-10 border border-[hsl(var(--border))]"
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

      {/* Contenedor del gráfico */}
      <div className="h-[380px] flex items-end justify-between">
        {labels.map((label, index) => {
          // Calcular altura relativa con un mínimo para visibilidad
          const heightPercent = Math.max(10, (values[index] / maxValue) * 100)

          return (
            <div key={label} className="flex flex-col items-center group">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-xs rounded py-1 px-2 pointer-events-none border border-[hsl(var(--border))]">
                ${values[index]}
              </div>

              {/* Barra con altura calculada y animación */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent * 2}px` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-8 bg-red-400 hover:bg-red-500 transition-all rounded-t-sm cursor-pointer"
                style={{
                  minHeight: "10px",
                }}
              />
              <span className="text-xs mt-2 text-[hsl(var(--muted-foreground))] font-medium">{label}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">${values[index]}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default RevenueChart
