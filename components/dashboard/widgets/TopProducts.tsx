"use client"

import { motion } from "framer-motion"

interface Product {
  id: number
  name: string
  sales: number
  percentage: number
}

const TopProducts = () => {
  const products: Product[] = [
    { id: 1, name: "Limpieza Dental", sales: 34, percentage: 25 },
    { id: 2, name: "Ortodoncia", sales: 28, percentage: 20 },
    { id: 3, name: "Blanqueamiento", sales: 21, percentage: 15 },
    { id: 4, name: "Extracciones", sales: 17, percentage: 12 },
    { id: 5, name: "Rellenos", sales: 12, percentage: 9 },
  ]

  return (
    <motion.div
      whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
      className="bg-[hsl(var(--card))] rounded-lg shadow-md p-6 h-96 overflow-hidden transition-colors duration-200"
    >
      <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4">Tratamientos Populares</h3>
      <div className="space-y-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between">
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{product.name}</span>
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">{product.sales} pacientes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${product.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className="bg-red-400 h-2.5 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <a
          href="/dashboard/treatments"
          className="inline-block text-sm font-medium text-red-400 hover:text-red-500 transition-colors duration-200"
        >
          Ver todos los tratamientos →
        </a>
      </div>
    </motion.div>
  )
}

export default TopProducts
