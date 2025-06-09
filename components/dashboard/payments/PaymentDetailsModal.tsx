"use client"

import { X, FileText, CreditCard, DollarSign, User, Phone, Mail, MapPin, Download } from "lucide-react"
import type { Payment } from "@/lib/api"
import { useTheme } from "@/context/ThemeContext"

interface PaymentDetailsModalProps {
  payment: Payment
  onClose: () => void
}

const PaymentDetailsModal = ({ payment, onClose }: PaymentDetailsModalProps) => {
  const { theme } = useTheme()

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pagado":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
      case "pendiente":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30"
      case "cancelado":
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/50"
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/50"
    }
  }

  const getStatusText = (estado: string) => {
    switch (estado) {
      case "pagado":
        return "Pagado"
      case "pendiente":
        return "Pendiente"
      case "cancelado":
        return "Cancelado"
      default:
        return estado
    }
  }

  const getMethodText = (metodo: string) => {
    switch (metodo) {
      case "efectivo":
        return "Efectivo"
      case "tarjeta":
        return "Tarjeta"
      case "transferencia":
        return "Transferencia"
      default:
        return metodo
    }
  }

  const getMethodIcon = (metodo: string) => {
    switch (metodo) {
      case "efectivo":
        return <DollarSign className="h-4 w-4" />
      case "tarjeta":
      case "transferencia":
        return <CreditCard className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
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
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isOverdue = () => {
    if (payment.estado === "pagado" || payment.estado === "cancelado") return false
    return new Date(payment.fechaVencimiento) < new Date()
  }

  const generatePDF = async () => {
    try {
      // Importación dinámica para evitar errores de SSR
      const jsPDF = (await import("jspdf")).default

      const doc = new jsPDF()

      // Configuración de colores
      const primaryColor = [220, 38, 38] // red-600
      const secondaryColor = [107, 114, 128] // gray-500
      const textColor = [17, 24, 39] // gray-900

      // Header de la clínica
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(0, 0, 210, 40, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("CLÍNICA DENTAL DRA. LINARES", 20, 25)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Cuidando tu sonrisa con excelencia", 20, 32)

      // Información de la factura
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("FACTURA", 150, 55)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Número: ${payment.numeroFactura || "N/A"}`, 150, 65)
      doc.text(`Fecha de emisión: ${formatDate(payment.fechaEmision)}`, 150, 72)
      doc.text(`Vencimiento: ${formatDate(payment.fechaVencimiento)}`, 150, 79)

      // Estado de la factura
      const statusColor =
        payment.estado === "pagado" ? [34, 197, 94] : payment.estado === "pendiente" ? [234, 179, 8] : [107, 114, 128]
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
      doc.rect(150, 85, 40, 8, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text(getStatusText(payment.estado).toUpperCase(), 152, 90)

      // Información del paciente
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("FACTURAR A:", 20, 60)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`${payment.paciente.nombre} ${payment.paciente.apellido}`, 20, 70)
      doc.text(`Email: ${payment.paciente.correo}`, 20, 77)
      if (payment.paciente.telefono) {
        doc.text(`Teléfono: ${payment.paciente.telefono}`, 20, 84)
      }
      if (payment.paciente.direccion) {
        doc.text(`Dirección: ${payment.paciente.direccion}`, 20, 91)
      }

      // Tabla de ítems - creada manualmente
      let yPosition = 110

      // Header de la tabla
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(20, yPosition, 170, 10, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Descripción", 25, yPosition + 7)
      doc.text("Cant.", 120, yPosition + 7)
      doc.text("Precio Unit.", 140, yPosition + 7)
      doc.text("Total", 170, yPosition + 7)

      yPosition += 10

      // Filas de la tabla
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)

      payment.items?.forEach((item, index) => {
        // Alternar color de fondo
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250)
          doc.rect(20, yPosition, 170, 8, "F")
        }

        doc.setTextColor(textColor[0], textColor[1], textColor[2])

        // Descripción (con texto ajustado si es muy largo)
        const description = item.descripcion.length > 35 ? item.descripcion.substring(0, 32) + "..." : item.descripcion
        doc.text(description, 25, yPosition + 6)

        // Cantidad (centrado)
        doc.text(item.cantidad.toString(), 125, yPosition + 6, { align: "center" })

        // Precio unitario (alineado a la derecha)
        doc.text(formatCurrency(item.precioUnitario), 165, yPosition + 6, { align: "right" })

        // Total (alineado a la derecha)
        doc.text(formatCurrency(item.cantidad * item.precioUnitario), 185, yPosition + 6, { align: "right" })

        yPosition += 8
      })

      // Línea de cierre de la tabla
      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPosition, 190, yPosition)

      // Totales
      yPosition += 15

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Subtotal:", 130, yPosition)
      doc.text(formatCurrency(payment.subtotal || 0), 185, yPosition, { align: "right" })

      yPosition += 7
      doc.text("Impuestos (13%):", 130, yPosition)
      doc.text(formatCurrency(payment.impuestos || 0), 185, yPosition, { align: "right" })

      // Total destacado
      yPosition += 10
      doc.setFillColor(240, 240, 240)
      doc.rect(125, yPosition - 3, 65, 10, "F")
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("TOTAL:", 130, yPosition + 4)
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text(formatCurrency(payment.total || 0), 185, yPosition + 4, { align: "right" })

      // Información de pago
      yPosition += 20
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Método de pago: ${getMethodText(payment.metodoPago)}`, 20, yPosition)

      if (payment.fechaPago) {
        yPosition += 7
        doc.text(`Fecha de pago: ${formatDate(payment.fechaPago)}`, 20, yPosition)
      }

      // Notas
      if (payment.notas) {
        yPosition += 15
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.text("Notas:", 20, yPosition)
        yPosition += 7
        doc.setFont("helvetica", "normal")
        const splitNotes = doc.splitTextToSize(payment.notas, 170)
        doc.text(splitNotes, 20, yPosition)
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(8)
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.text("Gracias por confiar en nosotros", 105, pageHeight - 20, { align: "center" })
      doc.text(
        "www.clinicadentallinares.com | info@clinicadentallinares.com | Tel: (+503) 7850-9957",
        105,
        pageHeight - 15,
        {
          align: "center",
        },
      )

      // Generar nombre del archivo
      const fileName = `Factura_${payment.numeroFactura || "N-A"}_${payment.paciente.apellido}.pdf`

      // Abrir en nueva pestaña como PDF real
      const pdfBlob = doc.output("blob")
      const pdfUrl = URL.createObjectURL(pdfBlob)

      // Crear un enlace temporal para abrir en nueva ventana
      const link = document.createElement("a")
      link.href = pdfUrl
      link.target = "_blank"
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar la URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
    } catch (error) {
      console.error("Error generando PDF:", error)
      alert("Error al generar el PDF. Por favor, intente nuevamente.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalle de Factura</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {payment.numeroFactura || "Sin número de factura"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - con flex-1 y overflow */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información del paciente */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <User className="h-5 w-5 text-red-500" />
                    Información del Paciente
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</div>
                      <div className="text-base text-gray-900 dark:text-white">
                        {payment.paciente.nombre} {payment.paciente.apellido}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
                        <div className="text-sm text-gray-900 dark:text-white">{payment.paciente.correo}</div>
                      </div>
                    </div>

                    {payment.paciente.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</div>
                          <div className="text-sm text-gray-900 dark:text-white">{payment.paciente.telefono}</div>
                        </div>
                      </div>
                    )}

                    {payment.paciente.direccion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</div>
                          <div className="text-sm text-gray-900 dark:text-white">{payment.paciente.direccion}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del pago */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4 mt-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <CreditCard className="h-5 w-5 text-red-500" />
                    Información del Pago
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.estado)}`}
                      >
                        {getStatusText(payment.estado)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Método</span>
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        {getMethodIcon(payment.metodoPago)}
                        {getMethodText(payment.metodoPago)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de emisión</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(payment.fechaEmision)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vencimiento</span>
                      <span
                        className={`text-sm ${isOverdue() ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-900 dark:text-white"}`}
                      >
                        {formatDate(payment.fechaVencimiento)}
                        {isOverdue() && <span className="ml-1">⚠️</span>}
                      </span>
                    </div>

                    {payment.fechaPago && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de pago</span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {formatDate(payment.fechaPago)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Creado</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDateTime(payment.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Tratamiento asociado */}
                {payment.tratamiento && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3 mt-4">
                    <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">Tratamiento Asociado</div>
                    <div>
                      <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Tipo</div>
                      <div className="text-sm text-blue-900 dark:text-blue-100">{payment.tratamiento.tipo}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Descripción</div>
                      <div className="text-sm text-blue-900 dark:text-blue-100">{payment.tratamiento.descripcion}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Costo del tratamiento</div>
                      <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        {formatCurrency(payment.tratamiento.costo)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detalle de la factura */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalle de Factura</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Precio Unitario
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {payment.items?.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.descripcion}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-sm text-gray-900 dark:text-white">{item.cantidad}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {formatCurrency(item.precioUnitario)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(item.cantidad * item.precioUnitario)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totales */}
                  <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(payment.subtotal || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Impuestos (13%):</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(payment.impuestos || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-red-600 dark:text-red-400">{formatCurrency(payment.total || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notas */}
                  {payment.notas && (
                    <div className="px-6 py-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Notas adicionales:
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">{payment.notas}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - siempre visible */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cerrar
          </button>
          <button
            onClick={generatePDF}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetailsModal
