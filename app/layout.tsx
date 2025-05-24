import type React from "react"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import AosInitializer from "@/components/AosInitializer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Clinica Dental Dr. Linares",
  description: "Servicios dentales profesionales"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {/* AosInitializer ahora maneja errores internamente */}
          <AosInitializer />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
