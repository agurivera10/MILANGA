'use server'

import { supabase } from '@/lib/db/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const recipeItemSchema = z.object({
  material_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string().min(1)
})

const recipeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  expected_final_weight: z.number().positive('El peso final debe ser mayor a 0'),
  labor_hours: z.number().min(0).default(0),
  labor_people: z.number().min(0).default(0),
  items: z.array(recipeItemSchema).min(1, 'Debe incluir al menos un ingrediente')
})

export async function createRecipe(data: z.infer<typeof recipeSchema>) {
  const parsed = recipeSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Datos inválidos', details: parsed.error.format() }
  }

  // TODO: Obtener auth
  const business_id = '00000000-0000-0000-0000-000000000000'

  // Calcular expected_yield_factor = final_weight / sum(items.quantity)
  // Nota: Esto asume que todas las quantities de los items están en la misma unidad base (ej. kg) que el final_weight.
  // En un sistema real más avanzado, habría conversión de unidades.
  const totalInputWeight = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0)
  const expected_yield_factor = totalInputWeight > 0 ? (parsed.data.expected_final_weight / totalInputWeight) : 1

  // 1. Crear receta
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      business_id,
      name: parsed.data.name,
      expected_final_weight: parsed.data.expected_final_weight,
      expected_yield_factor,
      labor_hours: parsed.data.labor_hours,
      labor_people: parsed.data.labor_people
    })
    .select()
    .single()

  if (recipeError || !recipe) {
    console.error('Error creating recipe:', recipeError)
    return { error: 'Error al crear la receta' }
  }

  // 2. Crear items
  const itemsToInsert = parsed.data.items.map(item => ({
    recipe_id: recipe.id,
    material_id: item.material_id,
    quantity: item.quantity,
    unit: item.unit
  }))

  const { error: itemsError } = await supabase
    .from('recipe_items')
    .insert(itemsToInsert)

  if (itemsError) {
    console.error('Error creating recipe items:', itemsError)
    // Rollback manual podría ser necesario si no hay transacciones en Supabase REST, o idealmente usar una RPC.
    return { error: 'Error al agregar los ingredientes de la receta' }
  }

  revalidatePath('/recipes')
  return { success: true }
}
