import { useState, type ReactNode } from 'react'
import { Archive, ArchiveRestore, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '../../../components/ui/IconButton'
import { Spinner } from '../../../components/ui/Spinner'
import { cn } from '../../../lib/cn'

interface ManagedItem {
  id: string
  name: string
  archived: boolean
}

interface ManagedListProps<T extends ManagedItem> {
  items: T[]
  /** Ícono o color a la izquierda del nombre. */
  renderLeading?: (item: T) => ReactNode
  /** Texto secundario debajo del nombre. */
  renderMeta?: (item: T) => ReactNode
  onEdit: (item: T) => void
  onToggleArchived: (item: T) => void
  onDelete: (item: T) => void
  /** Fila con una acción en curso. */
  busyId?: string | null
  emptyText: string
}

/** Lista de elementos editables con archivado: activos arriba, archivados plegados. */
export function ManagedList<T extends ManagedItem>({
  items,
  renderLeading,
  renderMeta,
  onEdit,
  onToggleArchived,
  onDelete,
  busyId,
  emptyText,
}: ManagedListProps<T>) {
  const [showArchived, setShowArchived] = useState(false)
  const active = items.filter((i) => !i.archived)
  const archived = items.filter((i) => i.archived)

  const row = (item: T) => {
    const busy = busyId === item.id
    return (
      <li key={item.id} className="flex items-center gap-3 py-2">
        {renderLeading && <span className="shrink-0">{renderLeading(item)}</span>}
        <div className={cn('min-w-0 flex-1', item.archived && 'text-muted')}>
          <p className="truncate text-sm font-medium">{item.name}</p>
          {renderMeta && <p className="truncate text-xs text-muted">{renderMeta(item)}</p>}
        </div>
        {busy ? (
          <Spinner size="sm" className="mx-2 text-muted" />
        ) : (
          <div className="flex shrink-0 items-center">
            <IconButton label={`Editar ${item.name}`} icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(item)} />
            <IconButton
              label={item.archived ? `Restaurar ${item.name}` : `Archivar ${item.name}`}
              icon={item.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              onClick={() => onToggleArchived(item)}
            />
            <IconButton
              label={`Eliminar ${item.name}`}
              icon={<Trash2 className="h-4 w-4" />}
              className="hover:text-danger"
              onClick={() => onDelete(item)}
            />
          </div>
        )}
      </li>
    )
  }

  return (
    <div>
      {active.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-border">{active.map(row)}</ul>
      )}

      {archived.length > 0 && (
        <div className="mt-2 border-t border-border pt-2">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            aria-expanded={showArchived}
            className="flex w-full items-center justify-between rounded-md py-1.5 text-sm text-muted hover:text-fg"
          >
            Archivadas ({archived.length})
            <ChevronDown className={cn('h-4 w-4 transition-transform', showArchived && 'rotate-180')} />
          </button>
          {showArchived && <ul className="divide-y divide-border">{archived.map(row)}</ul>}
        </div>
      )}
    </div>
  )
}
