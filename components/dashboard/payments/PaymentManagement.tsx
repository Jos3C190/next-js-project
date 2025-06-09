"use client"

import { useState, useEffect } from "react"
import { Plus, Search, DollarSign, Clock, AlertTriangle, TrendingUp, FileText } from "lucide-react"
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi"
import { type Payment, type PaymentStats, createPaymentsApi } from "@/lib/api"
import PaymentForm from "./PaymentForm"
import PaymentsList from "./PaymentsList"
import Pagination from "../common/Pagination"
import { useTheme } from "@/context/ThemeContext"

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const PaymentManagement = () => {
  const { theme } = useTheme()
  const { apiCall } = useAuthenticatedApi()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const itemsPerPage = 10

  const loadPayments = async (page = 1) => {
    try {
      setLoading(true)
      const response = await apiCall(async (token) => {
        const api = createPaymentsApi(token)
        return api.getPayments(page, itemsPerPage)
      })

      if (response?.docs) {
        setPayments(response.docs)
        setTotalPages(response.totalPages || 1)
        setTotalItems(response.totalDocs || 0)
      }
    } catch (error) {
      console.error("Error loading payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiCall(async (token) => {
        const api = createPaymentsApi(token)
        return api.getPaymentStats()
      })

      if (response) {
        setStats(response)
      }
    } catch (error) {
      console.error("Error loading payment stats:", error)
    }
  }

  useEffect(() => {
    loadPayments(currentPage)
    loadStats()
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCreatePayment = () => {
    setEditingPayment(null)
    setShowForm(true)
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment)
    setShowForm(true)
  }

  // Modificamos esta función para eliminar la confirmación del navegador
  const handleDeletePayment = async (id: string) => {
    try {
      // Actualizar el estado local inmediatamente para una mejor UX
      setPayments((prevPayments) => prevPayments.filter((payment) => payment._id !== id))

      // Eliminar del servidor
      await apiCall(async (token) => {
        const api = createPaymentsApi(token)
        return api.deletePayment(id)
      })

      // Actualizar estadísticas en segundo plano
      await loadStats()

      // Opcional: recargar la página actual para mantener la paginación correcta
      // Solo si es necesario para mantener la consistencia
      if (payments.length === 1 && currentPage > 1) {
        // Si era el último elemento de la página y no es la primera página
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      console.error("Error deleting payment:", error)
      // Si hay error, recargar los datos para restaurar el estado correcto
      await loadPayments(currentPage)
      alert("Error al eliminar el pago")
    }
  }

  const handleFormSubmit = async () => {
    setShowForm(false)
    setEditingPayment(null)
    await loadPayments(currentPage)
    await loadStats()
  }

  const filteredPayments = payments.filter((payment) => {
    const normalizedSearchTerm = normalizeText(searchTerm)

    const matchesSearch =
      normalizedSearchTerm === "" ||
      normalizeText(payment.paciente.nombre).includes(normalizedSearchTerm) ||
      normalizeText(payment.paciente.apellido).includes(normalizedSearchTerm) ||
      normalizeText(payment.notas || "").includes(normalizedSearchTerm) ||
      normalizeText(payment.numeroFactura || "").includes(normalizedSearchTerm) ||
      payment.items?.some((item) => normalizeText(item.descripcion).includes(normalizedSearchTerm))

    const matchesStatus = statusFilter === "all" || payment.estado === statusFilter
    const matchesMethod = methodFilter === "all" || payment.metodoPago === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading && !payments.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400 dark:border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Ingresos Totales</p>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  {formatCurrency(stats.totalIngresos)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{formatCurrency(stats.ingresosMes)}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.pagosPendientes}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Pagos Vencidos</p>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.pagosVencidos}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Gestión de Pagos y Facturas</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Administra los pagos y facturas de la clínica</p>
        </div>
        <button
          onClick={handleCreatePayment}
          className="flex items-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Pago/Factura
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-[hsl(var(--card))] p-4 rounded-lg shadow-sm border border-[hsl(var(--border))]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar pagos o facturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
          >
            <option value="all">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <FileText className="h-4 w-4" />
            <span>
              {filteredPayments.length} de {totalItems} registros
            </span>
          </div>
        </div>
      </div>

      {/* Lista de pagos */}
      <PaymentsList
        payments={filteredPayments}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
        loading={loading}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      {/* Modal del formulario */}
      {showForm && (
        <PaymentForm
          payment={editingPayment}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingPayment(null)
          }}
        />
      )}
    </div>
  )
}

export default PaymentManagement
