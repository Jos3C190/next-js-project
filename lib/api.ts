const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true"

// Tipos de datos
export interface DashboardStats {
  totalPatients: number
  appointmentsToday: number
  appointmentsWeek: number
  monthlyAppointments: number
  completedTreatments: number
  pendingPayments: number
  totalRevenue: number
  revenueThisMonth: number
}

export interface RecentAppointment {
  id: string
  pacienteId: string
  pacienteNombre: string
  fecha: string
  hora: string
  motivo: string
  estado: string
  odontologoId: string
  odontologoNombre: string
}

export interface Activity {
  _id: string
  type: string
  action: string
  description: string
  userId: string
  userRole: string
  userName: string
  timestamp: string
}

export interface Patient {
  _id: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  historia_clinica?: string
  password?: string
  role: string
  __v?: number
}

export interface CreatePatientRequest {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  historia_clinica?: string
  password: string
}

export interface UpdatePatientRequest {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  historia_clinica?: string
  password?: string
}

export interface PatientsResponse {
  data: Patient[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface Doctor {
  _id: string
  nombre: string
  apellido: string
  especialidad: string
}

export interface Appointment {
  _id: string
  pacienteId?: {
    _id: string
    nombre: string
    apellido: string
    correo: string
    telefono?: string
  }
  pacienteTemporalId?: {
    _id: string
    nombre: string
    apellido: string
    correo: string
  }
  odontologoId: {
    _id: string
    nombre: string
    apellido: string
    especialidad: string
    correo?: string
    telefono?: string
  }
  fecha: string
  hora: string
  motivo: string
  estado: "pendiente" | "completada" | "cancelada"
  createdAt: string
  __v?: number
}

export interface CreateAppointmentRequest {
  pacienteId?: string
  pacienteTemporalId?: string
  odontologoId: string
  fecha: string
  hora: string
  motivo: string
}

export interface UpdateAppointmentRequest {
  pacienteId?: string
  pacienteTemporalId?: string
  odontologoId?: string
  fecha?: string
  hora?: string
  motivo?: string
  estado?: "pendiente" | "completada" | "cancelada"
}

// Nuevo tipo para citas de pacientes (simplificado)
export interface CreatePatientAppointmentRequest {
  fecha: string
  hora: string
  motivo: string
}

export interface AppointmentsResponse {
  data: Appointment[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface Dentist {
  _id: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  especialidad: string
  fecha_nacimiento: string
  role: string
  __v?: number
}

export interface DentistsResponse {
  data: Dentist[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface User {
  _id: string
  nombre: string
  apellido: string
  correo: string
  telefono?: string
  especialidad?: string
  fecha_nacimiento?: string
  role?: string
}

export interface LoginResponse {
  token: string
  role: string
  user: User
}

export interface RegisterData {
  correo: string
  password: string
  nombre: string
  apellido: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
}

export interface VerifyResponse {
  message: string
  user: {
    id: string
    role: string
    nombre: string
    apellido: string
  }
}

// Agregar interfaces para expedientes después de las interfaces existentes

export interface Treatment {
  _id: string
  paciente: {
    _id: string
    nombre: string
    apellido: string
    correo: string
    telefono: string
    direccion: string
    fecha_nacimiento: string
  }
  odontologo: {
    _id: string
    nombre: string
    apellido: string
    correo: string
    telefono: string
    especialidad: string
    fecha_nacimiento: string
  }
  descripcion: string
  tipo: string
  costo: number
  numeroSesiones: number
  sesionesCompletadas: number
  estado: "pendiente" | "en progreso" | "completado" | "cancelado"
  fechaInicio: string
  fechaFin?: string
  __v?: number
}

// Agregar interfaces para requests de tratamientos después de las interfaces existentes

export interface CreateTreatmentRequest {
  paciente: string
  odontologo: string
  descripcion: string
  tipo: string
  costo: number
  numeroSesiones: number
  sesionesCompletadas: number
  estado: "pendiente" | "en progreso" | "completado" | "cancelado"
  fechaFin?: string
}

export interface UpdateTreatmentRequest {
  descripcion?: string
  tipo?: string
  costo?: number
  numeroSesiones?: number
  sesionesCompletadas?: number
  fechaInicio?: string
  fechaFin?: string
  estado?: "pendiente" | "en progreso" | "completado" | "cancelado"
}

export interface TreatmentsResponse {
  data: Treatment[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface MedicalRecord {
  _id: string
  paciente: {
    _id: string
    nombre: string
    apellido: string
    correo: string
    telefono: string
    direccion: string
    fecha_nacimiento: string
  }
  observaciones: string
  tratamientos: Treatment[]
  fechaCreacion: string
  __v?: number
}

export interface CreateMedicalRecordRequest {
  paciente: string
  observaciones: string
}

export interface UpdateMedicalRecordRequest {
  observaciones: string
}

export interface MedicalRecordsResponse {
  data: MedicalRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Interfaces para pagos y facturación
export interface Payment {
  _id: string
  paciente: {
    _id: string
    nombre: string
    apellido: string
    correo: string
    telefono: string
    direccion?: string
  }
  tratamiento?: {
    _id: string
    descripcion: string
    tipo: string
    costo: number
  }
  // Invoice-related fields
  items: {
    descripcion: string
    cantidad: number
    precioUnitario: number
  }[]
  metodoPago: "efectivo" | "tarjeta" | "transferencia"
  estado: "pendiente" | "pagado" | "cancelado"
  fechaVencimiento: string
  fechaPago?: string
  notas?: string
  numeroFactura?: string
  subtotal: number
  impuestos: number
  total: number
  fechaEmision: string
  createdAt: string
  __v?: number
}

// Actualizar la interfaz CreatePaymentRequest para eliminar el campo transaccionId
export interface CreatePaymentRequest {
  paciente: string
  pacienteTemporalId?: string
  tratamiento?: string
  items: {
    descripcion: string
    cantidad: number
    precioUnitario: number
  }[]
  metodoPago: "efectivo" | "tarjeta" | "transferencia"
  estado?: "pendiente" | "pagado" | "cancelado"
  fechaVencimiento: string
  fechaPago?: string
  notas?: string
}

export interface UpdatePaymentRequest {
  items?: {
    descripcion: string
    cantidad: number
    precioUnitario: number
  }[]
  metodoPago?: "efectivo" | "tarjeta" | "transferencia"
  estado?: "pendiente" | "pagado" | "cancelado"
  fechaVencimiento?: string
  fechaPago?: string
  notas?: string
}

export type Invoice = {}

export interface InvoicesResponse {
  data: Invoice[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateInvoiceRequest {
  paciente: string
  items: {
    descripcion: string
    cantidad: number
    precioUnitario: number
  }[]
  fechaVencimiento: string
  notas?: string
}

export interface UpdateInvoiceRequest {
  estado?: "borrador" | "enviada" | "pagada" | "cancelada"
  fechaVencimiento?: string
  fechaPago?: string
  notas?: string
}

export interface PaymentStats {
  totalIngresos: number
  ingresosMes: number
  pagosPendientes: number
  pagosVencidos: number
  facturasPendientes: number
  facturasVencidas: number
  promedioTiempoPago: number
}

export interface PaymentsResponse {
  docs: Payment[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

// Interfaces para usuarios del sistema (odontólogos y administradores)
export interface SystemUser {
  _id: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  especialidad: string
  fecha_nacimiento: string
  password?: string
  role: "odontologo" | "admin"
  __v?: number
}

export interface CreateSystemUserRequest {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  especialidad: string
  fecha_nacimiento: string
  password: string
}

export interface UpdateSystemUserRequest {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  especialidad: string
  fecha_nacimiento: string
  password?: string
}

export interface SystemUsersResponse {
  data: SystemUser[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Función helper para hacer peticiones
async function apiRequest<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  // En modo desarrollo, simular respuestas
  if (DEV_MODE) {
    return simulateApiResponse<T>(endpoint, options.method || "GET", options.body as string)
  }

  console.log("API Request:", { url, method: options.method, body: options.body }) // Para debug

  const response = await fetch(url, config)

  if (!response.ok) {
    // Intentar obtener el mensaje de error del servidor
    let errorMessage = `Error ${response.status}: ${response.statusText}`
    let errorDetails = null

    try {
      const errorData = await response.json()
      console.log("Error response:", errorData) // Para debug

      if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.join(", ")
      }

      errorDetails = errorData
    } catch (parseError) {
      // Si no se puede parsear el error, usar el mensaje por defecto
      console.log("Could not parse error response")
    }

    if (response.status === 401) {
      // Token inválido, limpiar localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/"
      }
      throw new Error("Token inválido")
    }

    const error = new Error(errorMessage)
    ;(error as any).response = response
    ;(error as any).details = errorDetails
    throw error
  }

  return response.json()
}

// Simulador para modo desarrollo
function simulateApiResponse<T>(endpoint: string, method: string, body?: string): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (endpoint === "/api/auth/login") {
        resolve({
          token: "dev-token-123",
          role: "admin",
          user: {
            _id: "dev-user-1",
            nombre: "Usuario",
            apellido: "Desarrollo",
            correo: "dev@test.com",
            telefono: "123456789",
            especialidad: "Desarrollo",
          },
        } as T)
      } else if (endpoint === "/api/auth/verify") {
        resolve({
          message: "Token válido",
          user: {
            id: "dev-user-1",
            role: "admin",
            nombre: "Usuario",
            apellido: "Desarrollo",
          },
        } as T)
      } else if (endpoint === "/api/dashboard/stats") {
        resolve({
          totalPatients: 45,
          appointmentsToday: 3,
          appointmentsWeek: 12,
          monthlyAppointments: 87,
          completedTreatments: 36,
          pendingPayments: 2,
          totalRevenue: 15240,
          revenueThisMonth: 5240,
        } as T)
      } else if (endpoint.includes("/api/dashboard/recent-appointments")) {
        resolve({
          appointments: [
            {
              id: "1",
              pacienteId: "p1",
              pacienteNombre: "María García",
              fecha: "2025-01-23",
              hora: "10:00",
              motivo: "Limpieza Dental",
              estado: "pendiente",
              odontologoId: "d1",
              odontologoNombre: "Dr. López",
            },
            {
              id: "2",
              pacienteId: "p2",
              pacienteNombre: "Juan Pérez",
              fecha: "2025-01-23",
              hora: "11:30",
              motivo: "Ortodoncia",
              estado: "confirmada",
              odontologoId: "d1",
              odontologoNombre: "Dr. López",
            },
          ],
        } as T)
      } else if (endpoint.includes("/api/dashboard/activity")) {
        // Simular paginación para actividades
        const urlParams = new URLSearchParams(endpoint.split("?")[1] || "")
        const page = Number.parseInt(urlParams.get("page") || "1")
        const limit = Number.parseInt(urlParams.get("limit") || "10")

        const allActivities: Activity[] = []

        const total = allActivities.length
        const totalPages = Math.ceil(total / limit)
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const data = allActivities.slice(startIndex, endIndex)

        if (limit === 1) {
          // Para la primera llamada que solo quiere obtener el total
          resolve({
            activities: data,
            pagination: {
              total,
              page,
              limit,
              totalPages,
            },
          } as T)
        } else {
          // Para las llamadas normales
          resolve({
            data,
            pagination: {
              total,
              page,
              limit,
              totalPages,
            },
          } as T)
        }
      } else if (endpoint === "/api/citas") {
        if (method === "POST") {
          const requestData = JSON.parse(body || "{}")
          resolve({
            message: "Cita creada con éxito",
            cita: {
              _id: "new-appointment-id",
              ...requestData,
              fecha: new Date(requestData.fecha).toISOString(),
              estado: "pendiente",
              createdAt: new Date().toISOString(),
              odontologoId: {
                _id: "d1",
                nombre: "José",
                apellido: "López",
                especialidad: "Ortodoncia",
              },
              __v: 0,
            },
          } as T)
        } else {
          resolve({
            data: [
              {
                _id: "1",
                pacienteId: {
                  _id: "p1",
                  nombre: "María",
                  apellido: "García",
                  correo: "maria@test.com",
                },
                odontologoId: {
                  _id: "d1",
                  nombre: "José",
                  apellido: "López",
                  especialidad: "Ortodoncia",
                },
                fecha: "2025-01-25T00:00:00.000Z",
                hora: "10:00",
                motivo: "Limpieza dental",
                estado: "pendiente",
                createdAt: "2025-01-20T10:00:00.000Z",
              },
              {
                _id: "2",
                pacienteId: {
                  _id: "p1",
                  nombre: "María",
                  apellido: "García",
                  correo: "maria@test.com",
                },
                odontologoId: {
                  _id: "d1",
                  nombre: "José",
                  apellido: "López",
                  especialidad: "Ortodoncia",
                },
                fecha: "2025-01-30T00:00:00.000Z",
                hora: "14:30",
                motivo: "Revisión de ortodoncia",
                estado: "pendiente",
                createdAt: "2025-01-22T10:00:00.000Z",
              },
            ],
            pagination: {
              total: 2,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          } as T)
        }
      } else if (endpoint === "/api/citas" && method === "POST") {
        // Cita pública sin autenticación
        const requestData = JSON.parse(body || "{}")
        resolve({
          message: "Cita creada con éxito. Nos pondremos en contacto contigo pronto.",
          cita: {
            _id: "new-public-appointment-id",
            ...requestData,
            fecha: new Date(requestData.fecha).toISOString(),
            estado: "pendiente",
            createdAt: new Date().toISOString(),
            __v: 0,
          },
        } as T)
      } else if (endpoint.includes("/api/citas/") && endpoint.includes("/cancelar") && method === "PATCH") {
        resolve({
          message: "Cita cancelada con éxito",
          cita: {
            _id: endpoint.split("/")[3],
            estado: "cancelada",
          },
        } as T)
      } else if (endpoint.includes("/api/citas/") && method === "PUT") {
        const requestData = JSON.parse(body || "{}")
        resolve({
          _id: endpoint.split("/").pop(),
          ...requestData,
          fecha: requestData.fecha ? new Date(requestData.fecha).toISOString() : undefined,
          createdAt: "2025-01-20T10:00:00.000Z",
          __v: 0,
        } as T)
      } else if (endpoint.includes("/api/citas/") && method === "DELETE") {
        resolve({
          message: "Cita eliminada con éxito",
        } as T)
      } else if (endpoint === "/odontologos") {
        resolve({
          data: [
            {
              _id: "d1",
              nombre: "José",
              apellido: "López",
              correo: "jose@example.com",
              telefono: "87654321",
              especialidad: "Ortodoncia",
              fecha_nacimiento: "1998-06-15T00:00:00.000Z",
              role: "odontologo",
              __v: 0,
            },
            {
              _id: "d2",
              nombre: "Admin",
              apellido: "Principal",
              correo: "admin@example.com",
              telefono: "1234567890",
              especialidad: "Administración",
              fecha_nacimiento: "1980-01-01T00:00:00.000Z",
              role: "admin",
              __v: 0,
            },
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 100,
            totalPages: 1,
          },
        } as T)
      } else if (endpoint === "/pacientes") {
        if (method === "POST") {
          const requestData = JSON.parse(body || "{}")
          resolve({
            _id: "new-patient-id",
            ...requestData,
            fecha_nacimiento: new Date(requestData.fecha_nacimiento).toISOString(),
            password: "$2b$10$hashedpassword",
            role: "paciente",
            __v: 0,
          } as T)
        } else {
          resolve({
            data: [
              {
                _id: "67f4a50ec5e2bcae913f7871",
                nombre: "Javier",
                apellido: "Martinez",
                correo: "paciente@ejemplo.com",
                telefono: "1234567890",
                direccion: "Calle Falsa 123",
                fecha_nacimiento: "1990-01-01T00:00:00.000Z",
                password: "$2b$10$hashedpassword",
                role: "paciente",
                __v: 0,
              },
              {
                _id: "682fe194e35012e49e5f8eca",
                nombre: "Jose",
                apellido: "Carlos",
                correo: "jose.carlos@example.com",
                telefono: "123456789",
                direccion: "Calle Falsa 123",
                fecha_nacimiento: "1990-05-15T00:00:00.000Z",
                historia_clinica: "Sin antecedentes médicos importantes",
                password: "$2b$10$hashedpassword",
                role: "paciente",
                __v: 0,
              },
            ],
            pagination: {
              total: 2,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          } as T)
        }
      } else if (endpoint.includes("/pacientes/") && method === "PUT") {
        const requestData = JSON.parse(body || "{}")
        resolve({
          _id: endpoint.split("/").pop(),
          ...requestData,
          fecha_nacimiento: new Date(requestData.fecha_nacimiento).toISOString(),
          password: "$2b$10$hashedpassword",
          role: "paciente",
          __v: 0,
        } as T)
      } else if (endpoint.includes("/pacientes/") && method === "DELETE") {
        resolve({
          message: "Paciente eliminado",
        } as T)
      } else if (endpoint === "/api/expedientes") {
        if (method === "POST") {
          const requestData = JSON.parse(body || "{}")
          resolve({
            paciente: requestData.paciente,
            observaciones: requestData.observaciones,
            tratamientos: [],
            _id: "new-record-id",
            fechaCreacion: new Date().toISOString(),
            __v: 0,
          } as T)
        } else {
          resolve({
            data: [
              {
                _id: "record1",
                paciente: {
                  _id: "67f4a50ec5e2bcae913f7871",
                  nombre: "Javier",
                  apellido: "Martinez",
                  correo: "paciente@ejemplo.com",
                  telefono: "1234567890",
                  direccion: "Calle Falsa 123",
                  fecha_nacimiento: "1990-01-01T00:00:00.000Z",
                },
                observaciones: "Historial médico inicial del paciente.",
                tratamientos: [],
                fechaCreacion: "2025-01-20T10:00:00.000Z",
              },
              {
                _id: "record2",
                paciente: {
                  _id: "682fe194e35012e49e5f8eca",
                  nombre: "Jose",
                  apellido: "Carlos",
                  correo: "jose.carlos@example.com",
                  telefono: "123456789",
                  direccion: "Calle Falsa 123",
                  fecha_nacimiento: "1990-05-15T00:00:00.000Z",
                },
                observaciones: "Observaciones actualizadas después del tratamiento.",
                tratamientos: [
                  {
                    _id: "treatment1",
                    paciente: "682fe194e35012e49e5f8eca",
                    odontologo: {
                      _id: "d1",
                      nombre: "José",
                      apellido: "López",
                      correo: "jose@example.com",
                      telefono: "87654321",
                      especialidad: "Ortodoncia",
                      fecha_nacimiento: "1998-06-15T00:00:00.000Z",
                    },
                    descripcion: "Tratamiento de ortodoncia invisible.",
                    tipo: "Ortodoncia",
                    costo: 3500,
                    numeroSesiones: 24,
                    sesionesCompletadas: 24,
                    estado: "completado",
                    fechaInicio: "2025-01-15T00:00:00.000Z",
                    fechaFin: "2025-01-30T00:00:00.000Z",
                  },
                ],
                fechaCreacion: "2025-01-10T10:00:00.000Z",
              },
            ],
            pagination: {
              total: 2,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          } as T)
        }
      } else if (endpoint.includes("/api/expedientes/") && method === "GET") {
        resolve({
          _id: endpoint.split("/").pop(),
          paciente: {
            _id: "682fe194e35012e49e5f8eca",
            nombre: "Jose",
            apellido: "Carlos",
            correo: "jose.carlos@example.com",
            telefono: "123456789",
            direccion: "Calle Falsa 123",
            fecha_nacimiento: "1990-05-15T00:00:00.000Z",
          },
          observaciones: "Observaciones del expediente médico.",
          tratamientos: [],
          fechaCreacion: "2025-01-10T10:00:00.000Z",
        } as T)
      } else if (endpoint.includes("/api/expedientes/") && method === "PUT") {
        const requestData = JSON.parse(body || "{}")
        resolve({
          _id: endpoint.split("/").pop(),
          paciente: "682fe194e35012e49e5f8eca",
          observaciones: requestData.observaciones,
          tratamientos: [],
          fechaCreacion: "2025-01-10T10:00:00.000Z",
          __v: 0,
        } as T)
      } else if (endpoint.includes("/api/expedientes/") && method === "DELETE") {
        resolve({
          message: "Expediente eliminado con éxito",
        } as T)
      } else if (endpoint === "/api/tratamientos") {
        if (method === "POST") {
          const requestData = JSON.parse(body || "{}")
          resolve({
            paciente: requestData.paciente,
            odontologo: requestData.odontologo,
            descripcion: requestData.descripcion,
            tipo: requestData.tipo,
            costo: requestData.costo,
            numeroSesiones: requestData.numeroSesiones,
            sesionesCompletadas: requestData.sesionesCompletadas,
            fechaFin: requestData.fechaFin,
            estado: requestData.estado,
            _id: "new-treatment-id",
            fechaInicio: new Date().toISOString(),
            __v: 0,
          } as T)
        } else {
          resolve({
            data: [
              {
                _id: "treatment1",
                paciente: {
                  _id: "682fe194e35012e49e5f8eca",
                  nombre: "Jose",
                  apellido: "Carlos",
                  correo: "jose.carlos@example.com",
                  telefono: "123456789",
                  direccion: "Calle Falsa 123",
                  fecha_nacimiento: "1990-05-15T00:00:00.000Z",
                },
                odontologo: {
                  _id: "68100d6af4e6f334f7024f30",
                  nombre: "José",
                  apellido: "López",
                  correo: "jose@example.com",
                  telefono: "87651234",
                  especialidad: "Ortodoncia",
                  fecha_nacimiento: "1998-06-15T00:00:00.000Z",
                },
                descripcion: "Tratamiento de ortodoncia invisible.",
                tipo: "Ortodoncia",
                costo: 3500,
                numeroSesiones: 24,
                sesionesCompletadas: 24,
                estado: "completado",
                fechaInicio: "2025-01-15T00:00:00.000Z",
                fechaFin: "2025-01-30T00:00:00.000Z",
              },
              {
                _id: "treatment2",
                paciente: {
                  _id: "67f4a50ec5e2bcae913f7871",
                  nombre: "Javier",
                  apellido: "Martinez",
                  correo: "paciente@ejemplo.com",
                  telefono: "1234567890",
                  direccion: "Calle Falsa 123",
                  fecha_nacimiento: "1990-01-01T00:00:00.000Z",
                },
                odontologo: {
                  _id: "68100d6af4e6f334f7024f30",
                  nombre: "José",
                  apellido: "López",
                  correo: "jose@example.com",
                  telefono: "87651234",
                  especialidad: "Ortodoncia",
                  fecha_nacimiento: "1998-06-15T00:00:00.000Z",
                },
                descripcion: "Limpieza dental y revisión general.",
                tipo: "Limpieza",
                costo: 150,
                numeroSesiones: 1,
                sesionesCompletadas: 0,
                estado: "en progreso",
                fechaInicio: "2025-01-20T00:00:00.000Z",
                fechaFin: "2025-01-25T00:00:00.000Z",
              },
            ],
            pagination: {
              total: 2,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          } as T)
        }
      } else if (endpoint.includes("/api/tratamientos/") && method === "GET") {
        resolve({
          _id: endpoint.split("/").pop(),
          paciente: {
            _id: "682fe194e35012e49e5f8eca",
            nombre: "Jose",
            apellido: "Carlos",
            correo: "jose.carlos@example.com",
            telefono: "123456789",
            direccion: "Calle Falsa 123",
            fecha_nacimiento: "1990-05-15T00:00:00.000Z",
          },
          odontologo: {
            _id: "68100d6af4e6f334f7024f30",
            nombre: "José",
            apellido: "López",
            correo: "jose@example.com",
            telefono: "87651234",
            especialidad: "Ortodoncia",
            fecha_nacimiento: "1998-06-15T00:00:00.000Z",
          },
          descripcion: "Tratamiento de ortodoncia invisible.",
          tipo: "Ortodoncia",
          costo: 3500,
          numeroSesiones: 24,
          sesionesCompletadas: 24,
          estado: "completado",
          fechaInicio: "2025-01-15T00:00:00.000Z",
          fechaFin: "2025-01-30T00:00:00.000Z",
        } as T)
      } else if (endpoint.includes("/api/tratamientos/") && method === "PUT") {
        const requestData = JSON.parse(body || "{}")
        resolve({
          _id: endpoint.split("/").pop(),
          paciente: "682fe194e35012e49e5f8eca",
          odontologo: "68100d6af4e6f334f7024f30",
          ...requestData,
          __v: 0,
        } as T)
      } else if (endpoint.includes("/api/tratamientos/") && method === "DELETE") {
        resolve({
          message: "Tratamiento eliminado con éxito",
        } as T)
      } else if (endpoint === "/api/auth/register") {
        const requestData = JSON.parse(body || "{}")
        resolve({
          message: "Usuario registrado exitosamente",
          usuario: {
            _id: "new-user-id",
            nombre: requestData.nombre,
            apellido: requestData.apellido,
            correo: requestData.correo,
            telefono: requestData.telefono,
            direccion: requestData.direccion,
            fecha_nacimiento: requestData.fecha_nacimiento,
            role: "paciente",
          },
        } as T)
      } else if (endpoint === "/api/pagos") {
        if (method === "POST") {
          const requestData = JSON.parse(body || "{}")
          const subtotal = requestData.items.reduce(
            (sum: number, item: any) => sum + item.cantidad * item.precioUnitario,
            0,
          )
          const impuestos = subtotal * 0.13
          const total = subtotal + impuestos

          resolve({
            _id: "new-payment-id",
            paciente: requestData.paciente,
            tratamiento: requestData.tratamiento,
            items: requestData.items,
            metodoPago: requestData.metodoPago,
            estado: requestData.estado || "pendiente",
            fechaVencimiento: new Date(requestData.fechaVencimiento).toISOString(),
            fechaPago: requestData.fechaPago ? new Date(requestData.fechaPago).toISOString() : undefined,
            notas: requestData.notas,
            numeroFactura: `FAC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
            subtotal,
            impuestos,
            total,
            fechaEmision: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            __v: 0,
          } as T)
        } else {
          resolve({
            docs: [
              {
                _id: "payment1",
                paciente: {
                  _id: "6834b2728a21ba72cbc7d1ee",
                  nombre: "Sofía",
                  apellido: "Ramírez",
                  correo: "sofia.ramirez@example.com",
                  telefono: "56789043",
                  direccion: "Calle de las Flores 456",
                },
                tratamiento: {
                  _id: "6834bb1b8a21ba72cbc7d728",
                  descripcion: "Control post-restauración de caries en molar superior derecho",
                  tipo: "Otro",
                  costo: 100,
                },
                items: [
                  {
                    descripcion: "Consulta inicial",
                    cantidad: 1,
                    precioUnitario: 50,
                  },
                  {
                    descripcion: "Brackets metálicos",
                    cantidad: 1,
                    precioUnitario: 1700,
                  },
                ],
                metodoPago: "tarjeta",
                estado: "pendiente",
                fechaVencimiento: "2025-01-30T00:00:00.000Z",
                notas: "Pago inicial del tratamiento",
                numeroFactura: "FAC-2025-001",
                subtotal: 1750,
                impuestos: 227.5,
                total: 1977.5,
                fechaEmision: "2025-06-08T21:56:28.390Z",
                createdAt: "2025-06-08T21:56:28.390Z",
              },
            ],
            totalDocs: 1,
            limit: 10,
            totalPages: 1,
            page: 1,
            pagingCounter: 1,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null,
          } as T)
        }
      } else if (endpoint.includes("/api/pagos/") && method === "PUT") {
        const requestData = JSON.parse(body || "{}")
        resolve({
          _id: endpoint.split("/").pop(),
          ...requestData,
          fechaVencimiento: requestData.fechaVencimiento
            ? new Date(requestData.fechaVencimiento).toISOString()
            : undefined,
          fechaPago: requestData.fechaPago ? new Date(requestData.fechaPago).toISOString() : undefined,
          __v: 0,
        } as T)
      } else if (endpoint.includes("/api/pagos/") && method === "DELETE") {
        resolve({
          message: "Pago eliminado con éxito",
        } as T)
      } else if (endpoint === "/api/facturas") {
        if (method === "POST") {
          const requestData = JSON.parse(body || "{}")
          const subtotal = requestData.items.reduce(
            (sum: number, item: any) => sum + item.cantidad * item.precioUnitario,
            0,
          )
          const impuestos = subtotal * 0.13 // 13% IVA
          const total = subtotal + impuestos

          resolve({
            _id: "new-invoice-id",
            numeroFactura: `FAC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
            paciente: requestData.paciente,
            items: requestData.items.map((item: any) => ({
              ...item,
              total: item.cantidad * item.precioUnitario,
            })),
            subtotal,
            impuestos,
            total,
            estado: "borrador",
            fechaEmision: new Date().toISOString(),
            fechaVencimiento: new Date(requestData.fechaVencimiento).toISOString(),
            notas: requestData.notas,
            createdAt: new Date().toISOString(),
            __v: 0,
          } as T)
        } else {
          resolve({
            data: [
              {
                _id: "invoice1",
                numeroFactura: "FAC-2025-001",
                paciente: {
                  _id: "67f4a50ec5e2bcae913f7871",
                  nombre: "Javier",
                  apellido: "Martinez",
                  correo: "paciente@ejemplo.com",
                  telefono: "1234567890",
                  direccion: "Calle Falsa 123",
                },
                items: [
                  {
                    descripcion: "Consulta inicial",
                    cantidad: 1,
                    precioUnitario: 50,
                    total: 50,
                  },
                  {
                    descripcion: "Limpieza dental",
                    cantidad: 1,
                    precioUnitario: 100,
                    total: 100,
                  },
                ],
                subtotal: 150,
                impuestos: 19.5,
                total: 169.5,
                estado: "pagada",
                fechaEmision: "2025-01-20T00:00:00.000Z",
                fechaVencimiento: "2025-02-20T00:00:00.000Z",
                fechaPago: "2025-01-25T00:00:00.000Z",
                metodoPago: "tarjeta",
                createdAt: "2025-01-20T10:00:00.000Z",
              },
              {
                _id: "invoice2",
                numeroFactura: "FAC-2025-002",
                paciente: {
                  _id: "682fe194e35012e49e5f8eca",
                  nombre: "Jose",
                  apellido: "Carlos",
                  correo: "jose.carlos@example.com",
                  telefono: "123456789",
                  direccion: "Calle Falsa 456",
                },
                items: [
                  {
                    descripcion: "Tratamiento de ortodoncia - Sesión 1",
                    cantidad: 1,
                    precioUnitario: 200,
                    total: 200,
                  },
                ],
                subtotal: 200,
                impuestos: 26,
                total: 226,
                estado: "enviada",
                fechaEmision: "2025-01-22T00:00:00.000Z",
                fechaVencimiento: "2025-02-22T00:00:00.000Z",
                createdAt: "2025-01-22T10:00:00.000Z",
              },
            ],
            pagination: {
              total: 2,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          } as T)
        }
      } else if (endpoint.includes("/api/facturas/") && method === "PUT") {
        const requestData = JSON.parse(body || "{}")
        resolve({
          _id: endpoint.split("/").pop(),
          ...requestData,
          fechaVencimiento: requestData.fechaVencimiento
            ? new Date(requestData.fechaVencimiento).toISOString()
            : undefined,
          fechaPago: requestData.fechaPago ? new Date(requestData.fechaPago).toISOString() : undefined,
          __v: 0,
        } as T)
      } else if (endpoint.includes("/api/facturas/") && method === "DELETE") {
        resolve({
          message: "Factura eliminada con éxito",
        } as T)
      } else if (endpoint === "/api/pagos/stats") {
        resolve({
          totalIngresos: 25400,
          ingresosMes: 5240,
          pagosPendientes: 3,
          pagosVencidos: 1,
          facturasPendientes: 2,
          facturasVencidas: 1,
          promedioTiempoPago: 7.5,
        } as T)
      }

      // Respuesta por defecto
      resolve({} as T)
    }, 500) // Simular delay de red
  })
}

// API de autenticación
export const authApi = {
  login: async (credentials: { correo: string; password: string }): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  register: async (data: RegisterData): Promise<{ message: string; usuario: User }> => {
    return apiRequest<{ message: string; usuario: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  verify: async (token: string): Promise<VerifyResponse> => {
    return apiRequest<VerifyResponse>(
      "/api/auth/verify",
      {
        method: "GET",
      },
      token,
    )
  },
}

// API del dashboard
export const createDashboardApi = (token: string) => ({
  getStats: (): Promise<DashboardStats> => {
    return apiRequest<DashboardStats>(
      "/api/dashboard/stats",
      {
        method: "GET",
      },
      token,
    )
  },

  getRecentAppointments: (limit = 5): Promise<{ appointments: RecentAppointment[] }> => {
    return apiRequest<{ appointments: RecentAppointment[] }>(
      `/api/dashboard/recent-appointments?limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  getActivity: async (limit = 5): Promise<{ activities: Activity[] }> => {
    // Para el dashboard principal, solo obtener las primeras 5 actividades
    return apiRequest<{ activities: Activity[] }>(
      `/api/dashboard/activity?limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  getAllAppointments: async (): Promise<{ data: Appointment[]; pagination: any }> => {
    try {
      // Primero obtener el total
      const initialResponse = await apiRequest<{ data: Appointment[]; pagination: any }>(
        "/api/citas?page=1&limit=1",
        {
          method: "GET",
        },
        token,
      )

      // Validar que la respuesta tenga la estructura esperada
      if (!initialResponse || !initialResponse.pagination || typeof initialResponse.pagination.total !== "number") {
        // Si no hay paginación o está mal estructurada, devolver datos vacíos o lo que hay
        return {
          data: Array.isArray(initialResponse?.data) ? initialResponse.data : [],
          pagination: { total: 0, page: 1, limit: 1, totalPages: 0 },
        }
      }

      // Usar el total como límite para obtener todos los datos
      const total = initialResponse.pagination.total
      if (total > 1) {
        const allDataResponse = await apiRequest<{ data: Appointment[]; pagination: any }>(
          `/api/citas?limit=${total}`,
          {
            method: "GET",
          },
          token,
        )
        return {
          data: Array.isArray(allDataResponse?.data) ? allDataResponse.data : [],
          pagination: allDataResponse.pagination || { total: 0, page: 1, limit: total, totalPages: 0 },
        }
      }

      return initialResponse
    } catch (error) {
      console.error("Error loading appointments:", error)
      // Devolver estructura segura en caso de error
      return {
        data: [],
        pagination: { total: 0, page: 1, limit: 1, totalPages: 0 },
      }
    }
  },
})

// API de pacientes
export const createPatientsApi = (token: string) => ({
  getPatients: (page = 1, limit = 10): Promise<PatientsResponse> => {
    return apiRequest<PatientsResponse>(
      `/pacientes?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  getPatientById: (id: string): Promise<Patient> => {
    return apiRequest<Patient>(
      `/pacientes/${id}`,
      {
        method: "GET",
      },
      token,
    )
  },

  createPatient: (patientData: CreatePatientRequest): Promise<Patient> => {
    return apiRequest<Patient>(
      "/pacientes",
      {
        method: "POST",
        body: JSON.stringify(patientData),
      },
      token,
    )
  },

  updatePatient: (id: string, patientData: UpdatePatientRequest): Promise<Patient> => {
    return apiRequest<Patient>(
      `/pacientes/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(patientData),
      },
      token,
    )
  },

  deletePatient: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(
      `/pacientes/${id}`,
      {
        method: "DELETE",
      },
      token,
    )
  },
})

// API de citas
export const createAppointmentsApi = (token: string) => ({
  getAppointments: (page = 1, limit = 10): Promise<AppointmentsResponse> => {
    return apiRequest<AppointmentsResponse>(
      `/api/citas?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  getAppointmentById: (id: string): Promise<Appointment> => {
    return apiRequest<Appointment>(
      `/api/citas/${id}`,
      {
        method: "GET",
      },
      token,
    )
  },

  createAppointment: (appointmentData: CreateAppointmentRequest): Promise<{ message: string; cita: Appointment }> => {
    return apiRequest<{ message: string; cita: Appointment }>(
      "/api/citas",
      {
        method: "POST",
        body: JSON.stringify(appointmentData),
      },
      token,
    )
  },

  updateAppointment: (
    id: string,
    appointmentData: UpdateAppointmentRequest,
  ): Promise<{ message: string; cita: Appointment }> => {
    return apiRequest<{ message: string; cita: Appointment }>(
      `/api/citas/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(appointmentData),
      },
      token,
    )
  },

  deleteAppointment: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(
      `/api/citas/${id}`,
      {
        method: "DELETE",
      },
      token,
    )
  },
})

// API de odontólogos
export const createDentistsApi = (token: string) => ({
  getDentists: (page = 1, limit = 100): Promise<DentistsResponse> => {
    return apiRequest<DentistsResponse>(
      `/odontologos?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },
})

// API de expedientes médicos
export const createMedicalRecordsApi = (token: string) => ({
  getMedicalRecords: (page = 1, limit = 10): Promise<MedicalRecordsResponse> => {
    return apiRequest<MedicalRecordsResponse>(
      `/api/expedientes?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  getMedicalRecordById: (id: string): Promise<MedicalRecord> => {
    return apiRequest<MedicalRecord>(
      `/api/expedientes/${id}`,
      {
        method: "GET",
      },
      token,
    )
  },

  createMedicalRecord: (recordData: CreateMedicalRecordRequest): Promise<MedicalRecord> => {
    return apiRequest<MedicalRecord>(
      "/api/expedientes",
      {
        method: "POST",
        body: JSON.stringify(recordData),
      },
      token,
    )
  },

  updateMedicalRecord: (id: string, recordData: UpdateMedicalRecordRequest): Promise<MedicalRecord> => {
    return apiRequest<MedicalRecord>(
      `/api/expedientes/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(recordData),
      },
      token,
    )
  },

  deleteMedicalRecord: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(
      `/api/expedientes/${id}`,
      {
        method: "DELETE",
      },
      token,
    )
  },

  getAllPatients: async (): Promise<{ data: Patient[] }> => {
    try {
      // Primero obtener el total
      const initialResponse = await apiRequest<PatientsResponse>(
        "/pacientes?page=1&limit=1",
        {
          method: "GET",
        },
        token,
      )

      // Validar que la respuesta tenga la estructura esperada
      if (!initialResponse || !initialResponse.pagination || typeof initialResponse.pagination.total !== "number") {
        return { data: Array.isArray(initialResponse?.data) ? initialResponse.data : [] }
      }

      // Usar el total como límite para obtener todos los pacientes
      const total = initialResponse.pagination.total
      if (total > 1) {
        const allPatientsResponse = await apiRequest<PatientsResponse>(
          `/pacientes?limit=${total}`,
          {
            method: "GET",
          },
          token,
        )
        return { data: Array.isArray(allPatientsResponse?.data) ? allPatientsResponse.data : [] }
      }

      return { data: Array.isArray(initialResponse.data) ? initialResponse.data : [] }
    } catch (error) {
      console.error("Error loading patients:", error)
      return { data: [] }
    }
  },
})

// API de tratamientos
export const createTreatmentsApi = (token: string) => ({
  getTreatments: async (page = 1, limit = 10): Promise<TreatmentsResponse> => {
    try {
      const response = await apiRequest<TreatmentsResponse>(
        `/api/tratamientos?page=${page}&limit=${limit}`,
        {
          method: "GET",
        },
        token,
      )

      // Validar que la respuesta tenga la estructura esperada
      if (!response || !Array.isArray(response.data)) {
        return {
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: limit,
            totalPages: 0,
          },
        }
      }

      return response
    } catch (error) {
      console.error("Error loading treatments:", error)
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: limit,
          totalPages: 0,
        },
      }
    }
  },

  getTreatmentById: (id: string): Promise<Treatment> => {
    return apiRequest<Treatment>(
      `/api/tratamientos/${id}`,
      {
        method: "GET",
      },
      token,
    )
  },

  createTreatment: (treatmentData: CreateTreatmentRequest): Promise<Treatment> => {
    return apiRequest<Treatment>(
      "/api/tratamientos",
      {
        method: "POST",
        body: JSON.stringify(treatmentData),
      },
      token,
    )
  },

  updateTreatment: (id: string, treatmentData: UpdateTreatmentRequest): Promise<Treatment> => {
    return apiRequest<Treatment>(
      `/api/tratamientos/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(treatmentData),
      },
      token,
    )
  },

  deleteTreatment: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(
      `/api/tratamientos/${id}`,
      {
        method: "DELETE",
      },
      token,
    )
  },

  getAllPatients: async (): Promise<{ data: Patient[] }> => {
    try {
      // Primero obtener el total
      const initialResponse = await apiRequest<PatientsResponse>(
        "/pacientes?page=1&limit=1",
        {
          method: "GET",
        },
        token,
      )

      // Validar que la respuesta tenga la estructura esperada
      if (!initialResponse || !initialResponse.pagination || typeof initialResponse.pagination.total !== "number") {
        return { data: Array.isArray(initialResponse?.data) ? initialResponse.data : [] }
      }

      // Usar el total como límite para obtener todos los pacientes
      const total = initialResponse.pagination.total
      if (total > 1) {
        const allPatientsResponse = await apiRequest<PatientsResponse>(
          `/pacientes?limit=${total}`,
          {
            method: "GET",
          },
          token,
        )
        return { data: Array.isArray(allPatientsResponse?.data) ? allPatientsResponse.data : [] }
      }

      return { data: Array.isArray(initialResponse.data) ? initialResponse.data : [] }
    } catch (error) {
      console.error("Error loading patients:", error)
      return { data: [] }
    }
  },

  getAllDentists: async (): Promise<{ data: Dentist[] }> => {
    try {
      // Primero obtener el total
      const initialResponse = await apiRequest<DentistsResponse>(
        "/odontologos?page=1&limit=1",
        {
          method: "GET",
        },
        token,
      )

      // Validar que la respuesta tenga la estructura esperada
      if (!initialResponse || !initialResponse.pagination || typeof initialResponse.pagination.total !== "number") {
        return { data: Array.isArray(initialResponse?.data) ? initialResponse.data : [] }
      }

      // Usar el total como límite para obtener todos los odontólogos
      const total = initialResponse.pagination.total
      if (total > 1) {
        const allDentistsResponse = await apiRequest<DentistsResponse>(
          `/odontologos?limit=${total}`,
          {
            method: "GET",
          },
          token,
        )
        return { data: Array.isArray(allDentistsResponse?.data) ? allDentistsResponse.data : [] }
      }

      return { data: Array.isArray(initialResponse.data) ? initialResponse.data : [] }
    } catch (error) {
      console.error("Error loading dentists:", error)
      return { data: [] }
    }
  },
})

// API específica para pacientes (sus propias citas)
export const createPatientAppointmentsApi = (token: string) => ({
  // Obtener las citas del paciente autenticado
  getMyAppointments: (page = 1, limit = 10): Promise<AppointmentsResponse> => {
    return apiRequest<AppointmentsResponse>(
      `/api/citas?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  // Crear una nueva cita (solo fecha, hora y motivo)
  createMyAppointment: (
    appointmentData: CreatePatientAppointmentRequest,
  ): Promise<{ message: string; cita: Appointment }> => {
    return apiRequest<{ message: string; cita: Appointment }>(
      "/api/citas",
      {
        method: "POST",
        body: JSON.stringify(appointmentData),
      },
      token,
    )
  },

  // Cancelar una cita específica
  cancelMyAppointment: (id: string): Promise<{ message: string; cita: Appointment }> => {
    return apiRequest<{ message: string; cita: Appointment }>(
      `/api/citas/${id}/cancelar`,
      {
        method: "PATCH",
      },
      token,
    )
  },
})

// API para citas públicas (sin autenticación)
export const publicAppointmentsApi = {
  // Crear una cita desde la landing page (sin autenticación)
  createPublicAppointment: (appointmentData: {
    nombre: string
    apellido: string
    telefono: string
    correo: string
    fecha: string
    hora: string
  }): Promise<{ message: string; cita: any }> => {
    return apiRequest<{ message: string; cita: any }>("/api/citas", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    })
  },
}

// API de pagos
export const createPaymentsApi = (token: string) => ({
  getPayments: (page = 1, limit = 10): Promise<PaymentsResponse> => {
    return apiRequest<PaymentsResponse>(
      `/api/pagos?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  getPaymentById: (id: string): Promise<Payment> => {
    return apiRequest<Payment>(
      `/api/pagos/${id}`,
      {
        method: "GET",
      },
      token,
    )
  },

  createPayment: (paymentData: CreatePaymentRequest): Promise<Payment> => {
    return apiRequest<Payment>(
      "/api/pagos",
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      },
      token,
    )
  },

  updatePayment: (id: string, paymentData: UpdatePaymentRequest): Promise<Payment> => {
    return apiRequest<Payment>(
      `/api/pagos/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(paymentData),
      },
      token,
    )
  },

  deletePayment: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(
      `/api/pagos/${id}`,
      {
        method: "DELETE",
      },
      token,
    )
  },

  getPaymentStats: (): Promise<PaymentStats> => {
    return apiRequest<PaymentStats>(
      "/api/pagos/stats",
      {
        method: "GET",
      },
      token,
    )
  },

  getAllPatients: async (): Promise<{ data: Patient[] }> => {
    try {
      const initialResponse = await apiRequest<PatientsResponse>(
        "/pacientes?page=1&limit=1",
        {
          method: "GET",
        },
        token,
      )

      if (!initialResponse || !initialResponse.pagination || typeof initialResponse.pagination.total !== "number") {
        return { data: Array.isArray(initialResponse?.data) ? initialResponse.data : [] }
      }

      const total = initialResponse.pagination.total
      if (total > 1) {
        const allPatientsResponse = await apiRequest<PatientsResponse>(
          `/pacientes?limit=${total}`,
          {
            method: "GET",
          },
          token,
        )
        return { data: Array.isArray(allPatientsResponse?.data) ? allPatientsResponse.data : [] }
      }

      return { data: Array.isArray(initialResponse.data) ? initialResponse.data : [] }
    } catch (error) {
      console.error("Error loading patients:", error)
      return { data: [] }
    }
  },

  getAllTreatments: async (): Promise<{ data: Treatment[] }> => {
    try {
      const initialResponse = await apiRequest<TreatmentsResponse>(
        "/api/tratamientos?page=1&limit=1",
        {
          method: "GET",
        },
        token,
      )

      if (!initialResponse || !initialResponse.pagination || typeof initialResponse.pagination.total !== "number") {
        return { data: Array.isArray(initialResponse?.data) ? initialResponse.data : [] }
      }

      const total = initialResponse.pagination.total
      if (total > 1) {
        const allTreatmentsResponse = await apiRequest<TreatmentsResponse>(
          `/api/tratamientos?limit=${total}`,
          {
            method: "GET",
          },
          token,
        )
        return { data: Array.isArray(allTreatmentsResponse?.data) ? allTreatmentsResponse.data : [] }
      }

      return { data: Array.isArray(initialResponse.data) ? initialResponse.data : [] }
    } catch (error) {
      console.error("Error loading treatments:", error)
      return { data: [] }
    }
  },
})

// API de facturas
export const createInvoicesApi = (token: string) => ({
  getInvoices: (page = 1, limit = 10): Promise<InvoicesResponse> => {
    return apiRequest<InvoicesResponse>(
      `/api/facturas?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  getInvoiceById: (id: string): Promise<Invoice> => {
    return apiRequest<Invoice>(
      `/api/facturas/${id}`,
      {
        method: "GET",
      },
      token,
    )
  },

  createInvoice: (invoiceData: CreateInvoiceRequest): Promise<Invoice> => {
    return apiRequest<Invoice>(
      "/api/facturas",
      {
        method: "POST",
        body: JSON.stringify(invoiceData),
      },
      token,
    )
  },

  updateInvoice: (id: string, invoiceData: UpdateInvoiceRequest): Promise<Invoice> => {
    return apiRequest<Invoice>(
      `/api/facturas/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(invoiceData),
      },
      token,
    )
  },

  deleteInvoice: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(
      `/api/facturas/${id}`,
      {
        method: "DELETE",
      },
      token,
    )
  },

  getAllPatients: async (): Promise<{ data: Patient[] }> => {
    try {
      const initialResponse = await apiRequest<PatientsResponse>(
        "/pacientes?page=1&limit=1",
        {
          method: "GET",
        },
        token,
      )

      if (!initialResponse || !initialResponse.pagination || typeof initialResponse.pagination.total !== "number") {
        return { data: Array.isArray(initialResponse?.data) ? initialResponse.data : [] }
      }

      const total = initialResponse.pagination.total
      if (total > 1) {
        const allPatientsResponse = await apiRequest<PatientsResponse>(
          `/pacientes?limit=${total}`,
          {
            method: "GET",
          },
          token,
        )
        return { data: Array.isArray(allPatientsResponse?.data) ? allPatientsResponse.data : [] }
      }

      return { data: Array.isArray(initialResponse.data) ? initialResponse.data : [] }
    } catch (error) {
      console.error("Error loading patients:", error)
      return { data: [] }
    }
  },

  getAllTreatments: async (): Promise<{ data: Treatment[] }> => {
    try {
      const initialResponse = await apiRequest<TreatmentsResponse>(
        "/api/tratamientos?page=1&limit=1",
        {
          method: "GET",
        },
        token,
      )

      if (!initialResponse || !initialResponse.pagination || typeof initialResponse.pagination.total !== "number") {
        return { data: Array.isArray(initialResponse?.data) ? initialResponse.data : [] }
      }

      const total = initialResponse.pagination.total
      if (total > 1) {
        const allTreatmentsResponse = await apiRequest<TreatmentsResponse>(
          `/api/tratamientos?limit=${total}`,
          {
            method: "GET",
          },
          token,
        )
        return { data: Array.isArray(allTreatmentsResponse?.data) ? allTreatmentsResponse.data : [] }
      }

      return { data: Array.isArray(initialResponse.data) ? initialResponse.data : [] }
    } catch (error) {
      console.error("Error loading treatments:", error)
      return { data: [] }
    }
  },
})

// API de usuarios del sistema (odontólogos y administradores)
export const createSystemUsersApi = (token: string) => ({
  getSystemUsers: (page = 1, limit = 100): Promise<SystemUsersResponse> => {
    return apiRequest<SystemUsersResponse>(
      `/odontologos?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  getSystemUserById: (id: string): Promise<SystemUser> => {
    return apiRequest<SystemUser>(
      `/odontologos/${id}`,
      {
        method: "GET",
      },
      token,
    )
  },

  createSystemUser: (userData: CreateSystemUserRequest): Promise<SystemUser> => {
    return apiRequest<SystemUser>(
      "/odontologos",
      {
        method: "POST",
        body: JSON.stringify(userData),
      },
      token,
    )
  },

  updateSystemUser: (id: string, userData: UpdateSystemUserRequest): Promise<SystemUser> => {
    return apiRequest<SystemUser>(
      `/odontologos/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(userData),
      },
      token,
    )
  },

  deleteSystemUser: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(
      `/odontologos/${id}`,
      {
        method: "DELETE",
      },
      token,
    )
  },
})
