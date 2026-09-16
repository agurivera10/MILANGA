import { supabase } from '@/lib/db/supabase'
import { ScenarioSimulator } from '@/components/lab/scenario-simulator'

export const dynamic = 'force-dynamic'

export default async function LabPage() {
  // Para el laboratorio, traemos una receta "hero" (la principal) o la primera disponible para simular.
  // En la V0.1, traemos todas las materias primas para jugar con sus precios.
  const { data: materials } = await supabase
    .from('materials')
    .select('id, name, current_price, presentation_quantity, expected_yield, base_unit, presentation_unit')
    .eq('active', true)
    .order('name')

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Laboratorio de Escenarios</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Simula cambios en precios de insumos, rendimientos o gastos fijos para ver el impacto en tiempo real. No modifica los datos reales.
        </p>
      </div>

      <div className="flex-1 mt-6">
        <ScenarioSimulator initialMaterials={materials || []} />
      </div>
    </div>
  )
}
