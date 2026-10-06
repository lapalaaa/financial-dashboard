import { ArrowLeftRight, Banknote, CreditCard, Plus, Smartphone, Wallet, type LucideIcon } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../../components/ui/Card'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useToast } from '../../../components/ui/toastContext'
import { ACCOUNT_KIND_LABELS } from '../constants'
import { useListManager } from '../hooks/useListManager'
import { useSettings } from '../settingsContext'
import type { Account, AccountInput, AccountKind } from '../types'
import { AccountForm } from './AccountForm'
import { ManagedList } from './ManagedList'

const KIND_ICONS: Record<AccountKind, LucideIcon> = {
  efectivo: Banknote,
  debito: CreditCard,
  credito: CreditCard,
  billetera: Smartphone,
  transferencia: ArrowLeftRight,
  otro: Wallet,
}

export function AccountManager() {
  const { accounts, createAccount, updateAccount, deleteAccount } = useSettings()
  const { toast } = useToast()
  const list = useListManager<Account>({
    label: 'Cuenta',
    setArchived: (id, archived) => updateAccount(id, { archived }),
    remove: deleteAccount,
  })

  const editing = list.editing === 'new' ? null : list.editing

  const handleSubmit = async (input: AccountInput) => {
    if (editing) await updateAccount(editing.id, input)
    else await createAccount(input)
    toast(editing ? 'Cuenta actualizada.' : 'Cuenta creada.', 'success')
  }

  return (
    <Card>
      <CardHeader
        icon={<Wallet className="h-5 w-5" />}
        title="Cuentas"
        description="Desde dónde salió cada gasto."
        action={
          <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={list.openNew}>
            Nueva
          </Button>
        }
      />
      <CardBody className="pt-2">
        <ManagedList
          items={accounts}
          emptyText="No hay cuentas activas."
          busyId={list.busyId}
          renderLeading={(a) => {
            const Icon = KIND_ICONS[a.kind]
            return (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted">
                <Icon className="h-4 w-4" />
              </span>
            )
          }}
          renderMeta={(a) => ACCOUNT_KIND_LABELS[a.kind]}
          onEdit={list.openEdit}
          onToggleArchived={list.toggleArchived}
          onDelete={list.askDelete}
        />
      </CardBody>

      <AccountForm open={list.editing !== null} account={editing} onClose={list.closeForm} onSubmit={handleSubmit} />

      <ConfirmDialog
        open={list.deleting !== null}
        onClose={list.cancelDelete}
        onConfirm={list.confirmDelete}
        loading={list.deletePending}
        danger
        title="Eliminar cuenta"
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
