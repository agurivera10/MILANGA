import { createProduct } from '@/actions/products'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  // Obtenemos recetas para el select
  const { data: recipes } = await (await createClient()).from('recipes').select('id, name').order('name')

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nuevo Producto / Presentación</h1>
        <Link href="/products" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Volver
        </Link>
      </div>

      <form action={createProduct} className="space-y-6 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          
          <div className="sm:col-span-6">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-zinc-900">
              Nombre de la Presentación Comercial
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm sm:leading-6"
                placeholder="Ej. Milanesa Clásica Caja 5kg"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="recipe_id" className="block text-sm font-medium leading-6 text-zinc-900">
              Receta Base (Proceso de Producción)
            </label>
            <div className="mt-2">
              <select
                id="recipe_id"
                name="recipe_id"
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
              >
                <option value="">Seleccionar receta...</option>
                {recipes?.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="net_weight" className="block text-sm font-medium leading-6 text-zinc-900">
              Peso Neto (kg)
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="net_weight"
                id="net_weight"
                step="0.01"
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm sm:leading-6"
                placeholder="5"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="sku" className="block text-sm font-medium leading-6 text-zinc-900">
              SKU (Opcional)
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="sku"
                id="sku"
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm sm:leading-6"
                placeholder="MIL-CLA-5KG"
              />
            </div>
          </div>

        </div>

        <div className="border-t border-zinc-200 pt-5 flex justify-end gap-3">
          <Link
            href="/products"
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            Guardar Producto
          </button>
        </div>
      </form>
    </div>
  )
}
