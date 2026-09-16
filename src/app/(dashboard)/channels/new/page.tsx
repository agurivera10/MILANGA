import { createChannel } from '@/actions/channels'
import Link from 'next/link'

export default function NewChannelPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nuevo Canal de Venta</h1>
        <Link href="/channels" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Volver
        </Link>
      </div>

      <form action={createChannel} className="space-y-6 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          
          <div className="sm:col-span-6">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-zinc-900">
              Nombre del Canal
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm sm:leading-6"
                placeholder="Ej. PedidosYa, Venta Directa, MercadoPago"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="fee_pct" className="block text-sm font-medium leading-6 text-zinc-900">
              Comisión Porcentual (%)
            </label>
            <div className="mt-2 relative rounded-md shadow-sm">
              <input
                type="number"
                name="fee_pct"
                id="fee_pct"
                step="0.01"
                min="0"
                max="100"
                defaultValue="0"
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="fee_fixed" className="block text-sm font-medium leading-6 text-zinc-900">
              Costo Fijo por Operación ($)
            </label>
            <div className="mt-2 relative rounded-md shadow-sm">
              <input
                type="number"
                name="fee_fixed"
                id="fee_fixed"
                step="0.01"
                min="0"
                defaultValue="0"
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-5 flex justify-end gap-3">
          <Link
            href="/channels"
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            Guardar Canal
          </button>
        </div>
      </form>
    </div>
  )
}
