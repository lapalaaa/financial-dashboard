import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import { ACCOUNT_KIND_LABELS, NAME_MAX_LENGTH } from '../constants'
import { errorMessage } from '../services'
import type { Account, AccountInput, AccountKind } from '../types'

const KIND_OPTIONS = (Object.keys(ACCOUNT_KIND_LABELS) as AccountKind[]).map((value) => ({
  value,
  label: ACCOUNT_KIND_LABELS[value],
}))

interface AccountFormProps {
  open: boolean
  /** null = nueva cuenta. */
  account: Account | null
  onClose: () => void
  onSubmit: (input: AccountInput) => Promise<void>
}

export function AccountForm(props: AccountFormProps) {
  return <AccountFormInner key={props.open ? (props.account?.id ?? 'new') : 'closed'} {...props} />
}

function AccountFormInner({ open, account, onClose, onSubmit }: AccountFormProps) {
  const [name, setName] = useState(account?.name ?? '')
  const [kind, setKind] = useState<AccountKind>(account?.kind ?? 'otro')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Escribí un nombre.')
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), kind })
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
      title={account ? 'Editar cuenta' : 'Nueva cuenta'}
      description="Indica de dónde salió el gasto. No registra saldos."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="account-form" loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={name}
          maxLength={NAME_MAX_LENGTH}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          placeholder="Ej. Tarjeta Visa"
          error={error}
          data-autofocus
          required
        />
        <Select label="Tipo" value={kind} onChange={(e) => setKind(e.target.value as AccountKind)} options={KIND_OPTIONS} />
      </form>
    </Modal>
  )
}
