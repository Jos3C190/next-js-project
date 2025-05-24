"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface TreatmentFormProps {
  treatment?: any
  onSave: (treatmentData: any) => void
  onCancel: () => void
}

// Sample patient list for dropdown
const patients = [
  { id: 1, name: "María García" },
  { id: 2, name: "Juan Pérez" },
  { id: 3, name: "Ana Rodríguez" },
  { id: 4, name: "Carlos Martínez" },
  { id: 5, name: "Laura Sánchez" },
]

// Sample treatment types
const treatmentTypes = [
  "Ortodoncia",
  "Blanqueamiento",
  "Extracción",
  "Limpieza Dental",
  "Relleno",
  "Endodoncia",
  "Prótesis",
  "Otro",
]

// Sample treatment statuses
const treatmentStatuses = ["Programado", "En progreso", "Completado", "Cancelado"]

const TreatmentForm = ({ treatment, onSave, onCancel }: TreatmentFormProps) => {
  const [formData, setFormData] = useState({
    patientId: 0,
    patientName: "",
    treatmentType: "",
    startDate: "",
    endDate: "",
    status: "Programado",
    cost: 0,
    sessions: 1,
    completedSessions: 0,
    notes: "",
  })

  useEffect(() => {
    if (treatment) {
      const startDate = new Date(treatment.startDate)
      const endDate = new Date(treatment.endDate)

      setFormData({
        patientId: treatment.patientId || 0,
        patientName: treatment.patientName || "",
        treatmentType: treatment.treatmentType || "",
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        status: treatment.status || "Programado",
        cost: treatment.cost || 0,
        sessions: treatment.sessions || 1,
        completedSessions: treatment.completedSessions || 0,
        notes: treatment.notes || "",
      })
    }
  }, [treatment])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Handle numeric inputs
    if (name === "cost" || name === "sessions" || name === "completedSessions") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // If patient is selected from dropdown, update patientName
    if (name === "patientId") {
      const selectedPatient = patients.find((p) => p.id === Number.parseInt(value))
      if (selectedPatient) {
        setFormData((prev) => ({
          ...prev,
          patientId: Number.parseInt(value),
          patientName: selectedPatient.name,
        }))
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create date objects from the date strings
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    const treatmentData = {
      patientId: formData.patientId,
      patientName: formData.patientName,
      treatmentType: formData.treatmentType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: formData.status,
      cost: formData.cost,
      sessions: formData.sessions,
      completedSessions: formData.completedSessions,
      notes: formData.notes,
    }

    onSave(treatmentData)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {treatment ? "Editar Tratamiento" : "Nuevo Tratamiento"}
        </h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                Paciente
              </label>
              <select
                id="patientId"
                name="patientId"
                required
                value={formData.patientId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">Seleccionar paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="treatmentType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Tratamiento
              </label>
              <select
                id="treatmentType"
                name="treatmentType"
                required
                value={formData.treatmentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
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
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Finalización
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                {treatmentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Costo ($)
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                required
                min="0"
                step="1"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label htmlFor="sessions" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Sesiones
              </label>
              <input
                type="number"
                id="sessions"
                name="sessions"
                required
                min="1"
                value={formData.sessions}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label htmlFor="completedSessions" className="block text-sm font-medium text-gray-700 mb-1">
                Sesiones Completadas
              </label>
              <input
                type="number"
                id="completedSessions"
                name="completedSessions"
                required
                min="0"
                max={formData.sessions}
                value={formData.completedSessions}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TreatmentForm
