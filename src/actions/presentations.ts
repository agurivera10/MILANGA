'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setActivePresentation(formData: FormData): Promise<void> {
  const materialId = formData.get('materialId') as string
  const presentationId = formData.get('presentationId') as string

  if (!materialId || !presentationId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get the presentation details
  const { data: presentation } = await supabase
    .from('material_presentations')
    .select('price, presentation_quantity, name')
    .eq('id', presentationId)
    .single()

  if (!presentation) return

  // Deactivate all presentations for this material
  await supabase
    .from('material_presentations')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('material_id', materialId)

  // Activate the selected one
  await supabase
    .from('material_presentations')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', presentationId)

  // Update the material's current_price and presentation info to match
  await supabase
    .from('materials')
    .update({
      current_price: presentation.price,
      presentation_quantity: presentation.presentation_quantity,
      presentation_unit: presentation.name,
      updated_at: new Date().toISOString()
    })
    .eq('id', materialId)
    .eq('business_id', user.id)

  // Revalidate everything that shows costs
  revalidatePath('/materials')
  revalidatePath('/materials/[id]', 'page')
  revalidatePath('/recipes')
  revalidatePath('/recipes/[id]', 'page')
  revalidatePath('/suppliers')
  revalidatePath('/suppliers/[id]', 'page')
}
