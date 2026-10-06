// Tipos de la base (supabase/migrations). Mismo formato que `supabase gen types typescript`;
// si se agrega la CLI de Supabase se puede regenerar este archivo.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Timestamps = { created_at: string; updated_at: string }

export type ThemeValue = 'light' | 'dark' | 'system'
export type DefaultPeriodValue = 'this-month' | 'last-month' | 'last-30'
export type SourceSlot = 'A' | 'B'
export type AccountKind = 'efectivo' | 'debito' | 'credito' | 'billetera' | 'transferencia' | 'otro'

export type Database = {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          user_id: string
          theme: ThemeValue
          default_period: DefaultPeriodValue
          catalog_cache_minutes: number
        } & Timestamps
        Insert: {
          user_id?: string
          theme?: ThemeValue
          default_period?: DefaultPeriodValue
          catalog_cache_minutes?: number
        }
        Update: {
          theme?: ThemeValue
          default_period?: DefaultPeriodValue
          catalog_cache_minutes?: number
        }
        Relationships: []
      }
      product_sources: {
        Row: {
          id: string
          user_id: string
          slot: SourceSlot
          name: string
          spreadsheet_id: string | null
          sheet_name: string | null
          header_row: number
          column_map: Json
          enabled: boolean
        } & Timestamps
        Insert: {
          id?: string
          user_id?: string
          slot: SourceSlot
          name: string
          spreadsheet_id?: string | null
          sheet_name?: string | null
          header_row?: number
          column_map?: Json
          enabled?: boolean
        }
        Update: {
          name?: string
          spreadsheet_id?: string | null
          sheet_name?: string | null
          header_row?: number
          column_map?: Json
          enabled?: boolean
        }
        Relationships: []
      }
      // Stock físico por usuario + fuente + producto/variante. Reglas: docs/REGLAS_DEL_PROYECTO.md
      physical_stock: {
        Row: {
          id: string
          user_id: string
          source_id: string
          /**
           * Identifica la VARIANTE dentro de la fuente: 'sku:…' > 'bc:…' > 'name:…'.
           * Si el valor no es único en la fuente (ej. un código con varios colores),
           * incluye los atributos de la variante: 'bc:6956526492062|color:negro'.
           * Nunca el número de fila de la planilla.
           */
          product_key: string
          /** false → quantity = 0 · true → quantity >= 1 (lo exige la base). */
          has_product: boolean
          quantity: number
          product_name: string
          sku: string | null
          barcode: string | null
          /** Copia del stock de la planilla al contar: solo referencia, nunca stock físico. */
          sheet_stock_ref: string | null
          counted_at: string
        } & Timestamps
        Insert: {
          id?: string
          user_id?: string
          source_id: string
          product_key: string
          has_product: boolean
          quantity: number
          product_name: string
          sku?: string | null
          barcode?: string | null
          sheet_stock_ref?: string | null
          counted_at?: string
        }
        Update: {
          has_product?: boolean
          quantity?: number
          product_name?: string
          sku?: string | null
          barcode?: string | null
          sheet_stock_ref?: string | null
          counted_at?: string
        }
        Relationships: []
      }
      physical_stock_history: {
        Row: {
          id: string
          user_id: string
          source_id: string
          physical_stock_id: string | null
          product_key: string
          has_product: boolean
          quantity: number
          product_name: string
          sku: string | null
          barcode: string | null
          sheet_stock_ref: string | null
          counted_at: string
          created_at: string
        }
        // Solo lectura desde el cliente: lo escribe un trigger.
        Insert: never
        Update: never
        Relationships: []
      }
      expense_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          sort_order: number
          archived: boolean
        } & Timestamps
        Insert: {
          id?: string
          user_id?: string
          name: string
          color?: string
          sort_order?: number
          archived?: boolean
        }
        Update: {
          name?: string
          color?: string
          sort_order?: number
          archived?: boolean
        }
        Relationships: []
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          kind: AccountKind
          sort_order: number
          archived: boolean
        } & Timestamps
        Insert: {
          id?: string
          user_id?: string
          name: string
          kind?: AccountKind
          sort_order?: number
          archived?: boolean
        }
        Update: {
          name?: string
          kind?: AccountKind
          sort_order?: number
          archived?: boolean
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category_id: string
          account_id: string
          spent_on: string
          description: string | null
        } & Timestamps
        Insert: {
          id?: string
          user_id?: string
          amount: number
          category_id: string
          account_id: string
          spent_on?: string
          description?: string | null
        }
        Update: {
          amount?: number
          category_id?: string
          account_id?: string
          spent_on?: string
          description?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      bootstrap_user: { Args: Record<PropertyKey, never>; Returns: undefined }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type TableRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
