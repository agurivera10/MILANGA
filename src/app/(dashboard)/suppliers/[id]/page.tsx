import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, Package2, TrendingDown, BarChart3, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch supplier
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .eq('business_id', user.id)
    .single()

  if (error || !supplier) notFound()

  // Fetch all materials from this supplier (preferred_supplier_id)
  const { data: materials } = await supabase
    .from('materials')
    .select('*')
    .eq('business_id', user.id)
    .eq('preferred_supplier_id', id)
    .order('category')

  // Fetch ALL business materials to show what could be sourced here
  const { data: allMaterials } = await supabase
    .from('materials')
    .select('*')
    .eq('business_id', user.id)
    .is('preferred_supplier_id', null)
    .order('name')

  // Fetch all suppliers for comparison panel
  const { data: allSuppliers } = await supabase
    .from('suppliers')
    .select('id, name')
    .eq('business_id', user.id)
    .neq('id', id)

  const supplierMaterials = materials ?? []
  const unlinkedMaterials = allMaterials ?? []

  // Stats
  const totalMaterials = supplierMaterials.length
  const avgCostPerUnit = totalMaterials > 0
    ? supplierMaterials.reduce((sum, m) => sum + (m.current_price / m.presentation_quantity), 0) / totalMaterials
    : 0
  const cheapestMat = supplierMaterials.reduce((min, m) => {
    const cpu = m.current_price / m.presentation_quantity
    return !min || cpu < (min.current_price / min.presentation_quantity) ? m : min
  }, null as any)

  // Group by category
  const byCategory = supplierMaterials.reduce((acc: Record<string, any[]>, mat) => {
    const cat = mat.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(mat)
    return acc
  }, {})

  return (
    <div className="space-y-8 max-w-5xl">

      {/* ── Header ── */}
      <div>
        <Link href="/suppliers" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Volver a Proveedores
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{supplier.name}</h1>
            {supplier.contact_info && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                <Phone className="h-3.5 w-3.5" />
                {supplier.contact_info}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              supplier.active ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-zinc-100 text-zinc-600'
            }`}>
              {supplier.active ? '● Activo' : '● Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Insumos de este proveedor</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{totalMaterials}</p>
          <p className="mt-1 text-xs text-zinc-400">materias primas vinculadas</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Costo promedio</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {totalMaterials > 0
              ? `$${avgCostPerUnit.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
              : '—'}
          </p>
          <p className="mt-1 text-xs text-zinc-400">por unidad base promedio</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Insumo más económico</p>
          <p className="mt-2 text-lg font-bold text-emerald-600 truncate">
            {cheapestMat ? cheapestMat.name : '—'}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {cheapestMat
              ? `$${(cheapestMat.current_price / cheapestMat.presentation_quantity).toLocaleString('es-AR', { maximumFractionDigits: 0 })}/${cheapestMat.base_unit}`
              : 'Sin insumos cargados'}
          </p>
        </div>
      </div>

      {/* ── Catálogo de precios ── */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Catálogo de Precios</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Todos los insumos vinculados a este proveedor</p>
          </div>
          <Package2 className="h-5 w-5 text-zinc-400" />
        </div>

        {totalMaterials === 0 ? (
          <div className="py-16 text-center">
            <Package2 className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
            <p className="text-sm font-medium text-zinc-600">No hay insumos vinculados a este proveedor</p>
            <p className="text-xs text-zinc-400 mt-1">Usá el SQL de vinculación para asignar materiales</p>
          </div>
        ) : (
          Object.entries(byCategory).map(([category, mats]) => (
            <div key={category}>
              <div className="bg-zinc-50 px-6 py-2 border-y border-zinc-100">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{category}</p>
              </div>
              <table className="min-w-full">
                <tbody className="divide-y divide-zinc-100">
                  {mats.map((mat: any) => {
                    const pricePerUnit = mat.current_price / mat.presentation_quantity
                    const adjustedPrice = pricePerUnit / mat.expected_yield
                    return (
                      <tr key={mat.id} className="hover:bg-zinc-50">
                        <td className="py-4 pl-6 pr-3">
                          <p className="text-sm font-medium text-zinc-900">{mat.name}</p>
                          <p className="text-xs text-zinc-400">{mat.presentation_unit}</p>
                        </td>
                        <td className="px-3 py-4 text-sm text-zinc-600 text-right">
                          <span className="font-semibold text-zinc-900">
                            ${mat.current_price.toLocaleString('es-AR')}
                          </span>
                          <span className="text-zinc-400 text-xs"> / {mat.presentation_unit}</span>
                        </td>
                        <td className="px-3 py-4 text-sm text-right">
                          <span className="font-semibold text-emerald-700">
                            ${pricePerUnit.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-zinc-400 text-xs">/{mat.base_unit}</span>
                        </td>
                        <td className="px-3 py-4 text-sm text-right">
                          {mat.expected_yield < 1 ? (
                            <div>
                              <span className="font-semibold text-amber-600">
                                ${adjustedPrice.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-zinc-400 text-xs">/{mat.base_unit} (ajustado)</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-xs">100% rinde</span>
                          )}
                        </td>
                        <td className="py-4 pl-3 pr-6 text-right">
                          <Link href={`/materials/${mat.id}`} className="text-xs text-zinc-500 hover:text-zinc-900 underline">
                            Editar precio
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* ── Insumos sin proveedor asignado ── */}
      {unlinkedMaterials.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200">
            <h2 className="text-base font-semibold text-amber-900">
              {unlinkedMaterials.length} insumo{unlinkedMaterials.length !== 1 ? 's' : ''} sin proveedor asignado
            </h2>
            <p className="text-sm text-amber-700 mt-0.5">
              Estos materiales no están vinculados a ningún proveedor todavía.
            </p>
          </div>
          <div className="px-6 py-4 flex flex-wrap gap-2">
            {unlinkedMaterials.map((mat: any) => (
              <span key={mat.id} className="inline-flex items-center rounded-full bg-white border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800">
                {mat.name}
              </span>
            ))}
          </div>
          <div className="px-6 pb-4">
            <p className="text-xs text-amber-600">
              💡 Para vincularlos, corré el SQL de vinculación que aparece más abajo.
            </p>
          </div>
        </div>
      )}

      {/* ── Comparación con otros proveedores ── */}
      {allSuppliers && allSuppliers.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-zinc-400" />
            <h2 className="text-base font-semibold text-zinc-900">Comparar con otros proveedores</h2>
          </div>
          <div className="px-6 py-4 flex flex-wrap gap-3">
            {allSuppliers.map((s: any) => (
              <Link
                key={s.id}
                href={`/suppliers/${s.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                {s.name}
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
