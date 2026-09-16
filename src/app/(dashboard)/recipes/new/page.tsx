'use client'

import { useState, useEffect } from 'react'
import { createRecipe } from '@/actions/recipes'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function NewRecipePage() {
  const router = useRouter()
  const supabase = createClient()
  const [materials, setMaterials] = useState<any[]>([])
  const [items, setItems] = useState([{ material_id: '', quantity: 0, unit: 'kg' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMaterials() {
      const { data } = await supabase.from('materials').select('id, name, base_unit').order('name')
      if (data) setMaterials(data)
    }
    loadMaterials()
  }, [])

  const handleAddItem = () => {
    setItems([...items, { material_id: '', quantity: 0, unit: 'kg' }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const payload = {
      name: formData.get('name') as string,
      expected_final_weight: Number(formData.get('expected_final_weight')),
      labor_hours: Number(formData.get('labor_hours')),
      labor_people: Number(formData.get('labor_people')),
      items: items.map(item => ({
        ...item,
        quantity: Number(item.quantity)
      }))
    }

    try {
      const result = await createRecipe(payload)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/recipes')
      }
    } catch (err) {
      setError('Ocurrió un error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nueva Receta</h1>
        <Link href="/recipes" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Datos Principales */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
          <h2 className="text-base font-semibold leading-7 text-zinc-900 border-b border-zinc-200 pb-2">
            Detalles de la Receta
          </h2>
          
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-zinc-900">
                Nombre de la Receta
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm"
                placeholder="Ej. Milanesa de Pollo Clásica"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="expected_final_weight" className="block text-sm font-medium leading-6 text-zinc-900">
                Producción Final (kg)
              </label>
              <input
                type="number"
                name="expected_final_weight"
                id="expected_final_weight"
                step="0.01"
                required
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm"
                placeholder="15.8"
              />
              <p className="mt-1 text-xs text-zinc-500">Cuánto se espera obtener al final del proceso.</p>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="labor_hours" className="block text-sm font-medium leading-6 text-zinc-900">
                Horas de Producción
              </label>
              <input
                type="number"
                name="labor_hours"
                id="labor_hours"
                step="0.5"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm"
                placeholder="3"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="labor_people" className="block text-sm font-medium leading-6 text-zinc-900">
                Cantidad de Operarios
              </label>
              <input
                type="number"
                name="labor_people"
                id="labor_people"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm"
                placeholder="2"
              />
            </div>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h2 className="text-base font-semibold leading-7 text-zinc-900">
              Ingredientes
            </h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-sm text-zinc-900 font-medium hover:text-zinc-600"
            >
              <Plus className="h-4 w-4" /> Agregar Ingrediente
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-4 relative bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Materia Prima</label>
                  <select
                    required
                    value={item.material_id}
                    onChange={(e) => handleItemChange(index, 'material_id', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (en {m.base_unit})</option>
                    ))}
                  </select>
                </div>
                
                <div className="w-32">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    required
                    step="0.001"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm"
                  />
                </div>

                <div className="w-24">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Unidad</label>
                  <input
                    type="text"
                    required
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 sm:text-sm bg-zinc-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="mb-1.5 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/recipes"
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Receta'}
          </button>
        </div>
      </form>
    </div>
  )
}
