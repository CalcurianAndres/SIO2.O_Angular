# Cartera de Clientes — Especificación Técnica y Funcional

> **Funcionalidad:** Módulo de gestión de clientes (cartera) dentro del módulo de Órdenes del sistema SIO (ERP/MES). Permite CRUD de clientes con datos fiscales, contactos, almacenes con geolocalización (Leaflet), en un layout master-detail con búsqueda, ordenamiento y paginación.

---

## 1. CONTEXTO Y OBJETIVOS

### Resumen Ejecutivo
Módulo que permite registrar, consultar, editar y eliminar clientes con su información fiscal (RIF, código, dirección), contactos asociados y almacenes con coordenadas geoespaciales visualizadas en mapas Leaflet. Presenta un layout de dos paneles: lista paginada a la izquierda y detalle del cliente seleccionado a la derecha.

### Problema/Oportunidad
- **Problema:** Los clientes se gestionaban de forma dispersa sin un panel unificado que permita ver datos, contactos y ubicaciones de almacenes en un solo lugar.
- **Oportunidad:** Centralizar la cartera de clientes con georreferenciación de almacenes, permitiendo al usuario tener una visión completa de cada cliente sin cambiar de pantalla.

### Objetivos de Negocio / KPIs esperados
| KPI | Objetivo |
|-----|----------|
| Tiempo de registro de cliente | Reducir de 5 min a < 2 min |
| Clientes con geolocalización | > 60% de los clientes con al menos un almacén georreferenciado |
| Completitud de datos | 100% de clientes con nombre, RIF, código y dirección |
| Duplicados | 0 clientes con mismo nombre |

### Fuera de Alcance (Out of Scope)
- Integración con sistemas contables/SNC
- Exportación de cartera a Excel/PDF
- Historial de cambios (audit trail) por cliente
- Reportes de clientes por zona geográfica
- Importación masiva desde CSV
- Módulo de facturación vinculado a clientes

---

## 2. LO QUE "NO" DEBE HACER EL SISTEMA (ANTIRREQUERIMIENTOS Y RESTRICCIONES)

### Restricciones de UI/UX
- **No debe recargar la página (SPA):** Todas las operaciones CRUD deben ocurrir vía WebSockets sin recarga del navegador.
- **No debe permitir doble submit:** El botón "Guardar" debe deshabilitarse (`[disabled]="guardando"`) mientras la operación está en curso.
- **No debe cerrar el modal si `guardando === true`:** El método `cerrar()` tiene `if (this.guardando) return;`.
- **No debe permitir eliminar contactos/almacenes sin confirmación visual** (aunque actualmente se eliminan directamente sin Swal, el diseño lo contempla para futura iteración).
- **No debe mostrar el mapa Leaflet si el contenedor no tiene dimensiones:** `initMap` reintenta hasta 15 veces con 400ms de espera si `clientWidth === 0`.

### Restricciones Lógicas/Negocio
- **Un cliente con `borrado: true` NO debe aparecer en la UI:** El backend filtra con `{borrado:false}`.
- **Un cliente con nombre duplicado NO debe crearse:** El backend verifica `findOne({ nombre, borrado: false })`.
- **Un cliente sin nombre NO debe guardarse:** Validación en backend (`nombre: { required: true }`).
- **Un contacto sin nombre NO debe agregarse:** Validación en frontend `if (!this.cliente_temporal.nombre?.trim()) return;`.
- **El RIF debe tener al menos un guion tras el primer carácter** (auto-hyphen en `addGuion()`), aunque no hay validación de formato completo.

### Restricciones Técnicas/Backend
- **No se deben mutar los documentos directamente sin dejar auditoría:** Soft-delete (`borrado: true`) obligatorio — nunca eliminar físicamente.
- **No se debe exponer el stack trace del error 500 al cliente:** Los errores se capturan con `try/catch` y se emiten como `{ mensaje: '...', icon: 'error' }`.
- **No se debe usar `findByIdAndUpdate` sin validar campos permitidos:** El objeto `data` puede contener campos espurios; idealmente debería hacerse un mapping explícito.
- **No se debe emitir `SERVER:cliente` antes de que la operación de escritura haya completado:** Confirmar con `await` antes de llamar a `emitirClientes()`.
- **No se debe hardcodear el centro del mapa Leaflet** (actualmente `[10.4806, -66.9036]` = Caracas). Debe ser configurable o detectar la ubicación del usuario.

---

## 3. HISTORIAS DE USUARIO Y CRITERIOS DE ACEPTACIÓN

### HU-01: Visualizar cartera de clientes

**Como** usuario del módulo de Órdenes,
**Quiero** ver una lista paginada de todos los clientes con búsqueda y ordenamiento,
**Para** localizar rápidamente un cliente y consultar sus datos.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Carga inicial con datos
  Dado que existen clientes registrados
  Cuando el usuario ingresa a la ruta /ordenes/clientes
  Entonces debe mostrar el layout master-detail
  Y la lista izquierda debe mostrar los clientes paginados con nombre, RIF, código y contador de contactos

Scenario: Carga inicial sin datos
  Dado que NO existen clientes registrados
  Cuando el usuario ingresa a la ruta /ordenes/clientes
  Entonces debe mostrar el empty state con icono fa-users y texto "No hay clientes registrados"

Scenario: Estado de carga
  Dado que los datos están cargando
  Entonces debe mostrar skeleton rows animados con pulse
```

### HU-02: Buscar y ordenar clientes

**Como** usuario del módulo de Órdenes,
**Quiero** buscar clientes por nombre, RIF o código y ordenar la tabla por cualquier columna,
**Para** encontrar rápidamente un cliente específico.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Buscar cliente por nombre
  Dado que hay múltiples clientes
  Cuando el usuario escribe "Acme" en el campo de búsqueda
  Entonces la lista debe filtrarse mostrando solo clientes con "Acme" en nombre, RIF o código
  Y la paginación debe reiniciarse a la página 1

Scenario: Ordenar por columna
  Dado que la lista de clientes está visible
  Cuando el usuario hace clic en el header "RIF"
  Entonces los clientes deben ordenarse por RIF ascendentemente
  Cuando el usuario hace clic nuevamente
  Entonces deben ordenarse descendentemente

Scenario: Sin resultados de búsqueda
  Dado que el usuario ha escrito un término sin match
  Entonces debe mostrarse la fila "Sin resultados" con colspan 4
```

### HU-03: Ver detalle de un cliente

**Como** usuario del módulo de Órdenes,
**Quiero** seleccionar un cliente de la lista y ver todos sus datos en el panel derecho,
**Para** consultar su información fiscal, contactos y ubicación de almacenes.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Seleccionar cliente de la lista
  Dado que hay clientes en la lista
  Cuando el usuario hace clic en un cliente
  Entonces la fila debe marcarse con clase `is-selected` y borde izquierdo azul
  Y el panel derecho debe mostrar: nombre, código, RIF, dirección
  Y debe mostrar la sección de contactos con sus tarjetas (nombre, cargo, correo, teléfono)
  Y debe mostrar la sección de almacenes como tags
  Y si el cliente tiene almacenes con coordenadas, debe mostrar el mapa Leaflet con marcadores

Scenario: Cliente sin contactos
  Dado que el cliente seleccionado no tiene contactos
  Entonces debe mostrarse "Sin contactos registrados"

Scenario: Cliente sin almacenes
  Dado que el cliente seleccionado no tiene almacenes
  Entonces debe mostrarse "Sin almacenes registrados"
  Y el mapa no debe mostrarse

Scenario: Sin cliente seleccionado
  Dado que el usuario no ha seleccionado ningún cliente
  Entonces debe mostrarse el mensaje "Selecciona un cliente" con icono fa-hand-pointer
```

### HU-04: Crear un nuevo cliente

**Como** usuario del módulo de Órdenes,
**Quiero** poder registrar un nuevo cliente con sus datos fiscales, contactos y almacenes,
**Para** incorporarlo a la cartera y poder asociarlo a órdenes de compra y productos.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Crear cliente exitosamente
  Dado que el usuario hace clic en "Nuevo Cliente"
  Cuando se abre el modal con icono fa-user-plus y título "Nuevo cliente"
  Y completa los campos: nombre, RIF (con auto-guion), código, dirección fiscal
  Y agrega al menos un contacto con título, nombre, cargo, correo y teléfono
  Y agrega al menos un almacén con nombre y coordenadas (clic en mapa o búsqueda Nominatim)
  Y hace clic en "Guardar"
  Entonces el botón debe mostrar spinner y deshabilitarse
  Y el modal debe cerrarse
  Y debe mostrarse un toast de éxito
  Y el nuevo cliente debe aparecer en la lista

Scenario: Crear cliente sin contactos ni almacenes
  Dado que el modal de nuevo cliente está abierto
  Cuando el usuario completa solo datos generales (nombre, RIF, código, dirección)
  Y hace clic en "Guardar"
  Entonces el cliente debe crearse correctamente con arrays vacíos de contactos y almacenes

Scenario: Validación de contacto duplicado
  Dado que el usuario está agregando contactos
  Cuando intenta agregar un contacto sin nombre
  Entonces el botón "+" debe estar deshabilitado
```

### HU-05: Editar un cliente existente

**Como** usuario del módulo de Órdenes,
**Quiero** poder editar los datos de un cliente existente,
**Para** actualizar su información fiscal, contactos o almacenes.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Editar cliente exitosamente
  Dado que el panel de detalle de un cliente está visible
  Cuando el usuario hace clic en "Editar Cliente"
  Entonces debe abrirse el modal con los datos precargados
  Cuando el usuario modifica algún campo
  Y hace clic en "Guardar"
  Entonces el modal debe cerrarse
  Y el detalle debe actualizarse con los nuevos datos
  Y debe mostrarse un toast de éxito

Scenario: Editar almacén existente
  Dado que el modal de edición está abierto con almacenes
  Cuando el usuario hace clic en un tag de almacén con coordenadas
  Entonces el mapa debe centrarse en la ubicación del almacén
  Y el pin debe mostrarse en la posición guardada
```

### HU-06: Geolocalización de almacenes con Leaflet

**Como** usuario del módulo de Órdenes,
**Quiero** poder ubicar almacenes en un mapa interactivo al crearlos o editarlos,
**Para** tener referencias geoespaciales de dónde se encuentran las bodegas del cliente.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Agregar almacén con clic en mapa
  Dado que el modal de cliente está abierto
  Cuando el usuario escribe un nombre de almacén
  Y hace clic en el mapa Leaflet
  Entonces debe colocarse un pin arrastrable en la posición del clic
  Y las coordenadas deben guardarse en el almacén temporal

Scenario: Buscar dirección con Nominatim
  Dado que el usuario ha escrito un nombre de almacén
  Cuando hace clic en el botón de búsqueda (fa-search-location)
  Entonces debe consultar la API de Nominatim
  Y si encuentra resultados, debe colocar un pin en la primera coordenada
  Y el mapa debe centrarse en esa ubicación

Scenario: Mapa en detalle del cliente
  Dado que un cliente seleccionado tiene almacenes con coordenadas
  Entonces debe mostrarse un mapa en el panel de detalle
  Y cada almacén debe tener un marcador con popup mostrando su nombre
  Si hay múltiples almacenes, el mapa debe ajustar el zoom con fitBounds
```

---

## 4. UX/UI, COMPONENTES Y ESTADOS

### 4.1 Layout general

```
<app-page-layout>
  ├── <app-section-header> (title="Clientes", icon="fa-users", color="blue")
  ├── <button> Nuevo Cliente
  └── <div class="columns"> (master-detail)
       ├── <div class="column is-6"> (lista izquierda)
       │    ├── [🔍 Search input]
       │    ├── <table> (is-fullwidth is-striped is-hoverable)
       │    │    ├── th: Cliente (sortable) | RIF (sortable) | Código (sortable) | 👥 (sortable)
       │    │    └── Filas con is-selected al hacer clic
       │    └── <Pagination> 10/25/50 + botones < 1 2 3 ... N >
       └── <div class="column is-6"> (detalle derecho)
            ├── [Empty state: "Selecciona un cliente"] cuando no hay selección
            └── [Card de detalle] cuando hay cliente seleccionado
                 ├── Header: icono + nombre + código
                 ├── Datos generales: RIF, Dirección
                 ├── Contactos: contact-cards con nombre, cargo, correo, teléfono
                 ├── Almacenes: tags is-warning is-light
                 ├── [Mapa Leaflet] con marcadores (si hay coordenadas)
                 └── [✏️ Editar Cliente] button
```

### 4.2 Componentes

| Componente | Archivos | Propósito |
|---|---|---|
| `ClientesComponent` | `clientes.component.ts/html/scss` | Layout master-detail, lista, búsqueda, paginación, detalle con mapa |
| `NewClienteComponent` | `new-cliente/new-cliente.component.ts/html/scss` | Modal de crear/editar cliente con formulario, contactos, almacenes y mapa |
| `ClientesService` | `services/clientes.service.ts` | Comunicación Socket.io para CRUD de clientes |

### 4.3 Estados de componentes

#### Lista de clientes (`ClientesComponent`)

| Estado | Condición | UI |
|---|---|---|
| **Loading** | `cargando && !api.clientes?.length` | 4 skeleton rows con animación pulse |
| **Empty** | `!cargando && (!api.clientes \|\| api.clientes.length === 0)` | Empty state: icono `fa-users`, texto "No hay clientes registrados" |
| **Data** | `api.clientes?.length > 0` | Tabla paginada con datos |
| **No search results** | `filteredClientes.length === 0` | Fila "Sin resultados" con colspan 4 |
| **Row selected** | `seleccion[i] === true` | Fila con clase `is-selected` + borde izquierdo azul |

#### Panel de detalle (`ClientesComponent`)

| Estado | Condición | UI |
|---|---|---|
| **No selection** | `!cliente_seleccionado` | Empty state pequeño: "Selecciona un cliente" |
| **Detail loaded** | `cliente_seleccionado` presente | Card con todas las secciones |
| **Sin contactos** | `contactos.length === 0` | Texto "Sin contactos registrados" |
| **Sin almacenes** | `almacenes.length === 0` | Texto "Sin almacenes registrados" |
| **Mapa visible** | `clienteTieneMapa === true` | Mapa Leaflet con marcadores |
| **Mapa oculto** | `clienteTieneMapa === false` | Sección de mapa no se renderiza (`[hidden]`) |

#### Modal Nuevo/Editar Cliente (`NewClienteComponent`)

| Estado | Condición | UI |
|---|---|---|
| **Nuevo** | `cliente === true` | Modal con icono `fa-user-plus`, título "Nuevo cliente" |
| **Editar** | `editar === true` | Modal con icono `fa-user-edit`, título "Editar cliente", datos precargados |
| **Saving** | `guardando === true` | Botón deshabilitado, icono `fa-spinner fa-pulse`, texto "Guardando…" |
| **Mapa oculto** | `!Almacene_temporal.nombre` | Mapa oculto (`[hidden]`) |
| **Mapa visible** | `Almacene_temporal.nombre` | Mapa Leaflet interactivo para pin |
| **Buscando dirección** | `buscandoDireccion === true` | Botón de búsqueda muestra spinner `fa-pulse` |

### 4.4 Estados de componentes interactivos

| Elemento | Default | Hover | Focus | Active | Disabled |
|---|---|---|---|---|---|
| Botón "Nuevo Cliente" (`.button.is-info`) | Fondo `--accent-blue` | Brillo | Outline | Presionado | N/A |
| Botón "Guardar" (`.button.is-success`) | Fondo `--status-success` | Brillo | Outline | Spinner `fa-pulse` | Opacidad 0.5, cursor not-allowed |
| Fila de cliente (`tr.cliente-row`) | Fondo transparente | `color-mix(accent-blue 8%, transparent)` | N/A | N/A | N/A |
| Fila seleccionada (`.is-selected`) | `color-mix(accent-blue 15%, transparent)` + borde izquierdo 3px | Mismo estilo | N/A | N/A | N/A |
| Header sortable (`th.sortable`) | Color `--text-muted` | Color `--accent-blue`, cursor pointer | N/A | N/A | N/A |
| Botón de paginación (`.button.is-small`) | Fondo `--bg-secondary` | `--hover-bg` | Outline | Presionado | Opacidad 0.4 |
| Página activa (`.is-info`) | Fondo `--accent-blue`, texto blanco | Mismo estilo | N/A | N/A | N/A |
| Botón "+" Agregar contacto | `--info` | Brillo | Outline | N/A | Sin nombre → disabled |
| Tag almacén con coordenadas (`.has-coords`) | Borde izquierdo verde `--status-success` | Mismo | N/A | N/A | N/A |
| Botón de búsqueda en mapa | `--info` | Brillo | N/A | Spinner | `buscandoDireccion` o sin nombre |

### 4.5 Responsive

| Breakpoint | Comportamiento |
|---|---|
| **Desktop (>1024px)** | Layout master-detail en `columns is-variable is-4` (50/50). Mapa Leaflet 240px altura. |
| **Tablet (768-1024px)** | Mismo layout, columnas se apilan si no hay espacio. Mapa se reduce proporcionalmente. |
| **Mobile (<768px)** | Las columnas se apilan verticalmente: lista arriba, detalle abajo. El modal ocupa 96vw. La paginación se vuelve scrollable horizontalmente. El mapa se oculta o se reduce a 180px de altura. |

---

## 5. EL MAPA DE CAMINOS (PATHS DE LÓGICA)

### 5.1 Happy Path — Crear un cliente

```
1. Usuario hace clic en "Nuevo Cliente"
2. Modal `app-new-cliente` se abre con `cliente = true`
3. Usuario completa: nombre "Acme Corp", RIF "J-12345678-9", código "CLI-042", dirección "Av. Principal, Caracas"
4. Usuario agrega contacto: título "Sr.", nombre "Juan Pérez", cargo "Gerente", correo "juan@acme.com", teléfono "+58 412 123 4567" → clic "+"
5. Usuario agrega almacén: nombre "Caracas", escribe en input → aparece mapa, hace clic en la ubicación → se coloca pin → clic "Agregar"
6. Usuario hace clic en "Guardar"
7. `guardando = true`, botón deshabilitado con spinner
8. `ClientesService.GuardarCliente(data)` emite `CLIENTE:nuevoCliente`
9. Backend: valida que no exista duplicado `findOne({ nombre: 'Acme Corp', borrado: false })`
10. Backend: crea documento en MongoDB con contactos y almacenes embebidos
11. Backend: emite `SERVIDOR:enviaMensaje({ mensaje: 'Se registró nuevo cliente', icon: 'success' })`
12. Backend: emite `SERVER:cliente` con lista actualizada
13. Frontend: recibe el mensaje, `onGuardarCliente` emite → `GuardarCiente()` en padre
14. Frontend: recibe `SERVER:cliente`, actualiza `api.clientes`
15. Modal se cierra, `destruirMapa()` limpia el mapa Leaflet
16. Toast de éxito aparece
17. Nuevo cliente aparece en la lista
```

### 5.2 Happy Path — Ver detalle de cliente

```
1. Usuario hace clic en cliente "Acme Corp" de la lista
2. `BuscarCliente(id, index)` → `cliente_seleccionado = api.buscarClientePorID(id)`
3. `seleccion[index] = true` → fila se marca visualmente
4. Panel derecho renderiza: nombre, RIF, código, dirección
5. `refrescarMapa()` → si hay almacenes con coordenadas, se renderiza mapa con marcadores
6. Contactos se muestran como contact-cards con nombre, cargo, correo, teléfono
7. Almacenes se muestran como tags is-warning is-light
```

### 5.3 Happy Path — Editar cliente

```
1. Usuario selecciona cliente, panel detalle visible
2. Usuario hace clic en "Editar Cliente"
3. `EditarCliente(cliente_seleccionado)` → clona datos a `this.data`
4. Modal se abre con `editar = true`, datos precargados
5. Usuario modifica nombre, agrega un contacto más
6. Usuario hace clic en "Guardar" → `editarCliente()`
7. `api.EditarClientes(this.data)` emite `CLIENTE:EditCliente`
8. Backend: `findByIdAndUpdate(data._id, data)`
9. Backend: emite éxito y actualiza lista
10. Modal se cierra, detalle se refresca con nuevos datos
```

### 5.4 Edge Cases

| Edge Case | Comportamiento esperado |
|---|---|
| **Doble clic en "Guardar"** | `guardando = true` impide el segundo clic |
| **Abrir modal sin nombre de cliente** | Botón "Guardar" habilitado igual (sin validación frontend de nombre) — el backend rechazará |
| **RIF con guion después del primer carácter** | `addGuion()` inserta guion automático al escribir el segundo carácter |
| **Clic en tag de almacén para editar** | `seleccionarAlmacenParaEditar(almacen)` copia datos al temporal y centra mapa |
| **Eliminar todos los contactos** | Array queda vacío, se muestra "Sin contactos registrados" |
| **Mapa sin dimensiones** | `initMap` reintenta hasta 15 veces (cada 400ms) |
| **Nominatim sin resultados** | Búsqueda falla silenciosamente (catch vacío), no se coloca pin |
| **Concurrencia: dos usuarios crean el mismo cliente simultáneamente** | Validación `findOne` puede fallar en condición de carrera; riesgo aceptado |
| **Editar sin cambiar nada** | Se envía mismo `data` al backend, se actualiza sin error |
| **Modal abierto con `selectedGrupo` en null** | Selector de grupo no aplica en clientes |

### 5.5 Sad Paths (Manejo de Errores)

#### Errores de validación en Frontend

| Escenario | Validación | UI |
|---|---|---|
| Contacto sin nombre | `if (!this.cliente_temporal.nombre?.trim()) return;` | Botón "+" deshabilitado |
| Almacén sin nombre | `if (!this.Almacene_temporal.nombre?.trim()) return;` | Botón "+" deshabilitado |
| Cerrar modal mientras guardando | `if (this.guardando) return;` en `cerrar()` | No hace nada |

#### Errores de Servidor/Backend (mapeo HTTP)

| Situación | Código HTTP equivalente | Mensaje | Toast al usuario |
|---|---|---|---|
| Cliente duplicado | 409 Conflict | `'Este cliente ya se encuentra registrado'` | Toast info amarillo |
| Faltan datos requeridos | 400 Bad Request | `'Faltan datos requeridos para el registro del cliente'` | Toast warning naranja |
| Error en creación | 500 Internal | `'Hubo un error en el registro de cliente'` | Toast error rojo |
| Error en edición | 500 Internal | `'Hubo un error en la edición del cliente'` | Toast error rojo |

#### Estado de Red (Offline)

| Escenario | Comportamiento |
|---|---|
| **Socket.io desconectado** | La lista muestra últimos datos en memoria. Sin indicador visual de desconexión. |
| **Intento de crear/editar sin conexión** | El evento Socket.io se emite pero nunca llega al backend. No hay feedback. |
| **Reconexión** | Socket.io reconecta automáticamente. Sin resincronización automática — el usuario debe recargar. |
| **Nominatim sin conexión** | `fetch` a Nominatim falla, `catch(() => {})` silencioso, no se coloca pin. |

---

## 6. ARQUITECTURA Y DETALLES TÉCNICOS

### 6.1 Contrato de API (Socket.io Events)

#### Eventos de Cliente → Servidor

| Evento | Payload | Descripción |
|---|---|---|
| `CLIENTE:buscarCliente` | `void` | Solicita la lista completa de clientes |
| `CLIENTE:nuevoCliente` | `ClientePayload` | Crea un nuevo cliente |
| `CLIENTE:EditCliente` | `ClientePayload & { _id: string }` | Actualiza un cliente existente |

#### ClientePayload (JSON)

```json
{
  "nombre": "Acme Corp",
  "rif": "J-12345678-9",
  "codigo": "CLI-042",
  "direccion": "Av. Principal, Caracas",
  "contactos": [
    {
      "titulo": "Sr.",
      "nombre": "Juan Pérez",
      "cargo": "Gerente",
      "correo": "juan@acme.com",
      "telefono": "+58 412 123 4567"
    }
  ],
  "almacenes": [
    {
      "nombre": "Caracas",
      "lat": 10.4806,
      "lng": -66.9036
    }
  ]
}
```

#### Eventos de Servidor → Cliente

| Evento | Payload | Descripción |
|---|---|---|
| `SERVER:cliente` | `Cliente[]` | Lista actualizada de clientes |
| `SERVIDOR:enviaMensaje` | `{ mensaje: string, icon: 'success' \| 'error' \| 'info' \| 'warning' }` | Mensaje de feedback |

#### Response exitoso (`SERVER:cliente`)

```json
[
  {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "nombre": "Acme Corp",
    "rif": "J-12345678-9",
    "codigo": "CLI-042",
    "direccion": "Av. Principal, Caracas",
    "contactos": [
      { "titulo": "Sr.", "nombre": "Juan Pérez", "cargo": "Gerente", "correo": "juan@acme.com", "telefono": "+58 412 123 4567" }
    ],
    "almacenes": [
      { "nombre": "Caracas", "lat": 10.4806, "lng": -66.9036 }
    ],
    "borrado": false,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-05-20T14:30:00.000Z"
  }
]
```

#### Response error (`SERVIDOR:enviaMensaje`)

```json
{
  "mensaje": "Este cliente ya se encuentra registrado",
  "icon": "info"
}
```

### 6.2 Modelo/Estructura de Datos

#### Colección: `cliente` (MongoDB/Mongoose)

| Campo | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | Auto | Identificador único |
| `nombre` | `String` | Sí | — | Nombre o razón social del cliente |
| `rif` | `String` | Sí | — | Registro de Información Fiscal (ej: J-12345678-9) |
| `codigo` | `String` | Sí | — | Código interno del cliente (ej: CLI-042) |
| `direccion` | `String` | Sí | — | Dirección fiscal |
| `contactos` | `[Contacto]` | No | `[]` | Array de contactos embebidos |
| `almacenes` | `[Almacen]` | No | `[]` | Array de almacenes embebidos |
| `borrado` | `Boolean` | No | `false` | Soft-delete |
| `createdAt` | `Date` | Auto | Auto | Fecha de creación |
| `updatedAt` | `Date` | Auto | Auto | Fecha de actualización |

#### Subdocumento: `Contacto`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre` | `String` | Sí | Nombre del contacto |
| `titulo` | `String` | Sí | Tratamiento (Sr./Sra.) |
| `cargo` | `String` | Sí | Cargo en la empresa |
| `correo` | `String` | Sí | Correo electrónico |
| `telefono` | `String` | Sí | Número de teléfono |

#### Subdocumento: `Almacen`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre` | `String` | Sí | Nombre del almacén (ej: Caracas, Valencia) |
| `lat` | `Number` | No | Latitud (georreferenciación) |
| `lng` | `Number` | No | Longitud (georreferenciación) |

### 6.3 Procesos Asíncronos / Workers

| Proceso | Disparador | Descripción |
|---|---|---|
| `emitirClientes()` | Después de cada CRUD en backend | Emite `SERVER:cliente` a todos los clientes conectados vía Socket.io |
| `initMap()` | Al abrir modal o cambiar nombre de almacén | Inicializa mapa Leaflet con reintento si el contenedor no tiene dimensiones |
| `buscarEnMapa()` | Clic en botón de búsqueda | Consulta Nominatim API (geocoding) y coloca pin en resultado |
| `colocarPin()` | Clic en mapa o resultado de búsqueda | Coloca/arrastra marcador Leaflet y actualiza coordenadas en `Almacene_temporal` |
| `refrescarMapa()` | Al seleccionar cliente en el detalle | Actualiza marcadores en el mapa de detalle con `fitBounds` si hay múltiples almacenes |

---

## 7. TELEMETRÍA Y ANALÍTICAS

### 7.1 Eventos de Tracking

| Evento | Disparador | Propiedades |
|---|---|---|
| `cliente_creado` | Usuario guarda nuevo cliente | `{ nombre: string, rif: string, contactos_count: number, almacenes_count: number, almacenes_georreferenciados: number }` |
| `cliente_editado` | Usuario edita cliente existente | `{ cliente_id: string, cambios: string[] }` |
| `cliente_seleccionado` | Usuario hace clic en un cliente de la lista | `{ cliente_id: string, nombre: string }` |
| `cliente_busqueda` | Usuario escribe en el campo de búsqueda | `{ termino: string, resultados: number }` |
| `contacto_agregado` | Usuario agrega un contacto en el modal | `{ cliente_id?: string }` |
| `almacen_agregado` | Usuario agrega un almacén en el modal | `{ cliente_id?: string, con_coordenadas: boolean }` |
| `almacen_geocodificado` | Usuario usa búsqueda Nominatim | `{ query: string, success: boolean }` |

Formato sugerido:

```json
{
  "event": "cliente_creado",
  "properties": {
    "nombre": "Acme Corp",
    "rif": "J-12345678-9",
    "contactos_count": 2,
    "almacenes_count": 1,
    "almacenes_georreferenciados": 1,
    "timestamp": "2026-06-05T10:30:00.000Z",
    "usuario_id": "665a...",
    "modulo": "ordenes"
  }
}
```

### 7.2 Logs Críticos (Backend)

| Evento | Nivel | Mensaje | Datos adicionales |
|---|---|---|---|
| Cliente creado | `info` | `Se registró nuevo cliente` | `{ nombre, rif, codigo }` |
| Cliente duplicado | `warn` | `el cliente ya se encuentra registrado` | `{ nombre }` |
| Error crear cliente | `error` | `Hubo un error en el registro del cliente` | `{ nombre, error: err.message }` |
| Cliente editado | `info` | `Se editó el cliente` | `{ _id }` |
| Error editar cliente | `error` | `Error al editar cliente` | `{ _id, error: err.message }` |
| Error buscar clientes | `error` | `Error al buscar cliente` | `{ error: err.message }` |
| Error emitir clientes | `error` | `No se pudo realizar la busqueda de los clientes` | `{ error: err.message }` |

Formato de log sugerido:

```javascript
console.log(JSON.stringify({
  level: 'info',
  event: 'cliente_creado',
  timestamp: new Date().toISOString(),
  data: { nombre: 'Acme Corp', rif: 'J-12345678-9' },
  socketId: socket.id
}));
```
