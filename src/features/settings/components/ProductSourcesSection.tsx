import { Database } from 'lucide-react'
import { useSettings } from '../settingsContext'
import { ProductSourceCard } from './ProductSourceCard'

/** Las dos fuentes, siempre en tarjetas separadas: nunca se combinan. */
export function ProductSourcesSection() {
  const { sources } = useSettings()

  return (
    <section aria-labelledby="sources-title">
      <div className="mb-3 flex items-start gap-3">
        <Database className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
        <div>
          <h2 id="sources-title" className="text-base font-semibold">
            Fuentes de productos
          </h2>
          <p className="text-sm text-muted">Dos plantillas de Google Sheets independientes. Solo lectura.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sources.map((s) => (
          <ProductSourceCard key={s.id} source={s} />
        ))}
      </div>
    </section>
  )
}
