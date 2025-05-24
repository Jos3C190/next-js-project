"use client"

import dynamic from "next/dynamic"
import Layout from "./Layout"

// Importar el Dashboard con carga dinámica y sin SSR
const Dashboard = dynamic(() => import("./Dashboard"), { ssr: false })

const DashboardApp = () => {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}

export default DashboardApp
