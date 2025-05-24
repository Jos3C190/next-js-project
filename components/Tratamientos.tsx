"use client"

import type { Tratamiento } from "@/types/tratamiento"
import tratamientos from "@/data/tratamientos"

const Tratamientos = () => {
  return (
    <section id="Tratamientos" className="py-10 px-5 justify-items-center bg-gray-200">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-widest">TRATAMIENTOS</h2>

      <div data-aos="zoom-in" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mb-8 gap-6 max-w-screen-lg">
        {tratamientos.map((tratamiento: Tratamiento, index: number) => (
          <div key={index} className="relative group">
            <img
              src={tratamiento.image || "/placeholder.svg"}
              alt={tratamiento.name}
              className="w-full h-64 object-cover rounded-lg shadow-lg transition-transform group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-[rgba(172,108,108,0.5)] flex flex-col justify-center items-center rounded-lg">
              <h3 className="tracking-widest text-black border-b-2 text-lg font-bold text-center">
                {tratamiento.name}
              </h3>
              <p className="tracking-widest mt-3 text-black p-4">{tratamiento.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Tratamientos
