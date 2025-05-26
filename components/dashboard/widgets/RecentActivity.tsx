"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { Activity } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface RecentActivityProps {
  activities?: Activity[] // Hacer opcional ya que lo cargaremos internamente
}

interface PaginatedActivities {
  data: Activity[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const RecentActivity = ({ activities: propActivities = [] }: RecentActivityProps) => {
  const [showModal, setShowModal] = useState(false)
  const [modalActivities, setModalActivities] = useState<Activity[]>([])
  const [cardActivities, setCardActivities] = useState<Activity[]>(propActivities) // Estado para actividades de la card
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalActivities, setTotalActivities] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cardLoading, setCardLoading] = useState(false) // Loading para la card

  const { token, isAuthenticated } = useAuth()

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

  // Función para cargar las actividades recientes para la card
  const loadCardActivities = async () => {
    setCardLoading(true)
    try {
      if (!token || !isAuthenticated) {
        console.error("No token or not authenticated")
        setCardLoading(false)
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const url = `${apiUrl}/api/dashboard/activity?limit=5`

      console.log("Fetching card activities from:", url)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Card activities response status:", response.status)

      if (response.ok) {
        const data: PaginatedActivities = await response.json()
        console.log("Card activities data received:", data)
        setCardActivities(data.data || [])
      } else {
        const errorText = await response.text()
        console.error("Error loading card activities:", response.status, response.statusText, errorText)
        setCardActivities([])
      }
    } catch (error) {
      console.error("Error loading card activities:", error)
      setCardActivities([])
    } finally {
      setCardLoading(false)
    }
  }

  // Función para cargar actividades paginadas para el modal
  const loadPaginatedActivities = async (page: number) => {
    setLoading(true)
    try {
      if (!token || !isAuthenticated) {
        console.error("No token or not authenticated")
        setLoading(false)
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const url = `${apiUrl}/api/dashboard/activity?page=${page}&limit=10`

      console.log("Fetching activities from:", url)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const data: PaginatedActivities = await response.json()
        console.log("Activities data received:", data)

        setModalActivities(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalActivities(data.pagination?.total || 0)
        setCurrentPage(data.pagination?.page || 1)
      } else {
        const errorText = await response.text()
        console.error("Error loading activities:", response.status, response.statusText, errorText)
        setModalActivities([])
        setTotalPages(1)
        setTotalActivities(0)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Error loading paginated activities:", error)
      setModalActivities([])
      setTotalPages(1)
      setTotalActivities(0)
      setCurrentPage(1)
    } finally {
      setLoading(false)
    }
  }

  // Cargar actividades de la card cuando el componente se monta
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCardActivities()
    }
  }, [isAuthenticated, token])

  // Cargar primera página cuando se abre el modal
  useEffect(() => {
    if (showModal && isAuthenticated && token) {
      loadPaginatedActivities(1)
    }
  }, [showModal, isAuthenticated, token])

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadPaginatedActivities(newPage)
    }
  }

  const ActivityItem = ({
    activity,
    index,
    showFullDate = false,
  }: { activity: Activity; index: number; showFullDate?: boolean }) => {
    const ListItem = showFullDate ? motion.li : "li"
    const animationProps = showFullDate
      ? {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: index * 0.1 },
        }
      : {}

    return (
      <ListItem key={activity._id} {...animationProps}>
        <div className="relative pb-8">
          {index !== (showFullDate ? (modalActivities?.length || 0) - 1 : (cardActivities?.length || 0) - 1) ? (
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
      </ListItem>
    )
  }

  return (
    <>
      <motion.div
        whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        transition={{ duration: 0.2 }}
        className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 transition-colors duration-200 h-[500px] flex flex-col"
      >
        <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4">Actividad Reciente</h3>

        {cardLoading ? (
          <div className="flex justify-center items-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
          </div>
        ) : cardActivities && cardActivities.length > 0 ? (
          <div className="flow-root flex-1 overflow-y-auto">
            <ul className="-mb-8">
              {cardActivities.slice(0, 5).map((activity, activityIdx) => (
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

      {/* Modal para mostrar todas las actividades con paginación */}
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
                    Toda la Actividad ({totalActivities} actividades)
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
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                  </div>
                ) : modalActivities.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {modalActivities.map((activity, activityIdx) => (
                        <ActivityItem key={activity._id} activity={activity} index={activityIdx} showFullDate={true} />
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-[hsl(var(--muted-foreground))] text-center py-8">No hay actividades registradas</p>
                )}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="bg-[hsl(var(--card))] px-6 py-4 border-t border-[hsl(var(--border))]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      Página {currentPage} de {totalPages} ({totalActivities} actividades en total)
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="p-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Números de página */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber
                          if (totalPages <= 5) {
                            pageNumber = i + 1
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i
                          } else {
                            pageNumber = currentPage - 2 + i
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              disabled={loading}
                              className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                                currentPage === pageNumber
                                  ? "bg-red-400 text-white"
                                  : "border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {pageNumber}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="p-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
