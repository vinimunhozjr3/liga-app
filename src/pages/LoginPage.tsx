import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/auth/LoginForm'

export function LoginPage() {
  const { session, loading } = useAuth()

  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-white px-6 pb-8 pt-8">
      <div className="text-center">
        <h1 className="text-6xl font-black italic leading-none tracking-tighter text-emerald-800">
          7<span className="text-amber-500">A</span>0
        </h1>
        <p className="mt-1 text-base font-extrabold uppercase tracking-[0.3em] text-slate-700">
          dos Amigos
        </p>
      </div>

      <img src="/login-hero.png" alt="Amigos do 7 a 0" className="-mb-1 mt-2 w-full max-w-xs" />

      <div className="w-full max-w-sm">
        <p className="mb-4 text-center text-sm text-slate-500">
          Entre com seu e-mail para ver e editar os campeonatos do grupo.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
