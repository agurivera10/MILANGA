'use client'

import { useState, useTransition } from 'react'
import { login, signup } from '@/actions/auth'
import { Package2, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const messageParam = searchParams.get('message')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (mode === 'login') {
          await login(formData)
        } else {
          await signup(formData)
        }
      } catch (err: any) {
        // Next.js redirect() throws a NEXT_REDIRECT error which is expected and should not be caught as failure
        if (err?.message?.includes('NEXT_REDIRECT')) {
          return
        }
        setFormError(err?.message || 'Ocurrió un error inesperado.')
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-zinc-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <div className="p-3 bg-zinc-900 rounded-xl text-white shadow-md">
            <Package2 className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-zinc-900">
          MILANGA <span className="text-zinc-500 font-normal">Cost Lab</span>
        </h2>
        <p className="mt-1 text-center text-sm text-zinc-500">
          Control de costos, pricing y rentabilidad gastronómica
        </p>

        {/* Toggle Selector entre Iniciar Sesión y Registro */}
        <div className="mt-6 flex rounded-lg bg-zinc-200/70 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setFormError(null); }}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${
              mode === 'login'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setFormError(null); }}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${
              mode === 'signup'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Crear Cuenta
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        {(formError || errorParam) && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-700">
            {formError ||
              (errorParam === 'auth' && 'Credenciales incorrectas o usuario no encontrado.') ||
              (errorParam === 'signup' && 'No se pudo crear la cuenta. Verificá si el email ya existe.') ||
              errorParam}
          </div>
        )}

        {messageParam && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800">
            {messageParam}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-900">
              Correo Electrónico
            </label>
            <div className="mt-1.5">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm"
                placeholder="agustina@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-900">
              Contraseña
            </label>
            <div className="mt-1.5">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm"
                placeholder="••••••••"
              />
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-zinc-500">Mínimo 6 caracteres.</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 transition-colors"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login'
              ? (isPending ? 'Iniciando sesión...' : 'Ingresar al Sistema')
              : (isPending ? 'Creando cuenta...' : 'Crear mi Cuenta Gratis')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          {mode === 'login' ? '¿Primera vez acá? ' : '¿Ya tenés una cuenta? '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setFormError(null); }}
            className="font-semibold text-zinc-900 underline hover:text-zinc-700"
          >
            {mode === 'login' ? 'Registrate aquí' : 'Iniciá sesión aquí'}
          </button>
        </p>
      </div>
    </div>
  )
}
