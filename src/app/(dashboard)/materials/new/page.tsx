import { createMaterial } from '@/actions/materials'
import Link from 'next/link'

export default function NewMaterialPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nueva Materia Prima</h1>
        <Link href="/materials" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Volver
        </Link>
      </div>

      <form action={createMaterial} className="space-y-6 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
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
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                placeholder="Ej. Pechuga de Pollo"
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
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
              >
                <option>Carnes</option>
                <option>Secos</option>
                <option>Verduras</option>
                <option>Packaging</option>
                <option>Otros</option>
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
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                placeholder="75000"
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
                defaultValue="1.00"
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
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                placeholder="Cajón"
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
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                placeholder="15"
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
                required
                className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                placeholder="kg"
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
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
