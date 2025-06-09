"use client"

import {
  Edit,
  Trash2,
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  ArrowUpRight,
  Search,
  AlertTriangle,
  Calendar,
  FileText,
} from "lucide-react"
import { useState, useMemo } from "react"
import type { Payment } from "@/lib/api"
import { useTheme } from "@/context/ThemeContext"
import PaymentDetailsModal from "./PaymentDetailsModal"
import ConfirmModal from "@/components/common/ConfirmModal"

interface PaymentsListProps {
  payments: Payment[]
  onEdit: (payment: Payment) => void
  onDelete: (id: string) => void
  loading: boolean
}

type FilterState = {
  status: string[]
  method: string[]
  search: string
  dateRange: {
    from: string | null
    to: string | null
  }
}

const PaymentsList = ({ payments, onEdit, onDelete, loading }: PaymentsListProps) => {
  const { theme } = useTheme()
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    method: [],
    search: "",
    dateRange: {
      from: null,
      to: null,
    },
  })
  const [showFilters, setShowFilters] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const showPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment)
  }

  const closePaymentDetails = () => {
    setSelectedPayment(null)
  }

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case "pagado":
        return {
          color:
            "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-800",
          icon: CheckCircle,
          text: "Pagado",
          pulse: false,
        }
      case "pendiente":
        return {
          color:
            "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800",
          icon: Clock,
          text: "Pendiente",
          pulse: true,
        }
      case "cancelado":
        return {
          color: "text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700",
          icon: XCircle,
          text: "Cancelado",
          pulse: false,
        }
      default:
        return {
          color: "text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700",
          icon: Clock,
          text: estado,
          pulse: false,
        }
    }
  }

  const getMethodConfig = (metodo: string) => {
    switch (metodo) {
      case "efectivo":
        return {
          text: "Efectivo",
          icon: Banknote,
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-900/20",
        }
      case "tarjeta":
        return {
          text: "Tarjeta",
          icon: CreditCard,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-900/20",
        }
      case "transferencia":
        return {
          text: "Transferencia",
          icon: ArrowUpRight,
          color: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-50 dark:bg-purple-900/20",
        }
      default:
        return {
          text: metodo,
          icon: DollarSign,
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-50 dark:bg-gray-900/20",
        }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "short",
    })
  }

  const isOverdue = (payment: Payment) => {
    if (payment.estado === "pagado" || payment.estado === "cancelado") return false
    return new Date(payment.fechaVencimiento) < new Date()
  }

  const getDaysUntilDue = (payment: Payment) => {
    if (payment.estado === "pagado" || payment.estado === "cancelado") return null
    const today = new Date()
    const dueDate = new Date(payment.fechaVencimiento)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const toggleFilter = (type: keyof FilterState, value: string) => {
    if (type === "status" || type === "method") {
      setFilters((prev) => {
        const currentValues = prev[type]
        return {
          ...prev,
          [type]: currentValues.includes(value) ? currentValues.filter((v) => v !== value) : [...currentValues, value],
        }
      })
    }
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      method: [],
      search: "",
      dateRange: {
        from: null,
        to: null,
      },
    })
  }

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return

    // Cerrar el modal inmediatamente para evitar el efecto visual feo
    const paymentId = paymentToDelete._id
    setPaymentToDelete(null)
    setIsDeleting(true)

    try {
      // Llamamos a la función onDelete que viene del componente padre
      await onDelete(paymentId)
    } catch (error) {
      console.error("Error al eliminar pago:", error)
      // Si hay error, podrías mostrar una notificación aquí
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setPaymentToDelete(null)
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Filter by status
      if (filters.status.length > 0 && !filters.status.includes(payment.estado)) {
        return false
      }

      // Filter by method
      if (filters.method.length > 0 && !filters.method.includes(payment.metodoPago)) {
        return false
      }

      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const patientName = `${payment.paciente.nombre} ${payment.paciente.apellido}`.toLowerCase()
        const invoiceNumber = payment.numeroFactura?.toLowerCase() || ""
        const notes = payment.notas?.toLowerCase() || ""
        const treatmentType = payment.tratamiento?.tipo?.toLowerCase() || "sin tratamiento"

        if (
          !patientName.includes(searchTerm) &&
          !invoiceNumber.includes(searchTerm) &&
          !notes.includes(searchTerm) &&
          !treatmentType.includes(searchTerm)
        ) {
          return false
        }
      }

      // Filter by date range
      if (filters.dateRange.from) {
        const fromDate = new Date(filters.dateRange.from)
        const paymentDate = new Date(payment.fechaVencimiento)
        if (paymentDate < fromDate) {
          return false
        }
      }

      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to)
        const paymentDate = new Date(payment.fechaVencimiento)
        if (paymentDate > toDate) {
          return false
        }
      }

      return true
    })
  }, [payments, filters])

  const statusOptions = ["pagado", "pendiente", "cancelado"]
  const methodOptions = ["efectivo", "tarjeta", "transferencia"]

  if (loading) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))] flex justify-between">
          <div className="h-8 bg-[hsl(var(--muted))] rounded w-40 animate-pulse"></div>
          <div className="h-8 bg-[hsl(var(--muted))] rounded w-32 animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[hsl(var(--muted))]">
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className="h-4 bg-[hsl(var(--muted))] rounded w-20 animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[hsl(var(--border))]">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-[hsl(var(--muted))] rounded w-full animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center mb-4">
          <DollarSign className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
        </div>
        <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">No hay pagos registrados</h3>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">Comienza creando tu primer registro de pago.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabla de pagos */}
      <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredPayments.map((payment) => {
                const statusConfig = getStatusConfig(payment.estado)
                const methodConfig = getMethodConfig(payment.metodoPago)
                const StatusIcon = statusConfig.icon
                const MethodIcon = methodConfig.icon
                const overdue = isOverdue(payment)
                const daysUntilDue = getDaysUntilDue(payment)
                const isHovered = hoveredRow === payment._id

                return (
                  <tr
                    key={payment._id}
                    className={`group transition-colors ${
                      overdue
                        ? "bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                    onMouseEnter={() => setHoveredRow(payment._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Paciente */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-medium text-xs">
                          {payment.paciente.nombre.charAt(0)}
                          {payment.paciente.apellido.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                            {payment.paciente.nombre} {payment.paciente.apellido}
                          </div>
                          <div className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[150px]">
                            {payment.paciente.correo}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Descripción */}
                    <td className="px-6 py-3">
                      <div className="text-sm text-[hsl(var(--foreground))] line-clamp-1">
                        {payment.notas || "Sin descripción"}
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.numeroFactura && (
                          <div className="flex items-center text-xs text-[hsl(var(--muted-foreground))]">
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="font-mono">{payment.numeroFactura}</span>
                          </div>
                        )}
                        {payment.tratamiento ? (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            Tratamiento: {payment.tratamiento.tipo}
                          </div>
                        ) : (
                          <div className="text-xs text-[hsl(var(--muted-foreground))] italic">
                            Sin tratamiento asociado
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {formatCurrency(payment.total)}
                      </div>
                      {payment.items && (
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {payment.items.length} {payment.items.length === 1 ? "ítem" : "ítems"}
                        </div>
                      )}
                    </td>

                    {/* Método */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${methodConfig.bg} ${methodConfig.color}`}
                      >
                        <MethodIcon className="h-3 w-3" />
                        <span>{methodConfig.text}</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${
                          statusConfig.color
                        } ${statusConfig.pulse ? "animate-pulse" : ""}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        <span>{statusConfig.text}</span>
                      </div>
                      {overdue && (
                        <div className="flex items-center text-xs text-red-600 dark:text-red-400 mt-1">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>Vencido</span>
                        </div>
                      )}
                    </td>

                    {/* Fechas */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center text-xs text-[hsl(var(--muted-foreground))]">
                        <Calendar className="h-3 w-3 mr-1 text-[hsl(var(--muted-foreground))]" />
                        <span>Vence: {formatDateShort(payment.fechaVencimiento)}</span>
                      </div>
                      {payment.fechaPago && (
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Pagado: {formatDateShort(payment.fechaPago)}</span>
                        </div>
                      )}
                      {daysUntilDue !== null && payment.estado === "pendiente" && !overdue && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {daysUntilDue === 0 ? "Vence hoy" : `${daysUntilDue} días restantes`}
                        </div>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            showPaymentDetails(payment)
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(payment)
                          }}
                          className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Editar pago"
                        >
                          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPaymentToDelete(payment)
                          }}
                          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Eliminar pago"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados de búsqueda */}
        {filteredPayments.length === 0 && (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
            </div>
            <h3 className="text-base font-medium text-[hsl(var(--foreground))] mb-1">No se encontraron resultados</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Intenta con otros términos de búsqueda o ajusta los filtros.
            </p>
          </div>
        )}
      </div>

      {/* Vista móvil */}
      <div className="md:hidden space-y-3">
        {filteredPayments.map((payment) => {
          const statusConfig = getStatusConfig(payment.estado)
          const methodConfig = getMethodConfig(payment.metodoPago)
          const StatusIcon = statusConfig.icon
          const MethodIcon = methodConfig.icon
          const overdue = isOverdue(payment)

          return (
            <div
              key={payment._id}
              className={`bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] overflow-hidden ${
                overdue ? "border-l-4 border-l-red-500 dark:border-l-red-500" : ""
              }`}
              onClick={() => showPaymentDetails(payment)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-medium text-xs">
                      {payment.paciente.nombre.charAt(0)}
                      {payment.paciente.apellido.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {payment.paciente.nombre} {payment.paciente.apellido}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[150px]">
                        {payment.paciente.correo}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${
                      statusConfig.color
                    } ${statusConfig.pulse ? "animate-pulse" : ""}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    <span>{statusConfig.text}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">Total:</span>
                    <span className="ml-1 font-medium text-[hsl(var(--foreground))]">
                      {formatCurrency(payment.total)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">Método:</span>
                    <div
                      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-xs rounded-full ${methodConfig.bg} ${methodConfig.color} mt-1`}
                    >
                      <MethodIcon className="h-2.5 w-2.5" />
                      <span>{methodConfig.text}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">Vencimiento:</span>
                    <span className="ml-1 text-[hsl(var(--foreground))]">
                      {formatDateShort(payment.fechaVencimiento)}
                    </span>
                  </div>
                  {payment.fechaPago && (
                    <div>
                      <span className="text-[hsl(var(--muted-foreground))]">Pagado:</span>
                      <span className="ml-1 text-green-600 dark:text-green-400">
                        {formatDateShort(payment.fechaPago)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Información del tratamiento */}
                <div className="mb-3">
                  {payment.tratamiento ? (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      <span className="font-medium">Tratamiento:</span> {payment.tratamiento.tipo}
                    </div>
                  ) : (
                    <div className="text-xs text-[hsl(var(--muted-foreground))] italic">Sin tratamiento asociado</div>
                  )}
                </div>

                {overdue && (
                  <div className="flex items-center text-xs text-red-600 dark:text-red-400 mb-3">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Pago vencido</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    className="text-xs text-blue-600 dark:text-blue-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      showPaymentDetails(payment)
                    }}
                  >
                    Ver detalles
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(payment)
                      }}
                      className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPaymentToDelete(payment)
                      }}
                      className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={!!paymentToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Pago"
        message={
          paymentToDelete
            ? `¿Estás seguro de que deseas eliminar el pago de ${paymentToDelete.paciente.nombre} ${paymentToDelete.paciente.apellido} por ${formatCurrency(paymentToDelete.total)}? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />

      {selectedPayment && <PaymentDetailsModal payment={selectedPayment} onClose={closePaymentDetails} />}
    </div>
  )
}

export default PaymentsList
