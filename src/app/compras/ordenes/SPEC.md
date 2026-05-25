# Órdenes de Compra — SPEC

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  SectionHeader: Órdenes de compra                            │
├─────────────────────────────────────────────────────────────┤
│ [Nueva Orden]    ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│                  │ Órdenes  │ │ Órdenes  │ │  Cerradas     │ │
│                  │   Mes    │ │   Año    │ │               │ │
│                  └──────────┘ └──────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [ Todas ] [ Por fecha ] [ Por N° ] [ Por proveedor ]        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Proveedor              OCP: XX-XXXX       [Abierta] [↓] │ │
│ │ [detalles expandibles — tabla de materiales + totales]  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─── skeleton cards (loading) ────────────────────────────┐ │
│ │  ░░░░░░░░░░░░░░    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─── Empty state ──────────────────────────────────────────┐ │
│ │              🧾 No hay órdenes de compra                 │ │
│ │      Haz clic en "Nueva Orden" para crear la primera     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## KPI Cards (3)

| Card | Data Source |
|------|-----------|
| Órdenes Mes | `api.ordenesMesActual` |
| Órdenes Año | `api.ordenesAnoActual` |
| Cerradas | `api.orden.filter(estado === 'cerrada').length` |

## Filter Tabs

- **Todas** (`home`): muestra todas las órdenes, sin filtro
- **Por fecha** (`date`): revela inputs `desde`/`hasta` + botón buscar
- **Por N°** (`number`): input de texto, busca en `orden.numero`
- **Por proveedor** (`client`): `<select>` con proveedores únicos

El filtro activo recibe clase `.active` (fondo azul, texto blanco).

## Order Card (accordion)

- **Card header** (click toggles expand):
  - Provider name (bold)
  - OC number (`addSlice` format: `XX-XXXXX`)
  - Status badge: `Abierta` (green) / `Cerrada` (gray)
  - PDF download icon (red, with tooltip)
  - Chevron rotate animation
- **Card body** (expandable, `max-height` transition):
  - Table: Producto | Código | Cantidad | Precio unit. | Base Imp.
  - Footer: Sub-Total | I.V.A | Neto

## Modal (Nueva Orden)

- **Header**: siempre incluye icono `fa-shopping-cart` antes del título
- **Form inputs**: layout en columnas Bulma (`columns is-multiline`) para evitar overflow horizontal

| Step | Element |
|------|---------|
| 1 | Select proveedor (icono `fa-building`) |
| 2 | Select fabricante → select material (solo `grupo.trato === true`) |
| 3 | Cantidad + Unidad (select: L/kg/Und/t) + Precio USD + Bobina/Ancho/Alto + botón `+` |
| 4 | Tabla de materiales agregados + totales |
| 5 | Condic. pago (Contado/Crédito), Fecha entrega, Descripción |
| 6 | Botón Guardar (con `is-loading`, texto "Guardando...", icono `fa-save`) |

## States

- **Cargando**: Skeleton cards (3, con animación pulse)
- **Vacío**: Icono `fa-file-invoice` + "No hay órdenes de compra" + hint
- **Normal**: Lista de order cards
- **Guardando**: Botón en modal con spinner `is-loading` y disabled

## Status Badges

```gherkin
Given una orden de compra en la lista
When su campo `estado` es `"cerrada"`
Then se muestra badge gris con texto "Cerrada"

When su campo `estado` es undefined u otro
Then se muestra badge verde con texto "Abierta"
```

## Data Flow

```
OpoligraficaService.orden → ordenesVisibles (getter)
  └─ si filtrados.length > 0 → filtrados
  └─ si no → api.orden

NuevoOrdenComponent
  └─ ProveedoresService.proveedores → select proveedor
  └─ FabricantesService.fabricantes → select fabricante
  └─ MaterialesService.filtrarPorFabricante(id) → select material (Sustratos)
  └─ OpoligraficaService.nuevaOrden(Orden) → guardar
```
