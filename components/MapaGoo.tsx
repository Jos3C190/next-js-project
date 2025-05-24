"use client"

const MapaGoo = () => {
  return (
    <div data-aos="fade-right" className="w-full h-96 flex justify-center items-center">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3738.5348879365365!2d-88.18742038820331!3d13.47453102995859!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f7b2b004fa45f67%3A0xdc76c4a299786623!2sCLINICA%20DOCTORA%20LINARES!5e1!3m2!1ses-419!2ssv!4v1743140391329!5m2!1ses-419!2ssv"
        width={"100%"}
        height={"100%"}
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}

export default MapaGoo
