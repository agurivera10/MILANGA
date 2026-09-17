import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateProduct } from '@/actions/products'
import { ArrowLeft, Package2, ChefHat, Scale, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch product with recipe and recipe items
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      recipes (
        id,
        name,
        expected_final_weight,
        recipe_items (
          quantity,
          unit,
          materials (
            current_price,
            presentation_quantity,
            expected_yield
          )
        )
      )
    `)
    .eq('id', id)
    .eq('business_id', user.id)
    .single()

  if (error || !product) notFound()

  // Fetch all recipes for the select dropdown
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, name')
    .eq('business_id', user.id)
    .order('name')

  // Calculate recipe cost per kg
  let recipeCostPerKg = 0
  if (product.recipes?.recipe_items) {
    const totalRecipeCost = product.recipes.recipe_items.reduce((sum: number, item: any) => {
      const mat = item.materials
      if (!mat || !mat.presentation_quantity) return sum
      const pricePerUnit = mat.current_price / mat.presentation_quantity
      const adjustedPrice = pricePerUnit / (mat.expected_yield || 1)
      return sum + (adjustedPrice * item.quantity)
    }, 0)
    const weight = product.recipes.expected_final_weight || 1
    recipeCostPerKg = totalRecipeCost / weight
  }

  const rawProductCost = recipeCostPerKg * product.net_weight

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Productos
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-900">
            <Package2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{product.name}</h1>
            <p className="text-sm text-zinc-500">
              Presentación comercial de {product.net_weight} kg · {product.sku ? `SKU: ${product.sku}` : 'Sin SKU'}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Costo Insumos Presentación
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            ${rawProductCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Costo de los {product.net_weight} kg de producto crudo
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <ChefHat className="h-4 w-4 text-zinc-600" />
            Receta Base
          </div>
          <p className="mt-2 text-lg font-bold text-zinc-900 truncate">
            {product.recipes?.name || 'Sin receta asignada'}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            ${recipeCostPerKg.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / kg costo base
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <Scale className="h-4 w-4 text-zinc-600" />
            Peso Neto
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {product.net_weight} kg
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Por unidad de venta comercial
          </p>
        </div>
      </div>

      {/* Form to Edit Product */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-base font-semibold text-zinc-900">Configuración del Producto</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Modificá el nombre, la receta asociada o el peso neto de esta presentación.
          </p>
        </div>

        <form action={updateProduct} className="p-6 space-y-6">
          <input type="hidden" name="id" value={product.id} />

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
                  defaultValue={product.name}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
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
                  defaultValue={product.recipe_id}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                >
                  <option value="">Seleccionar receta...</option>
                  {recipes?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
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
                  defaultValue={product.net_weight}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
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
                  defaultValue={product.sku || ''}
                  className="block w-full rounded-md border-0 py-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-5 flex justify-end gap-3">
            <Link
              href="/products"
              className="rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      {/* Quick Links */}
      {product.recipe_id && (
        <div className="flex justify-end">
          <Link
            href={`/recipes/${product.recipe_id}`}
            className="text-xs text-zinc-500 hover:text-zinc-900 underline flex items-center gap-1"
          >
            Ver desglose completo de la receta base ({product.recipes?.name}) →
          </Link>
        </div>
      )}
    </div>
  )
}
