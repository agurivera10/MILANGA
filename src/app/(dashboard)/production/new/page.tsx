import { createClient } from '@/utils/supabase/server'
import { createProductionLot } from '@/actions/production'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NewProductionPage() {
  const supabase = await createClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, name, expected_final_weight')
    .eq('active', true)
    .order('name')

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Registrar Producción</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Al guardar, se calculará el costo del lote y se descontará del inventario.
          </p>
        </div>
        <Link href="/production" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Volver
        </Link>
      </div>

      <form action={createProductionLot} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">

          {/* Receta */}
          <div>
            <label htmlFor="recipe_id" className="block text-sm font-medium leading-6 text-zinc-900">
              Receta Producida <span className="text-red-500">*</span>
            </label>
            <select
              name="recipe_id"
              id="recipe_id"
              required
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-zinc-900 sm:text-sm"
            >
              <option value="">Seleccionar receta...</option>
              {(recipes ?? []).map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name} (base: {r.expected_final_weight} kg)
                </option>
              ))}
            </select>
          </div>

          {/* Pesos */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="expected_weight_kg" className="block text-sm font-medium leading-6 text-zinc-900">
                Peso Esperado (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="expected_weight_kg"
                id="expected_weight_kg"
                step="0.1"
                min="0.1"
                required
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm"
                placeholder="15.0"
              />
              <p className="mt-1 text-xs text-zinc-500">¿Cuántos kg planificaste producir este lote?</p>
            </div>
            <div>
              <label htmlFor="actual_weight_kg" className="block text-sm font-medium leading-6 text-zinc-900">
                Peso Real Obtenido (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="actual_weight_kg"
                id="actual_weight_kg"
                step="0.01"
                min="0.01"
                required
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm"
                placeholder="14.3"
              />
              <p className="mt-1 text-xs text-zinc-500">Pesá la producción terminada al finalizar.</p>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium leading-6 text-zinc-900">
              Notas (opcional)
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm"
              placeholder="Ej. Se usó pollo de otra partida por falta de stock habitual..."
            />
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
          <strong>¿Cómo funciona el costo?</strong> El costo total del lote se calcula automáticamente 
          usando los precios actuales de tus materias primas y sus rendimientos esperados. 
          Es un <em>snapshot</em> — si los precios cambian mañana, este lote ya quedó registrado con los precios de hoy.
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/production"
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          >
            Registrar Lote
          </button>
        </div>
      </form>
    </div>
  )
}
