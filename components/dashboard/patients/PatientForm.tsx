"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, X, ArrowLeft } from "lucide-react"

interface Patient {
  id: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  historia_clinica?: string
  role: string
}

interface PatientFormProps {
  patient?: Patient | null
  onSave: (patientData: Partial<Patient>) => void
  onCancel: () => void
}

const PatientForm = ({ patient, onSave, onCancel }: PatientFormProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    historia_clinica: "",
    password: "", // Solo para nuevos pacientes
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (patient) {
      setFormData({
        nombre: patient.nombre || "",
        apellido: patient.apellido || "",
        correo: patient.correo || "",
        telefono: patient.telefono || "",
        direccion: patient.direccion || "",
        fecha_nacimiento: patient.fecha_nacimiento || "",
        historia_clinica: patient.historia_clinica || "",
        password: "", // No mostramos la contraseña existente
      })
    }
  }, [patient])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio"
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio"
    } else if (!/^\d{4}-\d{4}$/.test(formData.telefono)) {
      newErrors.telefono = "El formato debe ser XXXX-XXXX"
    }

    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = "El correo no es válido"
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria"
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria"
    }

    // Solo validar contraseña para nuevos pacientes
    if (!patient && !formData.password) {
      newErrors.password = "La contraseña es obligatoria para nuevos pacientes"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Formatear teléfono automáticamente
    if (name === "telefono") {
      // Eliminar cualquier carácter que no sea número
      const cleaned = value.replace(/\D/g, "")

      // Aplicar formato XXXX-XXXX
      if (cleaned.length <= 4) {
        setFormData({
          ...formData,
          [name]: cleaned,
        })
      } else {
        setFormData({
          ...formData,
          [name]: `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`,
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Limpiar error al editar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Simular una petición al servidor
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Si es una edición y no se cambió la contraseña, no la enviamos
        const dataToSave = { ...formData }
        if (patient && !dataToSave.password) {
          delete dataToSave.password
        }

        onSave(dataToSave)
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
        <h1 className="text-2xl font-semibold text-gray-900">{patient ? "Editar Paciente" : "Nuevo Paciente"}</h1>
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
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.nombre
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
              />
              {errors.nombre && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.nombre}</p>}
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                required
                value={formData.apellido}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.apellido
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
              />
              {errors.apellido && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.apellido}</p>}
            </div>

            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                Correo <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                required
                value={formData.correo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.correo
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
              />
              {errors.correo && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.correo}</p>}
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                required
                placeholder="XXXX-XXXX"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.telefono
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
              />
              {errors.telefono && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.telefono}</p>}
              {!errors.telefono && <p className="mt-1 text-xs text-gray-500">Formato: XXXX-XXXX</p>}
            </div>

            <div>
              <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                required
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.fecha_nacimiento
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
              />
              {errors.fecha_nacimiento && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.fecha_nacimiento}</p>
              )}
            </div>

            {!patient && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required={!patient}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.password
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                  } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password}</p>}
                {patient && (
                  <p className="mt-1 text-xs text-gray-500">Dejar en blanco para mantener la contraseña actual</p>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección <span className="text-red-500">*</span>
              </label>
              <textarea
                id="direccion"
                name="direccion"
                rows={2}
                required
                value={formData.direccion}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.direccion
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200`}
              />
              {errors.direccion && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.direccion}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="historia_clinica" className="block text-sm font-medium text-gray-700 mb-1">
                Historia Clínica <span className="text-gray-400 text-xs">(Opcional)</span>
              </label>
              <textarea
                id="historia_clinica"
                name="historia_clinica"
                rows={4}
                value={formData.historia_clinica}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              />
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

export default PatientForm
