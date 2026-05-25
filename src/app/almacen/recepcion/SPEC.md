# Recepción de material — Especificación

## Layout
- **Lista principal**: dentro de `<app-page-layout>` con `<app-section-header>` color orange (módulo Almacén)
- **Cards de recepción**: cada recepción como un card expandible con header y tabla de materiales
- **Botón "Nueva Recepción"**: arriba a la izquierda, debajo del section-header, con icono `fa-plus-circle`
- **Modal de creación**: modal único `.modal-card` con formulario en columnas responsive

## Estados visuales

| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && recepciones.length === 0` | Skeleton rows con `<app-skeleton type="table">` |
| Vacío | `!cargando && recepciones.length === 0` | Icono `fa-warehouse` + "No hay recepciones registradas" |
| Datos | `recepciones.length > 0` | Cards expandibles con tabla de materiales |

## Formulario — Nueva Recepción

### Estructura del modal
- **Head**: icono `fa-truck-loading` + título "Nueva recepción de material" + botón X (`.delete red_cross`)
- **Body**: formulario en `columns is-multiline` (reemplaza `field is-grouped`)
- **Secciones**: separadas por `<hr class="modal-divider">`

### Secciones del formulario
1. **Proveedor** (select con `disabled selected` blank option → fuerza selección explícita)
2. **Documento** (Tipo + Nº + Control + Base Imponible)
3. **Fechas y transporte** (Fecha recepción + Transportista)
4. **OC y material** (OC, Material, Ancho/Largo, Lote, Cantidad)
5. **Presentación y neto** (Fecha fabricación, Presentación, Neto/und, botón +)
6. **Acciones post-agregado** (Detalles, Control, Cargar Excel, Agregar)

### Patrón guardando
- `guardando: boolean` se resetea en `ngOnChanges` al abrir el modal
- Botón Guardar: `[disabled]="guardando"` con `fa-spinner fa-pulse` / `fa-save`
- Texto cambia a "Guardando…" durante la operación

### Validación
- Proveedor obligatorio (sin selección por defecto)
- Fecha de recepción máxima: hoy
- Control formateado automáticamente como `XX-XXXXXXXX`
- Base Imponible con formato moneda `000.000,00`

## Flujo de datos
- **RecepcionService** vía WebSockets (socket.io)
  - `CLIENTE:BuscarRecepcion` / `CLIENTE:NuevaRecepcion`
  - `SERVER:recepcion` → carga lista
  - `SERVIDOR:enviaMensaje` → feedback toast
- **ProveedoresService** + **BobinasService** → opciones combinadas de proveedor/convertidora
- **OpoligraficaService** → OC filtradas por proveedor
- Los datos del modal fluyen a `NuevoGuardarRegistro()` que envía al backend

## Diseño visual
- Módulo Almacén → color orange
- Badges semáforo: `is-danger` (Por notificar), `is-info` (Notificado), `is-warning` (En observación)
- Tags de análisis: `is-danger` (Rechazado), `is-success` (Aprobado), `is-warning` (Revisión), `is-info` (Por analizar)
- Dark/light via CSS variables
- Skeleton con `<app-skeleton type="table">` durante carga
- Botón creación: siempre con prefijo "Nueva/o" + nombre del recurso

## BDD / Gherkin

```gherkin
Feature: Recepción de materiales
  Como usuario de almacén quiero registrar la entrada de materiales
  para controlar el inventario recibido

  Background:
    Given el usuario ha iniciado sesión en el módulo de Almacén
    And los datos de recepciones están cargados vía WebSocket

  Scenario: Abrir nueva recepción
    Given el usuario está en la vista de recepciones
    When hace clic en "Nueva Recepción"
    Then se abre un modal con el formulario de recepción
    And el campo Proveedor está vacío (sin selección previa)

  Scenario: Seleccionar proveedor explícitamente
    Given el modal de nueva recepción está abierto
    When el usuario selecciona un proveedor de la lista
    Then se habilitan los campos de Tipo de documento y Nº Documento
    And se resetea cualquier OC seleccionada previamente

  Scenario: Completar recepción y guardar
    Given el formulario de recepción está completo
    When el usuario hace clic en Guardar
    Then el botón muestra "Guardando…" con spinner
    And se envía la recepción al servidor
    Then se muestra un toast de confirmación
    And el modal se cierra

  Scenario: Estado vacío
    Given no hay recepciones registradas
    Then se muestra mensaje "No hay recepciones registradas"
    And se muestra un icono de almacén

  Scenario: Carga de datos
    Given la página de recepciones se está cargando
    Then se muestran skeleton rows animadas
    When los datos llegan del servidor
    Then las skeleton rows son reemplazadas por las cards reales

  Scenario: Ver detalle de recepción
    Given hay al menos una recepción registrada
    When el usuario hace clic en el icono de expandir
    Then se muestra la tabla de materiales de esa recepción
    And se ven los análisis, OC, lote, y acciones disponibles

  Scenario: Notificar recepción
    Given una recepción en estado "Por notificar"
    When el usuario hace clic en el icono de campana
    Then la recepción cambia al estado "Notificado"
```

## Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ 🏭 Recepción                                  [Naranja]    │
│ Control de entrada de materiales                           │
├─────────────────────────────────────────────────────────────┤
│ [➕ Nueva Recepción]                                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📄 Documento Nº: F-00123 — Proveedor XYZ — [Por notificar]🔔│
│ │ ─────────────────────────────────────────────────────── │ │
│ │ Análisis   │ OC   │ Lote   │ Material       │ Detalles  │ │
│ │ ────────── │ ──── │ ────── │ ────────────── │ ───────── │ │
│ │ ✅ Aprobado│ 24-01│ L-042  │ Papel Bond 75g │ 500 Und   │ │
│ │ ⏳ Por ana.│ 24-01│ L-043  │ Papel Kraft    │ 200 Und   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📄 Documento Nº: F-00124 — Proveedor ABC — [Notificado] ✅│
│ │ ...                                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─ Modal: Nueva recepción ─────────────────────────────────┐
│ 🚚 Nueva recepción de material                        ✕ │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────┐ ┌──────────────────┐          │
│ │ Proveedor    │ │ Tipo │ │ Nº Documento     │          │
│ │ 🔽───────── │ │ F 🔽│ │ [___________]    │          │
│ └──────────────┘ └──────┘ └──────────────────┘          │
│ ──────────────────────────────────────────────────────── │
│ ┌──────────┐ ┌─────────────────────┐                     │
│ │ Control  │ │ Base Imponible (Bs) │                     │
│ │ [______] │ │ [___________]       │                     │
│ └──────────┘ └─────────────────────┘                     │
│ ──────────────────────────────────────────────────────── │
│ ┌──────────────┐ ┌──────────────┐ ┌────────────┐        │
│ │ Fecha recep. │ │Transportista │ │ OC         │        │
│ │ [yyyy-mm-dd] │ │ [__________] │ │ 🔽────── │        │
│ └──────────────┘ └──────────────┘ └────────────┘        │
│ ──────────────────────────────────────────────────────── │
│ ┌──────────┐ ┌───────┐ ┌──────┐ ┌──────┐ ┌────┐        │
│ │ Material │ │ Ancho │ │Largo │ │ Lote │ │Cant│        │
│ │ 🔽──── │ │ [___] │ │[___] │ │[____]│ │[__]│        │
│ └──────────┘ └───────┘ └──────┘ └──────┘ └────┘        │
│ ──────────────────────────────────────────────────────── │
│ ┌──────────────┐ ┌──────────────┐ ┌──────┐ ┌──┐         │
│ │ Fecha fab.   │ │ Presentación │ │Neto  │ │➕│         │
│ │ [yyyy-mm-dd] │ │ Lata 🔽     │ │ [__] │ │  │         │
│ └──────────────┘ └──────────────┘ └──────┘ └──┘         │
│                                                          │
│ [Detalles] [Control] [Cargar Excel] [Agregar]           │
│ ──────────────────────────────────────────────────────── │
│ ┌──────────┬──────────────┬─────────┬────────┬──┐       │
│ │ Material │ Registro     │ OC      │ Lote   │🗑│       │
│ ────────── ─────────────── ───────── ──────── ──        │
│ │ Papel    │ 3 Lata(s)... │ 24-001  │ L-042  │🗑│       │
│ └──────────┴──────────────┴─────────┴────────┴──┘       │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [💾 Guardar]  — or —  [💾 Descontar Bobinas]         │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```
