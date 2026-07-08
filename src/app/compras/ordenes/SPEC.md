# Órdenes de Compra (OCP) — Especificación funcional y técnica

## 1. Resumen

Módulo de Compras para gestionar órdenes de compra a proveedores de materiales (sustratos, tintas, barnices, etc.). Cada OCP agrupa pedidos de materiales a un proveedor con cálculo de IVA y totales. Incluye generación de PDF, filtros por fecha/número/proveedor, y un modal step-by-step para crear nuevas órdenes. El número de OC se auto-incrementa desde 24000 mediante un contador en MongoDB.

## 2. Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 16.2, Bulma 0.9.4, SweetAlert2, Font Awesome |
| Backend | Node.js, Express, Mongoose, Socket.io |
| BD | MongoDB — colección `ordenpoligraficas`, contador `OCPI` |
| PDF | pdfmake-wrapper con vfs_fonts |
| Servicios | `OpoligraficaService`, `ProveedoresService`, `FabricantesService`, `MaterialesService` (vía `WebSocketService`) |

## 3. Layout de página

```
┌──────────────────────────────────────────────────────────────┐
│ <app-section-header> color="green" (Compras)                 │
│   "Órdenes de compra — Solicitudes y seguimiento"           │
├──────────────────────────────────────────────────────────────┤
│ [Nueva Orden]   ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│                  │ Órdenes  │ │ Órdenes  │ │  Cerradas    │  │
│                  │   Mes    │ │   Año    │ │              │  │
│                  └──────────┘ └──────────┘ └──────────────┘  │
├──────────────────────────────────────────────────────────────┤
│ [Desde ██] [Hasta ██] [✕]  ← siempre visible               │
├──────────────────────────────────────────────────────────────┤
│ [ Activas ] [ Por N° ] [ Por proveedor ] [ ↕ ]              │
│ ┌─ filtros dinámicos según pestaña activa ─────────────────┐ │
│ │ number → [Buscar por número...]                          │ │
│ │ client → [<select proveedores>]                          │ │
│ │ fabricante → [<select fabricantes>]                      │ │
│ └──────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ OCP: 26-00001     (grande, azul, negrita, monospace)    │ │
│ │ Proveedor          [Abierta/Cerrada]   [📥] [⌄]        │ │
│ │ ┌─ tabla expandible ──────────────────────────────────┐ │ │
│ │ │ Producto | Código | Cantidad | Prec.Unit | BaseImp │ │ │
│ │ │ ...                                                │ │ │
│ │ │ Sub-Total | I.V.A (X%) | Neto                      │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌─── skeleton (loading, 3 cards) ──────────────────────────┐ │
│ │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌─── empty state ──────────────────────────────────────────┐ │
│ │        🧾 No hay órdenes de compra                       │ │
│ │   Haz clic en "Nueva Orden" para crear la primera        │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 4. Estados visuales

| Estado | Condición | UI |
|--------|-----------|----|
| **Carga** | `cargando && api.orden?.length === 0` | 3 skeleton cards con animación pulse |
| **Vacío** | `!cargando && ordenesVisibles.length === 0` | Empty state: icono `fa-file-invoice`, texto "No hay órdenes de compra" + hint |
| **Datos** | `ordenesVisibles.length > 0` | Lista de order cards expandibles |

## 5. Componentes

### 5.1 OrdenesComponent (padre)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `nueva` | `boolean` | Abre/cierra modal de nueva orden |
| `Orden` | `object` | Modelo de datos de la nueva orden en creación |
| `filtrados` | `any[]` | Órdenes filtradas (por fecha, número o proveedor) |
| `searchTerm` | `string` | Término de búsqueda para filtro por número |
| `filterMode` | `'home'\|'number'\|'client'\|'fabricante'` | Pestaña de filtro activa |
| `ordenExpandida` | `boolean[]` | Array de estados expandido/colapsado por orden |
| `cargando` | `boolean` | Estado de carga inicial |
| `sortAsc` | `boolean` | Dirección de ordenamiento (default `false` = newest first) |
| `fechaDesde` | `string` | Fecha inicial del filtro por rango (siempre visible) |
| `fechaHasta` | `string` | Fecha final del filtro por rango (siempre visible) |

**Getters**:
- `ordenesCerradas` — count de órdenes con `estado === 'Cerrada'`
- `ordenesActivas` — count de órdenes con `estado !== 'Cerrada'`
- `proveedoresUnicas` — set de nombres de proveedores únicos (para el select del filtro)
- `fabricantesUnicas` — set de nombres/alias de fabricantes únicos (desde pedido.material.fabricante)
- `ordenesVisibles` — retorna lista filtrada + ordenada:
  1. Filtra por estado si `filterMode === 'home'` (solo activas)
  2. Filtra por rango de `createdAt` si `fechaDesde` y `fechaHasta` están definidas
  3. Ordena por `numero` (desc si `sortAsc === false`, asc si `sortAsc === true`)

**Métodos clave**:
- `setFilter(mode)` — cambia el modo de filtro y resetea búsqueda
- `toggleSort()` — alterna `sortAsc` (asc/desc)
- `toggleOrder(n)` — expande/colapsa la card de orden en índice n
- `search()` — filtra por número de OC (limpia guiones)
- `filtrarPorProveedor(target)` — filtra por nombre de proveedor
- `filtrarPorFabricante(target)` — filtra por alias/nombre de fabricante desde `pedido.material.fabricante`
- `addSlice(n)` — formatea número `2600001` → `26-00001`
- `calcularTotalIva(orden)` — suma `(iva/100) * precio * cantidad` de cada pedido
- `calcularTotalNeto(orden)` — suma `precio * cantidad` de cada pedido
- `DescargarPDF(orden)` — genera PDF con pdfmake-wrapper (logo, datos proveedor, tabla materiales, totales, condiciones)
- `cerrar()` / `reset()` — resetea el objeto `Orden` a valores por defecto

**PDF generado**: Incluye:
- Logo de la empresa (cintillo)
- Encabezado "ORDEN DE COMPRA" con código FRP-007
- N° de OC formateado y fecha de emisión
- Información del proveedor (razón social, RIF, dirección, teléfono/contacto)
- Tabla de materiales: Código, Descripción, Cantidad, Costo Unit., Base Imp., IVA
- Sub-Total, I.V.A (16%), Total
- Observaciones (descripción de la orden)
- Condiciones de pago + Elaborado por (nombre del usuario logueado + firma)

### 5.2 NuevoOrdenComponent (modal)

| @Input/Output | Tipo | Propósito |
|--------------|------|-----------|
| `nueva` | `boolean` | Abre/cierra modal |
| `Orden` | `any` | Objeto orden compartido con el padre |
| `onCloseModal` | `EventEmitter` | Cierra modal |
| `onChangeProv` | `EventEmitter` | Notifica cambio de proveedor para reset |

**Flujo step-by-step del modal**:

| Step | Elemento | Descripción |
|------|----------|-------------|
| 1 | Select Proveedor | Carga desde `ProveedoresService.proveedores`. Al seleccionar, extrae los `fabricantesIDs` del proveedor |
| 2 | Select Fabricante → Material | Filtra fabricantes del proveedor. Al seleccionar fabricante, carga solo materiales con `grupo.trato === true` (sustratos) |
| 3 | Datos del material | Cantidad, Unidad (Und/kg/L/t), Precio USD, checkbox Bobina (solo para toneladas), Ancho (cm), Alto (cm). Botón `+` para agregar |
| 4 | Tabla resumen | Materiales agregados con descripción, cantidad, costo unit., neto. Botón 🗑️ por fila. Totales: Sub-Total, I.V.A., Total |
| 5 | Condiciones | Select pago (Contado/Crédito), Datepicker fecha entrega, TextArea descripción |
| 6 | Guardar | Botón con `is-loading`, disabled si no hay entrega o descripción |

**Validación**: El botón Guardar se habilita solo si `Orden.pedido.length > 0 && Orden.entrega && Orden.descripcion`.

**Métodos**:
- `proveedores_(e)` — busca proveedor, asigna `Orden.proveedor` y carga `fabricantesIDs`
- `condiciones(e)` — al seleccionar fabricante, filtra materiales por `grupo.trato === true`
- `onMaterialChange(id)` — actualiza nombre del material del item temporal
- `addMaterial()` — pushea `this.material` a `Orden.pedido` y resetea item temporal
- `guardar()` — emite `CLIENTE:NuevaOrdenPoligrafica`, muestra toast a los 2s
- `borrar(n)` — elimina item del pedido por índice
- `calcularTotalIva(orden)` / `calcularTotalNeto(orden)` — mismo cálculo que el padre

## 6. API — Contrato Socket.io

### 6.1 Eventos

| Cliente → Servidor | Payload | Descripción |
|-------------------|---------|-------------|
| `CLIENTE:BuscarOrdenesPoligrafica` | _(sin payload)_ | Solicita todas las órdenes activas con población completa |
| `CLIENTE:NuevaOrdenPoligrafica` | `OrdenPoligrafica` | Crea nueva orden con auto-incremento de número |
| `CLIENTE:CerrarOrdenPoligrafica` (reservado) | `{_id}` | Cierra una OCP manualmente (futuro) |

| Servidor → Cliente | Payload | Descripción |
|-------------------|---------|-------------|
| `SERVER:OrdenesPoligrafica` | `OrdenPoligrafica[]` | Lista de órdenes activas populadas (proveedor, pedido.material → fabricante + grupo) |
| `SERVIDOR:enviaMensaje` | `{mensaje, icon}` | Toast notification |

### 6.2 Flujo de creación

```
Usuario → NuevoOrdenComponent.guardar()
  → OpoligraficaService.nuevaOrden(data)
    → socket.emit('CLIENTE:NuevaOrdenPoligrafica', data)
      → Backend: new ordenPoligrafica(data)
      → Backend: pre('save') hook → OCPI.findByIdAndUpdate({_id:'OCPi'}, {$inc:{seq:1}})
      → Backend: orden.numero = OCPI.seq (auto-increment from 24000)
      → Backend: orden.save()
      → Backend: emit('SERVER:OrdenesPoligrafica')
      → Backend: emit('SERVIDOR:enviaMensaje', success)
  → setTimeout(2000ms)
    → Swal.fire(toast)
    → cerrar modal
```

### 6.3 Población (populate) de datos

```
ordenPoligrafica.find({borrado: false})
  .populate('proveedor')
  .populate({
    path: 'pedido.material',
    populate: [
      { path: 'fabricante', model: 'fabricante' },
      { path: 'grupo', model: 'grupo' }
    ]
  })
```

## 7. Modelo de datos

### 7.1 Colección `ordenpoligraficas`

```javascript
{
  numero: Number,           // auto-increment desde 24000 via pre('save') hook
  proveedor: { type: ObjectId, ref: 'proveedor' },
  borrado: Boolean,         // soft delete, default false
  iva: { type: Number, default: 16 },
  estado: { type: String, enum: ['Abierta', 'Cerrada'], default: 'Abierta' },
  fecha_cierre: Date,       // fecha en que se cerró la orden
  pedido: [{
    material: { type: ObjectId, ref: 'material' },
    bobina: { type: Boolean, default: false },
    cantidad: Number,
    precio: Number,
    alto: Number,
    ancho: Number,
    gramaje: String,
    calibre: String,
    unidad: { type: String, enum: ['L', 'kg', 'Und', 't'] }
  }],
  pago: String,             // "Contado" | "Crédito"
  entrega: String,          // fecha ISO
  descripcion: String
}
// timestamps: true (createdAt, updatedAt)
```

### 7.2 Colección contador `OCPI`

```javascript
{
  _id: "OCPi",              // fixed ID
  seq: { type: Number, default: 24000 }
}
```

## 8. Gherkin — Escenarios clave

### 8.1 Crear orden de compra
```gherkin
DADO que el usuario está en la página de Órdenes de Compra
CUANDO hace clic en "Nueva Orden"
ENTONCES se abre el modal "Nueva Orden de Compra"
Y se muestra el paso 1: selector de proveedor

CUANDO selecciona un proveedor
ENTONCES se cargan los fabricantes asociados a ese proveedor

CUANDO selecciona un fabricante
ENTONCES se cargan solo los materiales de tipo sustrato (grupo.trato === true)
Y se muestran los campos: Cantidad, Unidad, Precio USD, Ancho, Alto, Bobina

CUANDO completa los datos del material y hace clic en [+]
ENTONCES el material se agrega a la tabla de pedidos
Y se muestran Sub-Total, I.V.A. y Total actualizados

CUANDO completa pago, fecha entrega y descripción
Y hace clic en "Guardar"
ENTONCES se emite CLIENTE:NuevaOrdenPoligrafica
Y se asigna un número auto-incrementado (formato: XX-XXXXX)
Y se muestra un toast "Se registró una nueva orden de compra"
Y aparece en la lista de órdenes
```

### 8.2 Visualizar detalle de orden (accordion)
```gherkin
DADO que existe una orden en la lista
CUANDO el usuario hace clic en el header de la card
ENTONCES el cuerpo se expande con animación
Y se muestra la tabla de materiales: Producto, Código, Cantidad, Precio Unit., Base Imp.
Y se muestran Sub-Total, I.V.A. (X%) y Neto

CUANDO vuelve a hacer clic
ENTONCES el cuerpo se colapsa
```

### 8.3 Descargar PDF de orden
```gherkin
DADO que existe una orden en la lista
CUANDO el usuario hace clic en el icono 📥
ENTONCES se genera un PDF con pdfmake-wrapper
Y el PDF incluye: logo, datos del proveedor, tabla de materiales, totales, condiciones de pago
Y se descarga automáticamente
```

### 8.4 Filtrar órdenes por fecha
```gherkin
DADO que la página tiene órdenes de compra
CUANDO el usuario hace clic en "Por fecha"
ENTONCES se muestran inputs de fecha "Desde" y "Hasta"

CUANDO selecciona un rango y hace clic en 🔍
ENTONCES la lista se filtra por createdAt dentro del rango
```

### 8.5 Filtrar órdenes por número
```gherkin
DADO que la página tiene órdenes de compra
CUANDO el usuario hace clic en "Por N°"
ENTONCES se muestra un input de texto

CUANDO escribe un número
ENTONCES la lista se filtra en tiempo real por número de OC
Y se ignoran los guiones en la búsqueda
```

### 8.6 Filtrar órdenes por proveedor
```gherkin
DADO que la página tiene órdenes de compra
CUANDO el usuario hace clic en "Por proveedor"
ENTONCES se muestra un select con nombres de proveedores únicos

CUANDO selecciona un proveedor
ENTONCES la lista se filtra por ese proveedor

CUANDO selecciona "— Todos —"
ENTONCES se restablece la lista completa
```

### 8.7 Estados de carga y vacío
```gherkin
DADO que el usuario accede a la página
CUANDO los datos aún se están cargando
ENTONCES se muestran 3 skeleton cards con animación pulse

CUANDO no existen órdenes registradas y la carga terminó
ENTONCES se muestra empty state con icono fa-file-invoice
Y un hint "Haz clic en Nueva Orden para crear la primera"
```

### 8.8 KPI Cards
```gherkin
DADO que existen órdenes de compra
ENTONCES se muestran 3 KPI cards:
- Órdenes del Mes (contador del mes actual, con nombre del mes)
- Órdenes del Año (contador del año actual)
- Cerradas (cantidad de órdenes con estado === 'cerrada')

CUANDO se reciben nuevos datos del servidor
ENTONCES los contadores se actualizan automáticamente
```

## 9. Consideraciones de diseño

- **Colores**: Variables CSS (`--bg-secondary`, `--text-muted`, `--text-primary`, `--accent-blue`, `--status-success`, `--status-warning`, `--status-danger`, `--border-color`).
- **KPIs**: Cards con gradiente semitransparente via pseudo-element `::before`.
- **Filter tabs**: Grupo de botones tipo `segmented-control` con `.filter-tabs` (flex gap 2px, bg secondary). Tab activa con `--accent-blue` + texto blanco.
- **Order card**: `.card` con header clickable. Chevron con rotate 180deg animado en 0.3s.
- **Badge estado**: `.badge-open` (verde) / `.badge-closed` (gris), uppercase, letter-spacing, border-radius 20px.
- **Tabla expandible**: `max-height` transition 0.4s, de 0 a 2000px. Headers uppercase Gilroy.
- **Iconos**: `fa-shopping-cart` (módulo), `fa-plus-circle` (nuevo), `fa-download` (PDF, rojo), `fa-chevron-up` (expandir), `fa-trash-alt` (eliminar ítem), `fa-save` (guardar).
- **Modal**: z-index 10000. Inputs en layout `columns is-multiline`.
- **Toasts**: SweetAlert2, `top-end`, 5s, timerProgressBar, sin confirm button.
- **Confirmaciones**: No hay confirmación de borrado para órdenes (no hay delete implementado en frontend ni backend).
- **Skeleton**: 3 cards con animation `skeleton-pulse` (opacity 0.4 ↔ 0.8).

## 10. Auto-incremento de número de OC

El número de orden se genera automáticamente mediante un hook `pre('save')` en el schema de Mongoose:

- Colección contador: `OCPI` con documento `{_id: "OCPi", seq: 24000}`
- En cada `save()`, se ejecuta `findByIdAndUpdate` con `$inc: {seq: 1}` y `upsert: true`
- El número comienza en 24000 y se incrementa secuencialmente
- En el frontend se formatea con `addSlice()`: ej. `24001` → `24-001`

## 11. Telemetría / Logging sugerido

| Evento | Dato a registrar |
|--------|-----------------|
| Creación de OCP | numero, proveedorId, cantidadItems, totalUSD, timestamp |
| Visualización de detalle | ordenId, timestamp |
| Descarga de PDF | ordenId, numero, timestamp, usuario |
| Filtro por fecha | desde, hasta, resultadosCount, timestamp |
| Filtro por número | searchTerm, resultadosCount, timestamp |
| Filtro por proveedor | proveedorNombre, resultadosCount, timestamp |
| Error en creación | error message, datos parciales, timestamp |

## 12. Bugs conocidos / issues

- `OpoligraficaService` no tiene evento `SERVER:OrdenesPoligrafica` tipado — `this.orden` es `any`.

## 13. Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-07-08 | Se agregó campo `estado` (enum Abierta/Cerrada) + `fecha_cierre` al modelo |
| 2026-07-08 | Se agregó `.sort({ numero: -1 })` al backend para newest first |
| 2026-07-08 | Se agregó auto-cierre de OCP al enviar todos los materiales a almacén (`almacenEvents.js`) |
| 2026-07-08 | Se renombró tab "Todas" → "Activas", solo muestra órdenes no cerradas |
| 2026-07-08 | Se agregó toggle de ordenamiento ascendente/descendente |
| 2026-07-08 | Filtro por rango de fecha siempre visible (removido de pestaña) |
| 2026-07-08 | Énfasis en N° OCP en header de card (fuente grande, monospace, color accent) |
| 2026-07-08 | Se cambió orden de header: N° OCP primero, proveedor debajo |
| 2026-07-08 | Se eliminó `buscarPorFecha_cliente` (dead code) y `PorClientes` |
- `NuevoOrdenComponent.proveedores_()` usa `setTimeout(500ms)` antes de buscar el proveedor — posible race condition si el servicio no ha actualizado `proveedores` aún.
- `addMaterial()` en `NuevoOrdenComponent` pushea `this.material` por referencia y luego lo resetea — si algún otro componente modificara `material.nombre`, afectaría al item ya agregado en el pedido.
- El `min` del datepicker de entrega usa `getToday()` pero el backend guarda como string, no como Date — no hay validación de fecha real.
- El modelo `pedido.material` se guarda como ObjectId pero `addMaterial()` pushea un objeto con `nombre`, `material`, `precio`, etc. — el backend solo persiste `material: ObjectId` (los demás campos del item temporal se ignoran).
