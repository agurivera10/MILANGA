'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const productSchema = z.object({
  recipe_id: z.string().uuid('Debe seleccionar una receta válida'),
  name: z.string().min(1, 'El nombre es requerido'),
  net_weight: z.coerce.number().positive('El peso neto debe ser mayor a 0'),
  sku: z.string().optional()
})

export async function createProduct(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData.entries())
  const parsed = productSchema.safeParse(data)

  if (!parsed.success) {
    console.error('Validation error:', parsed.error.format())
    redirect('/products/new?error=invalid')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business_id = user.id

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

export async function updateProduct(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData.entries())
  const id = data.id as string
  const parsed = productSchema.safeParse(data)

  if (!parsed.success || !id) {
    console.error('Validation error:', parsed?.error?.format())
    redirect(`/products/${id}?error=invalid`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business_id = user.id

  const { error } = await supabase
    .from('products')
    .update(parsed.data)
    .eq('id', id)
    .eq('business_id', business_id)

  if (error) {
    console.error('Error updating product:', error)
    redirect(`/products/${id}?error=db`)
  }

  revalidatePath('/products')
  redirect('/products')
}

