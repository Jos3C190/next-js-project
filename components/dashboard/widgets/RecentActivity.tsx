"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import type { Activity } from "@/lib/api"

interface RecentActivityProps {
  activities: Activity[]
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  const [showModal, setShowModal] = useState(false)

  const getActivityIcon = (type: string, action: string) => {
    // Generar iniciales basadas en el tipo y acción
    const typeInitial = type.charAt(0).toUpperCase()
    const actionInitial = action.charAt(0).toUpperCase()
    return `${typeInitial}${actionInitial}`
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "tratamiento":
        return "bg-red-400"
      case "cita":
        return "bg-amber-400"
      case "paciente":
        return "bg-blue-400"
      default:
        return "bg-gray-500"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "hace un momento"
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`

    const diffInDays = Math.floor(diffInHours / 24)
    return `hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`
  }

  const formatFullDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const ActivityItem = ({
    activity,
    index,
    showFullDate = false,
  }: { activity: Activity; index: number; showFullDate?: boolean }) => (
    <motion.li
      key={activity._id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="relative pb-8">
        {index !== activities.length - 1 ? (
          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-[hsl(var(--border))]" aria-hidden="true" />
        ) : null}
        <div className="relative flex items-start space-x-3">
          <div className="relative">
            <div
              className={`${getActivityColor(activity.type)} h-10 w-10 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold`}
            >
              {getActivityIcon(activity.type, activity.action)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div>
              <div className="text-sm">
                <span className="text-[hsl(var(--foreground))]">{activity.description}</span>
              </div>
              <div className="mt-0.5 flex items-center text-xs text-[hsl(var(--muted-foreground))]">
                <span>{activity.userRole}</span>
                <span className="mx-1">•</span>
                <span>{showFullDate ? formatFullDate(activity.timestamp) : formatTimeAgo(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  )

  return (
    <>
      <motion.div
        whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        transition={{ duration: 0.2 }}
        className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 transition-colors duration-200 h-[500px] flex flex-col"
      >
        <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4">Actividad Reciente</h3>

        {activities.length > 0 ? (
          <div className="flow-root flex-1 overflow-y-auto">
            <ul className="-mb-8">
              {activities.slice(0, 5).map((activity, activityIdx) => (
                <ActivityItem key={activity._id} activity={activity} index={activityIdx} />
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[hsl(var(--muted-foreground))] text-center py-4">No hay actividad reciente</p>
        )}

        <div className="mt-4 text-center flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-medium text-red-400 hover:text-red-500 transition-colors duration-200"
          >
            Ver toda la actividad
          </button>
        </div>
      </motion.div>

      {/* Modal para mostrar todas las actividades */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-[hsl(var(--card))] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Header del modal */}
              <div className="bg-[hsl(var(--card))] px-6 py-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">
                    Toda la Actividad ({activities.length} actividades)
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="bg-[hsl(var(--card))] px-6 py-4 max-h-96 overflow-y-auto">
                {activities.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {activities.map((activity, activityIdx) => (
                        <ActivityItem key={activity._id} activity={activity} index={activityIdx} showFullDate={true} />
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-[hsl(var(--muted-foreground))] text-center py-8">No hay actividades registradas</p>
                )}
              </div>

              {/* Footer del modal */}
              <div className="bg-[hsl(var(--card))] px-6 py-4 border-t border-[hsl(var(--border))]">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RecentActivity
