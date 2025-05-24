"use client"

import type React from "react"

import {
  Home,
  Users,
  Calendar,
  FolderOpen,
  Stethoscope,
  LogOut,
  X,
  ChevronRight,
  CreditCard,
  UserCog,
  FileText,
  BarChart,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

interface NavigationItem {
  name: string
  icon: React.ElementType
  path: string
  disabled?: boolean
}

const navigation: NavigationItem[] = [
  { name: "Panel Principal", icon: Home, path: "/dashboard" },
  { name: "Pacientes", icon: Users, path: "/dashboard/patients" },
  { name: "Citas", icon: Calendar, path: "/dashboard/appointments" },
  { name: "Expedientes", icon: FolderOpen, path: "/dashboard/records" },
  { name: "Tratamientos", icon: Stethoscope, path: "/dashboard/treatments" },
  { name: "Pagos y Facturación", icon: CreditCard, path: "/dashboard/payments", disabled: true },
  { name: "Usuarios", icon: UserCog, path: "/dashboard/users", disabled: true },
  { name: "Reportes", icon: FileText, path: "/dashboard/reports", disabled: true },
  { name: "Estadísticas", icon: BarChart, path: "/dashboard/statistics", disabled: true },
]

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Determinar el módulo activo directamente basado en la ruta actual
  const getActiveModuleFromPath = (path: string) => {
    // Ordenamos de más específico a menos específico para evitar coincidencias parciales
    if (path === "/dashboard") return "Panel Principal"
    if (path.startsWith("/dashboard/patients")) return "Pacientes"
    if (path.startsWith("/dashboard/appointments")) return "Citas"
    if (path.startsWith("/dashboard/records")) return "Expedientes"
    if (path.startsWith("/dashboard/treatments")) return "Tratamientos"
    if (path.startsWith("/dashboard/payments")) return "Pagos y Facturación"
    if (path.startsWith("/dashboard/users")) return "Usuarios"
    if (path.startsWith("/dashboard/reports")) return "Reportes"
    if (path.startsWith("/dashboard/statistics")) return "Estadísticas"
    return "Panel Principal" // Default
  }

  // Usar el pathname directamente para determinar el módulo activo
  const activeModule = getActiveModuleFromPath(pathname)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleNavigation = (item: NavigationItem) => {
    if (item.disabled) return

    router.push(item.path)
    if (window.innerWidth < 768) {
      setOpen(false)
    }
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 transition-opacity md:hidden ${
          open ? "opacity-100 ease-out duration-300" : "opacity-0 ease-in duration-200 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-30 w-64 bg-[hsl(var(--sidebar-bg))] transform transition md:translate-x-0 md:relative md:shadow-none transition-colors duration-200 ${
          open ? "translate-x-0 ease-out duration-300" : "-translate-x-full ease-in duration-200"
        }`}
      >
        {/* Sidebar header with logo */}
        <div className="flex items-center justify-between h-20 flex-shrink-0 px-4 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="Logo" width={48} height={48} className="rounded-full mr-3" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-red-400">Clinica Dental</span>
              <span className="text-sm text-amber-400">Dra. Linares</span>
            </div>
          </div>
          <button
            className="md:hidden rounded-md p-2 text-[hsl(var(--sidebar-foreground))] hover:text-white hover:bg-[hsl(var(--sidebar-accent-hover))] focus:outline-none transition-colors duration-200"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4 bg-[hsl(var(--sidebar-bg))]">
          <nav className="mt-2 flex-1 px-3 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item)}
                disabled={item.disabled}
                className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  item.disabled
                    ? "text-gray-400 cursor-not-allowed opacity-50"
                    : activeModule === item.name
                      ? "bg-red-400 text-gray-900"
                      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-amber-400"
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.disabled
                        ? "text-gray-400"
                        : activeModule === item.name
                          ? "text-gray-900"
                          : "text-[hsl(var(--sidebar-foreground))] group-hover:text-amber-400"
                    }`}
                  />
                  {item.name}
                </div>
                {activeModule === item.name && !item.disabled && <ChevronRight className="h-4 w-4 text-gray-900" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout button */}
        <div className="flex-shrink-0 flex border-t border-[hsl(var(--sidebar-border))] p-4 bg-[hsl(var(--sidebar-bg))]">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-amber-400 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-[hsl(var(--sidebar-foreground))]" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
