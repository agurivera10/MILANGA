'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { calculateUsableCost } from '@/lib/cost-engine/index'

const productionSchema = z.object({
  recipe_id: z.string().uuid('Debes seleccionar una receta'),
  expected_weight_kg: z.coerce.number().positive(),
  actual_weight_kg: z.coerce.number().positive('El peso real es requerido y mayor a 0'),
  notes: z.string().optional()
})

export async function createProductionLot(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = productionSchema.safeParse(data)

  if (!parsed.success) {
    console.error('Validation error:', parsed.error.format())
    redirect('/production/new?error=invalid')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business_id = user.id

  // 1. Obtener la receta y sus ingredientes para calcular el costo y hacer descuentos de stock
  const { data: recipe } = await supabase
    .from('recipes')
    .select('*, recipe_items(*, materials(id, current_price, expected_yield, name))')
    .eq('id', parsed.data.recipe_id)
    .single()

  if (!recipe) {
    redirect('/production/new?error=not-found')
  }

  // 2. Calcular el costo total en base a lo que dictan los materiales AHORA (snapshot)
  let totalCost = 0
  const movementsToInsert = []

  // Calculamos factor de escala si la receta asume 1kg pero acá se produjeron N kg esperados
  const scaleFactor = parsed.data.expected_weight_kg / recipe.expected_final_weight

  for (const item of recipe.recipe_items) {
    const requiredQty = item.quantity * scaleFactor
    
    // Costo del ingrediente
    const usableCost = calculateUsableCost(item.materials.current_price, item.materials.expected_yield)
    totalCost += usableCost * requiredQty

    // Movimiento de inventario (salida)
    movementsToInsert.push({
      business_id,
      material_id: item.material_id,
      quantity_change: -requiredQty,
      reference_type: 'production'
    })
  }

  // Costo de mano de obra asociado a este lote escalado
  // (Para MVP asumimos labor_hours y labor_people por el lote base de la receta)
  // Lo dejamos fuera del costo total por ahora para simplificar, o lo sumamos si tuvieramos el hourly_rate.

  // 3. Insertar lote de producción
  const { data: lot, error: lotError } = await supabase
    .from('production_lots')
    .insert({
      business_id,
      recipe_id: parsed.data.recipe_id,
      lot_number: `LOT-${new Date().getTime().toString().slice(-6)}`,
      expected_weight_kg: parsed.data.expected_weight_kg,
      actual_weight_kg: parsed.data.actual_weight_kg,
      total_cost: totalCost,
      notes: parsed.data.notes
    })
    .select()
    .single()

  if (lotError || !lot) {
    console.error('Error creating lot:', lotError)
    redirect('/production/new?error=db')
  }

  // 4. Ligar movimientos de inventario al lote y guardar
  const finalMovements = movementsToInsert.map(m => ({
    ...m,
    reference_id: lot.id
  }))

  const { error: movError } = await supabase.from('inventory_movements').insert(finalMovements)

  if (movError) {
    console.error('Error inserting movements:', movError)
  }

  revalidatePath('/production')
  redirect('/production')
}
