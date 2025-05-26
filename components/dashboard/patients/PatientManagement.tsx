"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Search, Filter, ChevronLeft, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import PatientForm from "./PatientForm"
import Pagination from "../common/Pagination"
import ConfirmModal from "@/components/common/ConfirmModal"
import { useAuth } from "@/context/AuthContext"
import { createPatientsApi, type Patient } from "@/lib/api"

const ITEMS_PER_PAGE = 10

// Función para normalizar texto (eliminar acentos)
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const PatientManagement = () => {
  const { isAuthenticated, isHydrated, token, userRole } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "view" | "edit">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [filters, setFilters] = useState({
    age: "Todos",
    lastVisit: "Cualquier fecha",
    status: "Todos",
    historiaClinica: "Todos",
  })

  const [isFiltersApplied, setIsFiltersApplied] = useState(false)

  // Crear API solo si tenemos token
  const patientsApi = token ? createPatientsApi(token) : null

  // Cargar pacientes
  const loadPatients = async (page = 1, showRefreshIndicator = false) => {
    if (!isAuthenticated || !token || !patientsApi) {
      setIsLoading(false)
      return
    }

    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const response = await patientsApi.getPatients(page, ITEMS_PER_PAGE)

      // Validar que la respuesta tenga la estructura esperada
      if (response && response.data && Array.isArray(response.data)) {
        setPatients(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
        setTotalPatients(response.pagination?.total || 0)
        setCurrentPage(page)
      } else {
        console.error("Respuesta de API inválida:", response)
        setPatients([])
        setTotalPages(1)
        setTotalPatients(0)
      }
    } catch (error) {
      console.error("Error cargando pacientes:", error)
      setError("Error al cargar los pacientes")
      setPatients([]) // Añadir esta línea
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Effect para cargar pacientes cuando esté listo
  useEffect(() => {
    // Solo cargar si está hidratado y autenticado
    if (isHydrated) {
      if (isAuthenticated && token) {
        loadPatients(1)
      } else {
        setIsLoading(false)
      }
    }
  }, [isHydrated, isAuthenticated, token])

  const handleAddNew = () => {
    setCurrentPatient(null)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleEdit = (patient: Patient) => {
    setCurrentPatient(patient)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleView = (patient: Patient) => {
    setCurrentPatient(patient)
    setViewMode("view")
  }

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!patientsApi || !patientToDelete) return

    setIsDeleting(true)
    try {
      await patientsApi.deletePatient(patientToDelete._id)
      await loadPatients(currentPage)
      setShowDeleteModal(false)
      setPatientToDelete(null)
    } catch (error) {
      console.error("Error eliminando paciente:", error)
      alert("Error al eliminar el paciente")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setShowDeleteModal(false)
      setPatientToDelete(null)
    }
  }

  const handleSave = async (patientData: any) => {
    if (!patientsApi) return

    try {
      if (currentPatient) {
        await patientsApi.updatePatient(currentPatient._id, patientData)
      } else {
        await patientsApi.createPatient(patientData)
      }

      await loadPatients(currentPage)
      setIsFormOpen(false)
      setViewMode("list")
    } catch (error) {
      console.error("Error guardando paciente:", error)
      throw error
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setViewMode("list")
  }

  const handleRefresh = () => {
    loadPatients(currentPage, true)
  }

  const handlePageChange = (page: number) => {
    loadPatients(page)
  }

  // Filter patients based on search term and filters
  const filteredPatients = useMemo(() => {
    // Asegurar que patients sea un array
    if (!Array.isArray(patients)) {
      return []
    }

    const normalizedSearchTerm = normalizeText(searchTerm)

    return patients.filter((patient) => {
      const fullName = `${patient.nombre} ${patient.apellido}`
      const matchesSearch =
        normalizeText(fullName).includes(normalizedSearchTerm) ||
        normalizeText(patient.correo).includes(normalizedSearchTerm) ||
        normalizeText(patient.telefono).includes(normalizedSearchTerm)

      if (!matchesSearch) return false

      if (!isFiltersApplied) return true

      if (filters.age !== "Todos") {
        const birthDate = new Date(patient.fecha_nacimiento)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()

        const hasBirthdayOccurred =
          today.getMonth() > birthDate.getMonth() ||
          (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())

        const adjustedAge = hasBirthdayOccurred ? age : age - 1

        if (filters.age === "18-30 años" && (adjustedAge < 18 || adjustedAge > 30)) return false
        if (filters.age === "31-50 años" && (adjustedAge < 31 || adjustedAge > 50)) return false
        if (filters.age === "51+ años" && adjustedAge < 51) return false
      }

      if (filters.historiaClinica !== "Todos") {
        if (filters.historiaClinica === "Con historia" && !patient.historia_clinica) return false
        if (filters.historiaClinica === "Sin historia" && patient.historia_clinica) return false
      }

      return true
    })
  }, [patients, searchTerm, filters, isFiltersApplied])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const applyFilters = () => {
    setIsFiltersApplied(true)
  }

  const clearFilters = () => {
    setFilters({
      age: "Todos",
      lastVisit: "Cualquier fecha",
      status: "Todos",
      historiaClinica: "Todos",
    })
    setIsFiltersApplied(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Loading state - mostrar solo si no está hidratado O si está cargando
  if (!isHydrated || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="text-center text-sm text-gray-500">
          Estado: {!isHydrated ? "Hidratando..." : "Cargando pacientes..."}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Gestión de Pacientes</h1>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
          <p className="text-amber-600 dark:text-amber-400">Debes iniciar sesión para ver los pacientes</p>
        </div>
      </div>
    )
  }

  if (viewMode === "view" && currentPatient) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Detalles del Paciente</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("list")}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--card-hover))] flex items-center transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </motion.button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[hsl(var(--card))] transition-colors duration-200 shadow-md rounded-lg p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4 pb-2 border-b border-[hsl(var(--border))]">
                Información Personal
              </h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <span className="font-semibold w-40 text-[hsl(var(--foreground))]">Nombre:</span>
                  <span className="text-[hsl(var(--foreground))]">{`${currentPatient.nombre} ${currentPatient.apellido}`}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-40 text-[hsl(var(--foreground))]">Correo:</span>
                  <span className="text-[hsl(var(--foreground))]">{currentPatient.correo}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-40 text-[hsl(var(--foreground))]">Teléfono:</span>
                  <span className="text-[hsl(var(--foreground))]">{currentPatient.telefono}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-40 text-[hsl(var(--foreground))]">Fecha de Nacimiento:</span>
                  <span className="text-[hsl(var(--foreground))]">
                    {new Date(currentPatient.fecha_nacimiento).toLocaleDateString("es-ES")}
                  </span>
                </p>
                <p className="flex items-start">
                  <span className="font-semibold w-40 text-[hsl(var(--foreground))]">Dirección:</span>
                  <span className="text-[hsl(var(--foreground))]">{currentPatient.direccion}</span>
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4 pb-2 border-b border-[hsl(var(--border))]">
                Historia Clínica
              </h2>
              <div className="bg-[hsl(var(--secondary))] transition-colors duration-200 p-4 rounded-md min-h-48">
                {currentPatient.historia_clinica ? (
                  <p className="text-[hsl(var(--foreground))]">{currentPatient.historia_clinica}</p>
                ) : (
                  <p className="text-[hsl(var(--muted-foreground))] italic">No hay historia clínica disponible.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex space-x-4 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEdit(currentPatient)}
              className="px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </motion.button>
            {userRole !== "odontologo" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteClick(currentPatient)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Paciente"
          message={`¿Está seguro que desea eliminar al paciente ${patientToDelete?.nombre} ${patientToDelete?.apellido}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          isLoading={isDeleting}
        />
      </motion.div>
    )
  }

  if (viewMode === "edit") {
    return <PatientForm patient={currentPatient} onSave={handleSave} onCancel={handleCancel} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Gestión de Pacientes</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Total: {totalPatients} pacientes</p>
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center px-3 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--card-hover))] transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Actualizando..." : "Actualizar"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
              isFiltersApplied
                ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400"
                : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card-hover))]"
            }`}
          >
            <Filter
              className={`h-4 w-4 mr-2 ${isFiltersApplied ? "text-red-500 dark:text-red-400" : "text-[hsl(var(--muted-foreground))]"}`}
            />
            Filtros
            {isFiltersApplied && (
              <span className="ml-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                Activos
              </span>
            )}
          </motion.button>
          {userRole !== "odontologo" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNew}
              className="flex items-center px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500"
            >
              <Plus className="h-5 w-5 mr-1" />
              Nuevo Paciente
            </motion.button>
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Edad</label>
              <select
                name="age"
                value={filters.age}
                onChange={handleFilterChange}
                className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              >
                <option>Todos</option>
                <option>18-30 años</option>
                <option>31-50 años</option>
                <option>51+ años</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Historia Clínica</label>
              <select
                name="historiaClinica"
                value={filters.historiaClinica}
                onChange={handleFilterChange}
                className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              >
                <option>Todos</option>
                <option>Con historia</option>
                <option>Sin historia</option>
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
              placeholder="Buscar pacientes por nombre, correo o teléfono..."
              className="pl-10 pr-4 py-2 w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <motion.table
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-w-full divide-y divide-[hsl(var(--border))]"
          >
            <thead className="bg-[hsl(var(--secondary))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Fecha de Nacimiento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-[hsl(var(--card))] transition-colors duration-200 divide-y divide-[hsl(var(--border))]">
              {filteredPatients.map((patient) => (
                <motion.tr
                  key={patient._id}
                  variants={itemVariants}
                  className="hover:bg-[hsl(var(--card-hover))] transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[hsl(var(--foreground))]">{`${patient.nombre} ${patient.apellido}`}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{patient.correo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{patient.telefono}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      {new Date(patient.fecha_nacimiento).toLocaleDateString("es-ES")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleView(patient)}
                        className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] p-1 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(patient)}
                        className="text-amber-500 hover:text-amber-600 p-1 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </motion.button>
                      {userRole !== "odontologo" && (
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(patient)}
                          className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              <Search className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-3" />
              <p className="text-[hsl(var(--muted-foreground))] text-lg">No se encontraron pacientes</p>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
                Intenta con otra búsqueda o agrega un nuevo paciente
              </p>
            </motion.div>
          </div>
        ) : (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Paciente"
        message={`¿Está seguro que desea eliminar al paciente ${patientToDelete?.nombre} ${patientToDelete?.apellido}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}

export default PatientManagement
