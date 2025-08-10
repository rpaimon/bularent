"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { HomePage } from "@/pages/HomePage"
import { AuthPage } from "@/pages/AuthPage"
import { PropertiesPage } from "@/pages/PropertiesPage"
import { PropertyDetailPage } from "@/pages/PropertyDetailPage"
import { AdminDashboard } from "@/pages/AdminDashboard"
import { LandlordDashboard } from "@/pages/LandlordDashboard"
import { TenantDashboard } from "@/pages/TenantDashboard"
import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading BulaRent...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/landlord" element={<LandlordDashboard />} />
          <Route path="/tenant" element={<TenantDashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
