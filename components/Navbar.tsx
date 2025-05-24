"use client"

import { useState } from "react"
import Image from "next/image"

const Navbar = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900 text-white py-4 h-18 flex justify-center">
      <div className="container mx-auto flex justify-between items-center px-10">
        {/* Logo */}
        <Image src="/images/logo.png" alt="Logo" width={56} height={56} className="rounded-full h-14 w-14" />

        {/* Menu */}
        <ul className="hidden md:flex space-x-6 text-sm font-semibold tracking-widest text-red-400">
          <li>
            <a href="#Hero" className="hover:text-amber-400">
              INICIO
            </a>
          </li>
          <li>
            <a href="#SobreMi" className="hover:text-amber-400">
              SOBRE MI
            </a>
          </li>
          <li className="relative">
            <button onClick={() => setOpen(!open)} className="hover:text-amber-400 cursor-pointer">
              VER MAS
            </button>

            <ul
              className={`absolute py-3 left-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg transition-opacity duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
              <li>
                <a href="#Servicios" className="hover:text-amber-400 block m-2 ">
                  SERVICIOS
                </a>
              </li>
              <li>
                <a href="#Tratamientos" className="hover:text-amber-400 block m-2 ">
                  TRATAMIENTOS
                </a>
              </li>
              <li>
                <a href="#TiposDeMordidas" className="hover:text-amber-400 block m-2">
                  TIPOS DE MORDIDA
                </a>
              </li>
            </ul>
          </li>

          <li>
            <a href="#AgendarCita" className="hover:text-amber-400">
              AGENDA TU CITA
            </a>
          </li>
          <li>
            <a href="#Contactanos" className="hover:text-amber-400">
              CONTACTO
            </a>
          </li>
        </ul>

        {/* Boton del menu en movil */}
        <button className="md:hidden text-white focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
      </div>

      {/* Menu desplegable */}
      {isOpen && (
        <ul className="tracking-widest md:hidden bg-gray-800 text-center py-4 space-y-2">
          <li>
            <a href="#" className="block hover:text-gray-400">
              INICIO
            </a>
          </li>
          <li>
            <a href="#" className="block hover:text-gray-400">
              SOBRE MI
            </a>
          </li>
          <li>
            <a href="#" className="block hover:text-gray-400">
              TRATAMIENTOS
            </a>
          </li>
          <li>
            <a href="#" className="block hover:text-gray-400">
              TIPOS DE MORDIDA
            </a>
          </li>
          <li>
            <a href="#" className="block hover:text-gray-400">
              SERVICIOS
            </a>
          </li>
          <li>
            <a href="#" className="block hover:text-gray-400">
              AGENDA TU CITA
            </a>
          </li>
          <li>
            <a href="#" className="block hover:text-gray-400">
              CONTACTO
            </a>
          </li>
        </ul>
      )}
      <button
        onClick={onLoginClick}
        className="bg-gray-700 text-red-400 px-4 py-2 rounded hover:bg-red-400 hover:text-gray-900 transition mr-8 cursor-pointer"
      >
        Iniciar Sesión
      </button>
    </nav>
  )
}

export default Navbar
