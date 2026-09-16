import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Factory } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatARS(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ProductionPage() {
  const supabase = await createClient()
  const { data: lots } = await supabase
    .from('production_lots')
    .select('*, recipes(name)')
    .order('produced_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Producción</h1>
          <p className="mt-1 text-sm text-zinc-600">Historial de lotes producidos y movimientos de stock.</p>
        </div>
        <Link
          href="/production/new"
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Registrar Producción
        </Link>
      </div>

      {!lots || lots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
          <Factory className="h-10 w-10 text-zinc-400 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-700">Sin lotes de producción</h3>
          <p className="mt-1 text-xs text-zinc-500">Registrá tu primera producción para comenzar a ver el historial.</p>
          <Link
            href="/production/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" /> Registrar Producción
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:pl-6">Lote</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Receta</th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Esperado (kg)</th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Real (kg)</th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Rendimiento</th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Costo Total</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lots.map((lot: any) => {
                const yield_pct = lot.actual_weight_kg / lot.expected_weight_kg
                const costPerKg = lot.actual_weight_kg > 0 ? lot.total_cost / lot.actual_weight_kg : 0
                return (
                  <tr key={lot.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-mono font-medium text-zinc-900 sm:pl-6">
                      {lot.lot_number}
                    </td>
                    <td className="px-3 py-3 text-sm text-zinc-700">{lot.recipes?.name ?? '—'}</td>
                    <td className="px-3 py-3 text-sm text-right text-zinc-500">{lot.expected_weight_kg} kg</td>
                    <td className="px-3 py-3 text-sm text-right font-medium text-zinc-900">{lot.actual_weight_kg} kg</td>
                    <td className="px-3 py-3 text-sm text-right">
                      <span className={`font-semibold ${yield_pct >= 0.95 ? 'text-green-700' : yield_pct >= 0.85 ? 'text-amber-600' : 'text-red-600'}`}>
                        {(yield_pct * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-right text-zinc-700">
                      <div>{formatARS(lot.total_cost)}</div>
                      <div className="text-xs text-zinc-400">{formatARS(costPerKg)}/kg</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-zinc-500">{formatDate(lot.produced_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
