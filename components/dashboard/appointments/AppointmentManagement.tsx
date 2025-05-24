"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Plus, Edit, Trash2, Eye, Search, Filter } from "lucide-react"
import AppointmentForm from "./AppointmentForm"
import Pagination from "../common/Pagination"
import { motion } from "framer-motion"

// Interfaz para citas según el esquema
interface Appointment {
  id: string // Simulando ObjectId
  pacienteId?: string // Opcional según el esquema
  pacienteTemporalId?: string // Opcional según el esquema
  odontologoId: string
  fecha: string // Formato ISO para fechas
  hora: string // Formato HH:MM
  motivo: string
  estado: "pendiente" | "completada" | "cancelada"
  createdAt: string // Formato ISO para fechas
  // Campos adicionales para la UI
  pacienteNombre?: string // Para mostrar en la tabla
}

// Datos de ejemplo de odontólogos para el formulario
const dentists = [
  { id: "1", nombre: "Dra. Linares" },
  { id: "2", nombre: "Dr. Martínez" },
  { id: "3", nombre: "Dra. Rodríguez" },
]

// Sample appointment data actualizado según el esquema
const initialAppointments: Appointment[] = [
  {
    id: "1",
    pacienteId: "1",
    pacienteNombre: "María García",
    odontologoId: "1",
    fecha: "2025-05-20",
    hora: "10:00",
    motivo: "Limpieza Dental",
    estado: "pendiente",
    createdAt: "2025-05-01T10:00:00",
  },
  {
    id: "2",
    pacienteId: "2",
    pacienteNombre: "Juan Pérez",
    odontologoId: "1",
    fecha: "2025-05-20",
    hora: "11:00",
    motivo: "Ortodoncia",
    estado: "pendiente",
    createdAt: "2025-05-01T11:30:00",
  },
  {
    id: "3",
    pacienteId: "3",
    pacienteNombre: "Ana Rodríguez",
    odontologoId: "2",
    fecha: "2025-05-21",
    hora: "09:30",
    motivo: "Extracción",
    estado: "pendiente",
    createdAt: "2025-05-02T14:00:00",
  },
  {
    id: "4",
    pacienteId: "4",
    pacienteNombre: "Carlos Martínez",
    odontologoId: "3",
    fecha: "2025-05-22",
    hora: "14:00",
    motivo: "Consulta inicial",
    estado: "pendiente",
    createdAt: "2025-05-03T09:15:00",
  },
  {
    id: "5",
    pacienteId: "5",
    pacienteNombre: "Laura Sánchez",
    odontologoId: "1",
    fecha: "2025-05-23",
    hora: "16:30",
    motivo: "Blanqueamiento",
    estado: "pendiente",
    createdAt: "2025-05-04T11:45:00",
  },
  {
    id: "6",
    pacienteNombre: "Roberto Gómez", // Paciente temporal sin ID
    pacienteTemporalId: "t1",
    odontologoId: "2",
    fecha: "2025-05-24",
    hora: "10:00",
    motivo: "Consulta inicial",
    estado: "pendiente",
    createdAt: "2025-05-05T16:20:00",
  },
  {
    id: "7",
    pacienteId: "7",
    pacienteNombre: "Patricia Hernández",
    odontologoId: "3",
    fecha: "2025-05-24",
    hora: "11:00",
    motivo: "Relleno",
    estado: "pendiente",
    createdAt: "2025-05-06T10:30:00",
  },
  {
    id: "8",
    pacienteId: "8",
    pacienteNombre: "Miguel Díaz",
    odontologoId: "1",
    fecha: "2025-05-25",
    hora: "09:30",
    motivo: "Ortodoncia",
    estado: "pendiente",
    createdAt: "2025-05-07T14:15:00",
  },
  {
    id: "9",
    pacienteId: "9",
    pacienteNombre: "Carmen López",
    odontologoId: "2",
    fecha: "2025-05-25",
    hora: "14:00",
    motivo: "Limpieza Dental",
    estado: "pendiente",
    createdAt: "2025-05-08T09:45:00",
  },
  {
    id: "10",
    pacienteId: "10",
    pacienteNombre: "Fernando Torres",
    odontologoId: "3",
    fecha: "2025-05-26",
    hora: "16:30",
    motivo: "Consulta inicial",
    estado: "pendiente",
    createdAt: "2025-05-09T11:00:00",
  },
]

const ITEMS_PER_PAGE = 5

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "view" | "edit">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dentist: "Todos",
    date: "",
    status: "Todos",
  })
  const [isFiltersApplied, setIsFiltersApplied] = useState(false)

  const handleAddNew = () => {
    setCurrentAppointment(null)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleEdit = (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleView = (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    setViewMode("view")
  }

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro que desea eliminar esta cita?")) {
      setAppointments(appointments.filter((appointment) => appointment.id !== id))
    }
  }

  const handleSave = (appointmentData: Partial<Appointment>) => {
    if (currentAppointment) {
      // Update existing appointment
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === currentAppointment.id ? { ...appointment, ...appointmentData } : appointment,
        ),
      )
    } else {
      // Add new appointment
      const newId = Math.max(...appointments.map((a) => Number.parseInt(a.id))) + 1
      const newAppointment: Appointment = {
        id: newId.toString(),
        pacienteId: appointmentData.pacienteId,
        pacienteTemporalId: appointmentData.pacienteTemporalId,
        pacienteNombre: appointmentData.pacienteNombre,
        odontologoId: appointmentData.odontologoId || "1", // Default to first dentist
        fecha: appointmentData.fecha || new Date().toISOString().split("T")[0],
        hora: appointmentData.hora || "09:00",
        motivo: appointmentData.motivo || "Consulta inicial",
        estado: appointmentData.estado || "pendiente",
        createdAt: new Date().toISOString(),
      }
      setAppointments([...appointments, newAppointment])
    }
    setIsFormOpen(false)
    setViewMode("list")
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setViewMode("list")
  }

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setIsFiltersApplied(true)
    setCurrentPage(1) // Reset to first page when applying filters
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      dentist: "Todos",
      date: "",
      status: "Todos",
    })
    setIsFiltersApplied(false)
  }

  // Filter appointments based on search term and filters
  const filteredAppointments = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm)

    return appointments.filter((appointment) => {
      // Search filter
      const matchesSearch = appointment.pacienteNombre
        ? normalizeText(appointment.pacienteNombre).includes(normalizedSearchTerm) ||
          normalizeText(appointment.motivo).includes(normalizedSearchTerm)
        : normalizeText(appointment.motivo).includes(normalizedSearchTerm)

      if (!matchesSearch) return false

      // Only apply additional filters if they are active
      if (!isFiltersApplied) return true

      // Dentist filter
      if (filters.dentist !== "Todos" && appointment.odontologoId !== filters.dentist) {
        return false
      }

      // Date filter
      if (filters.date && appointment.fecha !== filters.date) {
        return false
      }

      // Status filter
      if (filters.status !== "Todos" && appointment.estado !== filters.status.toLowerCase()) {
        return false
      }

      return true
    })
  }, [appointments, searchTerm, filters, isFiltersApplied])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE)

  // Get current page items
  const currentAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAppointments, currentPage])

  // Reset to first page when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get dentist name by ID
  const getDentistName = (id: string) => {
    const dentist = dentists.find((d) => d.id === id)
    return dentist ? dentist.nombre : "Desconocido"
  }

  // Translate status to Spanish
  const translateStatus = (status: string) => {
    switch (status) {
      case "pendiente":
        return "Pendiente"
      case "completada":
        return "Completada"
      case "cancelada":
        return "Cancelada"
      default:
        return status
    }
  }

  // Get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-blue-100 text-blue-800"
      case "completada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (viewMode === "view" && currentAppointment) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Detalles de la Cita</h1>
          <button
            onClick={() => setViewMode("list")}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--card-hover))] transition-colors duration-200"
          >
            Volver
          </button>
        </div>

        <div className="bg-[hsl(var(--card))] transition-colors duration-200 shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Información de la Cita</h2>
              <p className="text-[hsl(var(--foreground))]">
                <span className="font-semibold">Paciente:</span>{" "}
                {currentAppointment.pacienteNombre || "Paciente temporal"}
              </p>
              <p className="text-[hsl(var(--foreground))]">
                <span className="font-semibold">Odontólogo:</span> {getDentistName(currentAppointment.odontologoId)}
              </p>
              <p className="text-[hsl(var(--foreground))]">
                <span className="font-semibold">Fecha:</span> {formatDate(currentAppointment.fecha)}
              </p>
              <p className="text-[hsl(var(--foreground))]">
                <span className="font-semibold">Hora:</span> {currentAppointment.hora}
              </p>
              <p className="text-[hsl(var(--foreground))]">
                <span className="font-semibold">Motivo:</span> {currentAppointment.motivo}
              </p>
              <p className="text-[hsl(var(--foreground))]">
                <span className="font-semibold">Estado:</span>{" "}
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(currentAppointment.estado)}`}>
                  {translateStatus(currentAppointment.estado)}
                </span>
              </p>
              <p className="text-[hsl(var(--foreground))]">
                <span className="font-semibold">Creada el:</span>{" "}
                {new Date(currentAppointment.createdAt).toLocaleString("es-ES")}
              </p>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => handleEdit(currentAppointment)}
              className="px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(currentAppointment.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === "edit") {
    return <AppointmentForm appointment={currentAppointment} onSave={handleSave} onCancel={handleCancel} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Gestión de Citas</h1>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
              isFiltersApplied
                ? "bg-white dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card-hover))]"
            }`}
          >
            <Filter
              className={`h-4 w-4 mr-2 ${isFiltersApplied ? "text-red-500 dark:text-red-400" : "text-[hsl(var(--muted-foreground))]"}`}
            />
            Filtros
            {isFiltersApplied && (
              <span className="ml-1 bg-white dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold px-1.5 py-0.5 rounded-full border border-red-100 dark:border-red-800">
                Activos
              </span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500"
          >
            <Plus className="h-5 w-5 mr-1" />
            Nueva Cita
          </motion.button>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[hsl(var(--card))] p-4 rounded-lg shadow-md transition-colors duration-200"
        >
          <h3 className="font-medium text-[hsl(var(--foreground))] mb-3">Filtros avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Odontólogo</label>
              <select
                name="dentist"
                value={filters.dentist}
                onChange={handleFilterChange}
                className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              >
                <option>Todos</option>
                {dentists.map((dentist) => (
                  <option key={dentist.id} value={dentist.id}>
                    {dentist.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Fecha</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Estado</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              >
                <option>Todos</option>
                <option>Pendiente</option>
                <option>Completada</option>
                <option>Cancelada</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--card-hover))] mr-2 transition-colors duration-200"
            >
              Limpiar
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors duration-200"
            >
              Aplicar filtros
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-[hsl(var(--card))] transition-colors duration-200 shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <input
              type="text"
              placeholder="Buscar citas por paciente o motivo..."
              className="pl-10 pr-4 py-2 w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[hsl(var(--border))]">
            <thead className="bg-[hsl(var(--secondary))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Odontólogo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))] transition-colors duration-200">
              {currentAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-[hsl(var(--card-hover))] transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {appointment.pacienteNombre || "Paciente temporal"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{formatDate(appointment.fecha)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{appointment.hora}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      {getDentistName(appointment.odontologoId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{appointment.motivo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(appointment.estado)}`}
                    >
                      {translateStatus(appointment.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(appointment)}
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mr-3 transition-colors duration-200"
                      title="Ver detalles"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-amber-500 hover:text-amber-600 mr-3"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              <Search className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-3" />
              <p className="text-[hsl(var(--muted-foreground))] text-lg">No se encontraron citas</p>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
                Intenta con otra búsqueda o agrega una nueva cita
              </p>
            </motion.div>
          </div>
        ) : (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>
    </div>
  )
}

export default AppointmentManagement
