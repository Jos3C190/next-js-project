"use client"

import { useState } from "react"
import { X, CreditCard, Banknote, ArrowUpRight, Shield, CheckCircle } from "lucide-react"
import type { Payment } from "@/lib/api"
import { createPatientPaymentsApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface PaymentMethodModalProps {
  payment: Payment
  onClose: () => void
  onPaymentSuccess: () => void
}

const PaymentMethodModal = ({ payment, onClose, onPaymentSuccess }: PaymentMethodModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<"tarjeta" | "transferencia" | "efectivo">("tarjeta")
  const [processing, setProcessing] = useState(false)
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const { token } = useAuth()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === "number") {
      formattedValue = formatCardNumber(value)
    } else if (field === "expiry") {
      formattedValue = formatExpiry(value)
    } else if (field === "cvv") {
      formattedValue = value.replace(/[^0-9]/g, "").substring(0, 4)
    }

    setCardData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }))
  }

  const validateCard = () => {
    // Validaciones básicas del frontend
    const cardNumber = cardData.number.replace(/\s/g, "")

    // Validar que tenga 16 dígitos
    if (cardNumber.length !== 16) {
      return "El número de tarjeta debe tener 16 dígitos"
    }

    // Validar fecha de vencimiento
    const [month, year] = cardData.expiry.split("/")
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1

    if (!month || !year || Number.parseInt(month) < 1 || Number.parseInt(month) > 12) {
      return "Fecha de vencimiento inválida"
    }

    if (
      Number.parseInt(year) < currentYear ||
      (Number.parseInt(year) === currentYear && Number.parseInt(month) < currentMonth)
    ) {
      return "La tarjeta está vencida"
    }

    // Validar CVV
    if (cardData.cvv.length < 3 || cardData.cvv.length > 4) {
      return "CVV inválido"
    }

    // Validar nombre
    if (cardData.name.trim().length < 2) {
      return "Nombre del titular requerido"
    }

    return null
  }

  const handlePayment = async () => {
    if (selectedMethod === "tarjeta") {
      // Validar tarjeta en el frontend
      const validationError = validateCard()
      if (validationError) {
        alert(validationError)
        return
      }
    }

    setProcessing(true)

    try {
      if (token) {
        const paymentsApi = createPatientPaymentsApi(token)

        // Llamar al endpoint simple para marcar como pagado
        const result = await paymentsApi.markPaymentAsPaid(payment._id, selectedMethod)

        if (result.success) {
          onPaymentSuccess()
          onClose()
        } else {
          alert(result.message || "Error al procesar el pago")
        }
      }
    } catch (error) {
      console.error("Error procesando pago:", error)
      alert("Error al procesar el pago. Por favor, intenta nuevamente.")
    } finally {
      setProcessing(false)
    }
  }

  const paymentMethods = [
    {
      id: "tarjeta" as const,
      name: "Tarjeta de Crédito/Débito",
      icon: CreditCard,
      description: "Visa, Mastercard, American Express",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      id: "transferencia" as const,
      name: "Transferencia Bancaria",
      icon: ArrowUpRight,
      description: "Transferencia directa a cuenta bancaria",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      id: "efectivo" as const,
      name: "Pago en Efectivo",
      icon: Banknote,
      description: "Pagar en la clínica",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      borderColor: "border-green-200 dark:border-green-800",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Procesar Pago</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Factura: {payment.numeroFactura}</p>
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
          {/* Payment Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total a pagar:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(payment.total)}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Incluye impuestos (13%): {formatCurrency(payment.impuestos)}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Selecciona método de pago:</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                const isSelected = selectedMethod === method.id

                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `${method.bgColor} ${method.borderColor}`
                        : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${isSelected ? method.color : "text-gray-400"}`} />
                      <div className="text-left">
                        <div
                          className={`font-medium ${
                            isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {method.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{method.description}</div>
                      </div>
                      {isSelected && <CheckCircle className={`h-5 w-5 ml-auto ${method.color}`} />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Card Details Form */}
          {selectedMethod === "tarjeta" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Datos de la tarjeta:</h4>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.number}
                  onChange={(e) => handleCardInputChange("number", e.target.value)}
                  maxLength={19}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Vencimiento</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardData.expiry}
                    onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del titular
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={cardData.name}
                  onChange={(e) => handleCardInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  <strong>Nota:</strong> Este es un sistema de demostración. Los datos de la tarjeta no se almacenan ni
                  procesan realmente.
                </p>
              </div>
            </div>
          )}

          {/* Transfer Instructions */}
          {selectedMethod === "transferencia" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Datos para transferencia:</h4>
              <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <p>
                  <strong>Banco:</strong> Banco Agrícola de El Salvador
                </p>
                <p>
                  <strong>Cuenta:</strong> 123-456-789-0
                </p>
                <p>
                  <strong>Titular:</strong> Clínica Dental Dra. Linares
                </p>
                <p>
                  <strong>Referencia:</strong> {payment.numeroFactura}
                </p>
              </div>
              <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border-l-4 border-blue-400">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Importante:</strong> Una vez realizada la transferencia, el estado del pago se actualizará
                  automáticamente en 24-48 horas. Si necesitas confirmación inmediata, contacta a la clínica en San
                  Miguel, El Salvador.
                </p>
              </div>
            </div>
          )}

          {/* Cash Instructions */}
          {selectedMethod === "efectivo" && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">Pago en efectivo:</h4>
              <div className="text-sm text-green-800 dark:text-green-400">
                <p>Puedes realizar el pago en efectivo directamente en nuestra clínica.</p>
                <p className="mt-2">
                  <strong>Horarios:</strong> Lunes a Viernes 8:00 AM - 6:00 PM
                </p>
                <p>
                  <strong>Dirección:</strong> San Miguel, El Salvador
                </p>
                <p className="mt-2">
                  <strong>Referencia:</strong> {payment.numeroFactura}
                </p>
              </div>
              <div className="mt-3 p-3 bg-green-100 dark:bg-green-800/30 rounded border-l-4 border-green-400">
                <p className="text-xs text-green-700 dark:text-green-300">
                  <strong>Nota:</strong> Al realizar el pago en efectivo, el recepcionista actualizará el estado de tu
                  factura inmediatamente.
                </p>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-start space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="h-4 w-4 mt-0.5 text-green-500" />
            <div>
              <p className="font-medium">Sistema de demostración</p>
              <p>Este es un entorno de prueba. No se procesan pagos reales.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>

          {selectedMethod === "tarjeta" ? (
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Pago {formatCurrency(payment.total)}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodModal
