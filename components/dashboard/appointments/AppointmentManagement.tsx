"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Search, Filter, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import {
  createAppointmentsApi,
  createDentistsApi,
  createPatientsApi,
  type Appointment,
  type Dentist,
  type Patient,
} from "@/lib/api"
import AppointmentForm from "./AppointmentForm"
import Pagination from "../common/Pagination"
import ConfirmModal from "@/components/common/ConfirmModal"

const ITEMS_PER_PAGE = 10

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const AppointmentManagement = () => {
  const { token } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [dentists, setDentists] = useState<Dentist[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "view" | "edit">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dentist: "Todos",
    date: "",
    status: "Todos",
  })
  const [isFiltersApplied, setIsFiltersApplied] = useState(false)

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Crear instancias de API
  const appointmentsApi = token ? createAppointmentsApi(token) : null
  const dentistsApi = token ? createDentistsApi(token) : null
  const patientsApi = token ? createPatientsApi(token) : null

  // Cargar datos iniciales
  useEffect(() => {
    if (token) {
      loadInitialData()
    }
  }, [token])

  const loadInitialData = async () => {
    if (!appointmentsApi || !dentistsApi || !patientsApi) return

    try {
      setIsLoading(true)

      // Cargar datos en paralelo
      const [appointmentsResponse, dentistsResponse, patientsResponse] = await Promise.all([
        appointmentsApi.getAppointments(1, ITEMS_PER_PAGE),
        dentistsApi.getDentists(1, 100), // Cargar todos los dentistas
        patientsApi.getPatients(1, 1000), // Cargar todos los pacientes para el formulario
      ])

      // Validar que las respuestas tengan la estructura esperada
      if (appointmentsResponse?.data && Array.isArray(appointmentsResponse.data)) {
        setAppointments(appointmentsResponse.data)
        setTotalPages(appointmentsResponse.pagination?.totalPages || 1)
      } else {
        setAppointments([])
        setTotalPages(1)
      }

      if (dentistsResponse?.data && Array.isArray(dentistsResponse.data)) {
        setDentists(dentistsResponse.data)
      } else {
        setDentists([])
      }

      if (patientsResponse?.data && Array.isArray(patientsResponse.data)) {
        setPatients(patientsResponse.data)
      } else {
        setPatients([])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      // Establecer arrays vacíos en caso de error
      setAppointments([])
      setDentists([])
      setPatients([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar citas cuando cambie la página
  useEffect(() => {
    if (token && appointmentsApi) {
      loadAppointments(currentPage)
    }
  }, [currentPage, token])

  const loadAppointments = async (page: number) => {
    if (!appointmentsApi) return

    try {
      const response = await appointmentsApi.getAppointments(page, ITEMS_PER_PAGE)

      if (response?.data && Array.isArray(response.data)) {
        setAppointments(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        setAppointments([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Error loading appointments:", error)
      setAppointments([])
      setTotalPages(1)
    }
  }

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

  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete || !appointmentsApi) return

    setIsDeleting(true)
    try {
      await appointmentsApi.deleteAppointment(appointmentToDelete._id)
      await loadAppointments(currentPage)
      setShowDeleteModal(false)
      setAppointmentToDelete(null)
    } catch (error) {
      console.error("Error deleting appointment:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setShowDeleteModal(false)
      setAppointmentToDelete(null)
    }
  }

  const handleSave = async (appointmentData: any) => {
    if (!appointmentsApi) return

    try {
      if (currentAppointment) {
        // Actualizar cita existente
        await appointmentsApi.updateAppointment(currentAppointment._id, appointmentData)
      } else {
        // Crear nueva cita
        await appointmentsApi.createAppointment(appointmentData)
      }

      await loadAppointments(currentPage)
      setIsFormOpen(false)
      setViewMode("list")
    } catch (error) {
      // Re-lanzar el error para que lo capture el formulario
      throw error
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setViewMode("list")
  }

  const handleRefresh = () => {
    loadAppointments(currentPage)
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
    setCurrentPage(1)
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

  // Get patient name
  const getPatientName = (appointment: Appointment | null) => {
    if (!appointment) return "Paciente desconocido"

    if (appointment.pacienteId) {
      return `${appointment.pacienteId.nombre} ${appointment.pacienteId.apellido}`
    } else if (appointment.pacienteTemporalId) {
      return `${appointment.pacienteTemporalId.nombre} ${appointment.pacienteTemporalId.apellido} (Temporal)`
    }
    return "Paciente desconocido"
  }

  // Get dentist name
  const getDentistName = (appointment: Appointment | null) => {
    if (!appointment || !appointment.odontologoId) return "Odontólogo desconocido"
    return `${appointment.odontologoId.nombre} ${appointment.odontologoId.apellido}`
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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "completada":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  // Filter appointments based on search term and filters
  const filteredAppointments = useMemo(() => {
    // Asegurar que appointments sea un array antes de filtrar
    if (!Array.isArray(appointments)) {
      return []
    }

    const normalizedSearchTerm = normalizeText(searchTerm)

    return appointments.filter((appointment) => {
      // Validar que la cita existe y tiene datos mínimos
      if (!appointment || !appointment._id) return false

      // Search filter
      const patientName = appointment.pacienteId
        ? `${appointment.pacienteId.nombre || ""} ${appointment.pacienteId.apellido || ""}`
        : appointment.pacienteTemporalId
          ? `${appointment.pacienteTemporalId.nombre || ""} ${appointment.pacienteTemporalId.apellido || ""}`
          : ""

      const dentistName = appointment.odontologoId
        ? `${appointment.odontologoId.nombre || ""} ${appointment.odontologoId.apellido || ""}`
        : ""

      const matchesSearch =
        normalizeText(patientName).includes(normalizedSearchTerm) ||
        normalizeText(dentistName).includes(normalizedSearchTerm) ||
        normalizeText(appointment.motivo || "").includes(normalizedSearchTerm)

      if (!matchesSearch) return false

      // Only apply additional filters if they are active
      if (!isFiltersApplied) return true

      // Dentist filter
      if (filters.dentist !== "Todos" && appointment.odontologoId?._id !== filters.dentist) {
        return false
      }

      // Date filter
      if (filters.date && appointment.fecha && !appointment.fecha.startsWith(filters.date)) {
        return false
      }

      // Status filter
      if (filters.status !== "Todos" && appointment.estado !== filters.status.toLowerCase()) {
        return false
      }

      return true
    })
  }, [appointments, searchTerm, filters, isFiltersApplied])

  // Reset to first page when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    // Crear la fecha directamente desde la cadena YYYY-MM-DD para evitar problemas de zona horaria
    const [year, month, day] = dateString.split("T")[0].split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
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
              <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4">Información de la Cita</h2>
              <div className="space-y-3">
                <p className="text-[hsl(var(--foreground))]">
                  <span className="font-semibold">Paciente:</span> {getPatientName(currentAppointment)}
                </p>
                <p className="text-[hsl(var(--foreground))]">
                  <span className="font-semibold">Odontólogo:</span> {getDentistName(currentAppointment)}
                </p>
                <p className="text-[hsl(var(--foreground))]">
                  <span className="font-semibold">Especialidad:</span> {currentAppointment.odontologoId.especialidad}
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
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => handleEdit(currentAppointment)}
              className="px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors duration-200"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeleteClick(currentAppointment)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
            >
              Eliminar
            </button>
          </div>
        </div>

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Cita"
          message={`¿Está seguro que desea eliminar la cita de ${getPatientName(appointmentToDelete!)} programada para el ${appointmentToDelete ? formatDate(appointmentToDelete.fecha) : ""}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          isLoading={isDeleting}
        />
      </div>
    )
  }

  if (viewMode === "edit") {
    return (
      <AppointmentForm
        appointment={currentAppointment}
        onSave={handleSave}
        onCancel={handleCancel}
        dentists={dentists}
        patients={patients}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Gestión de Citas</h1>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card-hover))] transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2 text-[hsl(var(--muted-foreground))]" />
            Actualizar
          </motion.button>
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
            className="flex items-center px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors duration-200"
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
                <option value="Todos">Todos</option>
                {dentists.map((dentist) => (
                  <option key={dentist._id} value={dentist._id}>
                    {dentist.nombre} {dentist.apellido}
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
                <option value="Todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
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
              placeholder="Buscar citas por paciente, odontólogo o motivo..."
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
              {Array.isArray(filteredAppointments) &&
                filteredAppointments
                  .map((appointment) => {
                    // Validar que la cita tenga datos mínimos requeridos
                    if (!appointment || !appointment._id) return null

                    return (
                      <tr
                        key={appointment._id}
                        className="hover:bg-[hsl(var(--card-hover))] transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                            {getPatientName(appointment)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {appointment.fecha ? formatDate(appointment.fecha) : "Fecha no disponible"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {appointment.hora || "Hora no disponible"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {getDentistName(appointment)}
                          </div>
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            {appointment.odontologoId?.especialidad || "Especialidad no disponible"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {appointment.motivo || "Sin motivo especificado"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(appointment.estado || "pendiente")}`}
                          >
                            {translateStatus(appointment.estado || "pendiente")}
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
                            className="text-amber-500 hover:text-amber-600 mr-3 transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(appointment)}
                            className="text-red-500 hover:text-red-600 transition-colors duration-200"
                            title="Eliminar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                  .filter(Boolean)}
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

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Cita"
        message={`¿Está seguro que desea eliminar la cita de ${appointmentToDelete ? getPatientName(appointmentToDelete) : ""} programada para el ${appointmentToDelete ? formatDate(appointmentToDelete.fecha) : ""}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default AppointmentManagement
