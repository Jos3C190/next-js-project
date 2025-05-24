"use client"

import MapaGoo from "./MapaGoo"

const Contact = () => {
  return (
    <section id="Contactanos" className="py-10 px-4 md:px-52 w-full mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-700 mb-6 tracking-widest">CONTÁCTANOS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div data-aos="fade-left">
          <h3 className="text-xl text-center font-semibold text-red-400 mb-4 tracking-widest">Envíanos un mensaje</h3>
          <form className=" p-6 rounded-lg w-full tracking-widest">
            <div>
              <label className="block text-amber-400 font-semibold mt-2">Nombre</label>
              <input
                type="text"
                placeholder="Ingresa tu nombre"
                className="w-full p-3 border border-gray-700 rounded-sm bg-gray-200 text-gray-700 focus:outline-none focus:right-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mt-2">Correo</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full p-3 border border-gray-700 rounded-sm bg-gray-200 text-gray-700 focus:outline-none focus:right-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mt-2">Teléfono</label>
              <input
                type="tel"
                placeholder="7777-8888"
                className="w-full p-3 border border-gray-700 rounded-sm bg-gray-200 text-gray-700 focus:outline-none focus:right-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mt-2">Mensaje</label>
              <textarea
                rows={4}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full p-3 resize-none border border-gray-700 rounded-sm bg-gray-200 text-gray-700 focus:outline-none focus:right-2 focus:ring-red-400"
              />
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full bg-gray-800 rounded-sm hover:bg-red-400 hover:text-gray-800 text-amber-400 font-bold py-3 transition duration-500"
            >
              ENVIAR
            </button>
          </form>
        </div>
        <div data-aos="fade-right">
          <h3 className="text-xl text-center font-semibold text-red-400 mb-20 tracking-widest">Nuestra Ubicación</h3>
          <MapaGoo />
        </div>
      </div>
    </section>
  )
}

export default Contact
