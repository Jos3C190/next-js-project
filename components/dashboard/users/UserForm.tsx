"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, User, Mail, Phone, Calendar, Lock, Briefcase } from "lucide-react"
import type { SystemUser, CreateSystemUserRequest, UpdateSystemUserRequest } from "@/lib/api"

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: CreateSystemUserRequest | UpdateSystemUserRequest) => Promise<void>
  user?: SystemUser | null
  isLoading?: boolean
}

const UserForm = ({ isOpen, onClose, onSubmit, user, isLoading = false }: UserFormProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    especialidad: "",
    fecha_nacimiento: "",
    password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      // Formatear la fecha correctamente para el input date
      const fechaFormateada = user.fecha_nacimiento ? user.fecha_nacimiento.split("T")[0] : ""

      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        correo: user.correo || "",
        telefono: user.telefono || "",
        especialidad: user.especialidad || "",
        fecha_nacimiento: fechaFormateada,
        password: "",
      })
    } else {
      setFormData({
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        especialidad: "",
        fecha_nacimiento: "",
        password: "",
      })
    }
    setErrors({})
  }, [user, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido"
    if (!formData.correo.trim()) newErrors.correo = "El correo es requerido"
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido"
    if (!formData.especialidad.trim()) newErrors.especialidad = "La especialidad es requerida"
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida"

    // Añadir estas nuevas validaciones:
    if (formData.fecha_nacimiento) {
      const fechaNacimiento = new Date(formData.fecha_nacimiento)
      const hoy = new Date()

      // Validar que la fecha no sea en el futuro
      if (fechaNacimiento > hoy) {
        newErrors.fecha_nacimiento = "La fecha de nacimiento no puede ser en el futuro"
      }

      // Calcular edad
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
      const mesActual = hoy.getMonth() - fechaNacimiento.getMonth()
      if (mesActual < 0 || (mesActual === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--
      }

      // Validar edad mínima (18 años)
      if (edad < 18) {
        newErrors.fecha_nacimiento = "La persona debe tener al menos 18 años"
      }

      // Validar edad máxima (100 años)
      if (edad > 100) {
        newErrors.fecha_nacimiento = "La fecha de nacimiento parece incorrecta"
      }
    }

    // Validar password solo para nuevos usuarios
    if (!user && !formData.password.trim()) {
      newErrors.password = "La contraseña es requerida"
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.correo && !emailRegex.test(formData.correo)) {
      newErrors.correo = "El formato del correo no es válido"
    }

    // Validar teléfono (solo números)
    const phoneRegex = /^\d+$/
    if (formData.telefono && !phoneRegex.test(formData.telefono)) {
      newErrors.telefono = "El teléfono debe contener solo números"
    }

    // Validar longitud mínima de contraseña
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      // Preparar los datos para enviar
      const submitData: any = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.correo.trim(),
        telefono: formData.telefono.trim(),
        especialidad: formData.especialidad.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
      }

      // Solo incluir password si se proporcionó y no está vacío
      if (formData.password && formData.password.trim()) {
        submitData.password = formData.password.trim()
      }

      console.log("Datos a enviar:", submitData) // Para debug
      console.log("Es edición:", !!user) // Para debug

      await onSubmit(submitData)
      onClose()
    } catch (error: any) {
      console.error("Error al guardar usuario:", error)

      // No cerrar el modal si hay error, para que el usuario pueda corregir
      // onClose() - Comentado para mantener el modal abierto

      // Mostrar error más específico si está disponible
      let errorMessage = "Error al guardar el usuario"
      if (error.message && error.message !== "Error 400: ") {
        errorMessage = error.message
      } else if (error.details) {
        errorMessage = `Error: ${JSON.stringify(error.details)}`
      }

      alert(errorMessage)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[hsl(var(--card))] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
            {user ? "Editar Usuario" : "Nuevo Odontólogo"}
          </h2>
          <button
            onClick={onClose}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.nombre ? "border-red-500" : "border-[hsl(var(--border))]"
                }`}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.apellido ? "border-red-500" : "border-[hsl(var(--border))]"
                }`}
                placeholder="Ingrese el apellido"
              />
              {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Correo Electrónico
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.correo ? "border-red-500" : "border-[hsl(var(--border))]"
                }`}
                placeholder="correo@ejemplo.com"
              />
              {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.telefono ? "border-red-500" : "border-[hsl(var(--border))]"
                }`}
                placeholder="12345678"
              />
              {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Especialidad */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <Briefcase className="h-4 w-4 inline mr-2" />
                Especialidad
              </label>
              <select
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.especialidad ? "border-red-500" : "border-[hsl(var(--border))]"
                }`}
              >
                <option value="">Seleccione una especialidad</option>
                <option value="Ortodoncia">Ortodoncia</option>
                <option value="Endodoncia">Endodoncia</option>
                <option value="Periodoncia">Periodoncia</option>
                <option value="Odontología General">Odontología General</option>
                <option value="Cirugía Oral">Cirugía Oral</option>
                <option value="Odontopediatría">Odontopediatría</option>
                <option value="Prostodoncia">Prostodoncia</option>
                <option value="Administración">Administración</option>
              </select>
              {errors.especialidad && <p className="text-red-500 text-sm mt-1">{errors.especialidad}</p>}
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.fecha_nacimiento ? "border-red-500" : "border-[hsl(var(--border))]"
                }`}
              />
              {errors.fecha_nacimiento && <p className="text-red-500 text-sm mt-1">{errors.fecha_nacimiento}</p>}
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
              <Lock className="h-4 w-4 inline mr-2" />
              Contraseña {user && "(dejar vacío para mantener la actual)"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.password ? "border-red-500" : "border-[hsl(var(--border))]"
              }`}
              placeholder={user ? "Nueva contraseña (opcional)" : "Contraseña"}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] rounded-md hover:bg-[hsl(var(--secondary))]/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Guardando..." : user ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default UserForm
