"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { createPatientAppointmentsApi, type Appointment } from "@/lib/api"
import ConfirmModal from "@/components/common/ConfirmModal"

export default function MyAppointments() {
  const { token } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todas")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [creating, setCreating] = useState(false)

  // Formulario para nueva cita
  const [newAppointment, setNewAppointment] = useState({
    fecha: "",
    hora: "",
    motivo: "",
  })

  const api = createPatientAppointmentsApi(token || "")

  useEffect(() => {
    if (token) {
      loadAppointments()
    }
  }, [token])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.getMyAppointments()

      // Verificar que la respuesta tenga la estructura correcta
      if (response && Array.isArray(response.data)) {
        setAppointments(response.data)
      } else if (Array.isArray(response)) {
        // Si la respuesta es directamente un array
        setAppointments(response)
      } else {
        console.error("Respuesta inesperada de la API:", response)
        setAppointments([])
      }
    } catch (err) {
      setError("Error al cargar las citas")
      console.error("Error loading appointments:", err)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      setError("")
      await api.createMyAppointment(newAppointment)
      setNewAppointment({ fecha: "", hora: "", motivo: "" })
      setShowCreateForm(false)
      await loadAppointments()
    } catch (err) {
      setError("Error al crear la cita")
      console.error("Error creating appointment:", err)
    } finally {
      setCreating(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return

    try {
      setError("")
      await api.cancelMyAppointment(selectedAppointment._id)
      setShowCancelModal(false)
      setSelectedAppointment(null)
      await loadAppointments()
    } catch (err) {
      setError("Error al cancelar la cita")
      console.error("Error canceling appointment:", err)
    }
  }

  // Asegurar que appointments sea un array antes de filtrar
  const filteredAppointments = Array.isArray(appointments)
    ? appointments.filter((appointment) => {
        const matchesSearch =
          appointment.motivo.toLowerCase().includes(searchTerm.toLowerCase()) || appointment.fecha.includes(searchTerm)
        const matchesStatus = statusFilter === "todas" || appointment.estado === statusFilter
        return matchesSearch && matchesStatus
      })
    : []

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { bg: "bg-blue-100", text: "text-blue-800", label: "Pendiente" },
      completada: { bg: "bg-green-100", text: "text-green-800", label: "Completada" },
      cancelada: { bg: "bg-red-100", text: "text-red-800", label: "Cancelada" },
      reprogramada: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Reprogramada" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  const canCancelAppointment = (appointment: Appointment) => {
    return appointment.estado === "pendiente"
  }

  const getDoctorName = (appointment: Appointment) => {
    if (appointment.odontologoId && typeof appointment.odontologoId === "object") {
      return `Dr. ${appointment.odontologoId.nombre} ${appointment.odontologoId.apellido}`
    }
    return "Doctor por asignar"
  }

  const getDoctorSpecialty = (appointment: Appointment) => {
    if (appointment.odontologoId && typeof appointment.odontologoId === "object") {
      return appointment.odontologoId.especialidad || "Odontología General"
    }
    return "Odontología General"
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nueva Cita
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por motivo o fecha..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="reprogramada">Reprogramadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-lg mb-2">No tienes citas registradas</p>
              <p className="text-gray-400 text-sm">Programa tu primera cita haciendo clic en "Nueva Cita"</p>
            </div>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.motivo}</h3>
                    {getStatusBadge(appointment.estado)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p>
                        <span className="font-medium">Fecha:</span> {formatDate(appointment.fecha)}
                      </p>
                      <p>
                        <span className="font-medium">Hora:</span> {appointment.hora}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Doctor:</span> {getDoctorName(appointment)}
                      </p>
                      <p>
                        <span className="font-medium">Especialidad:</span> {getDoctorSpecialty(appointment)}
                      </p>
                    </div>
                  </div>

                  {appointment.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">Creada el {formatDate(appointment.createdAt)}</p>
                  )}
                </div>

                {canCancelAppointment(appointment) && (
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setShowCancelModal(true)
                    }}
                    className="ml-4 bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear cita */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Cita</h2>
            <form onSubmit={handleCreateAppointment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newAppointment.fecha}
                    onChange={(e) => setNewAppointment({ ...newAppointment, fecha: e.target.value })}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time"
                    value={newAppointment.hora}
                    onChange={(e) => setNewAppointment({ ...newAppointment, hora: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                  <textarea
                    value={newAppointment.motivo}
                    onChange={(e) => setNewAppointment({ ...newAppointment, motivo: e.target.value })}
                    required
                    rows={3}
                    placeholder="Describe el motivo de tu cita..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Creando..." : "Crear Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para cancelar */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelAppointment}
        title="Cancelar Cita"
        message={`¿Estás seguro de que deseas cancelar la cita "${selectedAppointment?.motivo}" del ${selectedAppointment ? formatDate(selectedAppointment.fecha) : ""}?`}
        confirmText="Cancelar Cita"
        cancelText="Mantener Cita"
        type="danger"
      />
    </div>
  )
}
