/**
 * Milanga Cost Lab - Cost Engine
 * Todas las funciones puras responsables de la toma de decisiones económicas.
 * Ninguna de estas funciones depende de React ni de la base de datos.
 */

// 1. Costo Nominal por Unidad (ej: de $75.000 por cajón de 15kg -> $5.000/kg)
export function calculateNominalUnitCost(price: number, presentationQuantity: number): number {
  if (presentationQuantity <= 0) return 0;
  return price / presentationQuantity;
}

// 2. Costo Útil (ej: $5.000/kg nominal con 91% rinde -> $5.494,51/kg real)
export function calculateUsableCost(nominalCost: number, yieldPercentage: number): number {
  if (yieldPercentage <= 0) return 0; // Evitar división por cero
  // yieldPercentage se espera que sea un decimal (ej. 0.91)
  return nominalCost / yieldPercentage;
}

// 3. Rendimiento de Receta
// Factor multiplicador (ej. 15.8kg producidos / 10kg pollo útil = 1.58)
export function calculateRecipeYield(totalInputWeight: number, finalOutputWeight: number): number {
  if (totalInputWeight <= 0) return 0;
  return finalOutputWeight / totalInputWeight;
}

// 4. Costo por kg de Receta (ej. Costo total de ingredientes $60.000 / 15.8kg producidos)
export function calculateRecipeCostPerKg(recipeTotalCost: number, finalOutputWeight: number): number {
  if (finalOutputWeight <= 0) return 0;
  return recipeTotalCost / finalOutputWeight;
}

// 5. Margen Bruto (ej. Precio $11.900, Costo $7.284 -> 38.8%)
export function calculateGrossMargin(price: number, cost: number): number {
  if (price <= 0) return 0;
  return (price - cost) / price;
}

// 6. Markup (ej. Precio $11.900, Costo $7.284 -> 63.3%)
export function calculateMarkup(price: number, cost: number): number {
  if (cost <= 0) return 0;
  return (price - cost) / cost;
}

// 7. Precio Objetivo (Target Price) para un margen deseado
// Fórmula: P = (Costo + Fee Fijo) / (1 - Fee Porcentual - Margen Objetivo)
export function calculateTargetPriceForMargin(
  cost: number, 
  targetMarginPct: number, 
  channelFeePct: number = 0, 
  channelFeeFixed: number = 0
): number {
  const divisor = 1 - channelFeePct - targetMarginPct;
  if (divisor <= 0) throw new Error("Margen y comisiones superan o igualan el 100%");
  return (cost + channelFeeFixed) / divisor;
}

// 8. Contribución Unitaria (Ingreso neto menos costo variable)
export function calculateContributionMargin(
  price: number, 
  variableCost: number, 
  channelFeePct: number = 0, 
  channelFeeFixed: number = 0
): number {
  const netIncome = price - (price * channelFeePct) - channelFeeFixed;
  return netIncome - variableCost;
}

// 9. Punto de Equilibrio (Break-Even)
export function calculateBreakEvenPoint(totalFixedCosts: number, contributionMarginPerUnit: number): number {
  if (contributionMarginPerUnit <= 0) return 0; // Si no hay contribución positiva, no hay punto de equilibrio
  return totalFixedCosts / contributionMarginPerUnit;
}

// 10. Volumen Objetivo para una Ganancia Deseada (Target Profit Volume)
export function calculateTargetVolumeForProfit(
  targetProfit: number, 
  totalFixedCosts: number, 
  contributionMarginPerUnit: number
): number {
  if (contributionMarginPerUnit <= 0) return 0;
  return (targetProfit + totalFixedCosts) / contributionMarginPerUnit;
}

// 11. Costo de Mano de Obra por Kg/Unidad
export function calculateLaborCost(hours: number, hourlyRate: number, outputQuantity: number): number {
  if (outputQuantity <= 0) return 0;
  return (hours * hourlyRate) / outputQuantity;
}

// 12. Costo Completo (Full Cost)
export function calculateFullCost(variableCost: number, allocatedFixedCostPerUnit: number): number {
  return variableCost + allocatedFixedCostPerUnit;
}
