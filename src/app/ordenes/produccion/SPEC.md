# Órdenes de Producción — Especificación

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SectionHeader: Órdenes de producción (purple)   [icono fa-industry]    │
├─────────────────────────────────────────────────────────────────────────┤
│ [+ Orden] [+ Despacho]                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─── Carrusel de OPs (step-indicator style) ──────────────────────────┐ │
│ │                                                                     │ │
│ │  ◀  ●──●──●──●──●──●──●──●──●──●──●──●  ▶                        │ │
│ │      OP  OP  OP  OP  OP  OP  OP  OP  OP                             │ │
│ │      001 002 003 004 005 006 007 008 009                             │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ OP-2025-001  |  Etiqueta X  |  Cliente: Acme Corp  |  📅 15/05 │ │ │
│ │ │ [████████░░░░░░] 60%                                            │ │ │
│ │ │ [⚙️ Gestiones] [↩️ Devolución] [🛒 Solicitudes] [🚚 Despacho]  │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─── kpi-card kpi-orange ──┐ ┌─── kpi-card kpi-green ────┐ ┌─── kpi-card kpi-blue ──┐ │
│ │ 12                       │ │ 156                       │ │ 89                     │ │
│ │ Órdenes <strong>Activas</strong>│ Órdenes <strong>Año</strong>         │ Órdenes <strong>Cerradas</strong>      │ │
│ │ MAYO 2026                │ │ 2026                      │ │ 2026                   │ │
│ └──────────────────────────┘ └───────────────────────────┘ └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─── Filtros ──────────────────────────────────────────────────────────┐ │
│ │ Buscar por: [OP ▼] [input]  [OC ▼] [input]                          │ │
│ │ [Cliente ▼] [select]  [Producto ▼] [select ▼] [select ▼]            │ │
│ │ [Fecha ▼] [desde] [hasta] [🔍 Buscar]                               │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─── Resultados (tabla paginada, sincronizada con carrusel) ──────────┐ │
│ │ OP     │ Producto      │ Cliente   │ Solicitud │ Acciones           │ │
│ │────────┼───────────────┼───────────┼───────────┼───────────────────┤ │
│ │ ▸ 001  │ Etiqueta X    │ Acme      │ 15/05     │ [ℹ][⚙][↩][🛒][🚚] │ │
│ │   002  │ Film Y        │ Beta SA   │ 14/05     │ [ℹ][⚙][↩][🛒][🚚] │ │
│ │   003  │ Bolsa Z       │ Gamma     │ 13/05     │ [ℹ][⚙][↩][🛒][🚚] │ │
│ │ ...    │               │           │           │                   │ │
│ │─────────────────────────────────────────────────────────────────────│ │
│ │ Pág 1 de 5  [10/pág] [<][1][2][3]...[>]                           │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Carrusel de OPs

- **Estilo visual**: idéntico al step wizard de nuevo producto (DESIGN_SPEC.md § Formularios multi-paso)
  - `step-indicator` con dots conectados por línea horizontal
  - Cada dot representa una OP, label debajo con su N°
  - Dot activo: `--accent-purple`, escala 1.1
  - Dot completado: `--status-success`
  - Navegación: flechas ◀ ▶ a los lados, dots clicables
- **Tarjeta de vista previa** debajo del indicador:
  - Muestra OP, producto, cliente, fecha
  - Barra de progreso (hojas gestionadas / total)
  - Botones de acción directa: Gestiones, Devolución, Solicitudes, Despacho
- **Sincronización**: al navegar el carrusel, la fila correspondiente en la tabla recibe clase `.is-selected`
- **OPs pendientes por asignar** aparecen primero con indicador visual (badge `--status-warning`)

## Estados visuales

| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `api.orden` vacío y cargando | Skeleton: 3 dots + card placeholder con `skeleton-pulse` |
| Vacío | `api.orden.length === 0` y no cargando | Icono `fa-industry` + "No hay órdenes de producción" + hint |
| Datos | `api.orden.length > 0` | Carrusel + KPIs + tabla paginada |
| Guardando | `guardando === true` | Botón disabled + `fa-spinner fa-pulse` + "Guardando…" |

## KPIs (estándar `kpi-card`)

| Card | Clase | Fuente de datos |
|------|-------|-----------------|
| Órdenes activas | `kpi-orange` | `api.orden.length` |
| Órdenes del año | `kpi-green` | Filtradas por año actual |
| Cerradas | `kpi-blue` | `api.orden.filter(estado === 'cerrada').length` |

Layout: 3 columnas con `columns is-variable is-2`. Ver DESIGN_SPEC.md § KPI Cards.

## Filtros

Mantener los filtros existentes con su comportamiento actual:
- `parametro_busqueda` select: OP, OC, Cliente, Producto, Fecha
- `filtrarResultados()`, `filtrarResultadosOC()`, `filtrarResultadosCliente()`, `filtrarResultadosProducto()`, `BuscarPorFecha()`
- Los filtros afectan tanto al carrusel como a la tabla

## Tabla de resultados

- Sincronizada con carrusel: fila activa con `.is-selected`
- Columnas: OP, Producto, Cliente, Solicitud, Acciones
- Paginación: 10/25/50/100 por página
- Filas zebra, hover highlight
- Botones de acción: info, gestiones, devolución, solicitud, despacho

## Botones de acción en tarjeta del carrusel

| Botón | Icono | Modal |
|-------|-------|-------|
| Gestiones | `fa-tasks` | Modal de gestiones existente |
| Devolución | `fa-undo` | `app-devoluciones` |
| Solicitudes | `fa-shopping-cart` | `app-solicitudes` |
| Despacho | `fa-truck` | Modal de despachos existente |

## Formularios

- **Nueva OP**: modal step wizard (DESIGN_SPEC.md § Formularios multi-paso) con pasos: Identificación, Dimensiones, Sustrato/Impresión, Tintas/Barniz, Embalaje, Resumen.
- **Despacho**: modal existente (planificación de despachos con selector de OP, tabla de despachos, observación).
- Patrón `guardando` en todos los modales con save.

## Diseño visual

- **Módulo**: Producción → `--accent-purple` (header, dot activo, badges)
- **KPIs**: estándar `kpi-card` con colores por tipo (orange/green/blue)
- **Carrusel**: CSS vars (`--bg-secondary`, `--border-color`, `--accent-purple`, `--status-success`)
- **Tema**: dark/light vía CSS variables, sin colores hardcodeados
- **Tabla**: compacta con `is-fullwidth is-striped`, scroll horizontal

## BDD / Gherkin

```gherkin
Feature: Carrusel de Órdenes de Producción
  Como usuario quiero navegar las órdenes de producción en un carrusel
  para visualizar, filtrar y gestionar cada una rápidamente.

  Background:
    Given el módulo Producción está abierto
    And el servicio OproduccionService tiene datos cargados

  Scenario: Navegar carrusel con dots
    Given hay 5 órdenes de producción activas
    When el usuario hace clic en el tercer dot del carrusel
    Then la tarjeta muestra la información de la tercera OP
    And la tabla resalta la fila correspondiente

  Scenario: Filtrar y carrusel se actualiza
    Given el carrusel muestra todas las OPs
    When el usuario selecciona "Cliente" y elige "Acme Corp"
    Then el carrusel muestra solo las OPs de Acme Corp
    And los dots se actualizan con el nuevo total

  Scenario: Abrir gestiones desde el carrusel
    Given una tarjeta de OP está visible en el carrusel
    When el usuario hace clic en el botón de gestiones
    Then se abre el modal de gestiones con los datos de la OP

  Scenario: Crear nueva OP con step wizard
    Given el modal de nueva OP está abierto
    When el usuario completa todos los pasos y guarda
    Then la OP aparece en el carrusel y la tabla

  Scenario: Carrusel vacío
    Given no hay órdenes de producción
    Then se muestra icono y mensaje de vacío
    And el carrusel y KPIs no se renderizan

  Scenario: Skeleton mientras carga
    Given los datos están cargando
    Then se muestran placeholders skeleton con animación pulse
```

## Data Flow

```
OproduccionService.orden → api.orden (todas las OPs)
  ├─ Filtros → resultados (getter)
  ├─ Carrusel → resultados[currentIndex]
  ├─ Tabla → resultados (paginados)
  └─ KPIs → api.orden.length, filtro año, filtro cerradas

Acciones desde carrusel/tabla:
  └─ Gestiones   → abre modal con orden_selected
  └─ Devolución  → abre app-devoluciones con op
  └─ Solicitudes → abre app-solicitudes con op
  └─ Despacho    → abre modal planificación con op en selector

Nueva OP:
  └─ Step wizard modal → api.nuevaOrden() → WebSocket → actualiza api.orden
```

## Mockup ASCII

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🏭 Órdenes de producción          [color: purple]                       │
├──────────────────────────────────────────────────────────────────────────┤
│ [➕ Orden] [🚚 Despacho]                                                 │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │  ◀  ●──●──●──●──●──●──●──●──●   ▶                                 │ │
│ │    001 002 003 004 005 006 007 008 009                               │ │
│ │ ┌──────────────────────────────────────────────────────────────────┐ │ │
│ │ │ OP-2025-001   Producto: Etiqueta X  Cliente: Acme Corp           │ │ │
│ │ │ [████████░░░░░░░░] 60%   📅 15/05/2026                           │ │ │
│ │ │ [⚙️ Gestiones] [↩️ Devolución] [🛒 Solicitudes] [🚚 Despacho]   │ │ │
│ │ └──────────────────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
├──────────────────┬─────────────────────┬────────────────────────────────┤ │
│   ┌────────────┐ │  ┌──────────────┐   │  ┌──────────────┐            │ │
│   │ 12         │ │  │ 156          │   │  │ 89           │            │ │
│   │ Activas    │ │  │ Año          │   │  │ Cerradas     │            │ │
│   │ MAY 2026   │ │  │ 2026         │   │  │ 2026         │            │ │
│   └────────────┘ │  └──────────────┘   │  └──────────────┘            │ │
├──────────────────┴─────────────────────┴────────────────────────────────┤ │
│ ┌─── Filtros ─────────────────────────────────────────────────────────┐ │
│ │ [OP ___] [Cliente: Acme Corp ▼] [Fecha: 15/05 ░░ 20/05] [🔍]      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─── Resultados ───────────────────────────────────────────────────────┐ │
│ │ OP       │ Producto       │ Cliente   │ Solicitud │ Acciones        │ │
│ │──────────┼────────────────┼───────────┼───────────┼─────────────────┤ │
│ │ ▸ 001    │ Etiqueta X     │ Acme      │ 15/05     │ [ℹ][⚙][↩][🛒]  │ │
│ │   002    │ Film Y         │ Beta SA   │ 14/05     │ [ℹ][⚙][↩][🛒]  │ │
│ │   003    │ Bolsa Z        │ Gamma     │ 13/05     │ [ℹ][⚙][↩][🛒]  │ │
│ │ ...      │                │           │           │                 │ │
│ │──────────────────────────────────────────────────────────────────────│ │
│ │ Pág 1 de 5   [10/pág]   [<] [1] [2] [3] ... [>]                   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```
