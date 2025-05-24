"use client"

import { useForm } from "react-hook-form"
import { useState } from "react"
import { publicAppointmentsApi } from "@/lib/api"

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
}

interface FormData {
  nombre: string
  apellido: string
  telefono: string
  correo: string
}

const FormModal = ({ isOpen, onClose, selectedDate }: FormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  // Función segura para formatear la fecha
  const formatSelectedDate = () => {
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      return "No hay fecha seleccionada"
    }

    try {
      return selectedDate.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Fecha inválida"
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      setSubmitMessage({ type: "error", text: "Por favor selecciona una fecha y hora válida" })
      return
    }

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      // Formatear la fecha y hora para el backend de manera segura
      const fecha = selectedDate.toISOString().split("T")[0] // YYYY-MM-DD
      const hora = selectedDate.toTimeString().slice(0, 5) // HH:MM

      const appointmentData = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        telefono: data.telefono.trim(),
        correo: data.correo.trim().toLowerCase(),
        fecha,
        hora,
      }

      console.log("Enviando datos de cita:", appointmentData)

      const response = await publicAppointmentsApi.createPublicAppointment(appointmentData)

      setSubmitMessage({
        type: "success",
        text: response.message || "Cita creada con éxito. Nos pondremos en contacto contigo pronto.",
      })

      // Limpiar el formulario
      reset()

      // Cerrar el modal después de 3 segundos
      setTimeout(() => {
        onClose()
        setSubmitMessage(null)
      }, 3000)
    } catch (error) {
      console.error("Error al crear la cita:", error)
      setSubmitMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al crear la cita. Por favor intenta de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      setSubmitMessage(null)
      onClose()
    }
  }

  if (!isOpen) return null

  const isValidDate = selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md border-l-4 border-red-400 tracking-widest"
      >
        <h2 className="text-3xl font-bold mb-2 text-gray-900 text-center">CITA</h2>

        {/* Fecha y Hora seleccionada en el calendario */}
        <label className="block text-gray-900 font-semibold">Fecha y Hora:</label>
        <input
          className="w-full p-2 mb-3 border border-none focus:outline-none cursor-not-allowed bg-gray-100"
          value={formatSelectedDate()}
          readOnly
        />

        <label className="block text-gray-900 font-semibold">Nombre:</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 focus:outline-none text-xs rounded mb-0.5"
          disabled={isSubmitting}
          {...register("nombre", {
            required: "El nombre es obligatorio",
            minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" },
          })}
        />
        {errors.nombre && <p className="text-red-600 text-sm mb-2">{errors.nombre.message}</p>}

        <label className="block text-gray-900 font-semibold">Apellido:</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 focus:outline-none text-xs rounded mb-0.5"
          disabled={isSubmitting}
          {...register("apellido", {
            required: "El apellido es obligatorio",
            minLength: { value: 2, message: "El apellido debe tener al menos 2 caracteres" },
          })}
        />
        {errors.apellido && <p className="text-red-600 text-sm mb-2">{errors.apellido.message}</p>}

        <label className="block text-gray-900 font-semibold">Teléfono:</label>
        <input
          placeholder="77777777"
          type="tel"
          className="w-full p-2 border border-gray-300 focus:outline-none text-xs rounded mb-0.5"
          disabled={isSubmitting}
          {...register("telefono", {
            required: "El numero de telefono es obligatorio",
            pattern: {
              value: /^[0-9]{8,14}$/,
              message: "Telefono no valido (8-14 dígitos)",
            },
          })}
        />
        {errors.telefono && <p className="text-red-600 text-sm mb-2">{errors.telefono.message}</p>}

        <label className="block text-gray-900 font-semibold">Correo Electrónico:</label>
        <input
          type="email"
          className="w-full p-2 border border-gray-300 focus:outline-none text-xs rounded mb-0.5"
          disabled={isSubmitting}
          {...register("correo", {
            required: "El correo electrónico es obligatorio",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Correo electrónico no válido",
            },
          })}
        />
        {errors.correo && <p className="text-red-600 text-sm mb-2">{errors.correo.message}</p>}

        {/* Mensaje de estado */}
        {submitMessage && (
          <div
            className={`mt-4 p-3 rounded text-center ${
              submitMessage.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="bg-white text-gray-900 border border-gray-900 px-4 py-2 rounded hover:bg-gray-900 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-gray-900 text-red-400 px-4 py-2 rounded hover:bg-red-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !isValidDate}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormModal
