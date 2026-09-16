export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards Placeholder */}
        {['Costo Promedio / Kg', 'Precio Promedio', 'Margen Promedio', 'Punto de Equilibrio'].map((kpi) => (
          <div key={kpi} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-zinc-500">{kpi}</dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">--</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
