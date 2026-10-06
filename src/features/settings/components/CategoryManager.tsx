import { Plus, Tags } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../../components/ui/Card'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useToast } from '../../../components/ui/toastContext'
import { useListManager } from '../hooks/useListManager'
import { useSettings } from '../settingsContext'
import type { Category, CategoryInput } from '../types'
import { CategoryForm } from './CategoryForm'
import { ManagedList } from './ManagedList'

export function CategoryManager() {
  const { categories, createCategory, updateCategory, deleteCategory } = useSettings()
  const { toast } = useToast()
  const list = useListManager<Category>({
    label: 'Categoría',
    setArchived: (id, archived) => updateCategory(id, { archived }),
    remove: deleteCategory,
  })

  const editing = list.editing === 'new' ? null : list.editing

  const handleSubmit = async (input: CategoryInput) => {
    if (editing) await updateCategory(editing.id, input)
    else await createCategory(input)
    toast(editing ? 'Categoría actualizada.' : 'Categoría creada.', 'success')
  }

  return (
    <Card>
      <CardHeader
        icon={<Tags className="h-5 w-5" />}
        title="Categorías"
        description="Para clasificar tus gastos."
        action={
          <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={list.openNew}>
            Nueva
          </Button>
        }
      />
      <CardBody className="pt-2">
        <ManagedList
          items={categories}
          emptyText="No hay categorías activas."
          busyId={list.busyId}
          renderLeading={(c) => (
            <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} aria-hidden="true" />
          )}
          onEdit={list.openEdit}
          onToggleArchived={list.toggleArchived}
          onDelete={list.askDelete}
        />
      </CardBody>

      <CategoryForm open={list.editing !== null} category={editing} onClose={list.closeForm} onSubmit={handleSubmit} />

      <ConfirmDialog
        open={list.deleting !== null}
        onClose={list.cancelDelete}
        onConfirm={list.confirmDelete}
        loading={list.deletePending}
        danger
        title="Eliminar categoría"
        message={
          <>
            ¿Eliminar <strong>{list.deleting?.name}</strong>? Si tiene gastos asociados no se va a poder eliminar; en ese
            caso archivala.
          </>
        }
        confirmLabel="Eliminar"
      />
    </Card>
  )
}
