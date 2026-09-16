import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package2, TrendingUp, DollarSign, ListOrdered } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user business_id
  const { data: { user } } = await supabase.auth.getUser()
  const business_id = user?.id

  // Fetch some aggregate data
  const [
    { count: materialsCount },
    { count: recipesCount },
    { count: productsCount },
    { data: fixedCosts }
  ] = await Promise.all([
    supabase.from('materials').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('recipes').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('fixed_costs').select('amount, periodicity').eq('active', true)
  ])

  const totalMonthlyFixed = (fixedCosts || []).reduce((acc, c) => {
    const monthly =
      c.periodicity === 'annual' ? c.amount / 12 :
      c.periodicity === 'weekly' ? c.amount * 4.33 :
      c.amount
    return acc + monthly
  }, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Vista General</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Bienvenido al panel de control de tu negocio. Aquí tienes un resumen de tu estructura actual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materias Primas</CardTitle>
            <Package2 className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialsCount || 0}</div>
            <p className="text-xs text-zinc-500 mt-1">Insumos activos en el sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recetas</CardTitle>
            <ListOrdered className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipesCount || 0}</div>
            <p className="text-xs text-zinc-500 mt-1">Procesos productivos definidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Comerciales</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount || 0}</div>
            <p className="text-xs text-zinc-500 mt-1">Presentaciones de venta final</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Fijos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlyFixed.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-zinc-500 mt-1">Base estructural del negocio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Flujo de Operación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500 mb-4">
              Asegúrate de mantener actualizados los precios de tus materias primas. El Módulo de Pricing 
              recalculará automáticamente todos tus costos y márgenes.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600">1</div>
                <div>
                  <h4 className="font-semibold text-zinc-900">Actualiza Insumos</h4>
                  <p className="text-xs text-zinc-500">Revisa los precios de lista de tus proveedores.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600">2</div>
                <div>
                  <h4 className="font-semibold text-zinc-900">Monitorea el Pricing</h4>
                  <p className="text-xs text-zinc-500">Verifica si tus márgenes objetivo siguen en verde.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600">3</div>
                <div>
                  <h4 className="font-semibold text-zinc-900">Simula Escenarios</h4>
                  <p className="text-xs text-zinc-500">Usa el Laboratorio antes de tomar decisiones de precios.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href="/materials/new" className="block p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
              <h4 className="font-semibold text-zinc-900">Nueva Materia Prima</h4>
              <p className="text-xs text-zinc-500 mt-1">Agrega un insumo nuevo al sistema.</p>
            </a>
            <a href="/recipes/new" className="block p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
              <h4 className="font-semibold text-zinc-900">Crear Receta</h4>
              <p className="text-xs text-zinc-500 mt-1">Define un nuevo proceso de producción.</p>
            </a>
            <a href="/pricing" className="block p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
              <h4 className="font-semibold text-zinc-900">Analizar Márgenes</h4>
              <p className="text-xs text-zinc-500 mt-1">Ir al módulo de pricing inteligente.</p>
            </a>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
