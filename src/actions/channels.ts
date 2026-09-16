'use server'

import { supabase } from '@/lib/db/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const channelSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  fee_pct: z.coerce.number().min(0).max(100).default(0),
  fee_fixed: z.coerce.number().min(0).default(0),
})

export async function createChannel(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData.entries())
  const parsed = channelSchema.safeParse(data)

  if (!parsed.success) {
    console.error('Validation error:', parsed.error.format())
    redirect('/channels/new?error=invalid')
  }

  const business_id = '00000000-0000-0000-0000-000000000000'

  const { error } = await supabase
    .from('sales_channels')
    .insert({
      business_id,
      name: parsed.data.name,
      fee_pct: parsed.data.fee_pct / 100,
      fee_fixed: parsed.data.fee_fixed,
    })

  if (error) {
    console.error('Error creating channel:', error)
    redirect('/channels/new?error=db')
  }

  revalidatePath('/channels')
  redirect('/channels')
}
