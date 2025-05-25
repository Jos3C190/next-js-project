"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const AboutMe = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <section id="SobreMi" className="py-10 px-4 md:px-52 w-full mx-auto bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        <div
          className={`${isClient ? "animate-fade-in" : ""} h-full w-full`}
          {...(isClient && { "data-aos": "fade-right" })}
        >
          <h2 className="text-2xl font-bold text-gray-700 mb-5 leading-10 tracking-[0.10em]">
            Dra. Linares tu ortodoncista de confianza para trabajar tu sonrisa.
          </h2>

          <p className="text-gray-700 tracking-widest leading-8">
            Soy una odontóloga con muchos años de preparación académica para tener los mejores conocimientos para
            aplicarlos dia con dia y mejorar tu sonrisa cada dia. Me he especializado en ortodoncia que es el área de la
            odontología que se encarga del estudio, prevención, diagnóstico y el tratamiento de las anomalías de la
            forma, posición, relación, alineación y la función de los dientes y sus bases óseas.
          </p>
        </div>
        <div className={isClient ? "animate-fade-in" : ""} {...(isClient && { "data-aos": "fade-left" })}>
          <Image
            className="felx justify-items-center w-[80%] object-cover ml-10"
            src="/images/AboutMe.jpeg"
            alt="SobreMi"
            width={500}
            height={500}
          />
        </div>
      </div>
    </section>
  )
}

export default AboutMe
