import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type Mode = 'signin' | 'signup'

export function LoginForm() {
  const { signInWithPassword, signUpWithPassword } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'signed-up' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')
    try {
      if (mode === 'signup') {
        await signUpWithPassword(email, password)
        setStatus('signed-up')
      } else {
        await signInWithPassword(email, password)
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage(getErrorMessage(err, 'Erro ao entrar.'))
    }
  }

  if (status === 'signed-up') {
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-800">
        Conta criada! Já pode entrar com esse e-mail e senha.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          required
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
          Senha
        </label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          placeholder="mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
      <Button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Enviando...' : mode === 'signup' ? 'Criar conta' : 'Entrar'}
      </Button>
      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
          setStatus('idle')
          setErrorMessage('')
        }}
        className="text-sm text-slate-500 hover:underline"
      >
        {mode === 'signin' ? 'Ainda não tenho conta — criar uma' : 'Já tenho conta — entrar'}
      </button>
    </form>
  )
}
