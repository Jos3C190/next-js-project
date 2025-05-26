"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Users, Activity, AlertCircle, DollarSign, RefreshCw, Clock } from "lucide-react"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useAuth } from "@/context/AuthContext"
import StatCard from "./widgets/StatCard"
import RecentActivity from "./widgets/RecentActivity"
import AppointmentCalendar from "./widgets/AppointmentCalendar"
import RevenueChart from "./widgets/RevenueChart"

const Dashboard = () => {
  const { user } = useAuth()
  const { stats, activities, appointments, isLoading, error, refreshData, isReady } = useDashboardData()

  // Mostrar skeleton solo durante la carga inicial
  if (!isReady) {
    return <DashboardSkeleton />
  }

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  // Calcular citas de hoy desde el calendario
  const today = new Date().toISOString().split("T")[0]
  const appointmentsToday = appointments.filter((apt) => {
    const aptDate = new Date(apt.fecha).toISOString().split("T")[0]
    return aptDate === today && apt.estado === "pendiente"
  }).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Panel Principal</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Bienvenido, {user?.nombre} {user?.apellido}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center px-3 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card-hover))] transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button className="flex items-center px-3 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card-hover))] transition-colors duration-200">
            <Calendar className="h-4 w-4 mr-2 text-[hsl(var(--muted-foreground))]" />
            Hoy
          </button>
        </div>
      </div>

      <AnimatePresence>
        {/* Error de estadísticas */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-md bg-red-100 border border-red-200"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tarjetas de estadísticas */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Pacientes Activos"
            value={stats?.totalPatients?.toString() || "0"}
            icon={<Users className="h-6 w-6 text-red-400" />}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            title="Citas Hoy"
            value={stats?.appointmentsToday?.toString() || "0"}
            icon={<Clock className="h-6 w-6 text-blue-400" />}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            title="Citas Mensuales"
            value={stats?.monthlyAppointments?.toString() || "0"}
            icon={<Calendar className="h-6 w-6 text-amber-400" />}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            title="Tratamientos Completados este Mes"
            value={stats?.completedTreatments?.toString() || "0"}
            icon={<Activity className="h-6 w-6 text-green-500" />}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            title="Ingresos del Mes"
            value={`$${stats?.revenueThisMonth?.toLocaleString() || "0"}`}
            icon={<DollarSign className="h-6 w-6 text-purple-500" />}
          />
        </motion.div>
      </motion.div>

      {/* Calendario de citas */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <AppointmentCalendar appointments={appointments} />
      </motion.div>

      {/* Sección con Actividad Reciente y Gráfico de Ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad reciente */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <RecentActivity activities={activities} />
        </motion.div>

        {/* Gráfico de ingresos */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <RevenueChart />
        </motion.div>
      </div>
    </div>
  )
}

// Componente de skeleton para la carga inicial
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Calendar Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Activity and Chart Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
