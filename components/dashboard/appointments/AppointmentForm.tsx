"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, X, ArrowLeft, AlertCircle } from "lucide-react"
import type { Appointment, Dentist, Patient } from "@/lib/api"

interface AppointmentFormProps {
  appointment?: Appointment | null
  onSave: (appointmentData: any) => void
  onCancel: () => void
  dentists: Dentist[]
  patients: Patient[]
}

const AppointmentForm = ({ appointment, onSave, onCancel, dentists, patients }: AppointmentFormProps) => {
  const today = new Date().toISOString().split("T")[0] // Formato YYYY-MM-DD

  const [formData, setFormData] = useState({
    pacienteId: "",
    pacienteNombre: "",
    odontologoId: "",
    fecha: "",
    hora: "",
    motivo: "",
    estado: "pendiente" as "pendiente" | "completada" | "cancelada",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string>("")

  useEffect(() => {
    if (appointment) {
      // Si es una cita existente
      const appointmentDate = appointment.fecha.split("T")[0] // Extraer solo la fecha

      setFormData({
        pacienteId: appointment.pacienteId?._id || "",
        pacienteNombre: appointment.pacienteId
          ? `${appointment.pacienteId.nombre} ${appointment.pacienteId.apellido}`
          : appointment.pacienteTemporalId
            ? `${appointment.pacienteTemporalId.nombre} ${appointment.pacienteTemporalId.apellido}`
            : "Paciente temporal",
        odontologoId: appointment.odontologoId._id,
        fecha: appointmentDate, // Usar la fecha original sin validación
        hora: appointment.hora,
        motivo: appointment.motivo,
        estado: appointment.estado,
      })
    } else {
      // Set default values for new appointment
      setFormData({
        pacienteId: "",
        pacienteNombre: "",
        odontologoId: dentists.length > 0 ? dentists[0]._id : "",
        fecha: today,
        hora: "09:00",
        motivo: "",
        estado: "pendiente",
      })
    }
  }, [appointment, today, dentists])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate patient (solo en modo creación)
    if (!appointment && !formData.pacienteId) {
      newErrors.pacienteId = "Debe seleccionar un paciente"
    }

    // Validate dentist
    if (!formData.odontologoId) {
      newErrors.odontologoId = "Debe seleccionar un odontólogo"
    }

    // Validate date
    if (!formData.fecha) {
      newErrors.fecha = "La fecha es obligatoria"
    } else if (!appointment && formData.fecha < today) {
      // Solo validar fecha mínima en modo creación
      newErrors.fecha = "No se puede seleccionar una fecha anterior a la actual"
    }

    // Validate time
    if (!formData.hora) {
      newErrors.hora = "La hora es obligatoria"
    }

    // Validate motivo
    if (!formData.motivo.trim()) {
      newErrors.motivo = "El motivo es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // If patient is selected from dropdown, update pacienteNombre
    if (name === "pacienteId" && value) {
      const selectedPatient = patients.find((p) => p._id === value)
      if (selectedPatient) {
        setFormData((prev) => ({
          ...prev,
          pacienteId: value,
          pacienteNombre: `${selectedPatient.nombre} ${selectedPatient.apellido}`,
        }))
      }
    }

    // Limpiar error al editar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }

    // Limpiar error del servidor al hacer cambios
    if (serverError) {
      setServerError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)
      setServerError("") // Limpiar errores previos

      try {
        // Prepare data for saving
        const appointmentData: any = {
          fecha: formData.fecha,
          hora: formData.hora,
          motivo: formData.motivo,
          estado: formData.estado,
        }

        // Solo incluir pacienteId y odontologoId en modo creación
        if (!appointment) {
          appointmentData.pacienteId = formData.pacienteId
          appointmentData.odontologoId = formData.odontologoId
        }

        await onSave(appointmentData)
      } catch (error) {
        console.error("Error al guardar:", error)

        // Capturar el mensaje de error del servidor
        if (error instanceof Error) {
          setServerError(error.message)
        } else {
          setServerError("Ocurrió un error inesperado al guardar la cita")
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
          {appointment ? "Editar Cita" : "Nueva Cita"}
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="flex items-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </motion.button>
      </div>

      <div className="bg-[hsl(var(--card))] shadow-md rounded-lg p-6 transition-colors duration-200">
        {/* Mostrar error del servidor */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error al guardar la cita</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{serverError}</p>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo de paciente */}
            <div>
              <label htmlFor="pacienteId" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Paciente <span className="text-red-500">*</span>
              </label>
              {appointment ? (
                // Modo edición: mostrar solo el nombre del paciente (no editable)
                <div className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-md opacity-75">
                  {formData.pacienteNombre}
                </div>
              ) : (
                // Modo creación: dropdown de pacientes
                <select
                  id="pacienteId"
                  name="pacienteId"
                  required
                  value={formData.pacienteId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.pacienteId
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                  } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200 max-h-32 overflow-y-auto`}
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.nombre} {patient.apellido} - {patient.correo}
                    </option>
                  ))}
                </select>
              )}
              {appointment && (
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  El paciente no se puede modificar en edición
                </p>
              )}
              {errors.pacienteId && <p className="mt-1 text-sm text-red-500">{errors.pacienteId}</p>}
            </div>

            <div>
              <label htmlFor="odontologoId" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Odontólogo <span className="text-red-500">*</span>
              </label>
              {appointment ? (
                // Modo edición: mostrar solo el nombre del odontólogo (no editable)
                <div className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-md opacity-75">
                  {appointment.odontologoId
                    ? `${appointment.odontologoId.nombre} ${appointment.odontologoId.apellido} - ${appointment.odontologoId.especialidad}`
                    : "Odontólogo no disponible"}
                </div>
              ) : (
                // Modo creación: dropdown de odontólogos
                <select
                  id="odontologoId"
                  name="odontologoId"
                  required
                  value={formData.odontologoId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.odontologoId
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                  } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200 max-h-32 overflow-y-auto`}
                >
                  <option value="">Seleccionar odontólogo</option>
                  {dentists.map((dentist) => (
                    <option key={dentist._id} value={dentist._id}>
                      {dentist.nombre} {dentist.apellido} - {dentist.especialidad}
                    </option>
                  ))}
                </select>
              )}
              {appointment && (
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  El odontólogo no se puede modificar en edición
                </p>
              )}
              {errors.odontologoId && <p className="mt-1 text-sm text-red-500">{errors.odontologoId}</p>}
            </div>

            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                required
                min={appointment ? undefined : today}
                value={formData.fecha}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.fecha
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
              />
              {errors.fecha && <p className="mt-1 text-sm text-red-500">{errors.fecha}</p>}
            </div>

            <div>
              <label htmlFor="hora" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="hora"
                name="hora"
                required
                value={formData.hora}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.hora
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
              />
              {errors.hora && <p className="mt-1 text-sm text-red-500">{errors.hora}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="motivo" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Motivo <span className="text-red-500">*</span>
              </label>
              <textarea
                id="motivo"
                name="motivo"
                required
                rows={3}
                value={formData.motivo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.motivo
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
                placeholder="Describe el motivo de la cita..."
              />
              {errors.motivo && <p className="mt-1 text-sm text-red-500">{errors.motivo}</p>}
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                required
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              >
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-[hsl(var(--border))] mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--card-hover))] flex items-center transition-colors duration-200"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 flex items-center transition-colors duration-200"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Guardando..." : "Guardar"}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default AppointmentForm
