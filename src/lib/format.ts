import { CURRENCY, LOCALE } from './config'

const moneyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const moneyFormatterNoCents = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat(LOCALE)

/** $ 1.234,56 — `cents: false` redondea a pesos enteros. */
export function formatMoney(value: number | null | undefined, { cents = true } = {}): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return (cents ? moneyFormatter : moneyFormatterNoCents).format(n)
}

/** 12.345 */
export function formatNumber(value: number | null | undefined): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return numberFormatter.format(n)
}

/**
 * Convierte lo que escribe el usuario en formato es-AR a número.
 * "1.234,56" → 1234.56 · "1234,5" → 1234.5 · "1234.50" → 1234.5 · "" → null
 */
export function parseMoneyInput(input: string): number | null {
  const s = input.trim().replace(/\s|\$/g, '')
  if (!s) return null

  let normalized: string
  if (s.includes(',')) {
    // La coma es el separador decimal; los puntos, de miles.
    normalized = s.replace(/\./g, '').replace(',', '.')
  } else {
    // Sin coma: un único punto seguido de 1, 2 o 4+ dígitos es decimal ("12.5");
    // en cualquier otro caso los puntos separan miles ("1.234", "1.234.567").
    const parts = s.split('.')
    const isDecimal = parts.length === 2 && parts[1].length !== 3
    normalized = isDecimal ? s : parts.join('')
  }

  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

/** Acepta Date o "YYYY-MM-DD" (interpretado como fecha local, sin corrimiento de zona). */
function toDate(value: Date | string): Date {
  if (value instanceof Date) return value
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return new Date(value)
}

/** 27/09/2026 */
export function formatDate(value: Date | string): string {
  return toDate(value).toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** domingo, 27 de septiembre de 2026 */
export function formatDateLong(value: Date | string): string {
  return toDate(value).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** septiembre de 2026 */
export function formatMonth(value: Date | string): string {
  return toDate(value).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })
}

/** 27/09/2026, 14:32 */
export function formatDateTime(value: Date | string): string {
  return toDate(value).toLocaleString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Fecha local como "YYYY-MM-DD" (para inputs type=date y columnas `date`). */
export function toISODate(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
