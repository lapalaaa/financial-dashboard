import { useState, type FormEvent } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { SOURCE_NAME_MAX_LENGTH } from '../constants'
import { errorMessage } from '../services'
import type { ColumnMap, ProductSource, ProductSourcePatch } from '../types'
import { isSourceConfigured, normalizeColumnMap, parseSpreadsheetId, validateColumnMap } from '../utils/sources'
import { ColumnMappingEditor } from './ColumnMappingEditor'

interface ProductSourceFormProps {
  open: boolean
  source: ProductSource
  onClose: () => void
  onSubmit: (patch: ProductSourcePatch) => Promise<void>
}

export function ProductSourceForm(props: ProductSourceFormProps) {
  return <ProductSourceFormInner key={props.open ? props.source.id : 'closed'} {...props} />
}

interface Errors {
  name?: string
  spreadsheet?: string
  headerRow?: string
  columns?: string
  form?: string
}

function ProductSourceFormInner({ open, source, onClose, onSubmit }: ProductSourceFormProps) {
  const [name, setName] = useState(source.name)
  const [spreadsheet, setSpreadsheet] = useState(source.spreadsheetId ?? '')
  const [sheetName, setSheetName] = useState(source.sheetName ?? '')
  const [headerRow, setHeaderRow] = useState(String(source.headerRow))
  const [columnMap, setColumnMap] = useState<ColumnMap>(source.columnMap)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  const parsedId = parseSpreadsheetId(spreadsheet)
  const showDetectedId = parsedId !== null && parsedId !== spreadsheet.trim()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    const row = Number(headerRow)
    if (!name.trim()) next.name = 'Escribí un nombre.'
    if (spreadsheet.trim() && !parsedId) next.spreadsheet = 'No parece una URL o un ID de Google Sheets válido.'
    if (!Number.isInteger(row) || row < 1 || row > 1000) next.headerRow = 'Ingresá un número entre 1 y 1000.'
    const columnError = validateColumnMap(columnMap)
    if (columnError) next.columns = columnError
    setErrors(next)
    if (Object.keys(next).length) return

    const config = {
      spreadsheetId: parsedId,
      sheetName: sheetName.trim() || null,
      columnMap: normalizeColumnMap(columnMap),
    }
    const patch: ProductSourcePatch = { name: name.trim(), headerRow: row, ...config }
    // Una fuente incompleta no puede quedar activa.
    if (source.enabled && !isSourceConfigured(config)) patch.enabled = false

    setSaving(true)
    try {
      await onSubmit(patch)
      onClose()
    } catch (err) {
      setErrors({ form: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Configurar fuente ${source.slot}`}
      description="Esta configuración es independiente de la otra fuente."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="source-form" loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="source-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-muted">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            La app solo <strong className="font-medium text-fg">lee</strong> esta planilla. Nunca agrega, edita ni borra
            datos en Google Sheets.
          </p>
        </div>

        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={SOURCE_NAME_MAX_LENGTH}
          error={errors.name}
          data-autofocus
          required
        />

        <Input
          label="Planilla de Google Sheets"
          value={spreadsheet}
          onChange={(e) => setSpreadsheet(e.target.value)}
          placeholder="Pegá la URL o el ID de la planilla"
          error={errors.spreadsheet}
          hint={showDetectedId ? `ID detectado: ${parsedId}` : 'Ej. https://docs.google.com/spreadsheets/d/…/edit'}
          spellCheck={false}
          autoComplete="off"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_10rem]">
          <Input
            label="Pestaña"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Ej. Hoja 1"
            maxLength={100}
            hint="Nombre de la pestaña dentro de la planilla."
          />
          <Input
            label="Fila de encabezados"
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            value={headerRow}
            onChange={(e) => setHeaderRow(e.target.value)}
            error={errors.headerRow}
          />
        </div>

        <ColumnMappingEditor value={columnMap} onChange={setColumnMap} error={errors.columns} />

        <p className="text-sm text-muted">
          Próximamente vas a poder probar la conexión y elegir las columnas directamente desde la planilla.
        </p>

        {errors.form && (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
            {errors.form}
          </p>
        )}
      </form>
    </Modal>
  )
}
