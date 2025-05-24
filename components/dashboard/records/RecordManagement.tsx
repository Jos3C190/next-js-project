"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Plus, Edit, Trash2, Eye, Search, FileText } from "lucide-react"
import RecordForm from "./RecordForm"
import Pagination from "../common/Pagination"
import ConfirmModal from "@/components/common/ConfirmModal"

// Sample medical records data
const initialRecords = [
  {
    id: 1,
    patientName: "María García",
    patientId: 1,
    recordType: "Historia Clínica",
    date: "2025-04-15T10:30:00",
    diagnosis: "Gingivitis leve",
    treatment: "Limpieza profunda y enjuague bucal medicado",
    notes: "Paciente con buena respuesta al tratamiento",
  },
  {
    id: 2,
    patientName: "Juan Pérez",
    patientId: 2,
    recordType: "Tratamiento",
    date: "2025-04-20T14:00:00",
    diagnosis: "Maloclusión dental",
    treatment: "Ortodoncia correctiva",
    notes: "Inicio de tratamiento con brackets metálicos",
  },
  {
    id: 3,
    patientName: "Ana Rodríguez",
    patientId: 3,
    recordType: "Radiografía",
    date: "2025-04-22T09:15:00",
    diagnosis: "Impactación de muela del juicio",
    treatment: "Extracción programada",
    notes: "Radiografía panorámica muestra impactación horizontal",
  },
  {
    id: 4,
    patientName: "Carlos Martínez",
    patientId: 4,
    recordType: "Revisión",
    date: "2025-04-25T11:30:00",
    diagnosis: "Caries incipiente en molar inferior",
    treatment: "Aplicación de flúor y seguimiento",
    notes: "Recomendación de revisión en 3 meses",
  },
  {
    id: 5,
    patientName: "Laura Sánchez",
    patientId: 5,
    recordType: "Tratamiento",
    date: "2025-04-28T16:00:00",
    diagnosis: "Decoloración dental",
    treatment: "Blanqueamiento profesional",
    notes: "Primera sesión de blanqueamiento completada",
  },
  {
    id: 6,
    patientName: "Roberto Gómez",
    patientId: 6,
    recordType: "Historia Clínica",
    date: "2025-05-02T10:00:00",
    diagnosis: "Periodontitis moderada",
    treatment: "Tratamiento periodontal y antibióticos",
    notes: "Paciente con antecedentes de tabaquismo",
  },
  {
    id: 7,
    patientName: "Patricia Hernández",
    patientId: 7,
    recordType: "Radiografía",
    date: "2025-05-05T14:30:00",
    diagnosis: "Reabsorción radicular",
    treatment: "Evaluación endodóntica",
    notes: "Radiografía periapical muestra reabsorción en incisivo lateral",
  },
  {
    id: 8,
    patientName: "Miguel Díaz",
    patientId: 8,
    recordType: "Tratamiento",
    date: "2025-05-08T09:00:00",
    diagnosis: "Fractura dental",
    treatment: "Restauración con composite",
    notes: "Fractura en borde incisal de diente anterior",
  },
  {
    id: 9,
    patientName: "Carmen López",
    patientId: 9,
    recordType: "Revisión",
    date: "2025-05-10T11:00:00",
    diagnosis: "Sensibilidad dental",
    treatment: "Aplicación de barniz de flúor",
    notes: "Sensibilidad a estímulos térmicos",
  },
  {
    id: 10,
    patientName: "Fernando Torres",
    patientId: 10,
    recordType: "Historia Clínica",
    date: "2025-05-12T15:30:00",
    diagnosis: "Bruxismo",
    treatment: "Férula de descarga nocturna",
    notes: "Paciente reporta dolor mandibular matutino",
  },
  {
    id: 11,
    patientName: "Lucía Ramírez",
    patientId: 11,
    recordType: "Tratamiento",
    date: "2025-05-15T10:30:00",
    diagnosis: "Pulpitis irreversible",
    treatment: "Tratamiento de conducto",
    notes: "Dolor severo a estímulos térmicos",
  },
  {
    id: 12,
    patientName: "Javier Morales",
    patientId: 12,
    recordType: "Radiografía",
    date: "2025-05-18T14:00:00",
    diagnosis: "Lesión periapical",
    treatment: "Evaluación para endodoncia",
    notes: "Radiografía muestra radiolucidez periapical",
  },
]

const ITEMS_PER_PAGE = 5

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const RecordManagement = () => {
  const [records, setRecords] = useState(initialRecords)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "view" | "edit">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddNew = () => {
    setCurrentRecord(null)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleEdit = (record: any) => {
    setCurrentRecord(record)
    setIsFormOpen(true)
    setViewMode("edit")
  }

  const handleView = (record: any) => {
    setCurrentRecord(record)
    setViewMode("view")
  }

  const handleDeleteClick = (record: any) => {
    setRecordToDelete(record)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (!recordToDelete) return

    setIsDeleting(true)
    // Simular delay de API
    setTimeout(() => {
      setRecords(records.filter((record) => record.id !== recordToDelete.id))
      setShowDeleteModal(false)
      setRecordToDelete(null)
      setIsDeleting(false)
    }, 1000)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setShowDeleteModal(false)
      setRecordToDelete(null)
    }
  }

  const handleSave = (recordData: any) => {
    if (currentRecord) {
      // Update existing record
      setRecords(records.map((record) => (record.id === currentRecord.id ? { ...record, ...recordData } : record)))
    } else {
      // Add new record
      const newRecord = {
        id: records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1,
        ...recordData,
      }
      setRecords([...records, newRecord])
    }
    setIsFormOpen(false)
    setViewMode("list")
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setViewMode("list")
  }

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm)

    return records.filter(
      (record) =>
        normalizeText(record.patientName).includes(normalizedSearchTerm) ||
        normalizeText(record.diagnosis).includes(normalizedSearchTerm) ||
        normalizeText(record.recordType).includes(normalizedSearchTerm),
    )
  }, [records, searchTerm])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)

  // Reset to first page when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  if (viewMode === "view" && currentRecord) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Detalles del Expediente</h1>
          <button
            onClick={() => setViewMode("list")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Volver
          </button>
        </div>

        <div className="bg-[hsl(var(--card))] transition-colors duration-200 shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Información del Expediente</h2>
              <p>
                <span className="font-semibold">Paciente:</span> {currentRecord.patientName}
              </p>
              <p>
                <span className="font-semibold">Tipo de Registro:</span> {currentRecord.recordType}
              </p>
              <p>
                <span className="font-semibold">Fecha:</span> {formatDate(currentRecord.date)}
              </p>
              <p>
                <span className="font-semibold">Diagnóstico:</span> {currentRecord.diagnosis}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Tratamiento y Notas</h2>
              <p>
                <span className="font-semibold">Tratamiento:</span> {currentRecord.treatment}
              </p>
              <p>
                <span className="font-semibold">Notas:</span>{" "}
                <span className={!currentRecord.notes ? "text-[hsl(var(--muted-foreground))] italic" : ""}>
                  {currentRecord.notes || "No hay notas disponibles."}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => handleEdit(currentRecord)}
              className="px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeleteClick(currentRecord)}
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
          title="Eliminar Expediente"
          message={`¿Está seguro que desea eliminar el expediente de ${recordToDelete?.patientName}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          isLoading={isDeleting}
        />
      </div>
    )
  }

  if (viewMode === "edit") {
    return <RecordForm record={currentRecord} onSave={handleSave} onCancel={handleCancel} />
  }

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

      <div className="bg-[hsl(var(--card))] transition-colors duration-200 shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <input
              type="text"
              placeholder="Buscar expedientes..."
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
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Diagnóstico
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))] transition-colors duration-200">
              {currentItems.map((record) => (
                <tr key={record.id} className="hover:bg-[hsl(var(--card-hover))] transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[hsl(var(--foreground))]">{record.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))] mr-2" />
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">{record.recordType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{formatDate(record.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{record.diagnosis}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(record)}
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mr-3 transition-colors duration-200"
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
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-[hsl(var(--muted-foreground))]">No se encontraron expedientes</p>
          </div>
        ) : (
          filteredRecords.length > 0 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Expediente"
        message={`¿Está seguro que desea eliminar el expediente de ${recordToDelete?.patientName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default RecordManagement
