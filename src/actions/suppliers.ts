'use server'

import { supabase } from '@/lib/db/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const supplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  contact_info: z.string().optional(),
  payment_terms: z.string().optional(),
})

export async function createSupplier(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData.entries())
  const parsed = supplierSchema.safeParse(data)

  if (!parsed.success) {
    console.error('Validation error:', parsed.error.format())
    redirect('/suppliers/new?error=invalid')
  }

  const business_id = '00000000-0000-0000-0000-000000000000'

  const { error } = await supabase
    .from('suppliers')
    .insert({ business_id, ...parsed.data })

  if (error) {
    console.error('Error creating supplier:', error)
    redirect('/suppliers/new?error=db')
  }

  revalidatePath('/suppliers')
  redirect('/suppliers')
}
