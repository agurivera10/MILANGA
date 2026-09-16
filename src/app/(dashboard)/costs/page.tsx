import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { createFixedCost, createVariableCost } from '@/actions/costs'
import { Plus, Minus } from 'lucide-react'

export const dynamic = 'force-dynamic'

const periodicityLabel: Record<string, string> = {
  monthly: 'Mensual',
  weekly: 'Semanal',
  annual: 'Anual',
}

const variableTypeLabel: Record<string, string> = {
  per_kg: 'Por kg',
  per_unit: 'Por unidad',
  percentage: 'Porcentaje (%)',
}

export default async function CostsPage() {
  const supabase = await createClient()
  const [{ data: fixedCosts }, { data: variableCosts }] = await Promise.all([
    supabase.from('fixed_costs').select('*').eq('active', true).order('name'),
    supabase.from('variable_costs').select('*').eq('active', true).order('name'),
  ])

  const totalMonthlyFixed = (fixedCosts || []).reduce((acc: number, c: any) => {
    const monthly =
      c.periodicity === 'annual' ? c.amount / 12 :
      c.periodicity === 'weekly' ? c.amount * 4.33 :
      c.amount
    return acc + monthly
  }, 0)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Costos Fijos y Variables</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Registra la estructura de costos del negocio para un cálculo de margen completo.
        </p>
      </div>

      {/* ── COSTOS FIJOS ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Costos Fijos</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Estructura mensual estimada:{' '}
              <span className="font-semibold text-zinc-800">${totalMonthlyFixed.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
            </p>
          </div>
        </div>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-zinc-300">
            <thead className="bg-zinc-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 sm:pl-6">Nombre</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-zinc-900">Monto ($)</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-zinc-900">Periodicidad</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-zinc-900">Equiv. Mensual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {!fixedCosts || fixedCosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-zinc-500">
                    Aún no cargaste costos fijos.
                  </td>
                </tr>
              ) : (
                fixedCosts.map((c: any) => {
                  const monthly =
                    c.periodicity === 'annual' ? c.amount / 12 :
                    c.periodicity === 'weekly' ? c.amount * 4.33 :
                    c.amount
                  return (
                    <tr key={c.id}>
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-zinc-900 sm:pl-6">{c.name}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">${c.amount.toLocaleString('es-AR')}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">{periodicityLabel[c.periodicity] ?? c.periodicity}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-zinc-900">${monthly.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario inline para nuevo costo fijo */}
        <details className="group">
          <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900">
            <Plus className="h-4 w-4 text-zinc-500 group-open:hidden" />
            <Minus className="hidden h-4 w-4 text-zinc-500 group-open:block" />
            Agregar Costo Fijo
          </summary>
          <form action={createFixedCost} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Nombre</label>
              <input name="name" required placeholder="Ej. Alquiler"
                className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 sm:text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Monto ($)</label>
              <input name="amount" type="number" step="100" required placeholder="150000"
                className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 sm:text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Periodicidad</label>
              <select name="periodicity"
                className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 sm:text-sm">
                <option value="monthly">Mensual</option>
                <option value="weekly">Semanal</option>
                <option value="annual">Anual</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit"
                className="w-full rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800">
                Guardar
              </button>
            </div>
          </form>
        </details>
      </section>

      {/* ── COSTOS VARIABLES ADICIONALES ── */}
      <section className="space-y-4">
        <div className="border-b border-zinc-200 pb-3">
          <h2 className="text-base font-semibold text-zinc-900">Costos Variables Adicionales</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Energía, gas, materiales de limpieza, comisiones de pago, etc.</p>
        </div>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-zinc-300">
            <thead className="bg-zinc-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 sm:pl-6">Nombre</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-zinc-900">Tipo</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-zinc-900">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {!variableCosts || variableCosts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-zinc-500">
                    Aún no cargaste costos variables adicionales.
                  </td>
                </tr>
              ) : (
                variableCosts.map((c: any) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-zinc-900 sm:pl-6">{c.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500">{variableTypeLabel[c.type] ?? c.type}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-zinc-900">
                      {c.type === 'percentage' ? `${c.amount}%` : `$${c.amount}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <details className="group">
          <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900">
            <Plus className="h-4 w-4 text-zinc-500 group-open:hidden" />
            <Minus className="hidden h-4 w-4 text-zinc-500 group-open:block" />
            Agregar Costo Variable
          </summary>
          <form action={createVariableCost} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Nombre</label>
              <input name="name" required placeholder="Ej. Gas de producción"
                className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 sm:text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Tipo</label>
              <select name="type"
                className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 sm:text-sm">
                <option value="per_kg">Por kg</option>
                <option value="per_unit">Por unidad</option>
                <option value="percentage">Porcentaje (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Valor</label>
              <input name="amount" type="number" step="0.01" required placeholder="250"
                className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 sm:text-sm" />
            </div>
            <div className="flex items-end">
              <button type="submit"
                className="w-full rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800">
                Guardar
              </button>
            </div>
          </form>
        </details>
      </section>
    </div>
  )
}
