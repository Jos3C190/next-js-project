"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { authApi } from "@/lib/api"

type User = {
  id: string
  nombre: string
  apellido: string
  correo: string
  role: string
  telefono?: string
  especialidad?: string
  direccion?: string
  fecha_nacimiento?: string
}

type AuthContextType = {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  userRole: string | null
  login: (credentials: { correo: string; password: string }) => Promise<boolean>
  logout: () => void
  register: (userData: {
    correo: string
    password: string
    nombre: string
    apellido: string
    telefono: string
    direccion: string
    fecha_nacimiento: string
  }) => Promise<boolean>
  isLoading: boolean
  error: string | null
  isHydrated: boolean
  hasAccess: (module: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

// Definir permisos por rol
const ROLE_PERMISSIONS = {
  admin: [
    "dashboard",
    "patients",
    "appointments",
    "records",
    "treatments",
    "payments",
    "users",
    "reports",
    "statistics",
  ],
  odontologo: ["dashboard", "patients", "appointments", "records", "treatments"],
  paciente: ["my-appointments"],
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Efecto para hidratación del cliente
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Verificar si hay una sesión guardada al cargar (solo en el cliente)
  useEffect(() => {
    if (!isHydrated) return

    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY)
        const storedUser = localStorage.getItem(USER_KEY)

        if (storedToken && storedUser) {
          // Verificar si el token es válido
          try {
            await authApi.verify(storedToken)
            const userData = JSON.parse(storedUser)
            setToken(storedToken)
            setUser(userData)
            setUserRole(userData.role)
            setIsAuthenticated(true)
            console.log("✅ Sesión restaurada correctamente")
          } catch (error) {
            console.error("❌ Token inválido:", error)
            // Limpiar datos de autenticación si el token no es válido
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
            setIsAuthenticated(false)
            setUser(null)
            setToken(null)
            setUserRole(null)
          }
        } else {
          console.log("ℹ️ No hay sesión guardada")
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("❌ Error al cargar la autenticación:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [isHydrated])

  const login = async (credentials: { correo: string; password: string }) => {
    setError(null)
    try {
      setIsLoading(true)
      const response = await authApi.login(credentials)

      // Guardar datos de autenticación
      const userData: User = {
        id: response.user._id,
        nombre: response.user.nombre,
        apellido: response.user.apellido,
        correo: response.user.correo,
        role: response.role,
        telefono: response.user.telefono,
        especialidad: response.user.especialidad,
        direccion: response.user.direccion,
        fecha_nacimiento: response.user.fecha_nacimiento,
      }

      setToken(response.token)
      setUser(userData)
      setUserRole(response.role)
      setIsAuthenticated(true)

      // Guardar en localStorage solo en el cliente
      if (isHydrated) {
        localStorage.setItem(TOKEN_KEY, response.token)
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
      }

      console.log("✅ Login exitoso")
      return true
    } catch (error) {
      console.error("❌ Error de inicio de sesión:", error)
      setError("Credenciales incorrectas. Por favor, inténtelo de nuevo.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    correo: string
    password: string
    nombre: string
    apellido: string
    telefono: string
    direccion: string
    fecha_nacimiento: string
  }) => {
    setError(null)
    try {
      setIsLoading(true)
      const response = await authApi.register(userData)
      console.log("✅ Registro exitoso:", response.message)
      return true
    } catch (error: any) {
      console.error("❌ Error de registro:", error)
      setError(error.message || "Error al registrar. Por favor, inténtelo de nuevo.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setToken(null)
    setUserRole(null)

    // Limpiar localStorage solo en el cliente
    if (isHydrated) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }

    console.log("✅ Logout exitoso")
  }

  // Función para verificar si el usuario tiene acceso a un módulo
  const hasAccess = (module: string): boolean => {
    if (!userRole) return false
    const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || []
    return permissions.includes(module)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        userRole,
        login,
        logout,
        register,
        isLoading,
        error,
        isHydrated,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }

  return context
}
