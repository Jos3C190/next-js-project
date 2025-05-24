"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { motion } from "framer-motion"
import { ThemeProvider } from "@/context/ThemeContext"

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simular un tiempo de carga breve para mostrar la animación
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-[hsl(var(--dashboard-bg))] transition-colors duration-200">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            )}
          </main>

          {/* Footer simple */}
          <footer className="bg-[hsl(var(--header-bg))] border-t border-[hsl(var(--header-border))] py-3 px-6 text-center text-sm text-[hsl(var(--muted-foreground))] transition-colors duration-200">
            <p>© {new Date().getFullYear()} Clínica Dental Dra. Linares. Todos los derechos reservados.</p>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default Layout
