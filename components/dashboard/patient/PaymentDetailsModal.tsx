"use client"

import {
  X,
  Calendar,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Banknote,
  ArrowUpRight,
} from "lucide-react"
import type { Payment } from "@/lib/api"
import { useState } from "react"
import PaymentMethodModal from "./PaymentMethodModal"

interface PaymentDetailsModalProps {
  payment: Payment
  onClose: () => void
}

const PaymentDetailsModal = ({ payment, onClose }: PaymentDetailsModalProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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
      }
    } else if (isOverdue) {
      return {
        color: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-800",
        icon: AlertTriangle,
        text: "Vencido",
      }
    } else {
      return {
        color:
          "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800",
        icon: Clock,
        text: "Pendiente",
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
    return new Date(dateString).toLocaleDateString("es-SV", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
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
      doc.text("San Miguel, El Salvador", 40, 32)
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
      doc.text("San Miguel, El Salvador | www.clinicadentallinares.com", 105, pageHeight - 18, { align: "center" })
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

  const handlePayNow = () => {
    if (payment.estado === "pagado") {
      alert("Este pago ya ha sido procesado.")
      return
    }
    setShowPaymentModal(true)
  }

  const statusConfig = getStatusConfig(payment)
  const methodConfig = getMethodConfig(payment.metodoPago)
  const StatusIcon = statusConfig.icon
  const MethodIcon = methodConfig.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detalles del Pago</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{payment.numeroFactura}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Amount */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${statusConfig.color}`}>
              <StatusIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">{statusConfig.text}</span>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(payment.total)}</p>
              <div className="flex items-center justify-end mt-1">
                <MethodIcon className={`h-4 w-4 mr-1 ${methodConfig.color}`} />
                <span className={`text-sm ${methodConfig.color}`}>{methodConfig.text}</span>
              </div>
            </div>
          </div>

          {/* Treatment Info */}
          {payment.tratamiento && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Tratamiento Asociado</h3>
              <p className="text-blue-800 dark:text-blue-400">
                <span className="font-medium">{payment.tratamiento.tipo}</span>
                {payment.tratamiento.descripcion && (
                  <span className="text-blue-600 dark:text-blue-500 block text-sm mt-1">
                    {payment.tratamiento.descripcion}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Detalles de Facturación</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cant.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {payment.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.descripcion}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">{item.cantidad}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                        {formatCurrency(item.precioUnitario)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">
                        {formatCurrency(item.cantidad * item.precioUnitario)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="bg-gray-100 dark:bg-gray-600 px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(payment.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Impuestos (13%):</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(payment.impuestos)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t border-gray-200 dark:border-gray-500 pt-2">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(payment.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Emisión</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(payment.fechaEmision)}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Vencimiento</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(payment.fechaVencimiento)}
                </p>
              </div>
            </div>

            {payment.fechaPago && (
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg sm:col-span-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">Fecha de Pago</p>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    {formatDate(payment.fechaPago)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {payment.notas && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Notas</h4>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">{payment.notas}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {payment.estado === "pendiente" && (
            <button
              onClick={handlePayNow}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pagar Ahora
            </button>
          )}

          <button
            onClick={() => handleDownloadInvoice(payment)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Factura
          </button>

          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
      {/* Payment Method Modal */}
      {showPaymentModal && (
        <PaymentMethodModal
          payment={payment}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            setShowPaymentModal(false)
            onClose() // Cerrar el modal de detalles
            window.location.reload() // Recargar para ver cambios
          }}
        />
      )}
    </div>
  )
}

export default PaymentDetailsModal
