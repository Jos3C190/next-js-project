"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Users, Calendar, Stethoscope, CreditCard, Activity, BarChart3, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReportGenerator from "./ReportGenerator"

interface ReportType {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  category: string
}

const reportTypes: ReportType[] = [
  {
    id: "patients",
    title: "Reporte de Pacientes",
    description: "Lista completa de pacientes registrados con sus datos personales",
    icon: <Users className="h-6 w-6" />,
    color: "bg-blue-500",
    category: "Gestión",
  },
  {
    id: "appointments",
    title: "Reporte de Citas",
    description: "Historial de citas programadas, completadas y canceladas",
    icon: <Calendar className="h-6 w-6" />,
    color: "bg-green-500",
    category: "Operacional",
  },
  {
    id: "treatments",
    title: "Reporte de Tratamientos",
    description: "Tratamientos realizados y en progreso con detalles completos",
    icon: <Stethoscope className="h-6 w-6" />,
    color: "bg-purple-500",
    category: "Clínico",
  },
  {
    id: "payments",
    title: "Reporte Financiero",
    description: "Análisis de pagos, ingresos y estado de facturación",
    icon: <CreditCard className="h-6 w-6" />,
    color: "bg-yellow-500",
    category: "Financiero",
  },
  {
    id: "activity",
    title: "Reporte de Actividad",
    description: "Log de actividades del sistema y acciones de usuarios",
    icon: <Activity className="h-6 w-6" />,
    color: "bg-red-500",
    category: "Sistema",
  },
  {
    id: "statistics",
    title: "Reporte Estadístico",
    description: "Métricas generales y análisis de rendimiento de la clínica",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "bg-indigo-500",
    category: "Análisis",
  },
]

const categories = ["Todos", "Gestión", "Operacional", "Clínico", "Financiero", "Sistema", "Análisis"]

export default function ReportsManagement() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const filteredReports = reportTypes.filter((report) => {
    const matchesCategory = selectedCategory === "Todos" || report.category === selectedCategory
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true)
    setSelectedReport(reportId)

    try {
      // La generación del reporte se maneja en el componente ReportGenerator
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simular tiempo de generación
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setIsGenerating(false)
      setSelectedReport(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Reportes</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Genera reportes detallados de la información de tu clínica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <FileText className="h-4 w-4 mr-1" />
            {filteredReports.length} reportes disponibles
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Reporte
          </CardTitle>
          <CardDescription>Personaliza los parámetros para generar reportes específicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Reporte</Label>
              <Input
                id="search"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-red-400 border-0">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${report.color} text-white`}>
                    {report.id === "appointments" ? <Calendar className="h-6 w-6 text-white" /> : report.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {report.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{report.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <ReportGenerator
                  reportType={report.id}
                  dateRange={dateRange}
                  onGenerate={() => handleGenerateReport(report.id)}
                  isGenerating={isGenerating && selectedReport === report.id}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredReports.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <FileText className="h-16 w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">No se encontraron reportes</h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
            Intenta ajustar los filtros para encontrar los reportes que necesitas
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("Todos")
            }}
          >
            Limpiar Filtros
          </Button>
        </motion.div>
      )}
    </div>
  )
}
