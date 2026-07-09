export function SetupNotice() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Configuração pendente</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Crie um arquivo <code className="rounded bg-slate-100 px-1 py-0.5">.env.local</code> na raiz do projeto
        com <code className="rounded bg-slate-100 px-1 py-0.5">VITE_SUPABASE_URL</code> e{' '}
        <code className="rounded bg-slate-100 px-1 py-0.5">VITE_SUPABASE_ANON_KEY</code> do seu projeto Supabase
        (veja <code className="rounded bg-slate-100 px-1 py-0.5">.env.example</code>).
      </p>
    </div>
  )
}
