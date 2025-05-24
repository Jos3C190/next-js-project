"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Navbar from "./Navbar"
import Hero from "./Hero"
import AboutMe from "./AboutMe"
import Tratamientos from "./Tratamientos"
import TiposMordida from "./TiposMordida"
import Services from "./Services"
import Contact from "./Contact"
import NuestrosDatos from "./NuestrosDatos"
import Footer from "./Footer"
import LoginModal from "./LoginModal"

// Importar Calendar con carga dinámica para evitar problemas de SSR
const Calendar = dynamic(() => import("./Calendar"), {
  ssr: false,
  loading: () => (
    <div className="py-10 bg-gray-200 text-center">
      <h2 className="font-bold text-3xl text-gray-800 mb-8">HAZ TU CITA</h2>
      <p className="text-gray-600">Cargando calendario...</p>
    </div>
  ),
})

const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleLoginClick = () => {
    setIsLoginOpen(true)
  }

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Navbar onLoginClick={handleLoginClick} />
      <Hero />
      <AboutMe />
      <Tratamientos />
      <TiposMordida />
      <Services />
      <Calendar onDateSelect={setSelectedDate} />
      <Contact />
      <NuestrosDatos />
      <Footer onLoginClick={handleLoginClick} />
    </>
  )
}

export default LandingPage
