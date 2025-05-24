"use client"

const NuestrosDatos = () => {
  return (
    <section className="py-10 px-4 md:px-52 w-full mx-auto bg-gray-200">
      <div data-aos="flip-up" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 tracking-widest">
        <div>
          <h2 className="mb-4 font-bold text-gray-800">HORARIOS</h2>
          <p>Lunes a Viernes</p>
          <p>8:00 am a 4:00 pm</p>

          <p>Sábados</p>
          <p>8:00 am a 12:00 md</p>
        </div>

        <div>
          <h2 className="mb-4 font-bold text-gray-800">CORREO</h2>
          <p>dra.linares@gmail.com</p>
        </div>

        <div>
          <h2 className="mb-4 font-bold text-gray-800">DIRECCIÓN</h2>
          <h3 className="font-bold mb-1 ">San Miguel</h3>
          <p>Calle los Almendros Poligono A casa #15, la calle del Gimnasio nautilyus, San Miguel, El Salvador.</p>
        </div>

        <div>
          <h2 className="mb-4 font-bold text-gray-800">INFORMACIÓN DE CONTACTO</h2>
          <p>(+503) 7850-9957</p>
        </div>
      </div>
    </section>
  )
}

export default NuestrosDatos
