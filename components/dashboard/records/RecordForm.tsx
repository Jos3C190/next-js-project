"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface RecordFormProps {
  record?: any
  onSave: (recordData: any) => void
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

// Sample record types
const recordTypes = ["Historia Clínica", "Tratamiento", "Radiografía", "Revisión", "Consulta", "Otro"]

const RecordForm = ({ record, onSave, onCancel }: RecordFormProps) => {
  const [formData, setFormData] = useState({
    patientId: 0,
    patientName: "",
    recordType: "",
    date: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  })

  useEffect(() => {
    if (record) {
      const recordDate = new Date(record.date)
      const dateString = recordDate.toISOString().split("T")[0]

      setFormData({
        patientId: record.patientId || 0,
        patientName: record.patientName || "",
        recordType: record.recordType || "",
        date: dateString,
        diagnosis: record.diagnosis || "",
        treatment: record.treatment || "",
        notes: record.notes || "",
      })
    }
  }, [record])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

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

    // Create a date object from the date string
    const recordDate = new Date(formData.date)

    const recordData = {
      patientId: formData.patientId,
      patientName: formData.patientName,
      recordType: formData.recordType,
      date: recordDate.toISOString(),
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      notes: formData.notes,
    }

    onSave(recordData)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{record ? "Editar Expediente" : "Nuevo Expediente"}</h1>
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
              <label htmlFor="recordType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Registro
              </label>
              <select
                id="recordType"
                name="recordType"
                required
                value={formData.recordType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">Seleccionar tipo</option>
                {recordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                Diagnóstico
              </label>
              <input
                type="text"
                id="diagnosis"
                name="diagnosis"
                required
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
                Tratamiento
              </label>
              <textarea
                id="treatment"
                name="treatment"
                rows={2}
                required
                value={formData.treatment}
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

export default RecordForm
