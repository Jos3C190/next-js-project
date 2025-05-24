"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import type { Treatment, Patient, Dentist, CreateTreatmentRequest, UpdateTreatmentRequest } from "@/lib/api"

interface TreatmentFormProps {
  treatment?: Treatment
  patients: Patient[]
  dentists: Dentist[]
  onSave: (treatmentData: CreateTreatmentRequest | UpdateTreatmentRequest) => Promise<void>
  onCancel: () => void
}

// Tipos de tratamiento disponibles
const treatmentTypes = [
  "Ortodoncia",
  "Blanqueamiento",
  "Extracción",
  "Limpieza",
  "Profilaxis Dental Completa",
  "Endodoncia",
  "Prótesis",
  "Relleno",
  "Implante",
  "Cirugía",
  "Otro",
]

// Estados de tratamiento
const treatmentStatuses = ["pendiente", "en progreso", "completado", "cancelado"]

const TreatmentForm = ({ treatment, patients = [], dentists = [], onSave, onCancel }: TreatmentFormProps) => {
  const [formData, setFormData] = useState({
    paciente: "",
    odontologo: "",
    descripcion: "",
    tipo: "",
    costo: 0,
    numeroSesiones: 1,
    sesionesCompletadas: 0,
    estado: "pendiente" as const,
    fechaInicio: "",
    fechaFin: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (treatment) {
      const fechaInicio = new Date(treatment.fechaInicio)
      const fechaFin = treatment.fechaFin ? new Date(treatment.fechaFin) : null

      setFormData({
        paciente: treatment.paciente._id,
        odontologo: treatment.odontologo._id,
        descripcion: treatment.descripcion,
        tipo: treatment.tipo,
        costo: treatment.costo,
        numeroSesiones: treatment.numeroSesiones,
        sesionesCompletadas: treatment.sesionesCompletadas,
        estado: treatment.estado,
        fechaInicio: fechaInicio.toISOString().split("T")[0],
        fechaFin: fechaFin ? fechaFin.toISOString().split("T")[0] : "",
      })
    }
  }, [treatment])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setError(null) // Limpiar error cuando el usuario hace cambios

    // Handle numeric inputs
    if (name === "costo" || name === "numeroSesiones" || name === "sesionesCompletadas") {
      setFormData({
        ...formData,
        [name]: Number.parseFloat(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (treatment) {
        // Modo edición - solo enviar campos editables
        const updateData: UpdateTreatmentRequest = {
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          costo: formData.costo,
          numeroSesiones: formData.numeroSesiones,
          sesionesCompletadas: formData.sesionesCompletadas,
          fechaInicio: new Date(formData.fechaInicio).toISOString(),
          estado: formData.estado,
        }

        if (formData.fechaFin) {
          updateData.fechaFin = new Date(formData.fechaFin).toISOString()
        }

        await onSave(updateData)
      } else {
        // Modo creación
        const createData: CreateTreatmentRequest = {
          paciente: formData.paciente,
          odontologo: formData.odontologo,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          costo: formData.costo,
          numeroSesiones: formData.numeroSesiones,
          sesionesCompletadas: formData.sesionesCompletadas,
          estado: formData.estado,
        }

        if (formData.fechaFin) {
          createData.fechaFin = new Date(formData.fechaFin).toISOString()
        }

        await onSave(createData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el tratamiento")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
          {treatment ? "Editar Tratamiento" : "Nuevo Tratamiento"}
        </h1>
      </div>

      <div className="bg-[hsl(var(--card))] shadow-md rounded-lg p-6 transition-colors duration-200">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paciente" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Paciente
              </label>
              {treatment ? (
                <div className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-md">
                  {treatment.paciente.nombre} {treatment.paciente.apellido}
                  <span className="text-xs block">{treatment.paciente.correo}</span>
                </div>
              ) : (
                <select
                  id="paciente"
                  name="paciente"
                  required
                  value={formData.paciente}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 max-h-40 overflow-y-auto transition-colors duration-200"
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.nombre} {patient.apellido} - {patient.correo}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="odontologo" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Odontólogo
              </label>
              {treatment ? (
                <div className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-md">
                  Dr. {treatment.odontologo.nombre} {treatment.odontologo.apellido}
                  <span className="text-xs block">{treatment.odontologo.especialidad}</span>
                </div>
              ) : (
                <select
                  id="odontologo"
                  name="odontologo"
                  required
                  value={formData.odontologo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 max-h-40 overflow-y-auto transition-colors duration-200"
                >
                  <option value="">Seleccionar odontólogo</option>
                  {dentists.map((dentist) => (
                    <option key={dentist._id} value={dentist._id}>
                      Dr. {dentist.nombre} {dentist.apellido} - {dentist.especialidad}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Tipo de Tratamiento
              </label>
              <select
                id="tipo"
                name="tipo"
                required
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              >
                <option value="">Seleccionar tipo</option>
                {treatmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                required
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              >
                {treatmentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="costo" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Costo ($)
              </label>
              <input
                type="number"
                id="costo"
                name="costo"
                required
                min="0"
                step="0.01"
                value={formData.costo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              />
            </div>

            <div>
              <label htmlFor="numeroSesiones" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Número de Sesiones
              </label>
              <input
                type="number"
                id="numeroSesiones"
                name="numeroSesiones"
                required
                min="1"
                value={formData.numeroSesiones}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="sesionesCompletadas"
                className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1"
              >
                Sesiones Completadas
              </label>
              <input
                type="number"
                id="sesionesCompletadas"
                name="sesionesCompletadas"
                required
                min="0"
                max={formData.numeroSesiones}
                value={formData.sesionesCompletadas}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              />
            </div>

            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                required
                value={formData.fechaInicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              />
            </div>

            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Fecha de Finalización (Opcional)
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="descripcion" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                required
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
                placeholder="Describe el tratamiento..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--secondary))]/80 disabled:opacity-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50 transition-colors duration-200"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TreatmentForm
