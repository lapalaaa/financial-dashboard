import type { AccountKind, DefaultPeriodValue, SourceSlot, ThemeValue } from '../../types/database'

export type { AccountKind, SourceSlot }

export interface Preferences {
  theme: ThemeValue
  defaultPeriod: DefaultPeriodValue
  catalogCacheMinutes: number
}

/**
 * Qué encabezado de la planilla corresponde a cada dato del producto.
 * Los valores son el texto exacto de la fila de encabezados.
 * Reglas: docs/REGLAS_DEL_PROYECTO.md
 */
export interface ColumnMap {
  name?: string
  sku?: string
  /**
   * Puede repetirse dentro de una misma fuente con distintas variantes (color/medida):
   * no identifica por sí solo una variante (regla 4).
   */
  barcode?: string
  /**
   * "Stock en planilla (referencia)". Solo informativo: nunca es stock físico ni entra
   * en ningún cálculo de stock físico (regla 3).
   */
  sheetStock?: string
  price?: string
  /** Otras columnas a mostrar en el detalle del producto. */
  display?: string[]
}

/**
 * Una de las dos fuentes independientes (A: proveedores de Argentina, B: importados).
 * La planilla es solo lectura; nunca se mezcla con la otra fuente (reglas 1 y 2).
 */
export interface ProductSource {
  id: string
  slot: SourceSlot
  name: string
  spreadsheetId: string | null
  sheetName: string | null
  headerRow: number
  columnMap: ColumnMap
  enabled: boolean
  updatedAt: string
}

export interface ProductSourceInput {
  name: string
  spreadsheetId: string | null
  sheetName: string | null
  headerRow: number
  columnMap: ColumnMap
}

export type ProductSourcePatch = Partial<ProductSourceInput> & { enabled?: boolean }

export interface Category {
  id: string
  name: string
  color: string
  sortOrder: number
  archived: boolean
}

export interface CategoryInput {
  name: string
  color: string
}

export type CategoryPatch = Partial<CategoryInput> & { archived?: boolean }

export interface Account {
  id: string
  name: string
  kind: AccountKind
  sortOrder: number
  archived: boolean
}

export interface AccountInput {
  name: string
  kind: AccountKind
}

export type AccountPatch = Partial<AccountInput> & { archived?: boolean }
