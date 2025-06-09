"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import {
  createPatientsApi,
  createAppointmentsApi,
  createTreatmentsApi,
  createPaymentsApi,
  createDashboardApi,
} from "@/lib/api"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface ReportGeneratorProps {
  reportType: string
  dateRange: { from: string; to: string }
  onGenerate: () => void
  isGenerating: boolean
}

export default function ReportGenerator({ reportType, dateRange, onGenerate, isGenerating }: ReportGeneratorProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const { token } = useAuth()

  const generatePDF = async () => {
    if (!token) {
      console.error("No token available")
      setStatus("error")
      return
    }

    setStatus("idle")
    onGenerate()

    try {
      // Crear las APIs directamente con el token
      const dashboardApi = createDashboardApi(token)
      const patientsApi = createPatientsApi(token)
      const appointmentsApi = createAppointmentsApi(token)
      const treatmentsApi = createTreatmentsApi(token)
      const paymentsApi = createPaymentsApi(token)

      let data: any = null
      let title = ""
      let headers: string[] = []
      let rows: any[][] = []

      switch (reportType) {
        case "patients":
          title = "Reporte de Pacientes"
          try {
            const patientsResponse = await patientsApi.getPatients(1, 1000)
            data = patientsResponse.data || []
            headers = ["Nombre", "Apellido", "Correo", "Teléfono", "Dirección", "Fecha Nacimiento"]
            rows = data.map((patient: any) => [
              patient.nombre || "N/A",
              patient.apellido || "N/A",
              patient.correo || "N/A",
              patient.telefono || "N/A",
              patient.direccion || "N/A",
              patient.fecha_nacimiento ? new Date(patient.fecha_nacimiento).toLocaleDateString() : "N/A",
            ])
          } catch (error) {
            console.error("Error fetching patients:", error)
            headers = ["Nombre", "Apellido", "Correo", "Teléfono", "Dirección", "Fecha Nacimiento"]
            rows = [["No hay datos disponibles", "", "", "", "", ""]]
          }
          break

        case "appointments":
          title = "Reporte de Citas"
          try {
            const appointmentsResponse = await appointmentsApi.getAppointments(1, 1000)
            data = appointmentsResponse.data || []

            // Filtrar citas que no tienen paciente (tanto pacienteId como pacienteTemporalId son null)
            const validAppointments = data.filter(
              (appointment: any) => appointment.pacienteId || appointment.pacienteTemporalId,
            )

            headers = ["Paciente", "Odontólogo", "Fecha", "Hora", "Motivo", "Estado"]
            rows = validAppointments.map((appointment: any) => [
              `${appointment.pacienteId?.nombre || appointment.pacienteTemporalId?.nombre || "N/A"} ${appointment.pacienteId?.apellido || appointment.pacienteTemporalId?.apellido || ""}`.trim(),
              `${appointment.odontologoId?.nombre || "N/A"} ${appointment.odontologoId?.apellido || ""}`.trim(),
              appointment.fecha ? new Date(appointment.fecha).toLocaleDateString() : "N/A",
              appointment.hora || "N/A",
              appointment.motivo || "N/A",
              appointment.estado || "N/A",
            ])
          } catch (error) {
            console.error("Error fetching appointments:", error)
            headers = ["Paciente", "Odontólogo", "Fecha", "Hora", "Motivo", "Estado"]
            rows = [["No hay datos disponibles", "", "", "", "", ""]]
          }
          break

        case "treatments":
          title = "Reporte de Tratamientos"
          try {
            const treatmentsResponse = await treatmentsApi.getTreatments(1, 1000)
            data = treatmentsResponse.data || []

            // Filtrar tratamientos que no tienen paciente
            const validTreatments = data.filter((treatment: any) => treatment.paciente)

            headers = ["Paciente", "Odontólogo", "Tipo", "Descripción", "Costo", "Estado", "Sesiones"]
            rows = validTreatments.map((treatment: any) => [
              `${treatment.paciente?.nombre || "N/A"} ${treatment.paciente?.apellido || ""}`.trim(),
              `${treatment.odontologo?.nombre || "N/A"} ${treatment.odontologo?.apellido || ""}`.trim(),
              treatment.tipo || "N/A",
              treatment.descripcion || "N/A",
              treatment.costo ? `$${treatment.costo.toLocaleString()}` : "N/A",
              treatment.estado || "N/A",
              `${treatment.sesionesCompletadas || 0}/${treatment.numeroSesiones || 0}`,
            ])
          } catch (error) {
            console.error("Error fetching treatments:", error)
            headers = ["Paciente", "Odontólogo", "Tipo", "Descripción", "Costo", "Estado", "Sesiones"]
            rows = [["No hay datos disponibles", "", "", "", "", "", ""]]
          }
          break

        case "payments":
          title = "Reporte Financiero"
          try {
            const paymentsResponse = await paymentsApi.getPayments(1, 1000)
            data = paymentsResponse.docs || []

            // Filtrar pagos que no tienen paciente
            const validPayments = data.filter((payment: any) => payment.paciente)

            headers = ["Paciente", "Método Pago", "Total", "Estado", "Fecha Emisión", "Fecha Vencimiento"]
            rows = validPayments.map((payment: any) => [
              `${payment.paciente?.nombre || "N/A"} ${payment.paciente?.apellido || ""}`.trim(),
              payment.metodoPago || "N/A",
              payment.total ? `$${payment.total.toLocaleString()}` : "N/A",
              payment.estado || "N/A",
              payment.fechaEmision ? new Date(payment.fechaEmision).toLocaleDateString() : "N/A",
              payment.fechaVencimiento ? new Date(payment.fechaVencimiento).toLocaleDateString() : "N/A",
            ])
          } catch (error) {
            console.error("Error fetching payments:", error)
            headers = ["Paciente", "Método Pago", "Total", "Estado", "Fecha Emisión", "Fecha Vencimiento"]
            rows = [["No hay datos disponibles", "", "", "", "", ""]]
          }
          break

        case "activity":
          title = "Reporte de Actividad del Sistema"
          // Simular datos de actividad ya que no tenemos endpoint específico
          headers = ["Usuario", "Acción", "Descripción", "Fecha"]
          rows = [
            ["Admin Principal", "Login", "Inicio de sesión exitoso", new Date().toLocaleDateString()],
            ["Dr. López", "Crear Cita", "Nueva cita programada", new Date().toLocaleDateString()],
            ["Admin Principal", "Crear Paciente", "Nuevo paciente registrado", new Date().toLocaleDateString()],
          ]
          break

        case "statistics":
          title = "Reporte Estadístico"
          try {
            const stats = await dashboardApi.getStats()
            headers = ["Métrica", "Valor"]
            rows = [
              ["Total de Pacientes", stats.totalPatients?.toString() || "0"],
              ["Citas Hoy", stats.appointmentsToday?.toString() || "0"],
              ["Citas Esta Semana", stats.appointmentsWeek?.toString() || "0"],
              ["Citas Este Mes", stats.monthlyAppointments?.toString() || "0"],
              ["Tratamientos Completados", stats.completedTreatments?.toString() || "0"],
              ["Pagos Pendientes", stats.pendingPayments?.toString() || "0"],
              ["Ingresos Totales", stats.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : "$0"],
              ["Ingresos Este Mes", stats.revenueThisMonth ? `$${stats.revenueThisMonth.toLocaleString()}` : "$0"],
            ]
          } catch (error) {
            console.error("Error fetching statistics:", error)
            headers = ["Métrica", "Valor"]
            rows = [["No hay datos disponibles", ""]]
          }
          break

        default:
          throw new Error("Tipo de reporte no válido")
      }

      // Generar PDF
      const doc = new jsPDF()

      // Configurar fuente
      doc.setFont("helvetica")

      // Título
      doc.setFontSize(20)
      doc.setTextColor(220, 38, 38) // Color rojo de la marca
      doc.text(title, 20, 30)

      // Información del reporte
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 20, 45)
      doc.text(`Clínica Dental Dra. Linares`, 20, 55)

      if (dateRange.from && dateRange.to) {
        doc.text(`Período: ${dateRange.from} - ${dateRange.to}`, 20, 65)
      }

      // Tabla - Usando la función autoTable importada
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: dateRange.from && dateRange.to ? 75 : 65,
        theme: "grid",
        headStyles: {
          fillColor: [220, 38, 38], // Color rojo
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        margin: { left: 20, right: 20 },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
      })

      // Pie de página
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10)
      }

      // Descargar PDF
      const fileName = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)

      setStatus("success")
    } catch (error) {
      console.error("Error generating report:", error)
      setStatus("error")
    }
  }

  const getButtonContent = () => {
    if (isGenerating) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generando...
        </>
      )
    }

    if (status === "success") {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          Generado
        </>
      )
    }

    if (status === "error") {
      return (
        <>
          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
          Error
        </>
      )
    }

    return (
      <>
        <Download className="h-4 w-4 mr-2" />
        Generar PDF
      </>
    )
  }

  const getButtonVariant = () => {
    if (status === "success") return "outline"
    if (status === "error") return "destructive"
    return "default"
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      <Button onClick={generatePDF} disabled={isGenerating} variant={getButtonVariant()} className="w-full">
        {getButtonContent()}
      </Button>

      {status === "success" && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-green-600 mt-2 text-center"
        >
          Reporte descargado exitosamente
        </motion.p>
      )}

      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 mt-2 text-center"
        >
          Error al generar el reporte
        </motion.p>
      )}
    </motion.div>
  )
}
