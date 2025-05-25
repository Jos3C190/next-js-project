"use client"

import type { TipoMordida } from "@/types/tipoMordida"
import tiposMordida from "@/data/tiposMordida"

const TiposMordida = () => {
  return (
    <section id="TiposDeMordidas" className="py-10 px-5 justify-items-center bg-white">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-widest">TIPOS DE MORDIDA</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8 text-center gap-6 max-w-screen-lg">
        {tiposMordida.map((tipoMordida: TipoMordida, index: number) => (
          <div data-aos="flip-left" key={index} className="relative">
            <h3 className="absolute w-full tracking-widest font-bold text-red-400 bg-gray-800 p-2 rounded-t-lg">
              {tipoMordida.name}
            </h3>
            <img
              src={tipoMordida.image || "/placeholder.svg"}
              alt={tipoMordida.name}
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default TiposMordida
