import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../auth/authContext'
import { DEFAULT_PREFERENCES } from './constants'
import { isLocalSettings, settingsRepository as repo, SettingsError } from './services'
import { SettingsContext, type SettingsContextValue, type SettingsStatus } from './settingsContext'
import type { Account, Category, Preferences, ProductSource } from './types'

const byOrder = <T extends { sortOrder: number; name: string }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es')

const nextSortOrder = (items: Array<{ sortOrder: number }>) =>
  items.reduce((max, i) => Math.max(max, i.sortOrder), 0) + 1

const replaceById = <T extends { id: string }>(items: T[], item: T) => items.map((i) => (i.id === item.id ? item : i))

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { setPreference: setThemePreference } = useTheme()

  const [status, setStatus] = useState<SettingsStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [sources, setSources] = useState<ProductSource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  // Ignora respuestas de cargas anteriores (cambio de usuario, recargas rápidas).
  const loadId = useRef(0)
  const userId = user?.id ?? null

  const reload = useCallback(async () => {
    const id = ++loadId.current
    setStatus('loading')
    setError(null)
    try {
      await repo.bootstrap()
      const [prefs, srcs, cats, accs] = await Promise.all([
        repo.getPreferences(),
        repo.listSources(),
        repo.listCategories(),
        repo.listAccounts(),
      ])
      if (id !== loadId.current) return
      setPreferences(prefs)
      setSources(srcs)
      setCategories(cats)
      setAccounts(accs)
      setThemePreference(prefs.theme)
      setStatus('ready')
    } catch (e) {
      if (id !== loadId.current) return
      setError(e instanceof SettingsError ? e.message : 'No se pudo cargar la configuración.')
      setStatus('error')
    }
  }, [setThemePreference])

  useEffect(() => {
    if (userId) {
      void reload()
      return
    }
    loadId.current++
    setStatus('idle')
    setError(null)
    setPreferences(DEFAULT_PREFERENCES)
    setSources([])
    setCategories([])
    setAccounts([])
  }, [userId, reload])

  const updatePreferences = useCallback(
    async (patch: Partial<Preferences>) => {
      // El tema se aplica al instante; si falla el guardado se revierte.
      const previousTheme = preferences.theme
      if (patch.theme) setThemePreference(patch.theme)
      try {
        setPreferences(await repo.updatePreferences(patch))
      } catch (e) {
        if (patch.theme) setThemePreference(previousTheme)
        throw e
      }
    },
    [preferences.theme, setThemePreference],
  )

  const updateSource = useCallback<SettingsContextValue['updateSource']>(async (id, patch) => {
    const updated = await repo.updateSource(id, patch)
    setSources((prev) => replaceById(prev, updated))
  }, [])

  const createCategory = useCallback<SettingsContextValue['createCategory']>(
    async (input) => {
      const created = await repo.createCategory({ ...input, sortOrder: nextSortOrder(categories) })
      setCategories((prev) => [...prev, created].sort(byOrder))
    },
    [categories],
  )

  const updateCategory = useCallback<SettingsContextValue['updateCategory']>(async (id, patch) => {
    const updated = await repo.updateCategory(id, patch)
    setCategories((prev) => replaceById(prev, updated).sort(byOrder))
  }, [])

  const deleteCategory = useCallback<SettingsContextValue['deleteCategory']>(async (id) => {
    await repo.deleteCategory(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const createAccount = useCallback<SettingsContextValue['createAccount']>(
    async (input) => {
      const created = await repo.createAccount({ ...input, sortOrder: nextSortOrder(accounts) })
      setAccounts((prev) => [...prev, created].sort(byOrder))
    },
    [accounts],
  )

  const updateAccount = useCallback<SettingsContextValue['updateAccount']>(async (id, patch) => {
    const updated = await repo.updateAccount(id, patch)
    setAccounts((prev) => replaceById(prev, updated).sort(byOrder))
  }, [])

  const deleteAccount = useCallback<SettingsContextValue['deleteAccount']>(async (id) => {
    await repo.deleteAccount(id)
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const value = useMemo<SettingsContextValue>(
    () => ({
      status,
      error,
      isLocal: isLocalSettings,
      preferences,
      sources,
      categories,
      accounts,
      reload,
      updatePreferences,
      updateSource,
      createCategory,
      updateCategory,
      deleteCategory,
      createAccount,
      updateAccount,
      deleteAccount,
    }),
    [
      status,
      error,
      preferences,
      sources,
      categories,
      accounts,
      reload,
      updatePreferences,
      updateSource,
      createCategory,
      updateCategory,
      deleteCategory,
      createAccount,
      updateAccount,
      deleteAccount,
    ],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
