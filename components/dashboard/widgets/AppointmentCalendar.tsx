"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from "lucide-react"
import { motion } from "framer-motion"
import type { Appointment } from "@/lib/api"
import Link from "next/link"

interface AppointmentCalendarProps {
  appointments: Appointment[]
}

const AppointmentCalendar = ({ appointments }: AppointmentCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Obtener el primer día del mes y el último día
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const days = []

    // Días del mes anterior (para completar la primera semana)
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i),
        isCurrentMonth: false,
      })
    }

    // Días del mes actual
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
        isCurrentMonth: true,
      })
    }

    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length // 6 semanas × 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentDate, firstDayOfWeek, lastDayOfMonth])

  // Obtener citas para una fecha específica
  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.fecha).toISOString().split("T")[0]
      return aptDate === dateString
    })
  }

  // Navegar entre meses
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDate(null)
  }

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    })
  }

  // Verificar si es el día de hoy
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Obtener citas del día seleccionado
  const selectedDateAppointments = selectedDate
    ? appointments.filter((apt) => {
        const aptDate = new Date(apt.fecha).toISOString().split("T")[0]
        return aptDate === selectedDate
      })
    : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completada":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-blue-100 text-blue-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
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

  const getPatientName = (appointment: Appointment) => {
    if (appointment.pacienteId) {
      return `${appointment.pacienteId.nombre} ${appointment.pacienteId.apellido}`
    }
    if (appointment.pacienteTemporalId) {
      return `${appointment.pacienteTemporalId.nombre} ${appointment.pacienteTemporalId.apellido}`
    }
    return "Paciente desconocido"
  }

  return (
    <motion.div
      whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
      className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 transition-colors duration-200"
    >
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-[hsl(var(--foreground))] flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-red-400" />
          Calendario de Citas
        </h3>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </motion.button>
          <span className="text-sm font-medium text-[hsl(var(--foreground))] min-w-[140px] text-center">
            {formatDate(currentDate)}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors duration-200"
          >
            <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="p-2 text-center text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day.date)
              const dateString = day.date.toISOString().split("T")[0]
              const isSelected = selectedDate === dateString

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(dateString)}
                  className={`
                    relative p-2 h-12 text-sm rounded-md transition-all duration-200
                    ${
                      !day.isCurrentMonth
                        ? "text-[hsl(var(--muted-foreground))] opacity-50"
                        : "text-[hsl(var(--foreground))]"
                    }
                    ${isToday(day.date) ? "bg-red-400 text-white font-bold" : "hover:bg-[hsl(var(--secondary))]"}
                    ${isSelected && !isToday(day.date) ? "bg-[hsl(var(--secondary))] ring-2 ring-red-400" : ""}
                  `}
                >
                  <span className="block">{day.date.getDate()}</span>
                  {dayAppointments.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isToday(day.date) ? "bg-white" : "bg-red-400"}`} />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Panel de citas del día seleccionado */}
        <div className="lg:col-span-1">
          <div className="bg-[hsl(var(--secondary))] rounded-lg p-4 transition-colors duration-200">
            <h4 className="font-medium text-[hsl(var(--foreground))] mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-amber-400" />
              {selectedDate
                ? `Citas del ${new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                  })}`
                : "Selecciona un día"}
            </h4>

            {selectedDate ? (
              selectedDateAppointments.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedDateAppointments.map((appointment) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[hsl(var(--card))] p-3 rounded-md border border-[hsl(var(--border))] transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1 text-[hsl(var(--muted-foreground))]" />
                          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                            {getPatientName(appointment)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.estado)}`}>
                          {translateStatus(appointment.estado)}
                        </span>
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] space-y-1">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {appointment.hora}
                        </div>
                        <div>{appointment.motivo}</div>
                        <div className="text-xs text-blue-600">
                          Dr. {appointment.odontologoId.nombre} {appointment.odontologoId.apellido}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
                  No hay citas programadas para este día
                </p>
              )
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
                Haz clic en un día para ver las citas programadas
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Link para ver todas las citas */}
      <div className="mt-4 text-center">
        <Link
          href="/dashboard/appointments"
          className="text-sm font-medium text-red-400 hover:text-red-500 transition-colors duration-200"
        >
          Ver todas las citas →
        </Link>
      </div>
    </motion.div>
  )
}

export default AppointmentCalendar
