import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateMaterial } from '@/actions/materials'
import { setActivePresentation } from '@/actions/presentations'
import { CheckCircle2, Circle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch the material
  const { data: material, error } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .eq('business_id', user.id)
    .single()

  if (error || !material) notFound()

  // Fetch presentations if they exist for this material
  const { data: presentations } = await supabase
    .from('material_presentations')
    .select('*')
    .eq('material_id', id)
    .order('price', { ascending: true })

  const hasPresentations = presentations && presentations.length > 0

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Editar Materia Prima</h1>
        <Link href="/materials" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Volver
        </Link>
      </div>

      <form action={updateMaterial} className="space-y-6 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <input type="hidden" name="id" value={material.id} />
        
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-zinc-900">
              Nombre
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={material.name}
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="category" className="block text-sm font-medium leading-6 text-zinc-900">
              Categoría
            </label>
            <div className="mt-2">
              <select
                id="category"
                name="category"
                defaultValue={material.category || ''}
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
              >
                <option value="Carnicería">Carnicería</option>
                <option value="Lácteos">Lácteos</option>
                <option value="Verdulería">Verdulería</option>
                <option value="Almacén">Almacén</option>
                <option value="Secos">Secos</option>
                <option value="Packaging">Packaging</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="current_price" className="block text-sm font-medium leading-6 text-zinc-900">
              Precio Actual ($)
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="current_price"
                id="current_price"
                step="0.01"
                defaultValue={material.current_price}
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="expected_yield" className="block text-sm font-medium leading-6 text-zinc-900">
              Rendimiento Esperado (0.01 a 1.00)
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="expected_yield"
                id="expected_yield"
                step="0.01"
                min="0.01"
                max="1"
                defaultValue={material.expected_yield}
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="presentation_unit" className="block text-sm font-medium leading-6 text-zinc-900">
              U. Presentación
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="presentation_unit"
                id="presentation_unit"
                defaultValue={material.presentation_unit}
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="presentation_quantity" className="block text-sm font-medium leading-6 text-zinc-900">
              Cantidad Present.
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="presentation_quantity"
                id="presentation_quantity"
                step="0.01"
                defaultValue={material.presentation_quantity}
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="base_unit" className="block text-sm font-medium leading-6 text-zinc-900">
              Unidad Base
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="base_unit"
                id="base_unit"
                defaultValue={material.base_unit}
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-5 flex justify-end gap-3">
          <Link
            href="/materials"
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            Actualizar Materia Prima
          </button>
        </div>
      </form>

      {/* ── Presentaciones de Compra ── */}
      {hasPresentations && (
        <div className="mt-8 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-base font-semibold text-zinc-900">Presentaciones de Compra</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              Activá la presentación que compraste hoy — el costo de la receta se recalcula automáticamente.
            </p>
          </div>
          <table className="min-w-full table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[22%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="bg-zinc-50">
              <tr>
                <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Presentación</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">Precio</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">Costo/kg</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">Estado</th>
                <th className="py-3 pl-3 pr-6 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {presentations!.map((pres: any) => {
                const pricePerUnit = pres.price / pres.presentation_quantity
                return (
                  <tr key={pres.id} className={pres.is_active ? 'bg-emerald-50' : 'hover:bg-zinc-50'}>
                    <td className="py-4 pl-6 pr-3">
                      <p className="text-sm font-medium text-zinc-900">{pres.name}</p>
                      <p className="text-xs text-zinc-400">{pres.presentation_quantity} kg</p>
                    </td>
                    <td className="px-3 py-4 text-sm text-right font-semibold text-zinc-900">
                      ${pres.price.toLocaleString('es-AR')}
                    </td>
                    <td className="px-3 py-4 text-sm text-right font-semibold text-emerald-700">
                      ${pricePerUnit.toLocaleString('es-AR', { maximumFractionDigits: 2 })}/kg
                    </td>
                    <td className="px-3 py-4 text-right">
                      {pres.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                          <Circle className="h-3.5 w-3.5" />
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="py-4 pl-3 pr-6 text-right">
                      {!pres.is_active && (
                        <form action={setActivePresentation}>
                          <input type="hidden" name="materialId" value={material.id} />
                          <input type="hidden" name="presentationId" value={pres.id} />
                          <button
                            type="submit"
                            className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
                          >
                            Activar
                          </button>
                        </form>
                      )}
                    </td>
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
