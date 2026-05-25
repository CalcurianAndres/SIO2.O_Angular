# Análisis Pendientes — Especificación

## Layout
- **Lista principal**: dentro de `<app-page-layout>` con `<app-section-header>` color red (módulo Laboratorio, icono `fa-flask`)
- **KPIs**: fila de 3 `kpi-card` (orange, green, blue) entre el section-header y la tabla
- **Tabla paginada**: compacta, zebra, scroll horizontal, con materiales pendientes
- **Filtros**: sección "Buscador" con selector de tipo (Grupo/Lote/Fecha/Fabricante)
- **Estadísticas**: sección al final con tabla aprobados/rechazados + últimos 5 análisis

## Estados visuales

| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && pendientes.length === 0` | Skeleton rows con `<app-skeleton type="table">` |
| Vacío | `!cargando && pendientes.length === 0` | Icono `fa-flask` + "No hay materiales pendientes por analizar" |
| Datos | `pendientes.length > 0` | Tabla paginada con badges de estado |

## KPIs
- **Analizados este mes** (`kpi-orange`): `analisisService.analisisMensuales`
- **Analizados este año** (`kpi-green`): `analisisService.analisisAnuales`
- **Promedio días resolución** (`kpi-blue`): promedio calculado desde recepción hasta resultado

## Filtros (Buscador)
- **Tipo de búsqueda**: select con Grupo, Lote, Fecha
- **Grupo**: select con grupos; al seleccionar aparece select anidado de materiales
- **Lote**: input texto
- **Fecha**: inputs date Desde / Hasta
- **Botón buscar**: `button is-success` con `fa-search`
- **Contador**: "N resultado(s) obtenido(s)" que abre modal de resultados

## Tabla de pendientes

### Columnas
| Columna | Contenido |
|---------|-----------|
| Estado | Badge: `is-danger` PENDIENTE, `is-warning` EN PROCESO, `is-success` POR VALIDAR |
| Lote | `material[0].lote` |
| Material | nombre + dimensiones + gramaje/calibre + fabricante + serie |
| Cantidad | peso calculado + unidad |
| Acciones | `fa-vial` (analizar) y `fa-tags` (etiquetas) |

### Paginación
- 10/25/50/100 registros por página
- Controles `< 1 2 3 ... N >`

## Acción "Analizar"
- Según `material[0].material.grupo`:
  - `trato === true` → `AnalisisSustratoComponent`
  - `'Tintas'` o `'Barniz s/impresión'` → `AnalisisTintaComponent`
  - `'Cajas Corrugadas'` → `AnalisisCajasComponent`
  - `'Soportes de Embalaje'` → `AnalisisPadsComponent`
  - Otro → `AnalisisOtrosComponent`
- Soporta `PreparacionesTinta()` con su propio flujo

## Estadísticas

### Tabla Aprobados/Rechazados por tipo
| Tipo | Aprobados | Rechazados |
|------|-----------|------------|
| Sustrato | `analisis.SustratoAprobado` | `analisis.SustratoRechazado` |
| Tinta | `analisis.TintasAprobadas` | `analisis.TintasRechazadas` |
| Cajas | `analisis.CajasAceptadas` | `analisis.CajasRechazadas` |
| Pads | `analisis.PadsAprobados` | `analisis.PadsRechazados` |
| Otros | `analisis.OtrosAprobados` | `analisis.OtrosRechazados` |

### Últimos 5 análisis
- Lote + Resultado (badge `is-success`/`is-danger`) + icono info

## Flujo de datos
- **RecepcionService** → `recepciones[]` con materiales
  - Filtro: `status === 'En observacion'` y análisis no completado/validado
  - Filtros locales: `filtrarMaterialesPorGrupoYAnalisis()`, `filtrarMaterialesPorLoteYAnalisis()`, `filtrarMaterialesporFecha()`
- **AnalisisService** → contadores, aprobados/rechazados, `lastFives`, `BuscarAnalisis()`
- **GruposService** → grupos para filtro
- **MaterialesService** → `filtrarGrupos()` para filtro anidado
- **SolicitudesService** → `PreparacionesTinta()`

## Diseño visual
- Módulo **Laboratorio** → color red
- Tabla compacta con filas zebra
- Badges: `is-danger` (PENDIENTE/RECHAZADO), `is-warning` (EN PROCESO), `is-success` (POR VALIDAR/APROBADO)
- KPI cards con CSS variables (patrón DESIGN_SPEC.md)
- Dark/light via CSS variables
- Skeleton + empty state con icono

## BDD / Gherkin

```gherkin
Feature: Análisis Pendientes
  Como usuario de laboratorio quiero ver los materiales pendientes de análisis
  para priorizar y ejecutar los ensayos correspondientes

  Background:
    Given el usuario ha iniciado sesión en el módulo de Laboratorio
    And los datos de recepciones y análisis están cargados vía WebSocket

  Scenario: Ver lista de pendientes
    Given hay materiales sin analizar
    When la página carga
    Then se muestran los KPIs con analizados del mes, año y promedio de días
    And se muestra la tabla de materiales pendientes

  Scenario: Filtrar por grupo
    Given la tabla de pendientes está visible
    When el usuario selecciona "Grupo" en el tipo de búsqueda
    And selecciona un grupo de materiales
    Then la tabla se filtra mostrando solo materiales de ese grupo

  Scenario: Iniciar análisis desde pendiente
    Given hay un material pendiente en la tabla
    When el usuario hace clic en el icono de vial
    Then se abre el modal de análisis correspondiente al tipo de material

  Scenario: Estado vacío
    Given no hay materiales pendientes por analizar
    Then se muestra mensaje "No hay materiales pendientes por analizar"
    And se muestra un icono de laboratorio

  Scenario: Ver estadísticas
    Given la página de pendientes está cargada
    Then se muestra la tabla de aprobados/rechazados por tipo
    And se muestran los últimos 5 análisis realizados
```

## Mockup

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🧪 Análisis Pendientes                             [color: red]    │
│ Materiales pendientes por analizar                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐              │
│ │    Analizados │ │  Analizados  │ │  Promedio días   │              │
│ │    este mes   │ │  este año    │ │  resolución      │              │
│ │      24       │ │     187      │ │       3.2        │              │
│ │ kpi-orange    │ │  kpi-green   │ │    kpi-blue      │              │
│ └──────────────┘ └──────────────┘ └──────────────────┘              │
│                                                                      │
│ ─── Buscador ────────────────────────────────────────────────────── │
│ Buscar por: [Grupo 🔽]  ┌──────────┐  ┌──────────────┐  [🔍]      │
│                         │ Grupo A  │  │ Todos mats   │              │
│                         └──────────┘  └──────────────┘              │
│                                                 3 resultado(s)      │
│                                                                      │
│ ┌─── Pendientes ─────────────────────────────────────────────────┐  │
│ │ Estado       │ Lote   │ Material           │ Cantidad │ Acciones│  │
│ │ ──────────── │ ────── │ ────────────────── │ ──────── │ ─────── │  │
│ │ 🔴 PENDIENTE │ L-042  │ Papel Bond 75g     │ 500 Und  │ 🧪 🏷️  │  │
│ │ 🟡 EN PROCESO│ L-043  │ Tinta Negra AP     │ 25 Kg    │ 🧪 🏷️  │  │
│ │ 🔵 POR VALID.│ L-044  │ Caja Corrugada     │ 200 Und  │ 🧪 🏷️  │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                               Pág 1 de 3  [25/pág] [<] [1] [2] [>]  │
│                                                                      │
│ ─── Estadísticas ─────────────────────────────────────────────────── │
│ ┌─── Detalles ───────────┐  ┌─── Últimos 5 ─────────────────────┐  │
│ │ Tipo     │ Aprob │ Rech │  │ Lote   │ Resultado               │  │
│ │ ──────── │ ───── │ ──── │  │ ────── │ ─────────────────────── │  │
│ │ Sustrato │  45   │  3   │  │ L-050  │ ✅ APROBADO             │  │
│ │ Tinta    │  62   │  7   │  │ L-049  │ ❌ RECHAZADO            │  │
│ │ Cajas    │  30   │  1   │  │ L-048  │ ✅ APROBADO             │  │
│ │ Pads     │  18   │  0   │  │ L-047  │ ✅ APROBADO             │  │
│ │ Otros    │  12   │  2   │  │ L-046  │ ❌ RECHAZADO            │  │
│ └─────────────────────────┘  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```
