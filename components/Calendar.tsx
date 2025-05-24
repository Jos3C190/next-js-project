"use client"

import type React from "react"

import { useState, useEffect } from "react"
import FormModal from "./FormModal"

interface CalendarProps {
  onDateSelect?: (date: Date | null) => void
}

const Calendar = ({ onDateSelect }: CalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [today, setToday] = useState<string>("")
  const [minTime, setMinTime] = useState<string>("")
  const [dateSelected, setDateSelected] = useState<string>("")

  // Set today's date when component mounts
  useEffect(() => {
    const currentDate = new Date()
    // Format date as YYYY-MM-DD for the input min attribute
    const formattedDate = currentDate.toISOString().split("T")[0]
    setToday(formattedDate)

    // Set current time (rounded to nearest 15 minutes) for min time if today is selected
    const hours = currentDate.getHours()
    const minutes = Math.ceil(currentDate.getMinutes() / 15) * 15
    const formattedTime = `${hours.toString().padStart(2, "0")}:${(minutes >= 60 ? 0 : minutes).toString().padStart(2, "0")}`
    setMinTime(formattedTime)
  }, [])

  // Función para manejar la selección de fecha usando inputs nativos
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    setDateSelected(dateValue)

    if (dateValue) {
      // Crear nueva fecha y establecer hora por defecto
      const newDate = new Date(dateValue + "T00:00:00")
      setSelectedDate(newDate)
      if (onDateSelect) {
        onDateSelect(newDate)
      }
    } else {
      setSelectedDate(null)
      if (onDateSelect) {
        onDateSelect(null)
      }
    }
  }

  // Función para manejar la selección de hora
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDate || !dateSelected) return

    const timeValue = e.target.value
    if (!timeValue) return

    const [hours, minutes] = timeValue.split(":").map(Number)

    // Crear nueva fecha con la fecha seleccionada y la nueva hora
    const newDate = new Date(dateSelected + "T00:00:00")
    newDate.setHours(hours, minutes, 0, 0)

    setSelectedDate(newDate)
    if (onDateSelect) {
      onDateSelect(newDate)
    }
  }

  // Check if selected date is today
  const isToday = dateSelected === today

  // Función segura para formatear la fecha
  const formatSelectedDate = () => {
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      return "No hay fecha seleccionada"
    }

    try {
      return selectedDate.toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Fecha inválida"
    }
  }

  return (
    <section id="AgendarCita" className="py-10 justify-items-center bg-gray-200">
      <h2 className="font-bold text-3xl text-gray-800 mb-8 text-center">HAZ TU CITA</h2>
      <div className="w-full max-w-md mx-auto text-center mb-5 p-6 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="date-select" className="block text-gray-700 font-bold mb-2">
            Selecciona una fecha
          </label>
          <input
            id="date-select"
            type="date"
            value={dateSelected}
            onChange={handleDateChange}
            min={today} // Set minimum date to today
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-sm text-gray-500 mt-1">Solo puedes seleccionar fechas a partir de hoy</p>
        </div>

        {selectedDate && dateSelected && (
          <div className="mb-4">
            <label htmlFor="time-select" className="block text-gray-700 font-bold mb-2">
              Selecciona una hora
            </label>
            <input
              id="time-select"
              type="time"
              onChange={handleTimeChange}
              min={isToday ? minTime : undefined} // Only apply min time if today is selected
              className="w-full p-2 border border-gray-300 rounded"
            />
            {isToday && (
              <p className="text-sm text-gray-500 mt-1">
                Para hoy, solo puedes seleccionar horas a partir de las {minTime}
              </p>
            )}
          </div>
        )}
      </div>

      {selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime()) && (
        <p className="text-center text-lg font-bold pb-4 pt-2">Fecha y Hora: {formatSelectedDate()}</p>
      )}

      <button
        className={`p-3 font-bold rounded-sm transition duration-500 mx-auto block ${
          selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())
            ? "bg-gray-800 text-red-400 hover:bg-red-400 hover:text-gray-700 cursor-pointer"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
        onClick={() => {
          if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
            setIsModalOpen(true)
          }
        }}
        disabled={!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())}
      >
        CONTINUAR
      </button>

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedDate={selectedDate} />
    </section>
  )
}

export default Calendar
