# Mi Aplicación

Aplicación web personal con dos módulos:

- **Productos**: consulta de productos en dos planillas de Google Sheets (solo lectura) y registro del stock físico.
- **Finanzas**: registro de gastos por categoría y cuenta.

Funciona en PC y celular (web responsive).

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Recharts · Supabase

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar con los datos del proyecto de Supabase
npm run dev
```

Sin `.env`, `npm run dev` permite entrar en un **modo desarrollo** local para recorrer la interfaz
(no disponible en el build de producción).

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Chequeo de tipos + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | ESLint |

## Estructura

```
src/
├── app/          App, router, providers, tema, rutas protegidas
├── layouts/      Layout principal (sidebar en PC, barra inferior en celular)
├── pages/        Una página por sección
├── features/     Lógica por dominio (auth, products, finance, settings)
├── components/   Componentes compartidos; ui/ = kit base
├── hooks/        useTheme, useMediaQuery, useDebounce
└── lib/          supabase, formato (ARS / es-AR), utilidades
```

## Estado

- [x] Fase 0 — Esqueleto, navegación y kit de interfaz
- [ ] Fase 1 — Base de datos y Ajustes (categorías, cuentas, preferencias)
- [ ] Fase 2 — Finanzas
- [ ] Fase 3 — Conexión de solo lectura con Google Sheets
- [ ] Fase 4 — Productos y stock físico
- [ ] Fase 5 — Inicio y pulido
