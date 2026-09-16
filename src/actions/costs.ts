'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const fixedCostSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  amount: z.coerce.number().min(0, 'El monto no puede ser negativo'),
  periodicity: z.enum(['monthly', 'weekly', 'annual']).default('monthly'),
})

export async function createFixedCost(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData.entries())
  const parsed = fixedCostSchema.safeParse(data)

  if (!parsed.success) {
    console.error('Validation error:', parsed.error.format())
    redirect('/costs?error=invalid-fixed')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business_id = user.id

  const { error } = await supabase
    .from('fixed_costs')
    .insert({ business_id, ...parsed.data })

  if (error) {
    console.error('Error creating fixed cost:', error)
    redirect('/costs?error=db')
  }

  revalidatePath('/costs')
  redirect('/costs')
}

const variableCostSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['per_kg', 'per_unit', 'percentage']),
  amount: z.coerce.number().min(0, 'El monto no puede ser negativo'),
})

export async function createVariableCost(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData.entries())
  const parsed = variableCostSchema.safeParse(data)

  if (!parsed.success) {
    console.error('Validation error:', parsed.error.format())
    redirect('/costs?error=invalid-variable')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business_id = user.id

  const { error } = await supabase
    .from('variable_costs')
    .insert({ business_id, ...parsed.data })

  if (error) {
    console.error('Error creating variable cost:', error)
    redirect('/costs?error=db')
  }

  revalidatePath('/costs')
  redirect('/costs')
}
