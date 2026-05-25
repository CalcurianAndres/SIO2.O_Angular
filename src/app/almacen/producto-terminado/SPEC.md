# Producto Terminado — Especificación

## Layout
- **KPI Cards**: 3 cards en fila con patrón `kpi-card` del DESIGN_SPEC (kpi-orange, kpi-blue, kpi-green)
  - Total productos → naranja
  - Total unidades → azul
  - Total OPs → verde
- **Buscador**: input de texto global con icono de búsqueda, debajo de KPIs
- **Tabla compacta**: zebra stripes, hover, sin scroll horizontal
  - Columnas: Producto (expandible) | Cantidad Total | OPs | Acción (notificar despacho)
  - Fila expandible con detalle de OPs (OP, Cantidad, Fecha de Fabricación)
  - Paginación inferior: 10/25/50/100 registros
- Módulo Almacén → color orange
- Sin `.card` wrapper alrededor de `.darker` (el bloque visual que molestaba fue eliminado)

## Estados visuales

| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && items.length === 0` | 5 skeleton rows (`app-skeleton type="table"`) |
| Vacío | `!cargando && filteredItems.length === 0` | Icono `fa-warehouse` + "No hay productos terminados disponibles" |
| Datos | `filteredItems.length > 0` | Tabla paginada con KPI cards |

## KPIs
- **Total productos**: cantidad de registros en `producto_terminado_agrupado`
- **Total unidades**: suma de `cantidadTotal` de todos los registros
- **Total OPs**: suma de `totalOPs` de todos los registros
- Calculados dinámicamente desde `OproduccionService.producto_terminado_agrupado`

## Tabla
- Búsqueda global por nombre de producto
- Fila principal: nombre del producto (click para expandir), cantidad total, total OPs, botón notificar despacho
- Fila expandida: tabla anidada con OP, cantidad, fecha de fabricación
- Chevron animado (gira 90°) al expandir/colapsar
- Paginación con selector de tamaño de página

## Formularios
- No aplica (solo vista de productos terminados + expansión de detalles)

## Flujo de datos
- `OproduccionService.producto_terminado_agrupado[]` → población de tabla
- Datos vía WebSockets (socket.io), mismos eventos que la implementación actual
- Cada item: `{ nombre, cantidadTotal, totalOPs, detalles: [{ opNumero, cantidad, fecha }] }`

## Diseño visual
- Módulo Almacén → color orange
- KPIs con gradientes via CSS variables (`kpi-orange`, `kpi-blue`, `kpi-green`)
- Tabla compacta con zebra stripes, hover, paginación
- Dark/light via CSS variables
- Skeleton con `app-skeleton type="table"` durante carga

## BDD / Gherkin

```gherkin
Feature: Vista de producto terminado
  Como usuario de almacén quiero ver los productos terminados
  para gestionar su despacho

  Background:
    Given el usuario ha iniciado sesión en el módulo de Almacén
    And los datos de producto terminado están cargados vía WebSocket

  Scenario: Visualizar KPI cards con totales
    Given hay productos terminados en el sistema
    Then se muestran 3 KPI cards con total de productos, unidades y OPs
    And los valores se calculan dinámicamente desde los datos

  Scenario: Filtrar productos por búsqueda
    Given hay productos registrados en la tabla
    When el usuario escribe "Mayonesa" en el buscador
    Then la tabla muestra solo los productos cuyo nombre contiene "Mayonesa"
    And la paginación se resetea a la página 1

  Scenario: Navegar páginas de la tabla
    Given hay más de 10 productos registrados
    When el usuario hace clic en "Siguiente"
    Then se muestran los productos de la página 2
    When el usuario cambia el tamaño de página a 25
    Then se muestran hasta 25 productos por página

  Scenario: Expandir detalle de producto
    Given hay al menos un producto en la tabla
    When el usuario hace clic en el nombre del producto
    Then se expande una fila con la tabla de OPs asociadas
    And se muestran OP, cantidad y fecha de fabricación

  Scenario: Colapsar detalle de producto
    Given un producto está expandido mostrando sus OPs
    When el usuario hace clic nuevamente en el nombre
    Then la fila de detalle se colapsa
    And el chevron vuelve a su posición original

  Scenario: Estado vacío
    Given no hay productos terminados registrados
    Then se muestra mensaje "No hay productos terminados disponibles"
    And se muestra un icono de almacén

  Scenario: Carga de datos
    Given la página de producto terminado se está cargando
    Then se muestran skeleton rows animadas
    When los datos llegan del servidor
    Then las skeleton rows son reemplazadas por la tabla real
```

## Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ 🏭 Producto Terminado                          [Naranja]    │
│ Producto finalizado para despacho                           │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐    │
│ │ 📦 12          │ │ 🔢 1,245,000  │ │ 📋 45          │    │
│ │ Total productos│ │ Total unid.   │ │ Total OPs      │    │
│ │ ▼ naranja      │ │ ▼ azul        │ │ ▼ verde        │    │
│ └────────────────┘ └────────────────┘ └────────────────┘    │
│                                                             │
│ [🔍 Buscar producto terminado...              ]             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Producto           │ Cantidad   │ OPs    │ Acción       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ▶ Mayonesa         │ 500,000    │ 2 OP   │ 🚚          │ │
│ │   ┌───────────────────────────────────────────────────┐ │ │
│ │   │ OP    │ Cantidad │ Fecha de Fabricación           │ │ │
│ │   ├───────┼──────────┼────────────────────────────────┤ │ │
│ │   │ 001   │ 250,000  │ lun, 25 may, 10:30 AM         │ │ │
│ │   │ 002   │ 250,000  │ mar, 26 may, 2:15 PM          │ │ │
│ │   └───────┴──────────┴────────────────────────────────┘ │ │
│ │ ▶ Cerveza           │ 200,000    │ 1 OP   │ 🚚          │ │
│ │ ▶ Flips             │  80,000    │ 1 OP   │ 🚚          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Mostrando 1-3 de 3                    [10] 25 50 100    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Skeleton (cargando) ────────────────────────────────┐ │
│ │  ░░░░░░░░░   ░░░░░░░░░   ░░░   ░░                      │ │
│ │  ░░░░░░░░░   ░░░░░░░░░   ░░░   ░░                      │ │
│ │  ░░░░░░░░░   ░░░░░░░░░   ░░░   ░░                      │ │
│ │  ░░░░░░░░░   ░░░░░░░░░   ░░░   ░░                      │ │
│ │  ░░░░░░░░░   ░░░░░░░░░   ░░░   ░░                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Empty state ─────────────────────────────────────────┐ │
│ │              🏪 No hay productos terminados              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
