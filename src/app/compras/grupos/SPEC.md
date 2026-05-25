# Grupos de Materiales — Especificación

## Layout
- **Responsive grid** de tarjetas: 2 cols base, 3 cols ≥768px, 5 cols ≥1024px.
- Implementado con clase nativa `.grupo-grid` en el SCSS del componente (garantiza funcionamiento independientemente de Tailwind).
- Clases Tailwind coexisten como redundancia (`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4` no usadas actualmente).
- Cada tarjeta es un Bulma `.card` con header (icono + nombre + badge) y footer (3 acciones).
- Skeletons idénticos al grid de cards mientras `cargando && api.grupos.length === 0`.

## Estados visuales
| Estado | Condición | UI |
|--------|-----------|----|
| Carga inicial | `cargando && api.grupos.length === 0` | 5 skeleton cards |
| Vacío | `!cargando && api.grupos.length === 0` | Empty state con icono, texto, flecha animada |
| Datos | `api.grupos.length > 0` | Grid de cards |

## Modales (z-index stacking)
- Todos los modales tienen `z-index: 10000` (global en `styles.scss`).
- Orden en DOM determina superposición cuando múltiples modales están abiertos:
  1. `<app-nuevo-grupo>` (nuevo/editar grupo)
  2. `<app-materiales>` (lista de materiales)
  3. `<app-nuevo-material>` (nuevo material) — último para quedar encima del listado
  4. `<app-page-layout>` (fondo fijo con scroll)

## Formularios
- **Nuevo/Editar Grupo**: modal con Nombre + 3 checkboxes (parcial, sustrato, sin análisis).
- **Nuevo Material**: modal con Grupo (select), Nombre, Fabricante, Serie, Código.
- Todos los botones "Guardar" usan patrón `guardando`:
  - `guardando = true` al hacer clic → botón se deshabilita, icono spinner, texto "Guardando...".
  - `guardando = false` se resetea vía `ngOnChanges` cuando `@Input() nuevo`/`nuevo_material`/`editar` cambia a `true`.

## Flujo de datos
- `GruposService` usa WebSockets (socket.io):
  - `CLIENTE:NuevoGrupo` / `CLIENTE:deleteGrupo` / `CLIENTE:EditarGrupo`
  - Escucha `SERVER:NuevoGrupo` para agregar al array local.
- `MaterialesService` similar, con `filtrarGrupos(id)` para materiales de un grupo.
- `nuevo-material` recibe `selectedGrupo` como input para pre-seleccionar el grupo.

## Diseño visual (CSS)
- Colores vía CSS custom properties (`--bg-card`, `--text-primary`, `--accent-green`, etc.).
- Tema oscuro por defecto, claro con `[data-theme='light']`.
- Tailwind v3.4.19 configurado con `corePlugins: { preflight: false }` para coexistir con Bulma.
- `@tailwind utilities;` en `styles.scss` después de imports de Bulma.
- Componente usa `styleUrls` (ViewEncapsulation.Emulated) → estilos scoped con atributos `_ngcontent`.
- `.grupo-grid` nativo en SCSS del componente como respaldo con mayor especificidad.
