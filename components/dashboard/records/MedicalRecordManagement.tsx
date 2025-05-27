"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Plus, Edit, Trash2, Eye, Search, FileText, User, Calendar, Stethoscope } from "lucide-react"
import MedicalRecordForm from "./MedicalRecordForm"
import Pagination from "../common/Pagination"
import ConfirmModal from "@/components/common/ConfirmModal"
import { createMedicalRecordsApi, type MedicalRecord } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

const ITEMS_PER_PAGE = 10

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const MedicalRecordManagement: React.FC = () => {
  const { token } = useAuth()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<MedicalRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "view" | "edit">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Cargar expedientes
  const loadRecords = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      setError(null)
      const medicalRecordsApi = createMedicalRecordsApi(token)
      const response = await medicalRecordsApi.getMedicalRecords(1, 1000) // Obtener todos

      // Validar que la respuesta tenga la estructura esperada
      if (response && response.data && Array.isArray(response.data)) {
        // Filtrar registros que tengan datos completos de paciente
        const validRecords = response.data.filter(
          (record) =>
            record && record.paciente && record.paciente.nombre && record.paciente.apellido && record.paciente.correo,
        )
        setRecords(validRecords)
      } else {
        setRecords([])
        console.warn("La respuesta de la API no tiene la estructura esperada:", response)
      }
    } catch (error: any) {
      console.error("Error loading medical records:", error)
      setError("Error al cargar los expedientes")
      setRecords([]) // Asegurar que records sea un array vacío en caso de error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [token])

  const handleAddNew = () => {
    setCurrentRecord(null)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleEdit = (record: MedicalRecord) => {
    setCurrentRecord(record)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleView = (record: MedicalRecord) => {
    setCurrentRecord(record)
    setViewMode("view")
  }

  const handleDeleteClick = (record: MedicalRecord) => {
    setRecordToDelete(record)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!recordToDelete || !token) return

    setIsDeleting(true)
    try {
      const medicalRecordsApi = createMedicalRecordsApi(token)
      await medicalRecordsApi.deleteMedicalRecord(recordToDelete._id)

      // Actualizar la lista local
      setRecords(records.filter((record) => record._id !== recordToDelete._id))
      setShowDeleteModal(false)
      setRecordToDelete(null)
    } catch (error: any) {
      console.error("Error deleting medical record:", error)
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setShowDeleteModal(false)
      setRecordToDelete(null)
    }
  }

  const handleSave = async (recordData: any) => {
    if (!token) throw new Error("No hay token de autenticación")

    const medicalRecordsApi = createMedicalRecordsApi(token)

    if (currentRecord) {
      // Actualizar expediente existente
      const updatedRecord = await medicalRecordsApi.updateMedicalRecord(currentRecord._id, {
        observaciones: recordData.observaciones,
      })

      // Recargar la lista para obtener datos completos
      await loadRecords()
    } else {
      // Crear nuevo expediente
      await medicalRecordsApi.createMedicalRecord(recordData)

      // Recargar la lista
      await loadRecords()
    }

    setIsFormOpen(false)
    setViewMode("list")
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setViewMode("list")
  }

  // Filtrar expedientes basado en el término de búsqueda
  const filteredRecords = useMemo(() => {
    // Validación de seguridad
    if (!records || !Array.isArray(records)) {
      return []
    }

    return records.filter((record) => {
      // Verificar que el record y paciente existan
      if (!record || !record.paciente) return false

      const { paciente } = record

      // Verificar que las propiedades del paciente existan
      if (!paciente.nombre || !paciente.apellido || !paciente.correo) return false

      const normalizedSearchTerm = normalizeText(searchTerm)

      return (
        normalizeText(`${paciente.nombre} ${paciente.apellido}`).includes(normalizedSearchTerm) ||
        normalizeText(paciente.correo).includes(normalizedSearchTerm) ||
        normalizeText(record.observaciones || "").includes(normalizedSearchTerm)
      )
    })
  }, [records, searchTerm])

  // Calcular paginación
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)

  // Resetear a la primera página cuando cambia el término de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Vista de detalles del expediente
  if (viewMode === "view" && currentRecord) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Detalles del Expediente</h1>
          <button
            onClick={() => setViewMode("list")}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--card-hover))]"
          >
            Volver
          </button>
        </div>

        <div className="bg-[hsl(var(--card))] shadow-md rounded-lg p-6">
          {/* Información del paciente */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información del Paciente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[hsl(var(--secondary))] p-4 rounded-lg">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Nombre completo</p>
                <p className="font-medium">
                  {currentRecord.paciente?.nombre || "N/A"} {currentRecord.paciente?.apellido || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Correo electrónico</p>
                <p className="font-medium">{currentRecord.paciente?.correo || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Teléfono</p>
                <p className="font-medium">{currentRecord.paciente?.telefono || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Fecha de nacimiento</p>
                <p className="font-medium">
                  {currentRecord.paciente?.fecha_nacimiento
                    ? formatDate(currentRecord.paciente.fecha_nacimiento)
                    : "N/A"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Dirección</p>
                <p className="font-medium">{currentRecord.paciente?.direccion || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Información del expediente */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Expediente Médico
            </h2>
            <div className="bg-[hsl(var(--secondary))] p-4 rounded-lg">
              <div className="mb-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Fecha de creación</p>
                <p className="font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(currentRecord.fechaCreacion)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Observaciones</p>
                <p className="text-[hsl(var(--foreground))] whitespace-pre-wrap">{currentRecord.observaciones}</p>
              </div>
            </div>
          </div>

          {/* Tratamientos */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2" />
              Tratamientos ({currentRecord.tratamientos.length})
            </h2>
            {currentRecord.tratamientos && currentRecord.tratamientos.length > 0 ? (
              <div className="space-y-4">
                {currentRecord.tratamientos
                  .map((treatment) => {
                    if (!treatment) return null

                    return (
                      <div key={treatment._id} className="bg-[hsl(var(--secondary))] p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Tipo de tratamiento</p>
                            <p className="font-medium">{treatment.tipo || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Estado</p>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                treatment.estado === "completado"
                                  ? "bg-green-100 text-green-800"
                                  : treatment.estado === "en_progreso"
                                    ? "bg-blue-100 text-blue-800"
                                    : treatment.estado === "pendiente"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {treatment.estado || "N/A"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Odontólogo</p>
                            <p className="font-medium">
                              Dr. {treatment.odontologo?.nombre || "N/A"} {treatment.odontologo?.apellido || ""}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Costo</p>
                            <p className="font-medium">${(treatment.costo || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Sesiones</p>
                            <p className="font-medium">
                              {treatment.sesionesCompletadas || 0}/{treatment.numeroSesiones || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Fecha de inicio</p>
                            <p className="font-medium">
                              {treatment.fechaInicio ? formatDate(treatment.fechaInicio) : "N/A"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Descripción</p>
                            <p className="text-[hsl(var(--foreground))]">{treatment.descripcion || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                  .filter(Boolean)}
              </div>
            ) : (
              <div className="bg-[hsl(var(--secondary))] p-4 rounded-lg text-center">
                <p className="text-[hsl(var(--muted-foreground))]">No hay tratamientos registrados</p>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => handleEdit(currentRecord)}
              className="px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500"
            >
              Editar Observaciones
            </button>
            <button
              onClick={() => handleDeleteClick(currentRecord)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Eliminar Expediente
            </button>
          </div>
        </div>

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Eliminar Expediente"
          message={`¿Está seguro que desea eliminar el expediente de ${recordToDelete?.paciente.nombre} ${recordToDelete?.paciente.apellido}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          isLoading={isDeleting}
        />
      </div>
    )
  }

  // Vista del formulario
  if (viewMode === "edit") {
    return <MedicalRecordForm record={currentRecord} onSave={handleSave} onCancel={handleCancel} />
  }

  // Vista principal de la lista
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Gestión de Expedientes</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500"
        >
          <Plus className="h-5 w-5 mr-1" />
          Nuevo Expediente
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
          <button onClick={loadRecords} className="mt-2 text-red-600 hover:text-red-800 underline">
            Reintentar
          </button>
        </div>
      )}

      <div className="bg-[hsl(var(--card))] shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <input
              type="text"
              placeholder="Buscar expedientes por paciente, correo o observaciones..."
              className="pl-10 pr-4 py-2 w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">Cargando expedientes...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[hsl(var(--border))]">
                <thead className="bg-[hsl(var(--secondary))]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Tratamientos
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))]">
                  {currentItems && currentItems.length > 0 ? (
                    currentItems
                      .map((record) => {
                        // Verificar que el record tenga datos válidos antes de renderizar
                        if (!record || !record.paciente) return null

                        return (
                          <tr
                            key={record._id}
                            className="hover:bg-[hsl(var(--card-hover))] transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                                {record.paciente?.nombre || "N/A"} {record.paciente?.apellido || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                {record.paciente?.correo || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                {record.fechaCreacion ? formatDate(record.fechaCreacion) : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Stethoscope className="h-4 w-4 text-[hsl(var(--muted-foreground))] mr-2" />
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                  {record.tratamientos?.length || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleView(record)}
                                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mr-3"
                                title="Ver detalles"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(record)}
                                className="text-amber-500 hover:text-amber-600 mr-3"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(record)}
                                className="text-red-500 hover:text-red-600"
                                title="Eliminar"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                      .filter(Boolean) // Filtrar elementos null
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-[hsl(var(--muted-foreground))]">
                        {isLoading ? "Cargando..." : "No hay expedientes para mostrar"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  {searchTerm ? "No se encontraron expedientes" : "No hay expedientes registrados"}
                </p>
              </div>
            ) : (
              filteredRecords.length > ITEMS_PER_PAGE && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              )
            )}
          </>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Expediente"
        message={`¿Está seguro que desea eliminar el expediente de ${recordToDelete?.paciente.nombre} ${recordToDelete?.paciente.apellido}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default MedicalRecordManagement
