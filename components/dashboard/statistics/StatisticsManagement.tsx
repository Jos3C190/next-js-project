"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { createDashboardApi } from "@/lib/api"
import StatCard from "../widgets/StatCard"
import RevenueChart from "../widgets/RevenueChart"
import PatientGrowthChart from "./PatientGrowthChart"
import TreatmentDistributionChart from "./TreatmentDistributionChart"
import AppointmentStatusChart from "./AppointmentStatusChart"
import MonthlyComparisonChart from "./MonthlyComparisonChart"
import { Users, Calendar, TrendingUp, DollarSign, Activity, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface DashboardStats {
  totalPatients: number
  appointmentsToday: number
  appointmentsWeek: number
  monthlyAppointments: number
  completedTreatments: number
  pendingPayments: number
  totalRevenue: number
  revenueThisMonth: number
}

const StatisticsManagement = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return

      try {
        setIsLoading(true)
        const dashboardApi = createDashboardApi(token)
        const statsData = await dashboardApi.getStats()
        setStats(statsData)
        setError(null)
      } catch (err) {
        console.error("Error fetching statistics:", err)
        setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [token])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Error al cargar estadísticas</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Estadísticas del Sistema</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Análisis completo del rendimiento de la clínica</p>
      </motion.div>

      {/* Tarjetas de estadísticas principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Pacientes"
          value={stats?.totalPatients?.toString() || "0"}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Citas Hoy"
          value={stats?.appointmentsToday?.toString() || "0"}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Ingresos del Mes"
          value={`$${stats?.revenueThisMonth?.toLocaleString() || "0"}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Tratamientos Completados"
          value={stats?.completedTreatments?.toString() || "0"}
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </motion.div>

      {/* Tarjetas de estadísticas secundarias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Citas Esta Semana"
          value={stats?.appointmentsWeek?.toString() || "0"}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Citas Este Mes"
          value={stats?.monthlyAppointments?.toString() || "0"}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Pagos Pendientes"
          value={stats?.pendingPayments?.toString() || "0"}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${stats?.totalRevenue?.toLocaleString() || "0"}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </motion.div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de ingresos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <RevenueChart />
        </motion.div>

        {/* Gráfico de crecimiento de pacientes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <PatientGrowthChart />
        </motion.div>
      </div>

      {/* Gráficos secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de tratamientos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <TreatmentDistributionChart />
        </motion.div>

        {/* Estado de citas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <AppointmentStatusChart />
        </motion.div>
      </div>

      {/* Gráfico de comparación mensual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <MonthlyComparisonChart />
      </motion.div>
    </div>
  )
}

export default StatisticsManagement
