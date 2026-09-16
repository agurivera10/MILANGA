import { Suspense } from 'react'
import AuthForm from '@/components/auth/auth-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-sm text-zinc-500">Cargando...</div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
