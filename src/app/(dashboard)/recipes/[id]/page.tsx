import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Package2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch recipe - business_id = user.id per trigger; RLS also enforces access
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_items (
        id,
        quantity,
        unit,
        materials (
          id,
          name,
          category,
          current_price,
          presentation_quantity,
          base_unit,
          expected_yield
        )
      )
    `)
    .eq('id', id)
    .eq('business_id', user.id)
    .single()



  if (error || !recipe) {
    notFound()
  }

  // Calculate cost for each item
  const itemsWithCost = (recipe.recipe_items as any[]).map((item) => {
    const mat = item.materials
    if (!mat) return { ...item, cost: 0 }
    // Price per base unit = price per presentation / quantity per presentation
    const pricePerBaseUnit = mat.current_price / mat.presentation_quantity
    // Adjust for yield (e.g. 0.95 yield means you need 1/0.95 = 1.053 kg to get 1 kg net)
    const adjustedPricePerUnit = pricePerBaseUnit / mat.expected_yield
    const cost = adjustedPricePerUnit * item.quantity
    return { ...item, cost, pricePerBaseUnit, adjustedPricePerUnit }
  })

  const totalCost = itemsWithCost.reduce((sum, i) => sum + i.cost, 0)
  const expectedWeight = recipe.expected_final_weight || 1
  const costPerKg = totalCost / expectedWeight

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/recipes"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Recetas
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{recipe.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Producción esperada: <span className="font-semibold text-zinc-900">{expectedWeight} kg</span>
          </p>
        </div>
      </div>

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Costo Total del Lote</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            ${totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-zinc-400">para {expectedWeight} kg finales</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Costo por Kg</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            ${costPerKg.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-zinc-400">por kg de milanesa cruda</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Ingredientes</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{itemsWithCost.length}</p>
          <p className="mt-1 text-xs text-zinc-400">materias primas en la receta</p>
        </div>
      </div>

      {/* Ingredient Breakdown */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-base font-semibold text-zinc-900">Desglose de Costos por Ingrediente</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Los precios incluyen ajuste por rendimiento de cada insumo.</p>
        </div>
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">Ingrediente</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">Cantidad</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">Precio/Unidad</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">Rinde</th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-zinc-600 uppercase tracking-wide pr-6">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {itemsWithCost.map((item: any) => {
              const mat = item.materials
              const pct = totalCost > 0 ? (item.cost / totalCost) * 100 : 0
              return (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="py-4 pl-6 pr-3">
                    <div className="font-medium text-sm text-zinc-900">{mat?.name ?? '—'}</div>
                    <div className="text-xs text-zinc-400">{mat?.category ?? ''}</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-zinc-600">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-3 py-4 text-sm text-zinc-600">
                    ${item.adjustedPricePerUnit?.toLocaleString('es-AR', { maximumFractionDigits: 0 }) ?? '—'}/{mat?.base_unit}
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      mat?.expected_yield < 1 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {mat ? `${(mat.expected_yield * 100).toFixed(0)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-4 pr-6 text-right">
                    <div className="text-sm font-semibold text-zinc-900">
                      ${item.cost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-zinc-400">{pct.toFixed(1)}% del total</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-zinc-50">
            <tr>
              <td colSpan={4} className="py-4 pl-6 pr-3 text-sm font-bold text-zinc-900">
                TOTAL
              </td>
              <td className="py-4 pr-6 text-right text-sm font-bold text-zinc-900">
                ${totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link
          href={`/production/new`}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
        >
          <Package2 className="h-4 w-4" />
          Registrar Producción con esta Receta
        </Link>
      </div>
    </div>
  )
}
