import { useState } from 'react'
import { Input } from '../../../components/ui/Input'
import type { ColumnMap } from '../types'

interface ColumnMappingEditorProps {
  value: ColumnMap
  onChange: (value: ColumnMap) => void
  error?: string | null
}

type SingleField = 'name' | 'sku' | 'barcode' | 'sheetStock' | 'price'

const FIELDS: Array<{ field: SingleField; label: string; placeholder: string; hint?: string; required?: boolean }> = [
  { field: 'name', label: 'Nombre del producto', placeholder: 'Ej. Descripción', required: true },
  { field: 'sku', label: 'SKU', placeholder: 'Ej. Código' },
  { field: 'barcode', label: 'Código de barras', placeholder: 'Ej. EAN' },
  {
    field: 'sheetStock',
    label: 'Stock en planilla',
    placeholder: 'Ej. Cantidad',
    hint: 'Solo de referencia. Nunca se usa como stock físico.',
  },
  { field: 'price', label: 'Precio', placeholder: 'Ej. Precio venta' },
]

/**
 * Indica qué encabezado de la planilla corresponde a cada dato.
 * Cada fuente tiene su propio mapeo; los encabezados se escriben tal cual aparecen.
 */
export function ColumnMappingEditor({ value, onChange, error }: ColumnMappingEditorProps) {
  // Texto libre separado por comas; se convierte a lista al escribir.
  const [displayText, setDisplayText] = useState((value.display ?? []).join(', '))

  const setField = (field: SingleField, text: string) => onChange({ ...value, [field]: text })

  const setDisplay = (text: string) => {
    setDisplayText(text)
    onChange({ ...value, display: text.split(',').map((s) => s.trim()).filter(Boolean) })
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium">Columnas</legend>
      <p className="-mt-2 text-sm text-muted">
        Escribí el encabezado exacto de cada columna, tal como aparece en la fila de encabezados. Solo el nombre es
        obligatorio.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map(({ field, label, placeholder, hint, required }) => (
          <Input
            key={field}
            label={
              <>
                {label}
                {required && <span className="text-danger"> *</span>}
              </>
            }
            value={value[field] ?? ''}
            onChange={(e) => setField(field, e.target.value)}
            placeholder={placeholder}
            hint={hint}
            maxLength={100}
          />
        ))}
      </div>

      <Input
        label="Otras columnas a mostrar"
        value={displayText}
        onChange={(e) => setDisplay(e.target.value)}
        placeholder="Ej. Marca, Rubro, Ubicación"
        hint="Separadas por coma. Se muestran en el detalle del producto."
      />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </fieldset>
  )
}
