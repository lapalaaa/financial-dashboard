import type { Json } from '../../../types/database'
import type { ColumnMap, ProductSourceInput } from '../types'

const SPREADSHEET_ID_RE = /^[A-Za-z0-9_-]{20,100}$/
const SPREADSHEET_URL_RE = /\/spreadsheets\/d\/([A-Za-z0-9_-]+)/

/**
 * Acepta la URL completa de Google Sheets o el ID solo.
 * Devuelve el ID, o null si no tiene un formato válido.
 */
export function parseSpreadsheetId(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  const fromUrl = SPREADSHEET_URL_RE.exec(value)?.[1]
  const id = fromUrl ?? value
  return SPREADSHEET_ID_RE.test(id) ? id : null
}

const SINGLE_FIELDS = ['name', 'sku', 'barcode', 'sheetStock', 'price'] as const

export const COLUMN_FIELD_LABELS: Record<(typeof SINGLE_FIELDS)[number], string> = {
  name: 'Nombre',
  sku: 'SKU',
  barcode: 'Código de barras',
  sheetStock: 'Stock en planilla',
  price: 'Precio',
}

/** Recorta espacios, descarta vacíos y duplicados. */
export function normalizeColumnMap(map: ColumnMap): ColumnMap {
  const out: ColumnMap = {}
  for (const field of SINGLE_FIELDS) {
    const v = map[field]?.trim()
    if (v) out[field] = v
  }
  const display = [...new Set((map.display ?? []).map((d) => d.trim()).filter(Boolean))]
  if (display.length) out.display = display
  return out
}

/** Lee column_map desde la base sin confiar en su forma. */
export function parseColumnMap(json: Json): ColumnMap {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {}
  const raw: ColumnMap = {}
  for (const field of SINGLE_FIELDS) {
    const v = json[field]
    if (typeof v === 'string') raw[field] = v
  }
  if (Array.isArray(json.display)) {
    raw.display = json.display.filter((d): d is string => typeof d === 'string')
  }
  return normalizeColumnMap(raw)
}

export function columnMapToJson(map: ColumnMap): Json {
  return { ...normalizeColumnMap(map) }
}

/** Mensaje de error si dos datos distintos apuntan al mismo encabezado. */
export function validateColumnMap(map: ColumnMap): string | null {
  const seen = new Map<string, string>()
  for (const field of SINGLE_FIELDS) {
    const header = map[field]?.trim().toLowerCase()
    if (!header) continue
    const previous = seen.get(header)
    if (previous) {
      return `“${COLUMN_FIELD_LABELS[field]}” y “${previous}” no pueden usar la misma columna.`
    }
    seen.set(header, COLUMN_FIELD_LABELS[field])
  }
  return null
}

/** Una fuente solo puede activarse con planilla, pestaña y columna de nombre. */
export function isSourceConfigured(source: Pick<ProductSourceInput, 'spreadsheetId' | 'sheetName' | 'columnMap'>) {
  return Boolean(source.spreadsheetId && source.sheetName?.trim() && source.columnMap.name?.trim())
}
