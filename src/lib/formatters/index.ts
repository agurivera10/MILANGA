/**
 * Milanga Cost Lab - Formatters
 * Funciones de presentación de datos. Solo se usan en la UI, nunca en el cost-engine.
 */

const ARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

const PLAIN_NUMBER = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 2,
})

const PERCENT = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** Formatea un número como moneda ARS. Ej: 75000 -> $ 75.000,00 */
export function formatMoney(value: number): string {
  return ARS.format(value)
}

/** Formatea un número con separadores de miles. Ej: 1234.56 -> 1.234,56 */
export function formatNumber(value: number): string {
  return PLAIN_NUMBER.format(value)
}

/** Formatea un decimal como porcentaje. Ej: 0.38 -> 38,0% */
export function formatPercent(value: number): string {
  return PERCENT.format(value)
}

/** Formatea un porcentaje ya en base 100. Ej: 38.8 -> 38,8% */
export function formatPct(value: number): string {
  return PERCENT.format(value / 100)
}
