import { login, signup } from '@/actions/auth'
import { Package2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const error = params?.error
  const message = params?.message

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-zinc-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <Package2 className="h-10 w-10 text-zinc-900" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-zinc-900">
          MILANGA Cost Lab
        </h2>
        <p className="mt-1 text-center text-sm text-zinc-500">
          Gestión económica, costos y pricing profesional
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-700">
            {error === 'auth' && 'Credenciales incorrectas o usuario no encontrado.'}
            {error === 'signup' && 'No se pudo completar el registro. Verificá si el correo ya existe o si requiere confirmación.'}
            {error === 'confirm' && 'Revisá tu casilla de correo para confirmar tu cuenta antes de iniciar sesión.'}
            {error !== 'auth' && error !== 'signup' && error !== 'confirm' && String(error)}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800">
            {String(message)}
          </div>
        )}

        <form className="space-y-5" action={login}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-zinc-900">
              Correo Electrónico
            </label>
            <div className="mt-1.5">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-zinc-900">
                Contraseña
              </label>
            </div>
            <div className="mt-1.5">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              formAction={signup}
              className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Crear cuenta nueva
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
