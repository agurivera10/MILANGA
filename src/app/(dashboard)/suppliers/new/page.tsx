import { createSupplier } from '@/actions/suppliers'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NewSupplierPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nuevo Proveedor</h1>
        <Link href="/suppliers" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Volver
        </Link>
      </div>

      <form action={createSupplier} className="space-y-6 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          
          <div className="sm:col-span-6">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-zinc-900">
              Nombre o Razón Social
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                placeholder="Ej. Frigorífico Los Andes"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="contact_info" className="block text-sm font-medium leading-6 text-zinc-900">
              Información de Contacto (Teléfono, WhatsApp, Email)
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="contact_info"
                id="contact_info"
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                placeholder="11 1234-5678"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="payment_terms" className="block text-sm font-medium leading-6 text-zinc-900">
              Términos y Forma de Pago
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="payment_terms"
                id="payment_terms"
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                placeholder="Efectivo contra entrega, Transferencia 30 días, etc."
              />
            </div>
          </div>

        </div>

        <div className="border-t border-zinc-200 pt-5 flex justify-end gap-3">
          <Link
            href="/suppliers"
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            Guardar Proveedor
          </button>
        </div>
      </form>
    </div>
  )
}
