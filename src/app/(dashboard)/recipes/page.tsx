import { supabase } from '@/lib/db/supabase'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RecipesPage() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_items (
        quantity,
        materials ( name )
      )
    `)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Recetas</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Define los procesos de producción y componentes físicos (ingredientes).
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/recipes/new"
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          >
            <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Nueva Receta
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-zinc-200 pb-4">
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 sm:text-sm sm:leading-6"
            placeholder="Buscar receta..."
          />
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
                Ingredientes Principales
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900">
                Producción Final
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900">
                Rendimiento (Factor)
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {!recipes || recipes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-zinc-500">
                  No hay recetas cargadas.
                </td>
              </tr>
            ) : (
              recipes.map((recipe) => (
                <tr key={recipe.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-900 sm:pl-6">
                    {recipe.name}
                  </td>
                  <td className="px-3 py-4 text-sm text-zinc-500 max-w-xs truncate">
                    {recipe.recipe_items.map((i: any) => i.materials?.name).join(', ')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                    {recipe.expected_final_weight} kg
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                    {recipe.expected_yield_factor.toFixed(2)}x
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link href={`/recipes/${recipe.id}`} className="text-zinc-600 hover:text-zinc-900">
                      Ver detalle
                    </Link>
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
