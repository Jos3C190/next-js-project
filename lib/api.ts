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
}

export interface Doctor {
  _id: string
  nombre: string
  apellido: string
  especialidad: string
}

export interface Appointment {
  _id: string
  pacienteId?: Patient
  pacienteTemporalId?: Patient
  odontologoId: Doctor
  fecha: string
  hora: string
  motivo: string
  estado: string
  createdAt: string
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
    return simulateApiResponse<T>(endpoint, options.method || "GET")
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    if (response.status === 401) {
      // Token inválido, limpiar localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/"
      }
      throw new Error("Token inválido")
    }
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

// Simulador para modo desarrollo
function simulateApiResponse<T>(endpoint: string, method: string): Promise<T> {
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
        resolve({
          activities: [
            {
              _id: "1",
              type: "cita",
              action: "created",
              description: "Nueva cita programada para María García",
              userId: "u1",
              userRole: "Paciente",
              userName: "María García",
              timestamp: new Date().toISOString(),
            },
            {
              _id: "2",
              type: "tratamiento",
              action: "completed",
              description: "Tratamiento de ortodoncia completado",
              userId: "u2",
              userRole: "Doctor",
              userName: "Dr. López",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
        } as T)
      } else if (endpoint === "/api/citas") {
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
              fecha: "2025-01-23T00:00:00.000Z",
              hora: "10:00",
              motivo: "Limpieza dental",
              estado: "pendiente",
              createdAt: "2025-01-20T10:00:00.000Z",
            },
            {
              _id: "2",
              pacienteId: {
                _id: "p2",
                nombre: "Juan",
                apellido: "Pérez",
                correo: "juan@test.com",
              },
              odontologoId: {
                _id: "d1",
                nombre: "José",
                apellido: "López",
                especialidad: "Ortodoncia",
              },
              fecha: "2025-01-24T00:00:00.000Z",
              hora: "14:00",
              motivo: "Consulta",
              estado: "confirmada",
              createdAt: "2025-01-20T10:00:00.000Z",
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

  getActivity: (limit = 10): Promise<{ activities: Activity[] }> => {
    return apiRequest<{ activities: Activity[] }>(
      `/api/dashboard/activity?limit=${limit}`,
      {
        method: "GET",
      },
      token,
    )
  },

  getAllAppointments: (): Promise<{ data: Appointment[]; pagination: any }> => {
    return apiRequest<{ data: Appointment[]; pagination: any }>(
      "/api/citas",
      {
        method: "GET",
      },
      token,
    )
  },
})
