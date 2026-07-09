import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { SetupNotice } from './components/SetupNotice'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { CompetitionRouter } from './pages/CompetitionRouter'
import { CompetitionSettingsPage } from './pages/CompetitionSettingsPage'

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col bg-white">
        <SetupNotice />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/competitions/:id"
              element={
                <ProtectedRoute>
                  <CompetitionRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/competitions/:id/settings"
              element={
                <ProtectedRoute>
                  <CompetitionSettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
