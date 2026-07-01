import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"

// Auth
import LoginPage from "@/pages/auth/login"
import SignupPage from "@/pages/auth/signup"

// Admin
import AdminLayout from "@/components/layout/admin-layout"
import AdminDashboard from "@/pages/admin/dashboard"
import AdminUsers from "@/pages/admin/users"
import AdminAnalytics from "@/pages/admin/analytics"
import AdminSystem from "@/pages/admin/system"

// Manager
import ManagerLayout from "@/components/layout/manager-layout"
import ManagerDashboard from "@/pages/manager/dashboard"

// Client
import ClientLayout from "@/components/layout/client-layout"
import ClientDashboard from "@/pages/client/dashboard"
import ClientAnalytics from "@/pages/client/analytics"

// Features
import AppLayout from "@/components/layout/app-layout"
import LeadsPage from "@/pages/features/leads"
import AICallsPage from "@/pages/features/ai-calls"
import InteractionsPage from "@/pages/features/interactions"
import CampaignsPage from "@/pages/features/campaigns"
import SupportPage from "@/pages/features/support"
import DocumentsPage from "@/pages/features/documents"

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="aura-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="system" element={<AdminSystem />} />
          </Route>

          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
          </Route>

          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="analytics" element={<ClientAnalytics />} />
          </Route>

          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="ai-calls" element={<AICallsPage />} />
            <Route path="interactions" element={<InteractionsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="documents" element={<DocumentsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
