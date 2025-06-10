"use client"

import { useState, useEffect } from "react"
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  FileText,
  Filter,
  Search,
  Download,
  Eye,
  Banknote,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { createPatientPaymentsApi, type Payment } from "@/lib/api"
import PaymentDetailsModal from "./PaymentDetailsModal"
import PaymentMethodModal from "./PaymentMethodModal"

interface PaymentStats {
  total: number
  paid: number
  pending: number
  overdue: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
}

const MyPayments = () => {
  const { user, token } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  })

  // Filtros
  const [filters, setFilters] = useState({
    status: "all", // all, pending, paid, overdue
    search: "",
    dateRange: "all", // all, thisMonth, lastMonth, thisYear
  })

  const [showFilters, setShowFilters] = useState(false)

  const [showPaymentModal, setShowPaymentModal] = useState<Payment | null>(null)

  // Cargar datos de la API
  useEffect(() => {
    loadPayments()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [payments, filters])

  const loadPayments = async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)

      const api = createPatientPaymentsApi(token)
      const response = await api.getMyPayments()

      setPayments(response.docs || [])
      calculateStats(response.docs || [])
    } catch (err: any) {
      setError(err.message || "Error al cargar los pagos. Por favor, intenta de nuevo.")
      console.error("Error loading payments:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (paymentsData: Payment[]) => {
    const now = new Date()

    const stats = paymentsData.reduce(
      (acc, payment) => {
        acc.total++
        acc.totalAmount += payment.total

        if (payment.estado === "pagado") {
          acc.paid++
          acc.paidAmount += payment.total
        } else if (payment.estado === "pendiente") {
          const dueDate = new Date(payment.fechaVencimiento)
          if (dueDate < now) {
            acc.overdue++
          } else {
            acc.pending++
          }
          acc.pendingAmount += payment.total
        }

        return acc
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      },
    )

    setStats(stats)
  }

  const applyFilters = () => {
    let filtered = [...payments]
    const now = new Date()

    // Filtro por estado
    if (filters.status !== "all") {
      if (filters.status === "overdue") {
        filtered = filtered.filter(
          (payment) => payment.estado === "pendiente" && new Date(payment.fechaVencimiento) < now,
        )
      } else {
        filtered = filtered.filter((payment) => payment.estado === filters.status)
      }
    }

    // Filtro por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (payment) =>
          payment.numeroFactura?.toLowerCase().includes(searchTerm) ||
          payment.notas?.toLowerCase().includes(searchTerm) ||
          payment.tratamiento?.tipo?.toLowerCase().includes(searchTerm),
      )
    }

    // Filtro por fecha
    if (filters.dateRange !== "all") {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.fechaEmision)

        switch (filters.dateRange) {
          case "thisMonth":
            return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
          case "lastMonth":
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
            return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear
          case "thisYear":
            return paymentDate.getFullYear() === currentYear
          default:
            return true
        }
      })
    }

    setFilteredPayments(filtered)
  }

  const getStatusConfig = (payment: Payment) => {
    const now = new Date()
    const dueDate = new Date(payment.fechaVencimiento)
    const isOverdue = payment.estado === "pendiente" && dueDate < now

    if (payment.estado === "pagado") {
      return {
        color:
          "text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-800",
        icon: CheckCircle,
        text: "Pagado",
        badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      }
    } else if (isOverdue) {
      return {
        color: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-800",
        icon: AlertTriangle,
        text: "Vencido",
        badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      }
    } else {
      return {
        color:
          "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800",
        icon: Clock,
        text: "Pendiente",
        badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      }
    }
  }

  const getMethodConfig = (method: string) => {
    switch (method) {
      case "efectivo":
        return { icon: Banknote, text: "Efectivo", color: "text-green-600 dark:text-green-400" }
      case "tarjeta":
        return { icon: CreditCard, text: "Tarjeta", color: "text-blue-600 dark:text-blue-400" }
      case "transferencia":
        return { icon: ArrowUpRight, text: "Transferencia", color: "text-purple-600 dark:text-purple-400" }
      default:
        return { icon: DollarSign, text: method, color: "text-gray-600 dark:text-gray-400" }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getDaysUntilDue = (payment: Payment) => {
    if (payment.estado === "pagado") return null
    const today = new Date()
    const dueDate = new Date(payment.fechaVencimiento)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleDownloadInvoice = async (payment: Payment) => {
    try {
      // Importación dinámica para evitar errores de SSR
      const jsPDF = (await import("jspdf")).default

      const doc = new jsPDF()

      // Configuración de colores
      const primaryColor = [220, 38, 38] // red-600
      const secondaryColor = [107, 114, 128] // gray-500
      const textColor = [17, 24, 39] // gray-900
      const lightGray = [248, 249, 250] // gray-50

      // Header de la clínica con gradiente
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(0, 0, 210, 45, "F")

      // Logo placeholder (puedes reemplazar con logo real)
      doc.setFillColor(255, 255, 255)
      doc.circle(25, 22, 8, "F")
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("DL", 22, 25)

      // Información de la clínica
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("CLÍNICA DENTAL DRA. LINARES", 40, 25)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Cuidando tu sonrisa con excelencia", 40, 32)
      doc.text("Tel: (+503) 7850-9957 | info@clinicadentallinares.com", 40, 38)

      // Información de la factura (lado derecho)
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("FACTURA", 150, 60)

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text(`Número: ${payment.numeroFactura || "N/A"}`, 150, 70)
      doc.text(`Fecha: ${formatDate(payment.fechaEmision)}`, 150, 77)
      doc.text(`Vencimiento: ${formatDate(payment.fechaVencimiento)}`, 150, 84)

      // Estado de la factura con color
      const statusConfig = getStatusConfig(payment)
      let statusColor = [107, 114, 128] // gray por defecto
      if (payment.estado === "pagado")
        statusColor = [34, 197, 94] // green
      else if (payment.estado === "pendiente")
        statusColor = [234, 179, 8] // yellow
      else if (payment.estado === "cancelado") statusColor = [239, 68, 68] // red

      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
      doc.roundedRect(150, 90, 45, 10, 2, 2, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      const statusText = statusConfig.text.toUpperCase()
      const textWidth = doc.getTextWidth(statusText)
      doc.text(statusText, 150 + (45 - textWidth) / 2, 97)

      // Información del paciente
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("FACTURAR A:", 20, 65)

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text(`${payment.paciente.nombre} ${payment.paciente.apellido}`, 20, 75)
      doc.text(`Email: ${payment.paciente.correo}`, 20, 82)
      if (payment.paciente.telefono) {
        doc.text(`Teléfono: ${payment.paciente.telefono}`, 20, 89)
      }
      if (payment.paciente.direccion) {
        doc.text(`Dirección: ${payment.paciente.direccion}`, 20, 96)
      }

      // Línea separadora
      doc.setDrawColor(200, 200, 200)
      doc.line(20, 110, 190, 110)

      // Tratamiento asociado (si existe)
      let yPosition = 120
      if (payment.tratamiento) {
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
        doc.roundedRect(20, yPosition, 170, 25, 3, 3, "F")

        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("TRATAMIENTO ASOCIADO", 25, yPosition + 8)

        doc.setTextColor(textColor[0], textColor[1], textColor[2])
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")

        // Dividir la descripción del tratamiento en múltiples líneas si es necesario
        const treatmentText = `${payment.tratamiento.tipo}: ${payment.tratamiento.descripcion}`
        const splitTreatment = doc.splitTextToSize(treatmentText, 165)
        doc.text(splitTreatment, 25, yPosition + 15)

        yPosition += 30
      }

      // Tabla de ítems
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("DETALLES DE FACTURACIÓN", 20, yPosition)
      yPosition += 10

      // Header de la tabla
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(20, yPosition, 170, 12, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Descripción", 25, yPosition + 8)
      doc.text("Cant.", 120, yPosition + 8)
      doc.text("Precio Unit.", 140, yPosition + 8)
      doc.text("Total", 170, yPosition + 8)

      yPosition += 12

      // Filas de la tabla
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)

      payment.items?.forEach((item, index) => {
        // Alternar color de fondo
        if (index % 2 === 0) {
          doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
          doc.rect(20, yPosition, 170, 10, "F")
        }

        doc.setTextColor(textColor[0], textColor[1], textColor[2])

        // Descripción con manejo mejorado de texto largo
        const maxDescriptionWidth = 90 // Ancho máximo para la descripción
        const splitDescription = doc.splitTextToSize(item.descripcion, maxDescriptionWidth)

        // Si la descripción es muy larga, usar solo la primera línea con "..."
        let descriptionToShow = splitDescription[0]
        if (splitDescription.length > 1) {
          // Truncar y agregar "..." si es necesario
          const ellipsis = "..."
          const ellipsisWidth = doc.getTextWidth(ellipsis)
          while (
            doc.getTextWidth(descriptionToShow) + ellipsisWidth > maxDescriptionWidth &&
            descriptionToShow.length > 0
          ) {
            descriptionToShow = descriptionToShow.slice(0, -1)
          }
          descriptionToShow += ellipsis
        }

        doc.text(descriptionToShow, 25, yPosition + 7)

        // Cantidad (centrado)
        doc.text(item.cantidad.toString(), 125, yPosition + 7, { align: "center" })

        // Precio unitario (alineado a la derecha)
        doc.text(formatCurrency(item.precioUnitario), 165, yPosition + 7, { align: "right" })

        // Total (alineado a la derecha)
        doc.text(formatCurrency(item.cantidad * item.precioUnitario), 185, yPosition + 7, { align: "right" })

        yPosition += 10
      })

      // Línea de cierre de la tabla
      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPosition, 190, yPosition)

      // Totales
      yPosition += 15

      // Caja de totales
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
      doc.roundedRect(120, yPosition, 70, 35, 3, 3, "F")

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.text("Subtotal:", 125, yPosition + 8)
      doc.text(formatCurrency(payment.subtotal || 0), 185, yPosition + 8, { align: "right" })

      doc.text("Impuestos (13%):", 125, yPosition + 16)
      doc.text(formatCurrency(payment.impuestos || 0), 185, yPosition + 16, { align: "right" })

      // Total destacado
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.line(125, yPosition + 20, 185, yPosition + 20)

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text("TOTAL:", 125, yPosition + 30)
      doc.text(formatCurrency(payment.total || 0), 185, yPosition + 30, { align: "right" })

      // Información de pago
      yPosition += 50
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const methodConfig = getMethodConfig(payment.metodoPago)
      doc.text(`Método de pago: ${methodConfig.text}`, 20, yPosition)

      if (payment.fechaPago) {
        yPosition += 7
        doc.setTextColor(34, 197, 94) // green
        doc.text(`✓ Pagado el: ${formatDate(payment.fechaPago)}`, 20, yPosition)
      }

      // Notas (verificar que no se superpongan con el footer)
      if (payment.notas) {
        const pageHeight = doc.internal.pageSize.height
        const footerStartY = pageHeight - 45 // Espacio reservado para el footer

        // Solo agregar notas si hay espacio suficiente
        if (yPosition + 25 < footerStartY) {
          yPosition += 15
          doc.setTextColor(textColor[0], textColor[1], textColor[2])
          doc.setFontSize(9)
          doc.setFont("helvetica", "bold")
          doc.text("Notas:", 20, yPosition)

          yPosition += 7
          doc.setFont("helvetica", "normal")

          // Dividir las notas en líneas que quepan en la página
          const splitNotes = doc.splitTextToSize(payment.notas, 170)
          const maxLines = Math.floor((footerStartY - yPosition - 10) / 5) // Calcular líneas disponibles
          const notesToShow = splitNotes.slice(0, maxLines)

          doc.text(notesToShow, 20, yPosition)

          // Si las notas son muy largas, agregar indicador
          if (splitNotes.length > maxLines) {
            yPosition += notesToShow.length * 5 + 3
            doc.setFontSize(8)
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
            doc.text("(Notas truncadas por espacio)", 20, yPosition)
          }
        }
      }

      // Footer elegante
      const pageHeight = doc.internal.pageSize.height

      // Línea decorativa
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setLineWidth(0.5)
      doc.line(20, pageHeight - 35, 190, pageHeight - 35)

      // Mensaje de agradecimiento
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text("¡Gracias por confiar en nosotros!", 105, pageHeight - 25, { align: "center" })

      // Información de contacto
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.text("www.clinicadentallinares.com", 105, pageHeight - 18, { align: "center" })
      doc.text("Síguenos en redes sociales: @ClinicaDentalLinares", 105, pageHeight - 13, { align: "center" })

      // Número de página
      doc.text("Página 1 de 1", 190, pageHeight - 8, { align: "right" })

      // Generar nombre del archivo
      const fileName = `Factura_${payment.numeroFactura || "N-A"}_${payment.paciente.apellido}_${new Date().toISOString().split("T")[0]}.pdf`

      // Descargar el PDF
      doc.save(fileName)
    } catch (error) {
      console.error("Error generando PDF:", error)
      alert("Error al generar el PDF. Por favor, intente nuevamente.")
    }
  }

  const handlePayNow = (payment: Payment) => {
    if (payment.estado === "pagado") {
      alert("Este pago ya ha sido procesado.")
      return
    }
    setShowPaymentModal(payment)
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error al cargar los pagos</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadPayments}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mis Pagos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona y revisa tus pagos y facturas</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showFilters
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>

          <button
            onClick={loadPayments}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pagos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">{formatCurrency(stats.totalAmount)} en total</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagados</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.paid}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">{formatCurrency(stats.paidAmount)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-yellow-600 dark:text-yellow-400">
              {formatCurrency(stats.pendingAmount)} pendiente
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencidos</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            <span className="text-red-600 dark:text-red-400">Requieren atención</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pagado">Pagados</option>
                <option value="pendiente">Pendientes</option>
                <option value="overdue">Vencidos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Período</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los períodos</option>
                <option value="thisMonth">Este mes</option>
                <option value="lastMonth">Mes pasado</option>
                <option value="thisYear">Este año</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por factura, notas..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron pagos</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.status !== "all" || filters.search || filters.dateRange !== "all"
                ? "Intenta ajustar los filtros para ver más resultados."
                : "Aún no tienes pagos registrados."}
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const statusConfig = getStatusConfig(payment)
            const methodConfig = getMethodConfig(payment.metodoPago)
            const StatusIcon = statusConfig.icon
            const MethodIcon = methodConfig.icon
            const daysUntilDue = getDaysUntilDue(payment)

            return (
              <div
                key={payment._id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {payment.numeroFactura}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusConfig.badge}`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.tratamiento
                            ? `${payment.tratamiento.tipo} - ${payment.tratamiento.descripcion}`
                            : "Consulta general"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(payment.total)}
                        </p>
                        <div className="flex items-center justify-end mt-1">
                          <MethodIcon className={`h-4 w-4 mr-1 ${methodConfig.color}`} />
                          <span className={`text-sm ${methodConfig.color}`}>{methodConfig.text}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Emitido: {formatDate(payment.fechaEmision)}</span>
                      </div>

                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Vence: {formatDate(payment.fechaVencimiento)}</span>
                      </div>

                      {payment.fechaPago && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span>Pagado: {formatDate(payment.fechaPago)}</span>
                        </div>
                      )}
                    </div>

                    {/* Status indicators */}
                    {daysUntilDue !== null && payment.estado === "pendiente" && (
                      <div className="flex items-center">
                        {daysUntilDue < 0 ? (
                          <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span>Vencido hace {Math.abs(daysUntilDue)} días</span>
                          </div>
                        ) : daysUntilDue === 0 ? (
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Vence hoy</span>
                          </div>
                        ) : daysUntilDue <= 7 ? (
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Vence en {daysUntilDue} días</span>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Notes */}
                    {payment.notas && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{payment.notas}"</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPayment(payment)
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver detalles
                    </button>

                    {payment.estado === "pendiente" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePayNow(payment)
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pagar Ahora
                      </button>
                    )}

                    {payment.numeroFactura && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadInvoice(payment)
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <PaymentMethodModal
          payment={showPaymentModal}
          onClose={() => setShowPaymentModal(null)}
          onPaymentSuccess={() => {
            setShowPaymentModal(null)
            loadPayments() // Recargar datos
          }}
        />
      )}

      {/* Payment Details Modal */}
      {selectedPayment && <PaymentDetailsModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />}
    </div>
  )
}

export default MyPayments
