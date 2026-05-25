# SPEC — Órdenes de Compra a Clientes (`ventas/compras`)

## Features

### 1. KPI Cards
- **Órdenes del Mes**: `ordenesMesActual` — filtradas por `createdAt`/`fecha` dentro del mes actual.
- **Órdenes del Año**: `ordenesAnoActual` — filtradas por el año actual.
- **Órdenes Cerradas**: `ordenesCerradas` — cuentan `orden.estado === 'cerrada'`.

### 2. Filter Tabs
| Tab | `filterMode` | Comportamiento |
|-----|--------------|----------------|
| Todas | `'home'` | Muestra todas las órdenes vía `ordenesVisibles` |
| Por fecha | `'date'` | Inputs Desde/Hasta + botón buscar → `buscarPorFecha()` |
| Por N° OC | `'number'` | Input de texto → `search()` por `orden.orden` |
| Por cliente | `'client'` | Select de clientes → `filtrarPorCliente()` |

Al cambiar de tab se limpian `filtrados` y `searchTerm`.

### 3. Order Cards (Acordeón)
- **Header**: semáforo (`rojo` / `amarillo` / `verde` según índice) + nombre del cliente + OC + badge de estado (Abierta/Cerrada).
- **Click** en header → toggle `ordenExpandida[i]` con animación de altura.
- **Tabla expandida**: producto, cantidad (formateada con `.`), fecha solicitud, entrega, OP, y columna de derivaciones.
- **Derivaciones inline**: botón con conteo de derivadas → toggle `derivadasVisibles` muestra tabla de sub-órdenes.

### 4. Modal Derivación
- Header con icono `fa-layer-group`.
- Inputs con iconos en `columns is-multiline`: Número (`fa-hashtag`), Cantidad (`fa-boxes`), F. Solic. (`fa-calendar-alt`), Entrega (`fa-truck`).
- Validación: cantidad no supere `maximo_oc`.

### 5. Modal Nueva Orden
- Header con icono `fa-shopping-cart`.
- Formulario con `columns is-multiline` (sin `field is-grouped` para evitar overflow).
- Patrón `guardando`: botón se deshabilita y muestra spinner + "Guardando…".
- `ngOnChanges` resetea `guardando = false` al abrirse.

### 6. Estados Vacío y Skeleton
- **Empty state**: icono `fa-file-invoice-dollar`, mensaje "No hay órdenes de clientes", hint para crear la primera.
- **Skeleton**: 3 cards animadas con `skeleton-pulse` mientras `cargando && !api.orden`.

### 7. Paginación
- `pageSize` con select 10/25/50.
- `currentPage` + `totalPages` computado.
- Controles: anterior, números de página, siguiente.
- Texto informativo: "Página X de Y (Z órdenes)".

## Data Flow
- `api.orden` (`OcompraService`) → `ordenesVisibles` getter (filtrados o todos).
- `paginatedOrdenes` getter → slice paginado para la vista.
- Derivaciones se guardan directamente en `api.orden[x].pedido[y].derivadas.push()` y persisten vía `api.guardarOrden()`.
- Backend: endpoint `CLIENTE:NuevaOrdenCompra` (socket) → MongoDB.
