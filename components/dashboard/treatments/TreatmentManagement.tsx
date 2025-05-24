"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit, Trash2, Eye, Search, Activity, User, Stethoscope } from "lucide-react"
import TreatmentForm from "./TreatmentForm"
import Pagination from "../common/Pagination"
import ConfirmModal from "@/components/common/ConfirmModal"
import { useAuth } from "@/context/AuthContext"
import type { Treatment, Patient, Dentist, CreateTreatmentRequest, UpdateTreatmentRequest } from "@/lib/api"
import { createTreatmentsApi } from "@/lib/api"

// Función para normalizar texto (eliminar acentos)
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const TreatmentManagement = () => {
  const { token } = useAuth()
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [dentists, setDentists] = useState<Dentist[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentTreatment, setCurrentTreatment] = useState<Treatment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "view" | "edit">("list")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [treatmentToDelete, setTreatmentToDelete] = useState<Treatment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const treatmentsApi = createTreatmentsApi(token || "")

  useEffect(() => {
    if (token) {
      loadInitialData()
    }
  }, [token])

  const loadInitialData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [treatmentsResponse, patientsResponse, dentistsResponse] = await Promise.all([
        treatmentsApi.getTreatments(1, 100), // Cargar todos los tratamientos
        treatmentsApi.getAllPatients(),
        treatmentsApi.getAllDentists(),
      ])

      // Validar y establecer tratamientos
      if (treatmentsResponse && Array.isArray(treatmentsResponse.data)) {
        setTreatments(treatmentsResponse.data)
      } else {
        setTreatments([])
      }

      // Validar y establecer pacientes
      if (patientsResponse && Array.isArray(patientsResponse.data)) {
        setPatients(patientsResponse.data)
      } else {
        setPatients([])
      }

      // Validar y establecer odontólogos
      if (dentistsResponse && Array.isArray(dentistsResponse.data)) {
        setDentists(dentistsResponse.data)
      } else {
        setDentists([])
      }
    } catch (err) {
      console.error("Error loading initial data:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los datos")
      setTreatments([])
      setPatients([])
      setDentists([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setCurrentTreatment(null)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleEdit = (treatment: Treatment) => {
    setCurrentTreatment(treatment)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleView = (treatment: Treatment) => {
    setCurrentTreatment(treatment)
    setViewMode("view")
  }

  const handleDeleteClick = (treatment: Treatment) => {
    setTreatmentToDelete(treatment)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!treatmentToDelete) return

    setIsDeleting(true)
    try {
      await treatmentsApi.deleteTreatment(treatmentToDelete._id)
      setTreatments(treatments.filter((treatment) => treatment._id !== treatmentToDelete._id))
      setShowDeleteModal(false)
      setTreatmentToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el tratamiento")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setShowDeleteModal(false)
      setTreatmentToDelete(null)
    }
  }

  const handleSave = async (treatmentData: CreateTreatmentRequest | UpdateTreatmentRequest) => {
    try {
      if (currentTreatment) {
        // Update existing treatment
        const updatedTreatment = await treatmentsApi.updateTreatment(
          currentTreatment._id,
          treatmentData as UpdateTreatmentRequest,
        )
        // Recargar los datos para obtener la información completa
        await loadInitialData()
      } else {
        // Add new treatment
        await treatmentsApi.createTreatment(treatmentData as CreateTreatmentRequest)
        // Recargar los datos para obtener la información completa
        await loadInitialData()
      }
      setIsFormOpen(false)
      setViewMode("list")
    } catch (err) {
      // Re-lanzar el error para que el formulario lo pueda capturar
      throw err
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setViewMode("list")
  }

  const filteredTreatments = useMemo(() => {
    if (!Array.isArray(treatments)) return []

    const normalizedSearchTerm = normalizeText(searchTerm)

    return treatments.filter(
      (treatment) =>
        normalizeText(`${treatment.paciente.nombre} ${treatment.paciente.apellido}`).includes(normalizedSearchTerm) ||
        normalizeText(`${treatment.odontologo.nombre} ${treatment.odontologo.apellido}`).includes(
          normalizedSearchTerm,
        ) ||
        normalizeText(treatment.tipo).includes(normalizedSearchTerm) ||
        normalizeText(treatment.descripcion).includes(normalizedSearchTerm) ||
        normalizeText(treatment.estado).includes(normalizedSearchTerm),
    )
  }, [treatments, searchTerm])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate progress percentage
  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Gestión de Tratamientos</h1>
        </div>
        <div className="bg-[hsl(var(--card))] shadow-md rounded-lg p-8 text-center transition-colors duration-200">
          <p className="text-[hsl(var(--muted-foreground))]">Cargando tratamientos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Gestión de Tratamientos</h1>
        </div>
        <div className="bg-[hsl(var(--card))] shadow-md rounded-lg p-8 text-center transition-colors duration-200">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadInitialData} className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (viewMode === "view" && currentTreatment) {
    const progressPercentage = calculateProgress(currentTreatment.sesionesCompletadas, currentTreatment.numeroSesiones)

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Detalles del Tratamiento</h1>
          <button
            onClick={() => setViewMode("list")}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--secondary))]/80 transition-colors duration-200"
          >
            Volver
          </button>
        </div>

        <div className="bg-[hsl(var(--card))] shadow-md rounded-lg p-6 transition-colors duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Paciente */}
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 text-red-400 mr-2" />
                <h2 className="text-lg font-medium text-[hsl(var(--foreground))]">Información del Paciente</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Nombre:</span> {currentTreatment.paciente.nombre}{" "}
                  {currentTreatment.paciente.apellido}
                </p>
                <p>
                  <span className="font-semibold">Correo:</span> {currentTreatment.paciente.correo}
                </p>
                <p>
                  <span className="font-semibold">Teléfono:</span> {currentTreatment.paciente.telefono}
                </p>
                <p>
                  <span className="font-semibold">Dirección:</span> {currentTreatment.paciente.direccion}
                </p>
              </div>
            </div>

            {/* Información del Odontólogo */}
            <div className="space-y-4">
              <div className="flex items-center mb-3">
                <Stethoscope className="h-5 w-5 text-red-400 mr-2" />
                <h2 className="text-lg font-medium text-[hsl(var(--foreground))]">Información del Odontólogo</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Nombre:</span> Dr. {currentTreatment.odontologo.nombre}{" "}
                  {currentTreatment.odontologo.apellido}
                </p>
                <p>
                  <span className="font-semibold">Especialidad:</span> {currentTreatment.odontologo.especialidad}
                </p>
                <p>
                  <span className="font-semibold">Correo:</span> {currentTreatment.odontologo.correo}
                </p>
                <p>
                  <span className="font-semibold">Teléfono:</span> {currentTreatment.odontologo.telefono}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[hsl(var(--border))] mt-6 pt-6">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-red-400 mr-2" />
              <h2 className="text-lg font-medium text-[hsl(var(--foreground))]">Detalles del Tratamiento</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold">Tipo:</span> {currentTreatment.tipo}
              </div>
              <div>
                <span className="font-semibold">Estado:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    currentTreatment.estado === "completado"
                      ? "bg-green-100 text-green-800"
                      : currentTreatment.estado === "en progreso"
                        ? "bg-blue-100 text-blue-800"
                        : currentTreatment.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {currentTreatment.estado.charAt(0).toUpperCase() + currentTreatment.estado.slice(1)}
                </span>
              </div>
              <div>
                <span className="font-semibold">Costo:</span> ${currentTreatment.costo}
              </div>
              <div>
                <span className="font-semibold">Fecha de Inicio:</span> {formatDate(currentTreatment.fechaInicio)}
              </div>
              {currentTreatment.fechaFin && (
                <div>
                  <span className="font-semibold">Fecha de Fin:</span> {formatDate(currentTreatment.fechaFin)}
                </div>
              )}
              <div>
                <span className="font-semibold">Sesiones:</span> {currentTreatment.sesionesCompletadas} de{" "}
                {currentTreatment.numeroSesiones}
              </div>
            </div>

            <div className="mt-4">
              <span className="font-semibold">Progreso:</span>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2 mb-2 transition-colors duration-200">
                <div className="bg-red-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{progressPercentage}% completado</span>
            </div>

            <div className="mt-4">
              <span className="font-semibold">Descripción:</span>
              <p className="mt-1 text-[hsl(var(--muted-foreground))]">{currentTreatment.descripcion}</p>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => handleEdit(currentTreatment)}
              className="px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors duration-200"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeleteClick(currentTreatment)}
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
          title="Eliminar Tratamiento"
          message={`¿Está seguro que desea eliminar el tratamiento de ${treatmentToDelete?.tipo} para ${treatmentToDelete?.paciente.nombre} ${treatmentToDelete?.paciente.apellido}? Esta acción no se puede deshacer.`}
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
      <TreatmentForm
        treatment={currentTreatment}
        patients={patients}
        dentists={dentists}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredTreatments)
    ? filteredTreatments.slice(indexOfFirstItem, indexOfLastItem)
    : []
  const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage)

  // Función para cambiar de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Gestión de Tratamientos</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-1" />
          Nuevo Tratamiento
        </button>
      </div>

      <div className="bg-[hsl(var(--card))] transition-colors duration-200 shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <input
              type="text"
              placeholder="Buscar tratamientos..."
              className="pl-10 pr-4 py-2 w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  Odontólogo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Tratamiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))] transition-colors duration-200">
              {Array.isArray(currentItems) &&
                currentItems.map((treatment) => {
                  const progressPercentage = calculateProgress(treatment.sesionesCompletadas, treatment.numeroSesiones)

                  return (
                    <tr
                      key={treatment._id}
                      className="hover:bg-[hsl(var(--card-hover))] transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-[hsl(var(--muted-foreground))] mr-2" />
                          <div>
                            <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {treatment.paciente.nombre} {treatment.paciente.apellido}
                            </div>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                              {treatment.paciente.correo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Stethoscope className="h-4 w-4 text-[hsl(var(--muted-foreground))] mr-2" />
                          <div>
                            <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                              Dr. {treatment.odontologo.nombre} {treatment.odontologo.apellido}
                            </div>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                              {treatment.odontologo.especialidad}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 text-[hsl(var(--muted-foreground))] mr-2" />
                          <div>
                            <div className="text-sm font-medium text-[hsl(var(--foreground))]">{treatment.tipo}</div>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">${treatment.costo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            treatment.estado === "completado"
                              ? "bg-green-100 text-green-800"
                              : treatment.estado === "en progreso"
                                ? "bg-blue-100 text-blue-800"
                                : treatment.estado === "pendiente"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {treatment.estado.charAt(0).toUpperCase() + treatment.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2 transition-colors duration-200">
                            <div
                              className="bg-red-400 h-2.5 rounded-full"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">{progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleView(treatment)}
                          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mr-3 transition-colors duration-200"
                          title="Ver detalles"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(treatment)}
                          className="text-amber-500 hover:text-amber-600 mr-3"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(treatment)}
                          className="text-red-500 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {filteredTreatments.length === 0 && (
          <div className="text-center py-4">
            <p className="text-[hsl(var(--muted-foreground))]">No se encontraron tratamientos</p>
          </div>
        )}
        {filteredTreatments.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Tratamiento"
        message={`¿Está seguro que desea eliminar el tratamiento de ${treatmentToDelete?.tipo} para ${treatmentToDelete?.paciente.nombre} ${treatmentToDelete?.paciente.apellido}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default TreatmentManagement
