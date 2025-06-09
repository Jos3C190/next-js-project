"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Calendar, Plus, Trash } from "lucide-react"
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi"
import {
  type Payment,
  type Patient,
  type Treatment,
  type CreatePaymentRequest,
  type UpdatePaymentRequest,
  createPaymentsApi,
} from "@/lib/api"
import { useTheme } from "@/context/ThemeContext"

interface PaymentFormProps {
  payment?: Payment | null
  patients: Patient[]
  treatments: Treatment[]
  onSubmit: () => void
  onCancel: () => void
}

const PaymentForm = ({ payment, patients, treatments, onSubmit, onCancel }: PaymentFormProps) => {
  const { theme } = useTheme()
  const { apiCall } = useAuthenticatedApi()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    paciente: payment?.paciente?._id || "",
    tratamiento: payment?.tratamiento?._id || "",
    items: payment?.items || [{ descripcion: "", cantidad: 1, precioUnitario: 0 }],
    metodoPago: payment?.metodoPago || ("efectivo" as const),
    estado: payment?.estado || ("pendiente" as const),
    fechaVencimiento: payment?.fechaVencimiento ? new Date(payment.fechaVencimiento).toISOString().split("T")[0] : "",
    fechaPago: payment?.fechaPago ? new Date(payment.fechaPago).toISOString().split("T")[0] : "",
    notas: payment?.notas || "",
  })

  const [subtotal, setSubtotal] = useState(payment?.subtotal || 0)
  const [impuestos, setImpuestos] = useState(payment?.impuestos || 0)
  const [total, setTotal] = useState(payment?.total || 0)

  useEffect(() => {
    const calculatedSubtotal = formData.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0)
    const calculatedImpuestos = calculatedSubtotal * 0.13 // 13% tax
    const calculatedTotal = calculatedSubtotal + calculatedImpuestos

    setSubtotal(calculatedSubtotal)
    setImpuestos(calculatedImpuestos)
    setTotal(calculatedTotal)
  }, [formData.items])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (payment?._id) {
        // Actualizar pago existente
        const updateData: UpdatePaymentRequest = {
          items: formData.items,
          metodoPago: formData.metodoPago,
          estado: formData.estado,
          fechaVencimiento: formData.fechaVencimiento,
          fechaPago: formData.fechaPago || undefined,
          notas: formData.notas,
        }

        await apiCall(async (token: string) => {
          const api = createPaymentsApi(token)
          return api.updatePayment(payment._id, updateData)
        })
      } else {
        // Crear nuevo pago
        const createData: CreatePaymentRequest = {
          paciente: formData.paciente,
          tratamiento: formData.tratamiento || undefined,
          items: formData.items,
          metodoPago: formData.metodoPago,
          estado: formData.estado,
          fechaVencimiento: formData.fechaVencimiento,
          fechaPago: formData.fechaPago || undefined,
          notas: formData.notas,
        }

        await apiCall(async (token: string) => {
          const api = createPaymentsApi(token)
          return api.createPayment(createData)
        })
      }

      onSubmit()
    } catch (error) {
      console.error("Error saving payment:", error)
      alert("Error al guardar el pago")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monto" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]

    if (field === "cantidad" || field === "precioUnitario") {
      newItems[index] = {
        ...newItems[index],
        [field]: typeof value === "string" ? Number.parseFloat(value) || 0 : value,
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      }
    }

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }))
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { descripcion: "", cantidad: 1, precioUnitario: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = [...formData.items]
      newItems.splice(index, 1)
      setFormData((prev) => ({
        ...prev,
        items: newItems,
      }))
    }
  }

  const selectedTreatment = treatments.find((t) => t._id === formData.tratamiento)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Filter treatments safely
  const filteredTreatments = treatments.filter((t) => {
    if (!formData.paciente) return true
    return t.paciente?._id === formData.paciente
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-[hsl(var(--card))] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
            {payment ? "Editar Pago y Factura" : "Nuevo Pago y Factura"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paciente */}
            <div>
              <label htmlFor="paciente" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Paciente *
              </label>
              <select
                id="paciente"
                name="paciente"
                value={formData.paciente}
                onChange={handleInputChange}
                required
                disabled={!!payment}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
              >
                <option value="">Seleccionar paciente</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.nombre} {patient.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Tratamiento */}
            <div>
              <label htmlFor="tratamiento" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Tratamiento (Opcional)
              </label>
              <select
                id="tratamiento"
                name="tratamiento"
                value={formData.tratamiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
              >
                <option value="">Sin tratamiento asociado</option>
                {filteredTreatments.map((treatment) => (
                  <option key={treatment._id} value={treatment._id}>
                    {treatment.descripcion} - {treatment.tipo}
                  </option>
                ))}
              </select>
              {selectedTreatment && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Costo del tratamiento: ${selectedTreatment.costo?.toLocaleString() || 0}
                </p>
              )}
            </div>

            {/* Método de pago */}
            <div>
              <label htmlFor="metodoPago" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Método de Pago *
              </label>
              <select
                id="metodoPago"
                name="metodoPago"
                value={formData.metodoPago}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                {payment && <option value="cancelado">Cancelado</option>}
              </select>
            </div>

            {/* Fecha de vencimiento */}
            <div>
              <label
                htmlFor="fechaVencimiento"
                className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2"
              >
                Fecha de Vencimiento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <input
                  type="date"
                  id="fechaVencimiento"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fecha de pago */}
            {formData.estado === "pagado" && (
              <div>
                <label htmlFor="fechaPago" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  Fecha de Pago
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <input
                    type="date"
                    id="fechaPago"
                    name="fechaPago"
                    value={formData.fechaPago}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notas" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
              Notas
            </label>
            <textarea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
              placeholder="Notas adicionales para la factura..."
            />
          </div>

          {/* Items de factura */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium text-[hsl(var(--foreground))]">Detalle de Factura</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-md transition-colors"
              >
                <Plus className="h-3 w-3" /> Agregar ítem
              </button>
            </div>

            <div className="bg-[hsl(var(--muted))] p-4 rounded-md border border-[hsl(var(--border))]">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="mb-4 last:mb-0 p-4 bg-[hsl(var(--card))] rounded-md border border-[hsl(var(--border))]"
                >
                  <div className="grid grid-cols-12 gap-3 mb-3">
                    <div className="col-span-6">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Descripción del servicio/producto
                      </label>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => handleItemChange(index, "descripcion", e.target.value)}
                        placeholder="Ej: Limpieza dental, Consulta, etc."
                        required
                        className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(index, "cantidad", e.target.value)}
                        placeholder="1"
                        min="1"
                        required
                        className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Precio unitario ($)
                      </label>
                      <input
                        type="number"
                        value={item.precioUnitario}
                        onChange={(e) => handleItemChange(index, "precioUnitario", e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex items-end justify-center pb-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length <= 1}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Eliminar ítem"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total del ítem - Separado en su propia fila */}
                  <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400 mr-2">Total del ítem:</span>
                      <span className="font-semibold text-[hsl(var(--foreground))]">
                        ${(item.cantidad * item.precioUnitario).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Totales */}
              <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-[hsl(var(--foreground))] font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Impuestos (13%):</span>
                  <span className="text-[hsl(var(--foreground))] font-medium">{formatCurrency(impuestos)}</span>
                </div>
                <div className="flex justify-between text-base mt-2 font-bold">
                  <span className="text-[hsl(var(--foreground))]">Total:</span>
                  <span className="text-[hsl(var(--foreground))]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-[hsl(var(--foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-400 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Guardando..." : payment ? "Actualizar" : "Crear"} Pago y Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentForm
