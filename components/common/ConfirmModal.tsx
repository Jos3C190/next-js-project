"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X, Loader2 } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
  isLoading?: boolean
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  isLoading = false,
}: ConfirmModalProps) => {
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-500",
          confirmButton: "bg-red-500 hover:bg-red-600 focus:ring-red-500",
          iconBg: "bg-red-100 dark:bg-red-900/20",
        }
      case "warning":
        return {
          icon: "text-amber-500",
          confirmButton: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
          iconBg: "bg-amber-100 dark:bg-amber-900/20",
        }
      case "info":
        return {
          icon: "text-blue-500",
          confirmButton: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",
          iconBg: "bg-blue-100 dark:bg-blue-900/20",
        }
      default:
        return {
          icon: "text-red-500",
          confirmButton: "bg-red-500 hover:bg-red-600 focus:ring-red-500",
          iconBg: "bg-red-100 dark:bg-red-900/20",
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={!isLoading ? onClose : undefined}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative transform overflow-hidden rounded-lg bg-[hsl(var(--card))] px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                {!isLoading && (
                  <button
                    type="button"
                    className="rounded-md bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="sm:flex sm:items-start">
                <div
                  className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}
                >
                  <AlertTriangle className={`h-6 w-6 ${styles.icon}`} aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-[hsl(var(--foreground))]">{title}</h3>
                  <div className="mt-2">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${styles.confirmButton} ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
                <button
                  type="button"
                  className={`mt-3 inline-flex w-full justify-center rounded-md bg-[hsl(var(--secondary))] px-3 py-2 text-sm font-semibold text-[hsl(var(--secondary-foreground))] shadow-sm ring-1 ring-inset ring-[hsl(var(--border))] hover:bg-[hsl(var(--card-hover))] sm:mt-0 sm:w-auto transition-colors duration-200 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmModal
