import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Store } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ChannelsPage() {
  const { data: channels } = await (await createClient())
    .from('sales_channels')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Canales de Venta</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Gestiona comisiones y costos fijos por operación (ej. PedidosYa, Mercado Pago).
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/channels/new"
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          >
            <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Nuevo Canal
          </Link>
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-zinc-300">
          <thead className="bg-zinc-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 sm:pl-6">
                Nombre
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900">
                Comisión (%)
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900">
                Costo Fijo / Operación
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {!channels || channels.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-zinc-500">
                  No hay canales de venta cargados.
                </td>
              </tr>
            ) : (
              channels.map((channel) => (
                <tr key={channel.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-900 sm:pl-6 flex items-center gap-3">
                    <Store className="h-5 w-5 text-zinc-400" />
                    {channel.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                    {(channel.fee_pct * 100).toFixed(1)}%
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-zinc-900">
                    ${channel.fee_fixed}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${channel.active ? 'bg-green-50 text-green-700' : 'bg-zinc-50 text-zinc-600'}`}>
                      {channel.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
