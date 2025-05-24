"use client"

const Hero = () => {
  return (
    <section
      id="Hero"
      className="relative w-full h-screen bg-cover bg-center pt-16"
      style={{ backgroundImage: "url('/images/img-Hero.jpg')" }}
    >
      {/* contenido verticalmente y a la izquierda */}
      <div data-aos="fade-right" className="absolute top-1/2 left-10 transform -translate-y-1/4">
        <h1 className="text-4xl md:text-4xl font-bold text-red-400 tracking-widest">Clinica Dental Dra. Linares</h1>
        <p className="mt-4 text-lg md:text-1xl max-w-lg text-gray-900 tracking-widest">
          Profesional en tratamientos dentales con amplia experiencia y trayectoria.
        </p>

        <button
          className="bg-gray-800 p-3 mt-4 cursor-pointer text-red-400 font-bold rounded-sm hover:bg-red-400 hover:text-gray-700 transition duration-500"
          onClick={() => {
            document.getElementById("AgendarCita")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          AGENDAR CITA
        </button>
      </div>
    </section>
  )
}

export default Hero
