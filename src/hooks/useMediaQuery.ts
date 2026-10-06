import { useCallback, useSyncExternalStore } from 'react'

/** true mientras la media query coincida. Ej: useMediaQuery('(min-width: 768px)') */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Mismo corte que el breakpoint `md` de Tailwind. */
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)')
