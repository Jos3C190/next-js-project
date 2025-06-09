"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, User, Mail, Phone, Calendar, Briefcase, Shield, UserCheck } from "lucide-react"
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi"
import type { SystemUser } from "@/lib/api"

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
}

const UserDetailsModal = ({ isOpen, onClose, userId }: UserDetailsModalProps) => {
  const { apiCall } = useAuthenticatedApi()
  const [user, setUser] = useState<SystemUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetails()
    } else {
      setUser(null)
      setError(null)
    }
  }, [isOpen, userId])

  const loadUserDetails = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      await apiCall(async (token) => {
        const response = await fetch(`https://proyecto-clinica-ortodoncia.onrender.com/odontologos/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const userData = await response.json()
        setUser(userData)
      })
    } catch (error: any) {
      console.error("Error loading user details:", error)
      setError(error.message || "Error al cargar los detalles del usuario")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateAge = (dateString: string) => {
    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
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
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Detalles del Usuario</h2>
          <button
            onClick={onClose}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="text-[hsl(var(--muted-foreground))]">Cargando detalles...</div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 p-4">
              <p>{error}</p>
              <button
                onClick={loadUserDetails}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {user && !loading && !error && (
            <div className="space-y-6">
              {/* Header con avatar y rol */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center ${
                      user.role === "admin" ? "bg-blue-100" : "bg-green-100"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <Shield className="h-8 w-8 text-blue-600" />
                    ) : (
                      <UserCheck className="h-8 w-8 text-green-600" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {user.nombre} {user.apellido}
                  </h3>
                  <p className={`text-sm font-medium ${user.role === "admin" ? "text-blue-600" : "text-green-600"}`}>
                    {user.role === "admin" ? "Administrador" : "Odontólogo"}
                  </p>
                </div>
              </div>

              {/* Información personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de contacto */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                    Información de Contacto
                  </h4>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Correo Electrónico</p>
                      <p className="font-medium text-[hsl(var(--foreground))]">{user.correo}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Teléfono</p>
                      <p className="font-medium text-[hsl(var(--foreground))]">{user.telefono}</p>
                    </div>
                  </div>
                </div>

                {/* Información profesional */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                    Información Profesional
                  </h4>

                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Especialidad</p>
                      <p className="font-medium text-[hsl(var(--foreground))]">{user.especialidad}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">ID del Usuario</p>
                      <p className="font-medium text-[hsl(var(--foreground))] font-mono text-sm">{user._id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información personal */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                  Información Personal
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Fecha de Nacimiento</p>
                      <p className="font-medium text-[hsl(var(--foreground))]">{formatDate(user.fecha_nacimiento)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Edad</p>
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {calculateAge(user.fecha_nacimiento)} años
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas o información adicional */}
              <div className="bg-[hsl(var(--secondary))] rounded-lg p-4">
                <h4 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">Información del Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[hsl(var(--muted-foreground))]">Rol en el sistema:</p>
                    <p className="font-medium text-[hsl(var(--foreground))]">
                      {user.role === "admin" ? "Administrador del Sistema" : "Profesional Odontólogo"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[hsl(var(--muted-foreground))]">Estado:</p>
                    <p className="font-medium text-green-600">Activo</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-[hsl(var(--border))]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-md hover:bg-[hsl(var(--secondary))]/80 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default UserDetailsModal
