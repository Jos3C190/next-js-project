"use client"

import { useState, useMemo } from "react"
import { Plus, Edit, Trash2, Eye, Search, Activity } from "lucide-react"
import TreatmentForm from "./TreatmentForm"
import Pagination from "../common/Pagination"
import ConfirmModal from "@/components/common/ConfirmModal"

// Sample treatment data
const initialTreatments = [
  {
    id: 1,
    patientName: "María García",
    patientId: 1,
    treatmentType: "Ortodoncia",
    startDate: "2025-03-10T09:00:00",
    endDate: "2026-03-10T09:00:00",
    status: "En progreso",
    cost: 2500,
    sessions: 24,
    completedSessions: 3,
    notes: "Brackets metálicos tradicionales",
  },
  {
    id: 2,
    patientName: "Juan Pérez",
    patientId: 2,
    treatmentType: "Blanqueamiento",
    startDate: "2025-04-15T14:30:00",
    endDate: "2025-05-15T14:30:00",
    status: "En progreso",
    cost: 350,
    sessions: 4,
    completedSessions: 1,
    notes: "Tratamiento de blanqueamiento profesional",
  },
  {
    id: 3,
    patientName: "Ana Rodríguez",
    patientId: 3,
    treatmentType: "Extracción",
    startDate: "2025-04-22T10:00:00",
    endDate: "2025-04-22T10:00:00",
    status: "Completado",
    cost: 120,
    sessions: 1,
    completedSessions: 1,
    notes: "Extracción de muela del juicio",
  },
  {
    id: 4,
    patientName: "Carlos Martínez",
    patientId: 4,
    treatmentType: "Limpieza Dental",
    startDate: "2025-04-18T11:30:00",
    endDate: "2025-04-18T11:30:00",
    status: "Completado",
    cost: 80,
    sessions: 1,
    completedSessions: 1,
    notes: "Limpieza dental profunda",
  },
  {
    id: 5,
    patientName: "Laura Sánchez",
    patientId: 5,
    treatmentType: "Relleno",
    startDate: "2025-04-25T15:00:00",
    endDate: "2025-04-25T15:00:00",
    status: "Programado",
    cost: 150,
    sessions: 1,
    completedSessions: 0,
    notes: "Relleno de composite en molar superior",
  },
]

// Primero, agregar una función para normalizar texto (eliminar acentos)
// Añadir esta función antes del componente TreatmentManagement

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const TreatmentManagement = () => {
  const [treatments, setTreatments] = useState(initialTreatments)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentTreatment, setCurrentTreatment] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "view" | "edit">("list")

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [treatmentToDelete, setTreatmentToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddNew = () => {
    setCurrentTreatment(null)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleEdit = (treatment: any) => {
    setCurrentTreatment(treatment)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleView = (treatment: any) => {
    setCurrentTreatment(treatment)
    setViewMode("view")
  }

  const handleDeleteClick = (treatment: any) => {
    setTreatmentToDelete(treatment)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (!treatmentToDelete) return

    setIsDeleting(true)
    // Simular delay de API
    setTimeout(() => {
      setTreatments(treatments.filter((treatment) => treatment.id !== treatmentToDelete.id))
      setShowDeleteModal(false)
      setTreatmentToDelete(null)
      setIsDeleting(false)
    }, 1000)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setShowDeleteModal(false)
      setTreatmentToDelete(null)
    }
  }

  const handleSave = (treatmentData: any) => {
    if (currentTreatment) {
      // Update existing treatment
      setTreatments(
        treatments.map((treatment) =>
          treatment.id === currentTreatment.id ? { ...treatment, ...treatmentData } : treatment,
        ),
      )
    } else {
      // Add new treatment
      const newTreatment = {
        id: treatments.length > 0 ? Math.max(...treatments.map((t) => t.id)) + 1 : 1,
        ...treatmentData,
      }
      setTreatments([...treatments, newTreatment])
    }
    setIsFormOpen(false)
    setViewMode("list")
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setViewMode("list")
  }

  // Luego, modificar la función de filtrado de tratamientos para usar la normalización
  // Reemplazar la función filteredTreatments con:

  const filteredTreatments = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm)

    return treatments.filter(
      (treatment) =>
        normalizeText(treatment.patientName).includes(normalizedSearchTerm) ||
        normalizeText(treatment.treatmentType).includes(normalizedSearchTerm) ||
        normalizeText(treatment.status).includes(normalizedSearchTerm),
    )
  }, [treatments, searchTerm])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate progress percentage
  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  if (viewMode === "view" && currentTreatment) {
    const progressPercentage = calculateProgress(currentTreatment.completedSessions, currentTreatment.sessions)

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Detalles del Tratamiento</h1>
          <button
            onClick={() => setViewMode("list")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Volver
          </button>
        </div>

        <div className="bg-[hsl(var(--card))] shadow-md rounded-lg p-6 transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Información del Tratamiento</h2>
              <p>
                <span className="font-semibold">Paciente:</span> {currentTreatment.patientName}
              </p>
              <p>
                <span className="font-semibold">Tipo de Tratamiento:</span> {currentTreatment.treatmentType}
              </p>
              <p>
                <span className="font-semibold">Fecha de Inicio:</span> {formatDate(currentTreatment.startDate)}
              </p>
              <p>
                <span className="font-semibold">Fecha de Finalización:</span> {formatDate(currentTreatment.endDate)}
              </p>
              <p>
                <span className="font-semibold">Estado:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    currentTreatment.status === "Completado"
                      ? "bg-green-100 text-green-800"
                      : currentTreatment.status === "En progreso"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {currentTreatment.status}
                </span>
              </p>
            </div>
            <div>
              <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Detalles Adicionales</h2>
              <p>
                <span className="font-semibold">Costo:</span> ${currentTreatment.cost}
              </p>
              <p>
                <span className="font-semibold">Sesiones:</span> {currentTreatment.completedSessions} de{" "}
                {currentTreatment.sessions}
              </p>
              <p>
                <span className="font-semibold">Progreso:</span>
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1 mb-4 transition-colors duration-200">
                <div className="bg-red-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p>
                <span className="font-semibold">Notas:</span>{" "}
                <span className={!currentTreatment.notes ? "text-[hsl(var(--muted-foreground))] italic" : ""}>
                  {currentTreatment.notes || "No hay notas disponibles."}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => handleEdit(currentTreatment)}
              className="px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeleteClick(currentTreatment)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
          message={`¿Está seguro que desea eliminar el tratamiento de ${treatmentToDelete?.treatmentType} para ${treatmentToDelete?.patientName}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          isLoading={isDeleting}
        />
      </div>
    )
  }

  if (viewMode === "edit") {
    return <TreatmentForm treatment={currentTreatment} onSave={handleSave} onCancel={handleCancel} />
  }

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTreatments.slice(indexOfFirstItem, indexOfLastItem)
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
          className="flex items-center px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500"
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
                  Tratamiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Inicio
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
              {currentItems.map((treatment) => {
                const progressPercentage = calculateProgress(treatment.completedSessions, treatment.sessions)

                return (
                  <tr key={treatment.id} className="hover:bg-[hsl(var(--card-hover))] transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">{treatment.patientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-[hsl(var(--muted-foreground))] mr-2" />
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">{treatment.treatmentType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        {formatDate(treatment.startDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          treatment.status === "Completado"
                            ? "bg-green-100 text-green-800"
                            : treatment.status === "En progreso"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {treatment.status}
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
        message={`¿Está seguro que desea eliminar el tratamiento de ${treatmentToDelete?.treatmentType} para ${treatmentToDelete?.patientName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default TreatmentManagement
