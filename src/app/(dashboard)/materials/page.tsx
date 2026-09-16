import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MaterialsPage() {
  // En el futuro: await (await createClient()).auth.getUser() para obtener business_id
  const { data: materials, error } = await (await createClient())
    .from('materials')
    .select(`
      *,
      suppliers ( name )
    `)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Materias Primas</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Gestiona tus insumos, rendimientos y precios de compra.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/materials/new"
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Nueva Materia Prima
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
            name="search"
            id="search"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
            placeholder="Buscar por nombre..."
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
                Categoría
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900">
                Precio / Presentación
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900">
                Costo Base
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900">
                Rendimiento
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {!materials || materials.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                  No hay materias primas cargadas.
                </td>
              </tr>
            ) : (
              materials.map((material) => (
                <tr key={material.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-900 sm:pl-6">
                    {material.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                      {material.category || 'General'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                    ${material.current_price} por {material.presentation_quantity} {material.presentation_unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-zinc-900">
                    ${(material.current_price / material.presentation_quantity).toFixed(2)} / {material.base_unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500">
                    {material.expected_yield * 100}%
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link href={`/materials/${material.id}`} className="text-zinc-600 hover:text-zinc-900">
                      Editar<span className="sr-only">, {material.name}</span>
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
