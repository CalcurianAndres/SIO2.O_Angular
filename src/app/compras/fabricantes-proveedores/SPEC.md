# Fabricantes y Proveedores — Especificación funcional y técnica

## 1. Resumen

Módulo unificado de Compras para la gestión de fabricantes y proveedores. Presenta dos tablas independientes en una misma página con búsqueda, ordenamiento, paginación y CRUD completo vía modales. Los fabricantes representan empresas que fabrican materiales; los proveedores son empresas que suministran materiales. Un fabricante puede ser también proveedor directo (flag `proveedor: true`), y un proveedor referencia uno o más fabricantes.

## 2. Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 16.2, Bulma 0.9.4, SweetAlert2, Font Awesome |
| Backend | Node.js, Express, Mongoose, Socket.io |
| BD | MongoDB — colecciones `fabricantes` y `proveedores` |
| Componentes compartidos | `<app-page-layout>`, `<app-section-header>` |
| Servicios | `FabricantesService`, `ProveedoresService`, `PaisesService` (vía `WebSocketService`) |

## 3. Layout de página

```
┌──────────────────────────────────────────────────┐
│ <app-section-header> color="green" (Compras)     │
│   "Fabricantes y Proveedores — Gestión..."       │
├──────────────────────────────────────────────────┤
│                                                  │
│ ██ FABRICANTES                                   │
│ [Nuevo Fabricante]                               │
│ ┌──────────────────────────────────────────────┐ │
│ │ <input search>                          🔍   │ │
│ ├──────┬───────┬───────────────────┬─────┬─────┤ │
│ │Nombre│Alias  │Ident. fiscal     │Tipo │Act. │ │
│ ├──────┼───────┼───────────────────┼─────┼─────┤ │
│ │  ✏️🗑️🔍   │       │                   │     │ │
│ └──────┴───────┴───────────────────┴─────┴─────┘ │
│ Paginación 10/25/50/100   Pág X de Y   ◀ ▶     │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ ██ PROVEEDORES                                   │
│ [Nuevo Proveedor]                                │
│ ┌──────────────────────────────────────────────┐ │
│ │ <input search>                          🔍   │ │
│ ├────────┬────────────┬──────┬──────────┬──────┤ │
│ │Nombre  │RIF         │País  │Contactos │Act.  │ │
│ ├────────┼────────────┼──────┼──────────┼──────┤ │
│ │        │            │      │          │✏️🗑️🔍│ │
│ └────────┴────────────┴──────┴──────────┴──────┘ │
│ Paginación 10/25/50/100   Pág X de Y   ◀ ▶     │
└──────────────────────────────────────────────────┘
```

## 4. Estados visuales

| Sección | Estado | Condición | UI |
|---------|--------|-----------|----|
| Fabricantes | Vacío | `fabricantes.length === 0` | Empty state: icono `fa-industry`, texto "No hay fabricantes registrados" |
| Fabricantes | Datos | `fabricantes.length > 0` | Tabla zebra con búsqueda, sort, paginación |
| Proveedores | Vacío | `proveedores.length === 0` | Empty state: icono `fa-truck`, texto "No hay proveedores registrados" |
| Proveedores | Datos | `proveedores.length > 0` | Tabla zebra con búsqueda, sort, paginación |

No hay estado de carga skeleton — los datos llegan vía WebSocket y la tabla se renderiza cuando el array está poblado.

## 5. Componentes

### 5.1 FabricantesProveedoresComponent (padre)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `fabSearchTerm` / `provSearchTerm` | `string` | Texto de búsqueda para cada tabla |
| `fabCurrentPage` / `fabPageSize` | `number` | Paginación de fabricantes (default 10) |
| `provCurrentPage` / `provPageSize` | `number` | Paginación de proveedores (default 10) |
| `fabSortColumn` / `fabSortDirection` | `string` | Columna y dirección de orden (fab) |
| `provSortColumn` / `provSortDirection` | `string` | Columna y dirección de orden (prov) |
| `fabDetalle` / `fabSelected` | `boolean/any` | Modal de detalle de fabricante |
| `provDetalle` / `provSelected` | `boolean/any` | Modal de detalle de proveedor |
| `nuevoFab` / `editarFab` / `fabData` | `boolean/any` | Modales de crear/editar fabricante |
| `nuevoProv` / `editarProv` / `provData` | `boolean/any` | Modales de crear/editar proveedor |
| `cargandoFab` / `cargandoProv` | `boolean` | Flag para mostrar spinner post-guardado |

**Métodos clave**:
- `AgregarNuevoFabricante()` / `AgregarNuevoProveedor()` — abre modal de creación
- `EditarFabricante(fab)` / `EditarProveedor(prov)` — carga datos y abre modal de edición
- `eliminarFabricante(id)` / `eliminarProveedor(id)` — confirmación Swal → emite evento de borrado
- `verFabDetalle(fab)` / `verProvDetalle(prov)` — abre modal de detalle
- `cerrarFabModal()` / `cerrarProvModal()` — cierra modal y muestra toast con el mensaje del servidor
- `fabToggleSort(col)` / `provToggleSort(col)` — ordenamiento asc/desc con reset de página
- `fabGoToPage(p)` / `provGoToPage(p)` — navegación de páginas

**Getters de datos**:
- `filteredFabricantes` — filtra por nombre o alias (case-insensitive)
- `sortedFabricantes` — ordena por nombre, alias, identificación_fiscal o tipo (proveedor boolean)
- `paginatedFabricantes` — slice paginado
- `filteredProveedores` — filtra por nombre, RIF o país
- `sortedProveedores` — ordena por nombre, RIF, país o cantidad de contactos
- `paginatedProveedores` — slice paginado

### 5.2 NuevoFabricanteComponent (modal)

| @Input/Output | Tipo | Propósito |
|--------------|------|-----------|
| `nuevo` / `editar` | `boolean` | Modo creación o edición |
| `data` | `Fabricante_populated` | Fabricante a editar |
| `cargando` | `boolean` | Estado de guardado |
| `onCloseModal` / `onCloseModal_` | `EventEmitter` | Cierre con/sin toast |

**Campos del formulario**:

| Sección | Campos | Descripción |
|---------|--------|-------------|
| Datos básicos | nombre, alias, identificación_fiscal | Razón social, nombre corto, ID fiscal |
| Origen | país, estado | Selector de país con carga dinámica de estados vía `PaisesService` |
| Grupo que fabrica | grupo | Selector de grupos, múltiples permitidos (tags) |
| Proveedor directo | checkbox (solo creación) | Al marcar, muestra sección adicional de datos de proveedor |
| Datos de proveedor | dirección, RIF, identificación_fiscal | Solo visible si es proveedor directo |
| Contactos (proveedor) | nombre, teléfono, correo, cargo | Múltiples contactos en tabla, validación de email |

**Validación** (`formValido`):
- Creación: nombre y alias obligatorios, ≥1 origen, ≥1 grupo, y si es proveedor directo → dirección + RIF + ≥1 contacto
- Edición: misma lógica sobre `data`

**Métodos**:
- `guardarFabricante()` — emite `CLIENTE:NuevoFabricante`; si `proveedor_directo`, tras 1s emite también `CLIENTE:NuevoProveedor`
- `editarFabricante()` — emite `CLIENTE:EditarFabricante`; si hay proveedor directo vinculado, emite `CLIENTE:EditarProveedor`
- `addOrigen()` / `deleteOrigen(i)` — gestiona tags de origen
- `addGrupo()` / `deleteGrupo(i)` — gestiona tags de grupo
- `AgregarContacto()` / `deletecontacto(i)` — gestiona contactos
- `onPaisChange()` — carga estados del país seleccionado
- `onTelefonoInput()` — detecta país por prefijo telefónico
- `limpiarFormulario()` — resetea todos los campos

### 5.3 NuevoProveedorComponent (modal)

| @Input/Output | Tipo | Propósito |
|--------------|------|-----------|
| `nuevo` / `editar` | `boolean` | Modo creación o edición |
| `proveedor` | `Proveedores` | Proveedor a editar |
| `api` | `any` | Servicio de proveedores (pasado por el padre) |
| `cargando` | `boolean` | Estado de guardado |

**Campos del formulario**:

| Sección | Campos | Descripción |
|---------|--------|-------------|
| Datos básicos | nombre, dirección, RIF, identificación_fiscal | RIF con autoformato (`formatRif()`) |
| Ubicación | país, estado | Selector con carga dinámica de estados |
| Contactos | nombre, teléfono, correo, cargo | Múltiples, validación de email |
| Fabricantes que provee | selector de fabricantes | Tags múltiples desde `FabricantesService.fabricantes` |

**Validación** (`formValido`):
- Creación: nombre + dirección + país + estado + (RIF o ID fiscal) + ≥1 contacto + ≥1 fabricante
- Edición: misma lógica sobre `proveedor`

**Métodos**:
- `GuardarProveedor()` — emite `CLIENTE:NuevoProveedor`
- `EditarProveedor()` — mapea fabricantes a `_id` y emite `CLIENTE:EditarProveedor`
- `addFabricante()` / `EliminarFabricante(i)` — gestiona tags de fabricantes
- `NuevoContacto()` / `EliminarContacto(i)` — gestiona contactos
- `formatRif(event)` — formatea automáticamente RIF con guiones
- `isValidEmail(email)` — validación regex

### 5.4 DetallesComponent (modal de solo lectura — fabricante)

| @Input | Tipo | Descripción |
|--------|------|-------------|
| `detalle` | `boolean` | Abre/cierra modal |
| `fabricante` | `Fabricante_populated` | Fabricante a mostrar |

Muestra: alias, identificación_fiscal, orígenes (tags), grupos asociados (tags), badge de "Proveedor" si aplica.

### 5.5 DetallesProveedoresComponent (modal de solo lectura — proveedor)

| @Input | Tipo | Descripción |
|--------|------|-------------|
| `detalle` | `boolean` | Abre/cierra modal |
| `proveedor` | `any` | Proveedor a mostrar |

Muestra: dirección, RIF, país, estado, identificación_fiscal, contactos (tags con nombre, teléfono, email, cargo), fabricantes asociados (tags con alias/nombre).

## 6. API — Contrato Socket.io

### 6.1 Eventos de Fabricantes

| Cliente → Servidor | Payload | Descripción |
|-------------------|---------|-------------|
| `CLIENTE:BuscarFabricante` | _(sin payload)_ | Solicita lista de fabricantes activos |
| `CLIENTE:NuevoFabricante` | `Fabricante` (sin _id) | Crea fabricante con validación de duplicado y campos requeridos |
| `CLIENTE:EditarFabricante` | `Fabricante_populated` | Actualiza fabricante, convierte objetos grupo a ObjectId |
| `CLIENTE:deleteFabricante` | `string` (id) | Soft delete (borrado: true) |

| Servidor → Cliente | Payload | Descripción |
|-------------------|---------|-------------|
| `SERVER:Fabricantes` | `Fabricante[]` | Lista de fabricantes activos (populados con grupo) |
| `SERVIDOR:enviaMensaje` | `{mensaje, icon}` | Toast notification |

### 6.2 Eventos de Proveedores

| Cliente → Servidor | Payload | Descripción |
|-------------------|---------|-------------|
| `CLIENTE:BuscarProveedores` | _(sin payload)_ | Solicita lista de proveedores activos |
| `CLIENTE:NuevoProveedor` | `Proveedores` (sin _id) | Crea proveedor; si fabricantes vacío, asigna el último fabricante creado |
| `CLIENTE:EditarProveedor` | `Proveedores` | Actualiza proveedor por _id |
| `CLIENTE:deleteProveedor` | `string` (id) | Soft delete (borrado: true) |

| Servidor → Cliente | Payload | Descripción |
|-------------------|---------|-------------|
| `SERVER:proveedores` | `Proveedores[]` | Lista de proveedores activos (populados con fabricantes) |
| `SERVIDOR:enviaMensaje` | `{mensaje, icon}` | Toast notification |

### 6.3 Flujo de creación de fabricante con proveedor directo

```
Usuario → guardarFabricante()
  → FabricantesService.agregarFabricante(data)
    → socket.emit('CLIENTE:NuevoFabricante', data)
      → Backend: valida nombre, alias, grupo, origenes no nulos
      → Backend: verifica duplicado por nombre
      → Backend: Fabricante.create(data)
      → Backend: emit('SERVER:Fabricantes')
      → Backend: emit('SERVIDOR:enviaMensaje', success)
  → setTimeout(1000ms)
    → ProveedoresService.nuevoProveedor(proveedorData)
      → socket.emit('CLIENTE:NuevoProveedor', data)
```

## 7. Modelos de datos

### 7.1 Colección `fabricantes`

```javascript
{
  borrado: Boolean,         // soft delete, default false
  proveedor: Boolean,       // default false — ¿es también proveedor?
  nombre: String,           // required
  alias: String,            // required
  origenes: [{ pais, estado }],
  grupo: [{ type: ObjectId, ref: 'grupo' }],
  identificacion_fiscal: String
}
// timestamps: true
```

### 7.2 Colección `proveedores`

```javascript
{
  borrado: Boolean,         // soft delete, default false
  nombre: String,           // required
  direccion: String,        // required
  rif: String,              // required
  contactos: [{ nombre, numero, email, cargo }],  // required
  fabricantes: [{ type: ObjectId, ref: 'fabricante' }],
  identificacion_fiscal: String,
  pais: String,
  estado: String
}
// timestamps: true
```

## 8. Gherkin — Escenarios clave

### 8.1 Crear fabricante
```gherkin
DADO que el usuario está en la página de Fabricantes y Proveedores
CUANDO hace clic en "Nuevo Fabricante"
ENTONCES se abre el modal "Nuevo Fabricante"
Y se muestran los campos: Razón social, Alias, Identificación fiscal
Y un selector de país con carga dinámica de estados
Y un selector de grupos

CUANDO completa nombre, alias, agrega ≥1 origen, ≥1 grupo
Y hace clic en "Guardar fabricante"
ENTONCES se emite CLIENTE:NuevoFabricante
Y se muestra un toast "Se creó un nuevo fabricante"
Y aparece en la tabla de fabricantes
```

### 8.2 Crear fabricante como proveedor directo
```gherkin
DADO que el modal "Nuevo Fabricante" está abierto
CUANDO marca "Proveedor directo"
ENTONCES se expande la sección "Datos de proveedor"
Y se muestran los campos: Dirección, RIF, Identificación fiscal
Y un formulario de contacto con nombre, teléfono, correo, cargo

CUANDO completa datos de proveedor con ≥1 contacto
Y hace clic en "Guardar fabricante"
ENTONCES se crea el fabricante
Y tras 1 segundo se crea automáticamente un proveedor vinculado
Y se muestran dos toasts de éxito
```

### 8.3 Editar fabricante
```gherkin
DADO que existe un fabricante en la tabla
CUANDO el usuario hace clic en ✏️
ENTONCES se abre el modal "Editar Fabricante"
Y los campos se cargan con los valores existentes
Y si tiene flag proveedor, se muestra enlace "Ver información de proveedor"

CUANDO modifica valores y hace clic en "Guardar cambios"
ENTONCES se emite CLIENTE:EditarFabricante
Y se actualiza la tabla
```

### 8.4 Eliminar fabricante con confirmación
```gherkin
DADO que existe un fabricante en la tabla
CUANDO el usuario hace clic en 🗑️
ENTONCES se muestra un Swal de confirmación
Con el texto "¿Eliminar este Fabricante?"

CUANDO confirma la eliminación
ENTONCES se emite CLIENTE:deleteFabricante
Y se realiza soft delete (borrado: true)
Y el fabricante desaparece de la tabla

CUANDO cancela
ENTONCES no se realiza ninguna acción
```

### 8.5 Crear proveedor
```gherkin
DADO que el usuario está en la página
CUANDO hace clic en "Nuevo Proveedor"
ENTONCES se abre el modal "Nuevo Proveedor"
Y se muestran campos: Nombre, Dirección, RIF (con autoformato), ID fiscal
Y selector de país con carga de estados
Y formulario de contacto (nombre, teléfono, correo, cargo)
Y selector de fabricantes que provee

CUANDO completa todos los campos requeridos
Y hace clic en "Guardar proveedor"
ENTONCES se emite CLIENTE:NuevoProveedor
Y se muestra toast de éxito
```

### 8.6 Búsqueda y ordenamiento en ambas tablas
```gherkin
DADO que la tabla de fabricantes tiene datos
CUANDO el usuario escribe en el campo de búsqueda
ENTONCES la tabla se filtra por nombre o alias (case-insensitive)
Y la paginación se resetea

CUANDO hace clic en un encabezado de columna (Nombre, Alias, Identificación fiscal, Tipo)
ENTONCES la tabla se ordena asc/desc alternadamente

DADO que la tabla de proveedores tiene datos
CUANDO busca por nombre, RIF o país
ENTONCES se filtra en tiempo real
```

### 8.7 Ver detalle de fabricante
```gherkin
DADO que existe un fabricante en la tabla
CUANDO el usuario hace clic en 🔍
ENTONCES se abre un modal de solo lectura
Y muestra: alias, identificación fiscal, orígenes, grupos asociados
Y si es también proveedor, muestra badge "Proveedor"
```

### 8.8 Ver detalle de proveedor
```gherkin
DADO que existe un proveedor en la tabla
CUANDO el usuario hace clic en 🔍
ENTONCES se abre un modal de solo lectura
Y muestra: dirección, RIF, país, estado, identificación fiscal
Y lista de contactos con nombre, teléfono, email, cargo
Y lista de fabricantes que provee
```

## 9. Consideraciones de diseño

- **Colores**: Usar exclusivamente variables CSS (`--accent-*`, `--status-*`, `--text-muted`, `--text-heading`, `--border-color`, `--hover-bg`).
- **Badges**: `.proveedor-badge-sm` (fondo `--status-success`, verde) para tipo proveedor; `.fabricante-badge` (fondo `--accent-blue`, azul) para tipo fabricante.
- **Iconos**: `fa-industry` (fabricantes), `fa-truck` (proveedores), `fa-edit` (editar, verde), `fa-trash-alt` (eliminar, rojo), `fa-info-circle` (detalle, azul).
- **Tablas**: Bulma `.table.is-fullwidth.is-striped.is-hoverable` con headers Gilroy uppercase y sortable.
- **Animaciones**: Clase `animate__animated animate__fadeInUp` en modals.
- **Z-index modal**: 10000.
- **Empty states**: Estilo `.empty-state-sm` con icono opaco y texto muted.
- **Confirmación de borrado**: SweetAlert2 con botón confirmar verde y cancelar rojo.
- **Toasts**: SweetAlert2, posición `top-end`, duración 5s, timerProgressBar, sin botón de confirmar.

## 10. Relación fabricante ↔ proveedor

- Un fabricante puede tener `proveedor: true` (flag booleano en el modelo `fabricante`)
- Un proveedor referencia uno o más fabricantes via `fabricantes: [ObjectId]`
- Al crear fabricante con "Proveedor directo" marcado, el frontend crea secuencialmente:
  1. Fabricante via `CLIENTE:NuevoFabricante`
  2. Proveedor via `CLIENTE:NuevoProveedor` (con `fabricantes: ''` — el backend asigna el último fabricante)
- Al editar fabricante que es proveedor, se puede editar también el proveedor vinculado
- Proveedores también pueden crearse independientemente sin vincular a un fabricante nuevo

## 11. Telemetría / Logging sugerido

| Evento | Dato a registrar |
|--------|-----------------|
| Creación de fabricante | nombre, alias, proveedorDirecto flag, timestamp |
| Edición de fabricante | fabricanteId, campos modificados, timestamp |
| Eliminación de fabricante | fabricanteId, timestamp |
| Creación de proveedor | nombre, cantidadContactos, cantidadFabricantes, timestamp |
| Edición de proveedor | proveedorId, timestamp |
| Eliminación de proveedor | proveedorId, timestamp |
| Error en creación | tipo, error message, timestamp |
| Creación combinada (fab+prov) | fabricanteId, proveedorId, timestamp |

## 12. Bugs conocidos / issues

- `NuevoFabricanteComponent.addGuion()` tiene un bug: la rama `else if` para `proveedor_directo_selected?.rif` falta el `=` de asignación (`this.proveedor_directo_selected.rif + '-'` sin asignar).
- En `NuevoFabricanteComponent.ngOnInit()`, la lista `paises` (hardcodeada con 167 entries) está definida pero nunca se usa — la carga real viene de `PaisesService.getPaises()`.
- `FabricantesService.buscarGrupos()` emite `CLIENTE:buscarGrupos` y escucha `cargarGrupos`, pero este evento no está implementado en `fabricanteEvents.js` — el array `grupos` nunca se puebla desde este servicio.
- En `NuevoProveedorComponent`, el método `onPaisChange()` referenciado en el template para modo edición usa `this.pais || this.proveedor?.pais`, pero no actualiza el proveedor directo cuando cambia en edición vía fabricante.
- `EliminarFabricante(i)` en `NuevoProveedorComponent` usa `splice` sobre el array de tags pero no remueve el `_id` correspondiente del array `fabricantes_array` — solo los nombres mostrados.
- `EliminarFabricante(i)` en `NuevoProveedorComponent` para modo edición hace `proveedor?.fabricantes?.splice(i, 1)` pero `proveedor.fabricantes` contiene objetos populados — el splice remueve el objeto del frontend pero el backend espera un array de ObjectId.
