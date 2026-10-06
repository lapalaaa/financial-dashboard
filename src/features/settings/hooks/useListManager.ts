import { useState } from 'react'
import { useToast } from '../../../components/ui/toastContext'
import { errorMessage } from '../services'

interface ListItem {
  id: string
  name: string
  archived: boolean
}

interface Options {
  /** "Categoría", "Cuenta"… (sustantivo femenino, para los avisos). */
  label: string
  setArchived: (id: string, archived: boolean) => Promise<void>
  remove: (id: string) => Promise<void>
}

/** Estado y acciones comunes de los administradores de categorías y cuentas. */
export function useListManager<T extends ListItem>({ label, setArchived, remove }: Options) {
  const { toast } = useToast()
  const [editing, setEditing] = useState<T | 'new' | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const toggleArchived = async (item: T) => {
    setBusyId(item.id)
    try {
      await setArchived(item.id, !item.archived)
      toast(`${label} ${item.archived ? 'restaurada' : 'archivada'}.`, 'success')
    } catch (e) {
      toast(errorMessage(e), 'error')
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletePending(true)
    try {
      await remove(deleting.id)
      toast(`${label} eliminada.`, 'success')
      setDeleting(null)
    } catch (e) {
      // Ej.: tiene gastos asociados → el mensaje sugiere archivarla.
      toast(errorMessage(e), 'error')
      setDeleting(null)
    } finally {
      setDeletePending(false)
    }
  }

  return {
    editing,
    openNew: () => setEditing('new'),
    openEdit: (item: T) => setEditing(item),
    closeForm: () => setEditing(null),
    deleting,
    askDelete: (item: T) => setDeleting(item),
    cancelDelete: () => setDeleting(null),
    confirmDelete,
    deletePending,
    busyId,
    toggleArchived,
  }
}
