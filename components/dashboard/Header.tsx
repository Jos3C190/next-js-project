"use client"

import { Menu, Calendar, Clock, Moon, Sun } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  // Actualizar la fecha y hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // Formatear la fecha en español
  const formatDate = () => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(currentDateTime)
  }

  // Formatear la hora en formato de 12 horas
  const formatTime = () => {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(currentDateTime)
  }

  // Obtener el nombre completo del usuario
  const getUserName = () => {
    if (user?.nombre && user?.apellido) {
      return `${user.nombre} ${user.apellido}`
    } else if (user?.nombre) {
      return user.nombre
    } else if (user?.correo) {
      // Fallback: extraer nombre del email si no hay nombre
      const namePart = user.correo.split("@")[0]
      return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase()
    }
    return "Usuario"
  }

  // Obtener la inicial del nombre
  const getInitial = () => {
    if (user?.nombre) {
      return user.nombre.charAt(0).toUpperCase()
    } else if (user?.correo) {
      return user.correo.charAt(0).toUpperCase()
    }
    return "U"
  }

  // Formatear el rol del usuario
  const getUserRole = () => {
    if (!user?.role) return "Usuario"

    // Mapear roles del backend a nombres más amigables
    const roleMap: { [key: string]: string } = {
      admin: "Administrador",
      doctor: "Doctor",
      dentista: "Dentista",
      ortodoncista: "Ortodoncista",
      asistente: "Asistente",
      recepcionista: "Recepcionista",
      user: "Usuario",
      patient: "Paciente",
    }

    return roleMap[user.role.toLowerCase()] || user.role
  }

  return (
    <header className="bg-[hsl(var(--header-bg))] border-b border-[hsl(var(--header-border))] shadow-sm z-10 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card-hover))] focus:outline-none transition-colors duration-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Abrir menú</span>
              <Menu className="h-6 w-6" />
            </button>

            {/* Fecha y hora */}
            <div className="hidden md:flex items-center ml-4 text-[hsl(var(--muted-foreground))]">
              <div className="flex items-center mr-4">
                <Calendar className="h-4 w-4 mr-2 text-red-400" />
                <span className="text-sm font-medium capitalize">{formatDate()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-amber-400" />
                <span className="text-sm font-medium">{formatTime()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme toggle button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--card-hover))] transition-colors duration-200"
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">{getUserName()}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{getUserRole()}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-red-400 flex items-center justify-center text-white font-medium">
              {getInitial()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
