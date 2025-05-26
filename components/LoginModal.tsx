"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
  })
  const { login, register, isLoading, error } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const success = await login({
      correo: email,
      password,
    })

    if (success) {
      onClose()
      router.push("/dashboard")
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validar que todos los campos estén llenos
    if (
      !formData.correo ||
      !formData.password ||
      !formData.nombre ||
      !formData.apellido ||
      !formData.telefono ||
      !formData.direccion ||
      !formData.fecha_nacimiento
    ) {
      alert("Por favor, complete todos los campos")
      return
    }

    const success = await register(formData)

    if (success) {
      // Mostrar mensaje de éxito y cambiar a login
      alert("Registro exitoso. Ahora puede iniciar sesión.")
      setIsRegistering(false)
      // Limpiar el formulario
      setFormData({
        correo: "",
        password: "",
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        fecha_nacimiento: "",
      })
    }
  }

  const toggleForm = () => {
    setIsRegistering(!isRegistering)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg border-l-4 border-red-400">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
        </h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {isRegistering ? (
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  required
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={formData.apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="correo"
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.correo}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                name="fecha_nacimiento"
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gray-800 text-red-400 px-4 py-2 rounded hover:bg-red-400 hover:text-white transition disabled:opacity-50"
              >
                {isLoading ? "Registrando..." : "Registrarse"}
              </button>
              <button type="button" className="text-gray-600 hover:text-amber-500" onClick={toggleForm}>
                Ya tengo cuenta
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Contraseña</label>
              <input
                type="password"
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gray-800 text-red-400 px-4 py-2 rounded hover:bg-red-400 hover:text-white transition disabled:opacity-50"
              >
                {isLoading ? "Iniciando..." : "Iniciar Sesión"}
              </button>
              <button type="button" className="text-gray-600 hover:text-amber-500" onClick={toggleForm}>
                Crear cuenta
              </button>
            </div>
          </form>
        )}

        <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:underline block mx-auto">
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default LoginModal
