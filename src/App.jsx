import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import { Login } from './pages/auth/Login'
import { AdminLogin } from './pages/auth/AdminLogin'
import { Register } from './pages/auth/Register'
import { CustomerDashboard } from './pages/customer/Dashboard'
import { Attendance } from './pages/customer/Attendance'
import { Credits } from './pages/customer/Credits'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminCustomers } from './pages/admin/Customers'
import { AdminCredits } from './pages/admin/Credits'
import { CustomerDetail } from './pages/admin/CustomerDetail'
import { AdminSocialLinks } from './pages/admin/SocialLinks'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, isAdmin, loading } = useAuth()
  const token = localStorage.getItem('sb-access-token')

  if (loading) {
    return <LoadingScreen />
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/customer/dashboard" replace />
  }

  if (requiredRole === 'customer' && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />

          <Route path="/customer/dashboard" element={
            <ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>
          } />
          <Route path="/customer/attendance" element={
            <ProtectedRoute requiredRole="customer"><Attendance /></ProtectedRoute>
          } />
          <Route path="/customer/credits" element={
            <ProtectedRoute requiredRole="customer"><Credits /></ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute requiredRole="admin"><AdminCustomers /></ProtectedRoute>
          } />
          <Route path="/admin/customer/:id" element={
            <ProtectedRoute requiredRole="admin"><CustomerDetail /></ProtectedRoute>
          } />
          <Route path="/admin/credits" element={
            <ProtectedRoute requiredRole="admin"><AdminCredits /></ProtectedRoute>
          } />
          <Route path="/admin/social-links" element={
            <ProtectedRoute requiredRole="admin"><AdminSocialLinks /></ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}