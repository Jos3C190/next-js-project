"use client"

const Footer = ({ onLoginClick }: { onLoginClick: () => void }) => {
  return (
    <footer className="bg-gray-900 w-full h-20 py-6 text-red-400">
      <div className="flex justify-center items-center">
        <p className="text-center">© 2025 Dra. Linares | Clinica Dental</p>
        <button onClick={onLoginClick} className="text-amber-400 hover:text-red-400 ml-16 cursor-pointer">
          Iniciar Sesión
        </button>
      </div>
    </footer>
  )
}

export default Footer
