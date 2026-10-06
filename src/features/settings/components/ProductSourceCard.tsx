import { useState, type ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Switch } from '../../../components/ui/Switch'
import { useToast } from '../../../components/ui/toastContext'
import { errorMessage } from '../services'
import { useSettings } from '../settingsContext'
import type { ProductSource, ProductSourcePatch } from '../types'
import { COLUMN_FIELD_LABELS, isSourceConfigured } from '../utils/sources'
import { ProductSourceForm } from './ProductSourceForm'

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 justify-between gap-3 py-1.5 text-sm">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  )
}

const notSet = <span className="text-subtle">—</span>

export function ProductSourceCard({ source }: { source: ProductSource }) {
  const { updateSource } = useSettings()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [toggling, setToggling] = useState(false)

  const configured = isSourceConfigured(source)
  const mapped = (Object.keys(COLUMN_FIELD_LABELS) as Array<keyof typeof COLUMN_FIELD_LABELS>)
    .filter((f) => source.columnMap[f])
    .map((f) => COLUMN_FIELD_LABELS[f])

  const status = source.enabled ? (
    <Badge tone="success">Activa</Badge>
  ) : configured ? (
    <Badge>Inactiva</Badge>
  ) : (
    <Badge tone="warning">Sin configurar</Badge>
  )

  const toggle = async (enabled: boolean) => {
    setToggling(true)
    try {
      await updateSource(source.id, { enabled })
      toast(`Fuente ${source.slot} ${enabled ? 'activada' : 'desactivada'}.`, 'success')
    } catch (e) {
      toast(errorMessage(e), 'error')
    } finally {
      setToggling(false)
    }
  }

  const save = async (patch: ProductSourcePatch) => {
    await updateSource(source.id, patch)
    toast(`Fuente ${source.slot} guardada.`, 'success')
  }

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-sm font-semibold text-accent">
            {source.slot}
          </span>
          <h3 className="truncate font-semibold">{source.name}</h3>
        </div>
        {status}
      </div>

      <dl className="flex-1 divide-y divide-border px-4 py-3 sm:px-5">
        <Detail label="Planilla">
          {source.spreadsheetId ? (
            <span className="font-mono text-xs" title={source.spreadsheetId}>
              {source.spreadsheetId}
            </span>
          ) : (
            notSet
          )}
        </Detail>
        <Detail label="Pestaña">{source.sheetName ?? notSet}</Detail>
        <Detail label="Fila de encabezados">{source.headerRow}</Detail>
        <Detail label="Columnas">{mapped.length ? mapped.join(', ') : notSet}</Detail>
      </dl>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
        <Switch
          checked={source.enabled}
          onChange={toggle}
          disabled={toggling || (!configured && !source.enabled)}
          label={source.enabled ? 'Activa' : 'Inactiva'}
        />
        <Button variant="secondary" size="sm" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>
          {configured ? 'Editar' : 'Configurar'}
        </Button>
      </div>
      {!configured && (
        <p className="-mt-1 px-4 pb-3 text-xs text-muted sm:px-5">
          Para activarla completá planilla, pestaña y la columna del nombre.
        </p>
      )}

      <ProductSourceForm open={editing} source={source} onClose={() => setEditing(false)} onSubmit={save} />
    </Card>
  )
}
