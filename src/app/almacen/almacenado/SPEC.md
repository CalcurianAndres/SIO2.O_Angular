# Almacenado de productos — Especificación

## Layout
- **KPI Cards**: 3 cards en fila con patrón `kpi-card` del DESIGN_SPEC (kpi-orange, kpi-green, kpi-blue)
  - Stock crítico → naranja
  - Cero stock → rojo (kpi-orange con semántica de alerta)
  - En observación → azul
- **Buscador**: input de texto global con icono de búsqueda, debajo de KPIs
- **Tabla compacta**: zebra stripes, hover, scroll horizontal
  - Columnas: Icono + Grupo | Stock Total | Estado (badge) | Acción (ver detalle)
  - Paginación inferior: 10/25/50/100 registros
- **Modal detalle**: se mantiene `app-inventarios` existente (sin cambios)
- Módulo Almacén → color orange

## Estados visuales

| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && grupos.length === 0` | 5 skeleton rows |
| Vacío | `!cargando && grupos.length === 0` | Icono `fa-warehouse` + "No hay grupos registrados" |
| Datos | `grupos.length > 0` | Tabla paginada con KPI cards |

## KPIs
- **Stock crítico**: cantidad de materiales con stock total > 0 pero por debajo de un umbral
- **Cero stock**: cantidad de materiales con stock total === 0
- **En observación**: cantidad de grupos marcados con flag `parcial`
- Calculados dinámicamente desde `AlmacenService.Almacen` y `GruposService.grupos`

## Tabla
- Búsqueda global por nombre de grupo
- Badge de estado: `tag is-success` (normal), `tag is-warning` (crítico), `tag is-danger` (sin stock)
- Icono del grupo desde `grupo.icono` (fallback `fa-paperclip`)
- Click en fila o botón de acción → abre modal `app-inventarios` con detalle de materiales

## Formularios
- No aplica (solo vista de inventario + modal detalle existente)

## Flujo de datos
- `GruposService.grupos[]` → población de tabla
- `AlmacenService.Almacen` → cálculos de stock por grupo y KPIs
- `AlmacenService.BuscarPorGrupo(id)` → modal `app-inventarios`
- `AlmacenService.Registro` → detalle de registros dentro del modal
- Datos vía WebSockets (socket.io), mismos eventos que la implementación actual

## Diseño visual
- Módulo Almacén → color orange
- KPIs con gradientes via CSS variables (`kpi-orange`, `kpi-green`, `kpi-blue`)
- Tabla compacta con zebra stripes, hover, paginación
- Badges semáforo para estado de stock
- Dark/light via CSS variables
- Skeleton con `app-skeleton type="table"` durante carga

## BDD / Gherkin

```gherkin
Feature: Vista de inventario de almacén
  Como usuario de almacén quiero ver el inventario general
  para monitorear el stock de cada grupo de materiales

  Background:
    Given el usuario ha iniciado sesión en el módulo de Almacén
    And los datos de grupos y almacén están cargados vía WebSocket

  Scenario: Visualizar KPI cards con totales
    Given hay materiales en el almacén
    Then se muestran 3 KPI cards con stock crítico, cero stock y observación
    And los valores se calculan dinámicamente desde los datos

  Scenario: Filtrar grupos por búsqueda
    Given hay grupos registrados en la tabla
    When el usuario escribe "Papel" en el buscador
    Then la tabla muestra solo los grupos cuyo nombre contiene "Papel"
    And la paginación se resetea a la página 1

  Scenario: Navegar páginas de la tabla
    Given hay más de 10 grupos registrados
    When el usuario hace clic en "Siguiente"
    Then se muestran los grupos de la página 2
    When el usuario cambia el tamaño de página a 25
    Then se muestran hasta 25 grupos por página

  Scenario: Abrir detalle de grupo
    Given hay al menos un grupo en la tabla
    When el usuario hace clic en el icono de ver detalle
    Then se abre el modal de inventario con los materiales del grupo agrupados

  Scenario: Estado vacío
    Given no hay grupos registrados
    Then se muestra mensaje "No hay grupos registrados"
    And se muestra un icono de almacén

  Scenario: Carga de datos
    Given la página de inventario se está cargando
    Then se muestran skeleton rows animadas
    When los datos llegan del servidor
    Then las skeleton rows son reemplazadas por la tabla real
```

## Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ 🏭 Almacenado de productos                      [Naranja]   │
│ Inventario de productos almacenados                         │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐    │
│ │ ⚠️ 3           │ │ 🚫 0           │ │ 👁️ 2           │    │
│ │ Stock crítico  │ │ Cero stock     │ │ Observación    │    │
│ │ ▼ naranja      │ │ ▼ rojo         │ │ ▼ azul         │    │
│ └────────────────┘ └────────────────┘ └────────────────┘    │
│                                                             │
│ [🔍 Buscar grupo...                          ]              │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Grupo              │  Stock  │ Estado       │ Acción    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 📦 Papeles         │ 12,450  │ ✅ Normal     │ 👁️       │ │
│ │ 🧪 Químicos        │    850  │ ⚠️ Crítico    │ 👁️       │ │
│ │ 🥫 Envases         │      0  │ 🚫 Sin stock  │ 👁️       │ │
│ │ 📦 Cartón          │  8,200  │ ✅ Normal     │ 👁️       │ │
│ │ 🧪 Tintas          │  2,100  │ ✅ Normal     │ 👁️       │ │
│ │ 📦 Plásticos       │      0  │ 🚫 Sin stock  │ 👁️       │ │
│ │ 🥫 Tapas           │    450  │ ⚠️ Crítico    │ 👁️       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Mostrando 1-7 de 7                    [10] 25 50 100    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────┐           │
│ │ Al hacer clic en 👁️ se abre modal inventario │           │
│ │ ┌───────────────────────────────────────────┐ │           │
│ │ │ 📦 Papeles — Total: 12,450 Unidad(es)     │ │           │
│ │ │ ┌───────────────────────────────────────┐ │ │           │
│ │ │ │ Papel Bond (Marca): 8,000 Und(s) ▼   │ │ │           │
│ │ │ │ Papel Kraft (Marca): 4,450 Und(s) ▼  │ │ │           │
│ │ │ └───────────────────────────────────────┘ │ │           │
│ │ └───────────────────────────────────────────┘ │           │
│ └───────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```
