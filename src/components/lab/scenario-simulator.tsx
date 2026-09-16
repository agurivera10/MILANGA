'use client'

import { useState } from 'react'
import { calculateUsableCost, calculateBreakEvenPoint, calculateTargetVolumeForProfit } from '@/lib/cost-engine'
import { DollarSign, Percent, TrendingUp, TrendingDown, Scale } from 'lucide-react'

type MaterialNode = {
  id: string
  name: string
  current_price: number
  presentation_quantity: number
  expected_yield: number
  base_unit: string
  presentation_unit: string
}

export function ScenarioSimulator({ initialMaterials }: { initialMaterials: MaterialNode[] }) {
  const [materials, setMaterials] = useState(
    initialMaterials.map(m => ({ ...m, simulated_price: m.current_price, simulated_yield: m.expected_yield }))
  )
  
  // Variables globales de simulación (mocks simplificados para el laboratorio V0.1)
  const [fixedCosts, setFixedCosts] = useState(1500000) // 1.5M ARS de costos fijos mensuales
  const [avgSellPrice, setAvgSellPrice] = useState(12000) // 12.000 ARS/kg venta promedio
  const [targetProfit, setTargetProfit] = useState(2000000) // 2M ARS ganancia esperada

  // Seleccionamos la materia prima principal para hacer un deep dive en la UI (ej. Pechuga de Pollo)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '')

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId)

  const handlePriceChange = (id: string, newPrice: number) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, simulated_price: newPrice } : m))
  }

  const handleYieldChange = (id: string, newYield: number) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, simulated_yield: newYield } : m))
  }

  // Cálculos Derivados
  let nominalCost = 0
  let usableCost = 0
  let realNominalCost = 0
  let realUsableCost = 0
  let priceDiffPct = 0
  let yieldDiffPct = 0
  let costDiffPct = 0

  if (selectedMaterial) {
    nominalCost = selectedMaterial.simulated_price / selectedMaterial.presentation_quantity
    usableCost = calculateUsableCost(nominalCost, selectedMaterial.simulated_yield)

    realNominalCost = selectedMaterial.current_price / selectedMaterial.presentation_quantity
    realUsableCost = calculateUsableCost(realNominalCost, selectedMaterial.expected_yield)

    priceDiffPct = ((selectedMaterial.simulated_price - selectedMaterial.current_price) / selectedMaterial.current_price) * 100
    yieldDiffPct = (selectedMaterial.simulated_yield - selectedMaterial.expected_yield) * 100
    costDiffPct = ((usableCost - realUsableCost) / realUsableCost) * 100
  }

  // Para Break Even asumimos un costo variable estimado basado en el usableCost de la materia prima principal + un markup fijo de otros ingredientes
  // En un sistema real interconectaríamos con las recetas.
  const estimatedVariableCost = usableCost * 1.4 // Mock factor para otros ingredientes y packaging
  const contributionMargin = avgSellPrice - estimatedVariableCost
  const breakEvenKg = calculateBreakEvenPoint(fixedCosts, contributionMargin)
  const targetVolumeKg = calculateTargetVolumeForProfit(targetProfit, fixedCosts, contributionMargin)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Controles del Escenario (Izquierda) */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Scale className="h-4 w-4" /> Sensibilidad de Insumos
          </h2>
          
          <select 
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-zinc-900 ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-zinc-900 sm:text-sm sm:leading-6 mb-6"
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
          >
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {selectedMaterial && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-zinc-700">Precio Simulado ($ / {selectedMaterial.presentation_unit})</label>
                  <span className={`text-xs font-medium ${priceDiffPct > 0 ? 'text-red-600' : priceDiffPct < 0 ? 'text-green-600' : 'text-zinc-500'}`}>
                    {priceDiffPct > 0 ? '+' : ''}{priceDiffPct.toFixed(1)}% vs Real
                  </span>
                </div>
                <input
                  type="range"
                  min={selectedMaterial.current_price * 0.5}
                  max={selectedMaterial.current_price * 2}
                  step={selectedMaterial.current_price * 0.05}
                  value={selectedMaterial.simulated_price}
                  onChange={(e) => handlePriceChange(selectedMaterial.id, Number(e.target.value))}
                  className="w-full accent-zinc-900"
                />
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="number"
                    value={selectedMaterial.simulated_price}
                    onChange={(e) => handlePriceChange(selectedMaterial.id, Number(e.target.value))}
                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-zinc-900 ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-zinc-900 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-zinc-700">Rendimiento Simulado (%)</label>
                  <span className={`text-xs font-medium ${yieldDiffPct < 0 ? 'text-red-600' : yieldDiffPct > 0 ? 'text-green-600' : 'text-zinc-500'}`}>
                    {yieldDiffPct > 0 ? '+' : ''}{yieldDiffPct.toFixed(1)}% vs Real
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.01"
                  value={selectedMaterial.simulated_yield}
                  onChange={(e) => handleYieldChange(selectedMaterial.id, Number(e.target.value))}
                  className="w-full accent-zinc-900"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-900">{(selectedMaterial.simulated_yield * 100).toFixed(0)}%</span>
                  <span className="text-xs text-zinc-500">Real: {(selectedMaterial.expected_yield * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
           <h2 className="text-sm font-semibold text-zinc-900 mb-4">Entorno Macroeconómico del Negocio</h2>
           
           <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Costos Fijos Mensuales ($)</label>
              <input
                type="number"
                step="100000"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(Number(e.target.value))}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 sm:text-sm"
              />
           </div>

           <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Precio Promedio de Venta ($/kg)</label>
              <input
                type="number"
                step="500"
                value={avgSellPrice}
                onChange={(e) => setAvgSellPrice(Number(e.target.value))}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 sm:text-sm"
              />
           </div>

           <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Ganancia Neta Deseada ($/mes)</label>
              <input
                type="number"
                step="100000"
                value={targetProfit}
                onChange={(e) => setTargetProfit(Number(e.target.value))}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 sm:text-sm"
              />
           </div>
        </div>

      </div>

      {/* Resultados en Tiempo Real (Derecha) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Impacto Directo en la Materia Prima */}
        <div className="bg-zinc-900 rounded-xl p-6 shadow-lg text-white">
          <h3 className="text-zinc-400 text-sm font-medium mb-4">Impacto en Costo Útil ({selectedMaterial?.name})</h3>
          
          <div className="flex items-end gap-4 mb-2">
            <span className="text-4xl font-bold tracking-tight">${usableCost.toFixed(2)}</span>
            <span className="text-zinc-400 mb-1">/ {selectedMaterial?.base_unit} útil</span>
          </div>
          
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
            {costDiffPct > 0 ? (
              <TrendingUp className="h-5 w-5 text-red-400" />
            ) : costDiffPct < 0 ? (
              <TrendingDown className="h-5 w-5 text-green-400" />
            ) : (
               <div className="h-5 w-5 rounded-full bg-zinc-700" />
            )}
            <span className={`text-sm ${costDiffPct > 0 ? 'text-red-400' : costDiffPct < 0 ? 'text-green-400' : 'text-zinc-400'}`}>
              {costDiffPct > 0 ? '+' : ''}{costDiffPct.toFixed(1)}% ({Math.abs(usableCost - realUsableCost).toFixed(2)}$ de diferencia por {selectedMaterial?.base_unit}) vs Costo Real Actual
            </span>
          </div>
        </div>

        {/* Impacto en el Negocio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Punto de Equilibrio</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-zinc-900">{Math.ceil(breakEvenKg)}</span>
              <span className="text-sm text-zinc-600 mb-1">kg / mes</span>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Ventas mínimas para no perder dinero (cubrir ${fixedCosts.toLocaleString()}).
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm ring-1 ring-inset ring-blue-500/10">
            <h4 className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2">Volumen Objetivo</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-900">{Math.ceil(targetVolumeKg)}</span>
              <span className="text-sm text-blue-700 mb-1">kg / mes</span>
            </div>
            <p className="mt-3 text-xs text-blue-600/80">
              Necesarios para alcanzar tu objetivo de ganancia de ${targetProfit.toLocaleString()}.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
           <h3 className="text-sm font-semibold text-zinc-900 mb-4">¿Qué significa esto?</h3>
           <p className="text-sm text-zinc-600 leading-relaxed">
             Si el precio de <strong>{selectedMaterial?.name}</strong> pasa a ser <strong>${selectedMaterial?.simulated_price}</strong> 
             {yieldDiffPct !== 0 && <span> y su rendimiento cambia a <strong>{(selectedMaterial!.simulated_yield * 100).toFixed(0)}%</strong></span>}, 
             el costo útil sube a <strong>${usableCost.toFixed(2)}</strong>.
           </p>
           <p className="text-sm text-zinc-600 leading-relaxed mt-2">
             Bajo este escenario, y manteniendo un precio de venta promedio de ${avgSellPrice}, tu margen de contribución estimado es de <strong>${contributionMargin.toFixed(2)} por kg</strong>. 
             Deberás producir y vender <strong>{Math.ceil(targetVolumeKg)} kg</strong> al mes para poder cubrir tus costos fijos y llevarte los ${targetProfit.toLocaleString()} a casa.
           </p>
        </div>

      </div>
    </div>
  )
}
