import { useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { cn } from '../../../lib/cn'
import { CATEGORY_COLORS, NAME_MAX_LENGTH } from '../constants'
import { errorMessage } from '../services'
import type { Category, CategoryInput } from '../types'

interface CategoryFormProps {
  open: boolean
  /** null = nueva categoría. */
  category: Category | null
  onClose: () => void
  onSubmit: (input: CategoryInput) => Promise<void>
}

export function CategoryForm(props: CategoryFormProps) {
  // `key` reinicia el formulario cada vez que cambia la categoría editada.
  return <CategoryFormInner key={props.open ? (props.category?.id ?? 'new') : 'closed'} {...props} />
}

function CategoryFormInner({ open, category, onClose, onSubmit }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? '')
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Escribí un nombre.')
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), color })
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={category ? 'Editar categoría' : 'Nueva categoría'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="category-form" loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={name}
          maxLength={NAME_MAX_LENGTH}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          placeholder="Ej. Supermercado"
          error={error}
          data-autofocus
          required
        />
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Color</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={c}
                onClick={() => setColor(c)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition-shadow',
                  color === c && 'ring-2 ring-fg/60',
                )}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
