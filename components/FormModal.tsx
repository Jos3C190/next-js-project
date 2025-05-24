"use client"

import { useForm } from "react-hook-form"

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
}

interface FormData {
  nombre: string
  apellido: string
  telefono: string
  email?: string
}

const FormModal = ({ isOpen, onClose, selectedDate }: FormModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    console.log("Datos enviados", data)
    onClose()
  }

  if (!isOpen) return null

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
          className="w-full p-2 mb-3 border border-none focus:outline-none cursor-not-allowed"
          value={selectedDate ? selectedDate.toLocaleString() : "No hay fecha"}
          readOnly
        />

        <label className="block text-gray-900 font-semibold">Nombre:</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 focus:outline-none text-xs rounded mb-0.5"
          {...register("nombre", { required: "El nombre es obligatorio" })}
        />
        {errors.nombre && <p className="text-red-600">{errors.nombre.message}</p>}

        <label className="block text-gray-900 font-semibold">Apellido:</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 focus:outline-none text-xs rounded mb-0.5"
          {...register("apellido", { required: "El apellido es obligatorio" })}
        />
        {errors.apellido && <p className="text-red-600">{errors.apellido.message}</p>}

        <label className="block text-gray-900 font-semibold">Teléfono:</label>
        <input
          placeholder="77777777"
          type="tel"
          className="w-full p-2 border border-gray-300 focus:outline-none text-xs rounded mb-0.5"
          {...register("telefono", {
            required: "El numero de telefono es obligatorio",
            pattern: {
              value: /^[0-9]{8,14}$/,
              message: "Telefono no valido",
            },
          })}
        />
        {errors.telefono && <p className="text-red-600">{errors.telefono.message}</p>}

        <label className="block text-gray-900 font-semibold">Correo Electrónico:</label>
        <input
          type="email"
          className="w-full p-2 border border-gray-300 focus:outline-none text-xs rounded mb-0.5"
          {...register("email")}
        />

        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="bg-white text-gray-900 border border-gray-900 px-4 py-2 rounded hover:bg-gray-900 hover:text-red-400"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-gray-900 text-red-400 px-4 py-2 rounded hover:bg-red-400 hover:text-gray-900"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormModal
