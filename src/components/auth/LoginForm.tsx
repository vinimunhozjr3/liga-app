import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function LoginForm() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')
    try {
      await signInWithEmail(email)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setErrorMessage(getErrorMessage(err, 'Erro ao enviar o link.'))
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-800">
        Link enviado! Verifique seu e-mail <strong>{email}</strong> e clique no link para entrar.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700" htmlFor="email">
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
      {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
      <Button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando...' : 'Enviar link mágico'}
      </Button>
    </form>
  )
}
