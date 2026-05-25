# Cartera de Clientes — SPEC

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ SectionHeader: Clientes (blue)   [icono fa-users]                │
├──────────────────────────────────────────────────────────────────┤
│ [Nuevo Cliente]                                                  │
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────── lista (50%) ───────┐ ┌──── detalle (50%) ────────┐│
│ │ 🔍 Buscar cliente... [input]   │ │ [icono] Nombre Cliente     ││
│ │                                │ │ RIF: J-XXXXXXXX-X          ││
│ │ ┌─── cliente 1 ──────────────┐ │ │ Código: CLI-001            ││
│ │ │ Nombre   RIF    Código   C  │ │ │                            ││
│ │ │ ─────────────────────────── │ │ │ ─── Dirección ───         ││
│ │ │ Acme Inc  J-...  CLI-01  3  │ │ │ Av. Principal, Caracas    ││
│ │ │ Beta SA   J-...  CLI-02  1  │ │ │                            ││
│ │ │ ...                         │ │ │ ─── Contactos ───         ││
│ │ └─────────────────────────────┘ │ │ [Sr. Juan Pérez] [Sra. Ana]││
│ │                                 │ │                            ││
│ │ Pág 1 de 3  [10/pág] [<][1][>] │ │ ─── Almacenes ───          ││
│ └─────────────────────────────────┘ │ [Caracas] [Valencia]       ││
│                                    │                            ││
│ ┌─── skeleton (loading) ─────────┐ │ [Editar]                   ││
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ └────────────────────────────┘│
│ └────────────────────────────────┘                               │
│ ┌─── empty state ──────────────────┐                             │
│ │     👥 No hay clientes           │                             │
│ │  Haz clic en "Nuevo Cliente"     │                             │
│ └──────────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────────┘
```

## Estados visuales

| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `api.clientes` vacío y componente iniciando | Skeleton: 3 filas animadas con pulse |
| Vacío | `api.clientes.length === 0` y no cargando | Icono `fa-users` + "No hay clientes" + hint |
| Datos | `api.clientes.length > 0` | Lista paginada + detalle al seleccionar |
| Guardando (modal) | `guardando === true` | Botón disabled + spinner `fa-spinner fa-pulse` + "Guardando…" |

## Vistas y componentes

### Lista de clientes (izquierda)
- Input de búsqueda global (filtra por nombre/RIF/código)
- Tabla compacta: Nombre | RIF | Código | Contactos (#)
- Filas zebra, hover highlight, fila seleccionada con `is-selected`
- **Paginación**: 10/25/50 por página, controles < 1 2 3 ... N >

### Panel de detalle (derecha)
- Aparece al hacer clic en un cliente de la lista
- Secciones divididas visualmente:
  - **Datos generales**: nombre (icono `fa-user-tie`), RIF, código
  - **Dirección fiscal**: texto completo (icono `fa-map-pin`)
  - **Contactos**: como tags/badges inline: `[Sr. Juan Pérez - Gerente]` con tooltip para teléfono/correo. Botón X para eliminar (con confirmación Swal)
  - **Almacenes**: como tags: `[Caracas] [Valencia]` con botón X
- Botón **Editar** (icono `fa-edit`) abajo del detalle

### Modal Nuevo/Editar Cliente (`new-cliente`)

#### Header
- **Crear**: icono `fa-user-plus` + "Nuevo cliente"
- **Editar**: icono `fa-user-edit` + "Editar cliente"

#### Formulario (unificado, sin panel `.added` separado)
Secciones divididas por `<hr class="modal-divider">`:

1. **Datos generales** (`fa-id-card`):
   - Nombre (input text, icono `fa-user`)
   - RIF (input text, icono `fa-file-invoice`, auto-guion tras 1er dígito)
   - Código (input text, icono `fa-hashtag`)
   - Dirección fiscal (textarea, icono `fa-map-pin`)

2. **Contactos** (`fa-address-book`):
   - Título (select: Sr./Sra.) + Nombre + Cargo + Correo + Teléfono
   - Botón `+` agrega y limpia
   - Contactos agregados como tags/badges inline con X para eliminar

3. **Almacenes** (`fa-warehouse`):
   - Nombre del almacén + botón `+`
   - Almacenes agregados como tags inline con X

#### Patrón guardando
- `guardando: boolean` se resetea en `ngOnChanges` cuando modal se abre
- Botón guardar: `[disabled]="guardando"`, icono `fa-spinner fa-pulse` / `fa-save`, texto "Guardando…" / "Guardar"
- Llamada a `api.GuardarCliente()` o `api.EditarClientes()`

### Confirmaciones (SweetAlert2)
- Al eliminar contacto del modal: "¿Eliminar contacto X?" con toast de éxito
- Al eliminar almacén del modal: "¿Eliminar almacén X?"
- Al eliminar contacto/almacén desde el detalle: misma confirmación

## Colores
- Módulo **Ordenes / Clientes**: `--accent-blue` (badges, tabs activas, header)
- Fondo de cards: `--bg-secondary`
- Texto: `--text-primary`, `--text-muted`
- Hover fila: `color-mix(in srgb, var(--accent-blue) 8%, transparent)`
- Tag contactos: `tag is-info is-light`
- Tag almacenes: `tag is-warning is-light`

## Data Flow

```
ClientesService.clientes → panel izquierdo (lista paginada)
  └─ onClick → BuscarCliente(id) → panel derecho (detalle)
  └─ Búsqueda → filtro local por nombre/RIF/código

NewClienteComponent
  └─ ClientesService.GuardarCliente(data) → WebSocket 'CLIENTE:nuevoCliente'
  └─ ClientesService.EditarClientes(data) → WebSocket 'CLIENTE:EditCliente'
  └─ Respuesta → 'SERVER:cliente' actualiza api.clientes
  └─ Mensaje → 'SERVIDOR:enviaMensaje' → toast Swal
```

## BDD / Gherkin

```gherkin
Feature: Cartera de Clientes
  Como usuario quiero gestionar mi cartera de clientes
  para registrar, consultar y modificar sus datos.

  Background:
    Given el módulo Clientes está abierto
    And el servicio ClientesService tiene datos cargados

  Scenario: Listar clientes con paginación
    Given hay más de 10 clientes registrados
    When la página carga
    Then se muestran los primeros 10 clientes en la tabla
    And se muestra el control de paginación con el total de páginas

  Scenario: Buscar cliente por nombre
    Given la lista de clientes está visible
    When el usuario escribe "Acme" en el campo de búsqueda
    Then la lista se filtra mostrando solo clientes con "Acme" en el nombre

  Scenario: Ver detalle de un cliente
    Given la lista de clientes está visible
    When el usuario hace clic en un cliente
    Then el panel derecho muestra nombre, RIF, código, dirección, contactos y almacenes

  Scenario: Crear cliente exitosamente
    Given el modal "Nuevo cliente" está abierto
    When el usuario completa todos los campos requeridos y hace clic en "Guardar"
    Then el botón muestra spinner y se deshabilita
    And se muestra un toast de éxito
    And el modal se cierra
    And el nuevo cliente aparece en la lista

  Scenario: Eliminar contacto con confirmación
    Given un cliente tiene al menos un contacto registrado
    When el usuario hace clic en el icono X del contacto
    Then se muestra confirmación "¿Eliminar contacto X?"
    When el usuario confirma
    Then el contacto se elimina de la lista

  Scenario: Editar cliente
    Given el panel de detalle de un cliente está visible
    When el usuario hace clic en "Editar"
    Then se abre el modal con los datos del cliente precargados
    When el usuario modifica datos y guarda
    Then se muestra toast de éxito
    And el detalle se actualiza
```

## Mockup

```
┌──────────────────────────────────────────────────────────────────┐
│  👥 Clientes                         [color: blue]              │
├──────────────────────────────────────────────────────────────────┤
│  [+ Nuevo Cliente]                                              │
├─────────────────────────────┬────────────────────────────────────┤
│  🔍 Buscar...               │  ┌─ ████ Cliente Seleccionado ─┐ │
│                             │  │ 👤 Nombre: Acme Corp         │ │
│  ┌─── Tabla de clientes ──┐ │  │ 📄 RIF: J-12345678-9        │ │
│  │ Nombre    │ RIF  │ Cód.│ │  │ 🔢 Código: CLI-001          │ │
│  │─────────────────────────│ │  │                             │ │
│  │ ▸ Acme C  │ J-.. │ 001 │ │  │ ─── Dirección ───          │ │
│  │   Beta SA │ J-.. │ 002 │ │  │ 📍 Av. Principal, Caracas   │ │
│  │   ...     │      │     │ │  │                             │ │
│  └─────────────────────────┘ │  │ ─── Contactos ───          │ │
│  Pág 1 de 5 [10/pág] [<][>] │  │ [🏢 Sr. Juan Pérez ✕]      │ │
│                              │  │ [👩 Sra. Ana López ✕]      │ │
│                              │  │                             │ │
│                              │  │ ─── Almacenes ───          │ │
│                              │  │ [🏭 Caracas ✕] [Maracay ✕]│ │
│                              │  │                             │ │
│                              │  │ [✏️ Editar Cliente]         │ │
│                              │  └─────────────────────────────┘ │
└─────────────────────────────┴────────────────────────────────────┘
```
