'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const materialSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.string().optional(),
  base_unit: z.string().min(1, 'Unidad base requerida'),
  presentation_unit: z.string().min(1, 'Unidad de presentación requerida'),
  presentation_quantity: z.coerce.number().positive('Debe ser mayor a 0'),
  current_price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  expected_yield: z.coerce.number().min(0.01).max(1, 'El rendimiento debe ser entre 0.01 y 1 (1%-100%)')
})

export async function createMaterial(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData.entries())
  const parsed = materialSchema.safeParse(data)

  if (!parsed.success) {
    console.error('Validation error:', parsed.error.format())
    redirect('/materials/new?error=invalid')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business_id = user.id

  const { error } = await supabase
    .from('materials')
    .insert({ business_id, ...parsed.data })

  if (error) {
    console.error('Error creating material:', error)
    redirect('/materials/new?error=db')
  }

  revalidatePath('/materials')
  redirect('/materials')
}

export async function updateMaterial(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData.entries())
  const id = data.id as string
  const parsed = materialSchema.safeParse(data)

  if (!parsed.success || !id) {
    console.error('Validation error:', parsed?.error?.format())
    redirect(`/materials/${id}?error=invalid`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business_id = user.id

  const { error } = await supabase
    .from('materials')
    .update(parsed.data)
    .eq('id', id)
    .eq('business_id', business_id)

  if (error) {
    console.error('Error updating material:', error)
    redirect(`/materials/${id}?error=db`)
  }

  revalidatePath('/materials')
  redirect('/materials')
}

