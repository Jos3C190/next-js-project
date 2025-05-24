"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always include first page
      pages.push(1)

      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if at the beginning
      if (currentPage <= 2) {
        end = 4
      }

      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1) // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push(-2) // -2 represents ellipsis
      }

      // Always include last page
      pages.push(totalPages)
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-[hsl(var(--border))]">
      <div className="flex flex-1 justify-between sm:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            currentPage === 1
              ? "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
              : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]"
          }`}
          aria-label="Previous page"
        >
          Anterior
        </motion.button>
        <span className="text-sm text-[hsl(var(--foreground))]">
          Página {currentPage} de {totalPages}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            currentPage === totalPages
              ? "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
              : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]"
          }`}
          aria-label="Next page"
        >
          Siguiente
        </motion.button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[hsl(var(--foreground))]">
            Mostrando página <span className="font-medium">{currentPage}</span> de{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 transition-colors duration-200 ${
                currentPage === 1
                  ? "cursor-not-allowed bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                  : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]"
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </motion.button>

            {getPageNumbers().map((page, index) => {
              // Render ellipsis
              if (page < 0) {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] border border-[hsl(var(--border))]"
                  >
                    ...
                  </span>
                )
              }

              // Render page number
              return (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    page === currentPage
                      ? "bg-red-400 text-white border border-red-400 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                      : "text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] focus:z-20 focus:outline-offset-0"
                  }`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </motion.button>
              )
            })}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 transition-colors duration-200 ${
                currentPage === totalPages
                  ? "cursor-not-allowed bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                  : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]"
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Pagination
