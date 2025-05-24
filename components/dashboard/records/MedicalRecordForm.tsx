"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { createMedicalRecordsApi, type Patient, type MedicalRecord } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface MedicalRecordFormProps {
  record?: MedicalRecord | null
  onSave: (recordData: any) => Promise<void>
  onCancel: () => void
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ record, onSave, onCancel }) => {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    paciente: "",
    observaciones: "",
  })
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)

  // Cargar pacientes al montar el componente
  useEffect(() => {
    const loadPatients = async () => {
      if (!token) return

      try {
        setIsLoadingPatients(true)
        const medicalRecordsApi = createMedicalRecordsApi(token)
        const response = await medicalRecordsApi.getAllPatients()
        setPatients(response.data)
      } catch (error) {
        console.error("Error loading patients:", error)
        setError("Error al cargar la lista de pacientes")
      } finally {
        setIsLoadingPatients(false)
      }
    }

    loadPatients()
  }, [token])

  // Cargar datos del expediente si estamos editando
  useEffect(() => {
    if (record) {
      setFormData({
        paciente: record.paciente._id,
        observaciones: record.observaciones,
      })
    } else {
      setFormData({
        paciente: "",
        observaciones: "",
      })
    }
  }, [record])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error cuando el usuario hace cambios
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await onSave(formData)
    } catch (error: any) {
      console.error("Error saving medical record:", error)
      setError(error.message || "Error al guardar el expediente")
    } finally {
      setIsLoading(false)
    }
  }

  const isEditing = !!record

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
          {isEditing ? "Editar Expediente" : "Nuevo Expediente"}
        </h1>
      </div>

      <div className="bg-[hsl(var(--card))] shadow-md rounded-lg p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="paciente" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
              Paciente
            </label>
            {isEditing ? (
              <div className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-md">
                {record?.paciente.nombre} {record?.paciente.apellido}
                <span className="text-xs ml-2 text-[hsl(var(--muted-foreground))]">(No se puede modificar)</span>
              </div>
            ) : (
              <select
                id="paciente"
                name="paciente"
                required
                value={formData.paciente}
                onChange={handleChange}
                disabled={isLoadingPatients}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 max-h-40 overflow-y-auto"
              >
                <option value="">{isLoadingPatients ? "Cargando pacientes..." : "Seleccionar paciente"}</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.nombre} {patient.apellido} - {patient.correo}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              required
              rows={6}
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Ingrese las observaciones del expediente médico..."
              className="w-full px-3 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 resize-vertical"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--card-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingPatients}
              className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MedicalRecordForm
