import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          Liga App
        </Link>
        {user && (
          <button
            onClick={() => signOut()}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Sair
          </button>
        )}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
