"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, X, ArrowLeft } from "lucide-react"

// Interfaz para citas según el esquema
interface Appointment {
  id: string
  pacienteId?: string
  pacienteTemporalId?: string
  odontologoId: string
  fecha: string
  hora: string
  motivo: string
  estado: "pendiente" | "completada" | "cancelada"
  createdAt: string
  // Campos adicionales para la UI
  pacienteNombre?: string
}

interface AppointmentFormProps {
  appointment?: Appointment | null
  onSave: (appointmentData: Partial<Appointment>) => void
  onCancel: () => void
}

// Sample patient list for dropdown
const patients = [
  { id: "1", nombre: "María García" },
  { id: "2", nombre: "Juan Pérez" },
  { id: "3", nombre: "Ana Rodríguez" },
  { id: "4", nombre: "Carlos Martínez" },
  { id: "5", nombre: "Laura Sánchez" },
]

// Sample dentist list for dropdown
const dentists = [
  { id: "1", nombre: "Dra. Linares" },
  { id: "2", nombre: "Dr. Martínez" },
  { id: "3", nombre: "Dra. Rodríguez" },
]

const AppointmentForm = ({ appointment, onSave, onCancel }: AppointmentFormProps) => {
  const today = new Date().toISOString().split("T")[0] // Formato YYYY-MM-DD

  const [formData, setFormData] = useState({
    pacienteId: "",
    pacienteNombre: "",
    pacienteTemporal: false,
    odontologoId: "1",
    fecha: "",
    hora: "",
    motivo: "Consulta inicial",
    estado: "pendiente" as "pendiente" | "completada" | "cancelada",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (appointment) {
      // Si es una cita existente, verificar que la fecha no sea anterior a hoy
      const appointmentDate = appointment.fecha || ""
      const validDate = appointmentDate < today ? today : appointmentDate

      setFormData({
        pacienteId: appointment.pacienteId || "",
        pacienteNombre: appointment.pacienteNombre || "",
        pacienteTemporal: !!appointment.pacienteTemporalId,
        odontologoId: appointment.odontologoId || "1",
        fecha: validDate,
        hora: appointment.hora || "",
        motivo: appointment.motivo || "Consulta inicial",
        estado: appointment.estado || "pendiente",
      })
    } else {
      // Set default values for new appointment
      setFormData({
        pacienteId: "",
        pacienteNombre: "",
        pacienteTemporal: false,
        odontologoId: "1",
        fecha: today,
        hora: "09:00",
        motivo: "Consulta inicial",
        estado: "pendiente",
      })
    }
  }, [appointment, today])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate patient
    if (!formData.pacienteTemporal && !formData.pacienteId) {
      newErrors.pacienteId = "Debe seleccionar un paciente o marcar como paciente temporal"
    }

    // If it's a temporary patient, validate name
    if (formData.pacienteTemporal && !formData.pacienteNombre.trim()) {
      newErrors.pacienteNombre = "El nombre del paciente temporal es obligatorio"
    }

    // Validate dentist
    if (!formData.odontologoId) {
      newErrors.odontologoId = "Debe seleccionar un odontólogo"
    }

    // Validate date
    if (!formData.fecha) {
      newErrors.fecha = "La fecha es obligatoria"
    } else if (formData.fecha < today) {
      newErrors.fecha = "No se puede seleccionar una fecha anterior a la actual"
    }

    // Validate time
    if (!formData.hora) {
      newErrors.hora = "La hora es obligatoria"
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
      const selectedPatient = patients.find((p) => p.id === value)
      if (selectedPatient) {
        setFormData((prev) => ({
          ...prev,
          pacienteId: value,
          pacienteNombre: selectedPatient.nombre,
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
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData({
      ...formData,
      [name]: checked,
    })

    // Clear patient ID if temporary patient is checked
    if (name === "pacienteTemporal" && checked) {
      setFormData((prev) => ({
        ...prev,
        pacienteId: "",
        [name]: checked,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Simular una petición al servidor
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Prepare data for saving
        const appointmentData: Partial<Appointment> = {
          odontologoId: formData.odontologoId,
          fecha: formData.fecha,
          hora: formData.hora,
          motivo: formData.motivo,
          estado: formData.estado,
        }

        // Handle patient data based on whether it's a temporary patient
        if (formData.pacienteTemporal) {
          appointmentData.pacienteTemporalId = appointment?.pacienteTemporalId || "temp_" + Date.now()
          appointmentData.pacienteNombre = formData.pacienteNombre
          appointmentData.pacienteId = undefined
        } else {
          appointmentData.pacienteId = formData.pacienteId
          appointmentData.pacienteNombre = formData.pacienteNombre
          appointmentData.pacienteTemporalId = undefined
        }

        onSave(appointmentData)
      } catch (error) {
        console.error("Error al guardar:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{appointment ? "Editar Cita" : "Nueva Cita"}</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </motion.button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="pacienteTemporal"
                  name="pacienteTemporal"
                  checked={formData.pacienteTemporal}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-red-400 focus:ring-red-400 border-gray-300 rounded"
                />
                <label htmlFor="pacienteTemporal" className="ml-2 block text-sm font-medium text-gray-700">
                  Paciente temporal (sin registro previo)
                </label>
              </div>
            </div>

            {formData.pacienteTemporal ? (
              <div>
                <label htmlFor="pacienteNombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Paciente Temporal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pacienteNombre"
                  name="pacienteNombre"
                  required
                  value={formData.pacienteNombre}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.pacienteNombre
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                  } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
                />
                {errors.pacienteNombre && <p className="mt-1 text-sm text-red-500">{errors.pacienteNombre}</p>}
              </div>
            ) : (
              <div>
                <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente <span className="text-red-500">*</span>
                </label>
                <select
                  id="pacienteId"
                  name="pacienteId"
                  required={!formData.pacienteTemporal}
                  value={formData.pacienteId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.pacienteId ? "border-red-300 bg-red-50" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-400`}
                  disabled={formData.pacienteTemporal}
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.nombre}
                    </option>
                  ))}
                </select>
                {errors.pacienteId && <p className="mt-1 text-sm text-red-500">{errors.pacienteId}</p>}
              </div>
            )}

            <div>
              <label htmlFor="odontologoId" className="block text-sm font-medium text-gray-700 mb-1">
                Odontólogo <span className="text-red-500">*</span>
              </label>
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
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
              >
                <option value="">Seleccionar odontólogo</option>
                {dentists.map((dentist) => (
                  <option key={dentist.id} value={dentist.id}>
                    {dentist.nombre}
                  </option>
                ))}
              </select>
              {errors.odontologoId && <p className="mt-1 text-sm text-red-500">{errors.odontologoId}</p>}
            </div>

            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                required
                min={today}
                value={formData.fecha}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.fecha ? "border-red-300 bg-red-50" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-400`}
              />
              {errors.fecha && <p className="mt-1 text-sm text-red-500">{errors.fecha}</p>}
            </div>

            <div>
              <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="hora"
                name="hora"
                required
                value={formData.hora}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.hora ? "border-red-300 bg-red-50" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-400`}
              />
              {errors.hora && <p className="mt-1 text-sm text-red-500">{errors.hora}</p>}
            </div>

            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
                Motivo
              </label>
              <input
                type="text"
                id="motivo"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                required
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
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
              className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 flex items-center"
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
