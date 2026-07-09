import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/auth/LoginForm'

export function LoginPage() {
  const { session, loading } = useAuth()

  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-slate-900">Liga App</h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Entre com seu e-mail para ver e editar os campeonatos do grupo.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
