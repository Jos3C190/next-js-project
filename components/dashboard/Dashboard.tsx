"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Users, Clock, Activity, AlertCircle, DollarSign, RefreshCw } from "lucide-react"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useAuth } from "@/context/AuthContext"
import StatCard from "./widgets/StatCard"
import RecentActivity from "./widgets/RecentActivity"
import AppointmentCalendar from "./widgets/AppointmentCalendar"
import RevenueChart from "./widgets/RevenueChart"
import Link from "next/link"

const Dashboard = () => {
  const { user } = useAuth()
  const { stats, recentAppointments, activities, appointments, isLoading, error, refreshData, isReady } =
    useDashboardData()

  const [showAlert, setShowAlert] = useState(true)

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

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completada":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-blue-100 text-blue-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      case "Alerta":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case "completada":
        return "Completada"
      case "pendiente":
        return "Pendiente"
      case "cancelada":
        return "Cancelada"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Calcular si hay citas para hoy
  const today = new Date().toISOString().split("T")[0]
  const appointmentsToday = recentAppointments.filter((apt) => apt.fecha === today).length

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
        {/* Alerta de citas pendientes */}
        {showAlert && appointmentsToday > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-md flex justify-between items-center ${getStatusClass("Alerta")}`}
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-3" />
              <p className="text-amber-800">
                Tienes {appointmentsToday} cita{appointmentsToday > 1 ? "s" : ""} pendiente
                {appointmentsToday > 1 ? "s" : ""} para hoy.{" "}
                <a href="/dashboard/appointments" className="font-medium underline text-amber-800 hover:text-amber-900">
                  Ver citas
                </a>
              </p>
            </div>
            <button onClick={() => setShowAlert(false)} className="text-amber-500 hover:text-amber-700">
              &times;
            </button>
          </motion.div>
        )}

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
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
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
            icon={<DollarSign className="h-6 w-6 text-blue-500" />}
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

      {/* Próximas citas con datos reales */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-[hsl(var(--card))] transition-colors duration-200 rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-red-400" />
          Próximas Citas
        </h3>

        {recentAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[hsl(var(--border))]">
              <thead className="bg-[hsl(var(--secondary))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))]">
                {recentAppointments.slice(0, 3).map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-[hsl(var(--card-hover))] transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {appointment.pacienteNombre}
                      </div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        Dr. {appointment.odontologoNombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">{formatDate(appointment.fecha)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">{appointment.hora}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">{appointment.motivo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(appointment.estado)}`}
                      >
                        {translateStatus(appointment.estado)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[hsl(var(--muted-foreground))] text-center py-4">No hay citas recientes</p>
        )}

        <div className="mt-4 text-right">
          <Link
            href="/dashboard/appointments"
            className="text-sm font-medium text-red-400 hover:text-red-500 transition-colors duration-200"
          >
            Ver todas las citas →
          </Link>
        </div>
      </motion.div>
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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
