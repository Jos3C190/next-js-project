import type { Tratamiento } from "@/types/tratamiento"

const tratamientos: Tratamiento[] = [
  {
    name: "ORTODONCIA METÁLICA",
    description:
      "La ortodoncia tradicional está compuesta por pequeños brackets metálicos. Es decir, pequeñas piezas de metal que se colocan de manera individual en cada diente y se unen a través de un hilo muy fino de metal llamado arco.",
    image: "/images/Ortodoncia-Metalica.jpg",
  },
  {
    name: "ORTODONCIA ESTÉTICA",
    description:
      "La ortodoncia estética consiste en utilizar una serie de arcos y de brackets con la diferencia que mejora la imagen y el resultado es practicamente imperceptible.",
    image: "/images/Ortodoncia-Estetica.jpg",
  },
  {
    name: "SISTEMA INVISALIGN",
    description:
      "Invisalign es un sistema de ortodoncia invisible que utiliza férulas transparentes para corregir la posición de los dientes.",
    image: "/images/sistema-invisalign.jpg",
  },
  {
    name: "ORTOPEDIA MAXILOFACIAL",
    description:
      "La cirugia maxilofacial aborda problemas más profundos que afectan la estructura ósea del rostro y la mandibula",
    image: "/images/ortopedia-maxilofacial.jpg",
  },
]

export default tratamientos
