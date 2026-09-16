'use client'

import { useState } from 'react'
import { calculateTargetPriceForMargin, calculateGrossMargin, calculateMarkup } from '@/lib/cost-engine'
import { DollarSign, Percent, TrendingUp } from 'lucide-react'

type ProductCost = {
  id: string
  name: string
  netWeight: number
  baseCost: number
}

export function PricingCalculator({ initialProducts }: { initialProducts: ProductCost[] }) {
  const [products, setProducts] = useState(
    initialProducts.map(p => ({
      ...p,
      targetMargin: 35, // 35% por defecto
      sellPrice: calculateTargetPriceForMargin(p.baseCost, 0.35)
    }))
  )

  const handleMarginChange = (index: number, newMarginPct: number) => {
    const updated = [...products]
    const margin = newMarginPct / 100
    updated[index].targetMargin = newMarginPct
    
    // Evitar errores de división si el margen es >= 100
    if (margin < 1) {
      updated[index].sellPrice = calculateTargetPriceForMargin(updated[index].baseCost, margin)
    }
    setProducts(updated)
  }

  const handlePriceChange = (index: number, newPrice: number) => {
    const updated = [...products]
    updated[index].sellPrice = newPrice
    
    // Recalcular margen en base al precio ingresado
    if (newPrice > 0) {
      updated[index].targetMargin = calculateGrossMargin(newPrice, updated[index].baseCost) * 100
    }
    setProducts(updated)
  }

  return (
    <div className="space-y-6">
      {products.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500">No hay productos disponibles para calcular precios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {products.map((product, index) => {
            const markup = calculateMarkup(product.sellPrice, product.baseCost) * 100
            const profit = product.sellPrice - product.baseCost
            
            // Semáforo visual de rentabilidad
            let marginColor = 'text-green-600'
            let marginBg = 'bg-green-50 ring-green-600/20'
            if (product.targetMargin < 25) {
              marginColor = 'text-red-600'
              marginBg = 'bg-red-50 ring-red-600/20'
            } else if (product.targetMargin < 35) {
              marginColor = 'text-amber-600'
              marginBg = 'bg-amber-50 ring-amber-600/20'
            }

            return (
              <div key={product.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-zinc-900">{product.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{product.netWeight} kg | Costo Base: ${(product.baseCost).toFixed(2)}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${marginColor} ${marginBg}`}>
                    {product.targetMargin.toFixed(1)}% Margen
                  </span>
                </div>
                
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Margen Objetivo (%)
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Percent className="h-4 w-4 text-zinc-400" />
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          max="99"
                          value={product.targetMargin.toFixed(1)}
                          onChange={(e) => handleMarginChange(index, parseFloat(e.target.value) || 0)}
                          className="block w-full rounded-md border-0 py-1.5 pl-10 text-zinc-900 ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-zinc-900 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Precio de Venta ($)
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <DollarSign className="h-4 w-4 text-zinc-400" />
                        </div>
                        <input
                          type="number"
                          step="10"
                          value={product.sellPrice.toFixed(0)}
                          onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                          className="block w-full rounded-md border-0 py-1.5 pl-10 text-zinc-900 ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-zinc-900 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resultados Visuales */}
                  <div className="bg-zinc-50 rounded-lg p-4 flex flex-col justify-center space-y-4 border border-zinc-100">
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-zinc-500">Ganancia / Unidad</span>
                      <span className="font-semibold text-zinc-900">${profit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-zinc-500">Markup Aplicado</span>
                      <span className="font-medium text-zinc-700">{markup.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-2 overflow-hidden flex">
                       <div 
                         className="bg-zinc-900 h-1.5" 
                         style={{ width: `${(product.baseCost / product.sellPrice) * 100}%` }}
                         title="Costo"
                       ></div>
                       <div 
                         className={`h-1.5 ${product.targetMargin >= 35 ? 'bg-green-500' : product.targetMargin >= 25 ? 'bg-amber-500' : 'bg-red-500'}`} 
                         style={{ width: `${product.targetMargin}%` }}
                         title="Ganancia"
                       ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-medium px-1">
                      <span>COSTO</span>
                      <span>GANANCIA</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
