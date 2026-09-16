import { createClient } from '@/utils/supabase/server'
import RecipeForm from '@/components/recipes/recipe-form'

export const dynamic = 'force-dynamic'

export default async function NewRecipePage() {
  const supabase = await createClient()
  const { data: materials } = await supabase
    .from('materials')
    .select('id, name, base_unit')
    .eq('active', true)
    .order('name')

  return <RecipeForm materials={materials ?? []} />
}
