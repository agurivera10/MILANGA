'use server'

import { supabase } from '@/lib/db/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const productSchema = z.object({
  recipe_id: z.string().uuid('Debe seleccionar una receta válida'),
  name: z.string().min(1, 'El nombre es requerido'),
  net_weight: z.coerce.number().positive('El peso neto debe ser mayor a 0'),
  sku: z.string().optional()
})

export async function createProduct(_prevState: unknown, formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData.entries())
  const parsed = productSchema.safeParse(data)

  if (!parsed.success) {
    console.error('Validation error:', parsed.error.format())
    redirect('/products/new?error=invalid')
  }

  const business_id = '00000000-0000-0000-0000-000000000000'

  const { error } = await supabase
    .from('products')
    .insert({ business_id, ...parsed.data })

  if (error) {
    console.error('Error creating product:', error)
    redirect('/products/new?error=db')
  }

  revalidatePath('/products')
  redirect('/products')
}
