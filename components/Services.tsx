"use client"

import type { Service } from "@/types/service"
import services from "@/data/services"

const Services = () => {
  return (
    <section id="Servicios" className="py-10 px-12 justify-items-center bg-gray-200">
      <h2 className="font-bold text-center text-3xl m-6 text-gray-700 tracking-widest">NUESTROS SERVICIOS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full rounded-lg mb-4 text-center max-w-screen-lg">
        {services?.map((service: Service, index: number) => (
          <div
            data-aos="flip-left"
            key={index}
            className="w-full p-2 border-4 border-amber-400 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 bg-gray-900"
          >
            <img
              src={service.image || "/placeholder.svg"}
              alt={service.name}
              className="w-full h-40 mx-auto mb-4 object-cover rounded-lg"
            />
            <h3 className="tracking-widest text-xl font-semibold mb-2 text-red-400">{service.name}</h3>
            <p className="text-amber-400 tracking-widest text-sm leading-relaxed">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Services
