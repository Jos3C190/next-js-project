import type React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string
  icon?: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        {icon && (
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">{icon}</div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
      </CardContent>
    </Card>
  )
}

export default StatCard
