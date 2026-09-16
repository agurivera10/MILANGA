import { supabase } from '@/lib/db/supabase'
import { PricingCalculator } from '@/components/pricing/pricing-calculator'

export const dynamic = 'force-dynamic'

type RecipeItem = {
  quantity: number
  materials: {
    id: string
    name: string
    current_price: number
    presentation_quantity: number
    expected_yield: number
  } | null
}

type RecipeData = {
  id: string
  name: string
  expected_final_weight: number
  recipe_items: RecipeItem[]
} | null

type ProductWithRecipe = {
  id: string
  name: string
  net_weight: number
  recipes: RecipeData
}

export default async function PricingPage() {
  const { data: rawProducts } = await supabase
    .from('products')
    .select(`
      id,
      name,
      net_weight,
      recipes (
        id,
        name,
        expected_final_weight,
        recipe_items (
          quantity,
          materials (
            id,
            name,
            current_price,
            presentation_quantity,
            expected_yield
          )
        )
      )
    `)
    .eq('active', true)
    .order('name')

  // Castear explícitamente para evitar el problema de tipado del cliente de Supabase sin tipos generados
  const products = (rawProducts ?? []) as unknown as ProductWithRecipe[]

  // Calcular costos al vuelo usando precios actuales de las materias primas
  const normalizedProducts = products.map((p) => {
    const recipe = p.recipes
    let recipeCost = 0
    const recipeFinalWeight = recipe?.expected_final_weight ?? 1

    if (recipe?.recipe_items) {
      recipeCost = recipe.recipe_items.reduce((acc, item) => {
        const mat = item.materials
        if (!mat || mat.current_price == null || mat.presentation_quantity == null) return acc
        const nominalCost = mat.current_price / mat.presentation_quantity
        const usableCost = mat.expected_yield > 0 ? nominalCost / mat.expected_yield : nominalCost
        return acc + usableCost * item.quantity
      }, 0)
    }

    const costPerKg = recipeFinalWeight > 0 ? recipeCost / recipeFinalWeight : 0
    const baseCost = costPerKg * p.net_weight

    return {
      id: p.id,
      name: p.name,
      netWeight: p.net_weight,
      baseCost,
    }
  })

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Módulo de Pricing</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Ajusta tus márgenes y precios de venta calculados en tiempo real basados en los costos actuales de tus insumos.
          </p>
        </div>
      </div>

      {normalizedProducts.length === 0 ? (
        <div className="mt-8 text-center rounded-xl border border-dashed border-zinc-300 bg-white p-10">
          <p className="text-sm text-zinc-500">
            No hay productos activos con recetas asignadas.
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Creá una materia prima → receta → producto para ver el pricing automático.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <PricingCalculator initialProducts={normalizedProducts} />
        </div>
      )}
    </div>
  )
}
