# Reglas definitivas del proyecto

Estas reglas son de cumplimiento obligatorio en todas las fases. Ante una duda de diseño,
prevalecen sobre cualquier otra decisión técnica.

---

## 1. Las dos fuentes de productos

| Ranura | Planilla | Hoja principal |
|---|---|---|
| **Fuente A** | INVENTARIO PROVEEDORES DE ARGENTINA | INVENTARIO INICIAL |
| **Fuente B** | INVENTARIO PRODUCTOS IMPORTADOS | INVENTARIO INICIAL |

- Son **dos fuentes completamente independientes**. Cada una tiene su propia configuración
  (planilla, hoja, fila de encabezados y mapeo de columnas) en `product_sources`.
- **Nunca se mezclan ni se sobrescriben entre sí**: no hay catálogo unificado. Si un mismo
  producto aparece en A y en B, son dos registros distintos.
- Ambas planillas usan una hoja llamada igual (`INVENTARIO INICIAL`). Eso no las vincula:
  cada fuente se identifica por su ranura (`slot` A/B) y su `spreadsheet_id`, nunca por el
  nombre de la hoja.

## 2. Google Sheets / Excel son solo lectura

Las planillas son **fuentes externas de referencia**. La aplicación **nunca** modifica
ninguna celda: ni nombres, ni SKU, ni códigos, ni colores, ni medidas, ni el stock de la
planilla, ni ningún otro dato.

Toda la información propia de la aplicación vive en **Supabase**.

**Ejemplo**

| Momento | Planilla | Web (`physical_stock`) |
|---|---|---|
| Situación inicial | stock = 29 | — |
| El usuario indica que físicamente tiene 0 | stock = **29** (sin cambios) | 0 |
| Después cambia el stock físico a 5 | stock = **29** (sin cambios) | 5 |

Cómo se garantiza:

- La lectura futura (Edge Function `sheets-read`, Fase 3) usará el permiso
  `spreadsheets.readonly` de Google y una service account con rol **Lector**.
- No existe ni debe existir código que escriba en Google Sheets.

## 3. Stock en planilla vs. stock físico

- La columna de unidades de la planilla se muestra siempre como
  **"Stock en planilla (referencia)"**.
- **Nunca** se usa como stock físico ni entra en ningún cálculo de stock físico, tampoco
  como valor inicial de un formulario.
- El stock físico lo decide solo el usuario:
  - "¿Tenés este producto?" **No** → `has_product = false`, `quantity = 0`.
  - **Sí** → `has_product = true`, `quantity >= 1` (lo que el usuario ingrese).
  - La base lo exige con el CHECK `physical_stock_answer_matches_quantity`.
- El valor de la planilla en el momento del conteo se puede guardar como copia informativa
  en `sheet_stock_ref` (texto). Es solo un registro histórico, no un dato de cálculo.

## 4. Los códigos de barras no siempre son únicos

Un mismo código de barras puede aparecer **varias veces dentro de una fuente**, con distintas
variantes de **COLOR / MEDIDA**.

> Ejemplo: `6956526492062` aparece como NEGRO, ROJO, VERDE AGUA y AZUL.

Consecuencias para la fase del catálogo (Fase 4). **Todavía no está implementado**:

- El código de barras **no** identifica por sí solo una variante.
- El buscador debe devolver **todas** las coincidencias de un código, nunca solo la primera.
- Si un código devuelve varias variantes, la interfaz debe mostrarlas con sus atributos
  (color, medida) y **dejar elegir** la correcta antes de registrar stock. Nunca se abre
  automáticamente el detalle cuando hay más de una coincidencia.
- La misma precaución vale para el SKU y el nombre: si se repiten dentro de una fuente, la
  variante se distingue por sus atributos.
- Para el mapeo de columnas hará falta indicar qué columnas definen la variante (por
  ejemplo, COLOR y MEDIDA). Se puede agregar dentro de `column_map` (jsonb) sin cambiar el
  esquema.

## 5. Stock físico: siempre por usuario + fuente + producto/variante

- Cada registro de `physical_stock` pertenece a **usuario + fuente + producto/variante**,
  con la restricción única `(user_id, source_id, product_key)`.
- La Fuente A y la Fuente B mantienen **stocks completamente separados**. La base impide
  además que un stock apunte a una fuente de otro usuario (FK compuesta `(source_id, user_id)`).
- **`product_key` identifica la variante, no solo el producto.** Orden de construcción:
  1. SKU normalizado (`sku:…`)
  2. si no hay SKU, código de barras (`bc:…`)
  3. si no hay ninguno, nombre normalizado (`name:…`)

  Cuando el valor elegido no es único dentro de la fuente (regla 4), la clave **debe
  incluir los atributos de la variante**, por ejemplo `bc:6956526492062|color:negro`.
  El CHECK actual (`^(sku|bc|name):.+$`) ya admite ese formato, así que no requiere
  migración.
- **Nunca** se usa el número de fila de la planilla como identificador: cambia si se
  reordena o se insertan filas.
- Cada conteo queda en `physical_stock_history`, que solo se escribe por trigger y el
  usuario no puede modificar.

---

## Dónde se aplican estas reglas en el código

| Regla | Lugar |
|---|---|
| Fuentes separadas, solo lectura | `supabase/migrations/…_initial_schema.sql` (`product_sources`), `src/features/settings/` |
| Stock físico NO → 0 / SÍ → ≥ 1 | CHECK en `physical_stock` y `physical_stock_history` |
| Stock separado por fuente | Restricción única + FK compuesta en `physical_stock` |
| Stock en planilla = referencia | `ColumnMap.sheetStock` y `sheet_stock_ref` (ver comentarios en los tipos) |
| Variantes y `product_key` | Comentarios en `src/types/database.ts`; implementación en la Fase 4 |
