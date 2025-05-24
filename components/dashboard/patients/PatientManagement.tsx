"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Plus, Edit, Trash2, Eye, Search, Filter, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import PatientForm from "./PatientForm"
import Pagination from "../common/Pagination"

// Actualizado para coincidir con el esquema real de pacientes
interface Patient {
  id: string // Simulando ObjectId
  nombre: string
  apellido: string
  correo: string
  telefono: string
  direccion: string
  fecha_nacimiento: string // Formato ISO para fechas
  historia_clinica?: string // Opcional
  role: string
}

// Sample patient data actualizado según el esquema
const initialPatients: Patient[] = [
  {
    id: "1",
    nombre: "María",
    apellido: "García",
    correo: "maria.garcia@example.com",
    telefono: "7123-4567",
    fecha_nacimiento: "1985-06-15",
    direccion: "Calle Principal #123, San Miguel",
    historia_clinica: "Paciente con historial de tratamientos ortodónticos.",
    role: "paciente",
  },
  {
    id: "2",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan.perez@example.com",
    telefono: "7234-5678",
    fecha_nacimiento: "1990-03-22",
    direccion: "Avenida Central #456, San Miguel",
    role: "paciente",
  },
  {
    id: "3",
    nombre: "Ana",
    apellido: "Rodríguez",
    correo: "ana.rodriguez@example.com",
    telefono: "7345-6789",
    fecha_nacimiento: "1978-11-10",
    direccion: "Colonia Las Flores #789, San Miguel",
    historia_clinica: "Paciente con sensibilidad dental.",
    role: "paciente",
  },
  {
    id: "4",
    nombre: "Carlos",
    apellido: "Martínez",
    correo: "carlos.martinez@example.com",
    telefono: "7456-7890",
    fecha_nacimiento: "1995-08-05",
    direccion: "Residencial Los Pinos #101, San Miguel",
    role: "paciente",
  },
  {
    id: "5",
    nombre: "Laura",
    apellido: "Sánchez",
    correo: "laura.sanchez@example.com",
    telefono: "7567-8901",
    fecha_nacimiento: "1982-04-30",
    direccion: "Barrio El Centro #234, San Miguel",
    historia_clinica: "Paciente con bruxismo.",
    role: "paciente",
  },
  {
    id: "6",
    nombre: "Roberto",
    apellido: "Gómez",
    correo: "roberto.gomez@example.com",
    telefono: "7678-9012",
    fecha_nacimiento: "1975-12-18",
    direccion: "Colonia San Francisco #345, San Miguel",
    role: "paciente",
  },
  {
    id: "7",
    nombre: "Patricia",
    apellido: "Hernández",
    correo: "patricia.hernandez@example.com",
    telefono: "7789-0123",
    fecha_nacimiento: "1988-07-25",
    direccion: "Urbanización Santa María #456, San Miguel",
    role: "paciente",
  },
  {
    id: "8",
    nombre: "Miguel",
    apellido: "Díaz",
    correo: "miguel.diaz@example.com",
    telefono: "7890-1234",
    fecha_nacimiento: "1992-09-14",
    direccion: "Pasaje Los Almendros #567, San Miguel",
    historia_clinica: "Paciente con tratamiento de ortodoncia en curso.",
    role: "paciente",
  },
  {
    id: "9",
    nombre: "Carmen",
    apellido: "López",
    correo: "carmen.lopez@example.com",
    telefono: "7901-2345",
    fecha_nacimiento: "1980-02-28",
    direccion: "Calle Las Palmas #678, San Miguel",
    role: "paciente",
  },
  {
    id: "10",
    nombre: "Fernando",
    apellido: "Torres",
    correo: "fernando.torres@example.com",
    telefono: "7012-3456",
    fecha_nacimiento: "1987-05-10",
    direccion: "Avenida Los Pinos #789, San Miguel",
    role: "paciente",
  },
  {
    id: "11",
    nombre: "Lucía",
    apellido: "Ramírez",
    correo: "lucia.ramirez@example.com",
    telefono: "7123-4567",
    fecha_nacimiento: "1993-01-15",
    direccion: "Colonia El Carmen #890, San Miguel",
    historia_clinica: "Paciente con historial de extracciones.",
    role: "paciente",
  },
  {
    id: "12",
    nombre: "Javier",
    apellido: "Morales",
    correo: "javier.morales@example.com",
    telefono: "7234-5678",
    fecha_nacimiento: "1979-10-20",
    direccion: "Residencial Las Flores #901, San Miguel",
    role: "paciente",
  },
]

const ITEMS_PER_PAGE = 5

// Función para normalizar texto (eliminar acentos)
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const PatientManagement = () => {
  const [patients, setPatients] = useState(initialPatients)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "view" | "edit">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    age: "Todos",
    lastVisit: "Cualquier fecha",
    status: "Todos",
    historiaClinica: "Todos",
  })

  const [isFiltersApplied, setIsFiltersApplied] = useState(false)

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

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro que desea eliminar este paciente?")) {
      setPatients(patients.filter((patient) => patient.id !== id))
    }
  }

  const handleSave = (patientData: Partial<Patient>) => {
    if (currentPatient) {
      // Update existing patient
      setPatients(
        patients.map((patient) => (patient.id === currentPatient.id ? { ...patient, ...patientData } : patient)),
      )
    } else {
      // Add new patient
      const newId = Math.max(...patients.map((p) => Number.parseInt(p.id))) + 1
      const newPatient = {
        id: newId.toString(),
        nombre: patientData.nombre || "",
        apellido: patientData.apellido || "",
        correo: patientData.correo || "",
        telefono: patientData.telefono || "",
        direccion: patientData.direccion || "",
        fecha_nacimiento: patientData.fecha_nacimiento || "",
        historia_clinica: patientData.historia_clinica,
        role: "paciente",
      }
      setPatients([...patients, newPatient])
    }
    setIsFormOpen(false)
    setViewMode("list")
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setViewMode("list")
  }

  // Filter patients based on search term and filters
  const filteredPatients = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm)

    return patients.filter((patient) => {
      // Search filter - buscar en nombre completo, correo y teléfono
      const fullName = `${patient.nombre} ${patient.apellido}`
      const matchesSearch =
        normalizeText(fullName).includes(normalizedSearchTerm) ||
        normalizeText(patient.correo).includes(normalizedSearchTerm) ||
        normalizeText(patient.telefono).includes(normalizedSearchTerm)

      if (!matchesSearch) return false

      // Only apply additional filters if they are active
      if (!isFiltersApplied) return true

      // Age filter
      if (filters.age !== "Todos") {
        const birthDate = new Date(patient.fecha_nacimiento)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()

        // Adjust age if birthday hasn't occurred yet this year
        const hasBirthdayOccurred =
          today.getMonth() > birthDate.getMonth() ||
          (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())

        const adjustedAge = hasBirthdayOccurred ? age : age - 1

        if (filters.age === "18-30 años" && (adjustedAge < 18 || adjustedAge > 30)) return false
        if (filters.age === "31-50 años" && (adjustedAge < 31 || adjustedAge > 50)) return false
        if (filters.age === "51+ años" && adjustedAge < 51) return false
      }

      // Historia clínica filter
      if (filters.historiaClinica !== "Todos") {
        if (filters.historiaClinica === "Con historia" && !patient.historia_clinica) return false
        if (filters.historiaClinica === "Sin historia" && patient.historia_clinica) return false
      }

      // For demo purposes, we'll simulate last visit and status filters
      // In a real app, these would be actual fields in the patient data

      // Last visit filter (simulated)
      if (filters.lastVisit !== "Cualquier fecha") {
        // This is a simulation - in a real app, you'd have actual lastVisit dates
        const patientId = Number.parseInt(patient.id)

        // Simulate last visit based on patient ID for demo purposes
        const simulatedLastVisit = new Date()
        simulatedLastVisit.setDate(simulatedLastVisit.getDate() - patientId * 30) // Each ID is months apart

        const today = new Date()
        const daysDifference = Math.floor((today.getTime() - simulatedLastVisit.getTime()) / (1000 * 3600 * 24))

        if (filters.lastVisit === "Último mes" && daysDifference > 30) return false
        if (filters.lastVisit === "Últimos 3 meses" && daysDifference > 90) return false
        if (filters.lastVisit === "Último año" && daysDifference > 365) return false
      }

      // Status filter (simulated)
      if (filters.status !== "Todos") {
        // This is a simulation - in a real app, you'd have actual status field
        const isActive = Number.parseInt(patient.id) % 5 !== 0 // Just a demo rule: every 5th patient is inactive

        if (filters.status === "Activo" && !isActive) return false
        if (filters.status === "Inactivo" && isActive) return false
      }

      return true
    })
  }, [patients, searchTerm, filters, isFiltersApplied])

  // Calculate pagination
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)

  // Get current page items
  const currentPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredPatients, currentPage])

  // Reset to first page when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      age: "Todos",
      lastVisit: "Cualquier fecha",
      status: "Todos",
      historiaClinica: "Todos",
    })
    setIsFiltersApplied(false)
  }

  // Animación para los elementos de la lista
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDelete(currentPatient.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  if (viewMode === "edit") {
    return <PatientForm patient={currentPatient} onSave={handleSave} onCancel={handleCancel} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Gestión de Pacientes</h1>
        <div className="flex space-x-2">
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500"
          >
            <Plus className="h-5 w-5 mr-1" />
            Nuevo Paciente
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
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Última visita</label>
              <select
                name="lastVisit"
                value={filters.lastVisit}
                onChange={handleFilterChange}
                className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              >
                <option>Cualquier fecha</option>
                <option>Último mes</option>
                <option>Últimos 3 meses</option>
                <option>Último año</option>
              </select>
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
                <option>Activo</option>
                <option>Inactivo</option>
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
              {currentPatients.map((patient) => (
                <motion.tr
                  key={patient.id}
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
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(patient.id)}
                        className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button>
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
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>
    </motion.div>
  )
}

export default PatientManagement

// Si hay badges en esta página, reemplazarlos con el mismo estilo
// No parece haber badges de estado en esta página, pero si se agregan en el futuro,
// deberían seguir el mismo patrón de diseño.
