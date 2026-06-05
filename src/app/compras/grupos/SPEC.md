# Grupos de Materiales — Especificación Técnica y Funcional

> **Funcionalidad:** Módulo de clasificación de materiales por categorías (grupos) dentro del módulo de Compras del sistema SIO (ERP/MES). Permite CRUD de grupos, visualización en cards con acordeón anidado de 3 niveles (nombre → marca → detalle sortable), y gestión de materiales asociados.

---

## 1. CONTEXTO Y OBJETIVOS

### Resumen Ejecutivo
Módulo que permite crear, editar, eliminar y visualizar grupos de materiales (ej: Tintas, Barnices, Sustratos, Pegamentos) con cards paginadas, búsqueda global, ordenamiento por columna, y un acordeón anidado de 3 niveles (nombre de material → marca → detalle sortable) que reemplaza el antiguo sistema de stacks.

### Problema/Oportunidad
- **Problema:** Los materiales no estaban categorizados, lo que dificultaba la búsqueda, el filtrado y la asociación lógica en la creación de productos y órdenes de compra.
- **Oportunidad:** Centralizar la clasificación de materiales en una interfaz rápida con feedback en tiempo real vía WebSockets, permitiendo al usuario organizar y encontrar materiales por categoría de forma intuitiva.

### Objetivos de Negocio / KPIs esperados
| KPI | Objetivo |
|-----|----------|
| Tiempo de creación de material | Reducir de 2 min a < 30 seg |
| Materiales categorizados | 100% de los materiales deben pertenecer a un grupo |
| Usuarios activos del módulo | > 80% del equipo de compras y producción |
| Errores de duplicado | 0 duplicados de nombre de grupo |

### Fuera de Alcance (Out of Scope)
- Importación masiva de grupos vía Excel/CSV
- Reportes o gráficos estadísticos por grupo
- Permisos por rol sobre grupos específicos
- Historial de cambios (audit trail) por grupo
- Reordenamiento drag-and-drop de grupos en la tabla
- Versión pública o API REST externa (solo Socket.io interno)

---

## 2. LO QUE "NO" DEBE HACER EL SISTEMA (ANTIRREQUERIMIENTOS Y RESTRICCIONES)

### Restricciones de UI/UX
- **No debe recargar la página (SPA):** Todas las operaciones CRUD deben ocurrir vía WebSockets sin recarga del navegador.
- **No debe permitir doble submit:** El botón "Guardar" debe deshabilitarse (`[disabled]="guardando"`) mientras la operación está en curso.
- **No debe mostrar datos sensibles en texto plano:** No aplica directamente (no hay datos sensibles en grupos), pero nunca exponer IDs de MongoDB en URLs o mensajes de error al usuario.
- **No debe cerrar el modal sin confirmación si hay datos sin guardar:** Si el usuario abre el modal de nuevo/editar grupo y escribe algo, al hacer clic en X debe cerrarse sin advertencia (comportamiento actual simple). Si se requiere advertencia en futura iteración, debe agregarse un `canDeactivate` guard.
- **No debe permitir eliminar un grupo sin confirmación:** Toda eliminación debe pasar por SweetAlert2 de confirmación.

### Restricciones Lógicas/Negocio
- **Un grupo con `borrado: true` NO debe aparecer en la UI:** El backend filtra con `{borrado:false}` y el frontend nunca debe mostrar grupos eliminados.
- **Un grupo con nombre duplicado NO debe crearse:** El backend verifica `Grupo.findOne({ nombre: data.nombre, borrado: false })` antes de insertar.
- **Un grupo sin nombre NO debe guardarse:** Validación tanto en frontend (aunque no hay validación actual de nombre vacío) como en backend (`nombre: { required: true }`).
- **Un material NO puede pertenecer a un grupo eliminado lógicamente:** La FK `material.grupo` debe apuntar siempre a un grupo con `borrado: false`.
- **Una vez marcado `trato: true` (sustrato), los materiales dentro DEBEN tener calibre y gramaje:** Validación en `nuevo-material.component.ts`.

### Restricciones Técnicas/Backend
- **No se deben mutar los documentos directamente sin dejar auditoría:** Aunque actualmente no hay auditoría, el soft-delete (`borrado: true`) es obligatorio — nunca eliminar físicamente un grupo.
- **No se debe exponer el stack trace del error 500 al cliente:** Los errores de backend se capturan con `try/catch` y se emiten como `{ mensaje: '...', icon: 'error' }`.
- **No se deben guardar contraseñas ni tokens en el modelo de grupo** — el modelo `grupo.js` no contiene campos sensibles, pero debe mantenerse así.
- **No se debe usar `findByIdAndUpdate` sin validar campos permitidos:** El objeto `data` que llega a `CLIENTE:EditarGrupo` podría contener campos espurios; idealmente debería hacerse un mapping explícito (scope creep, aceptado por ahora).
- **No se debe emitir el evento `cargarGrupos` antes de que la operación de escritura haya completado:** Confirmar con `await` antes de llamar a `emitGrupos()`.

---

## 3. HISTORIAS DE USUARIO Y CRITERIOS DE ACEPTACIÓN

### HU-01: Visualizar grupos de materiales

**Como** usuario del módulo de Compras,
**Quiero** ver una tabla con todos los grupos de materiales disponibles,
**Para** poder identificar rápidamente las categorías existentes y navegar por ellas.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Carga inicial con datos existentes
  Dado que existen grupos de materiales en la base de datos
  Cuando el usuario ingresa a la ruta /compras/grupos
  Entonces debe mostrar una tabla con los grupos paginados
  Y cada fila debe mostrar: nombre con icono, badge de tipo (Parcial/Total), contador de materiales, y acciones (editar/eliminar)

Scenario: Carga inicial sin datos
  Dado que NO existen grupos de materiales
  Cuando el usuario ingresa a la ruta /compras/grupos
  Entonces debe mostrar el empty state con icono de cubos, texto "Crea tu primer grupo" y una flecha animada apuntando al botón "Nuevo Grupo"

Scenario: Estado de carga
  Dado que el usuario ingresa a la ruta /compras/grupos
  Cuando los datos aún no se han cargado
  Entonces debe mostrar 5 filas de skeleton animadas con efecto shimmer
  Y el empty state NO debe mostrarse mientras `cargando === true`
```

### HU-02: Crear un nuevo grupo

**Como** usuario del módulo de Compras,
**Quiero** poder crear un nuevo grupo de materiales mediante un modal,
**Para** clasificar nuevos tipos de materiales que aún no tienen categoría.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Crear grupo exitosamente
  Dado que el usuario hace clic en "Nuevo Grupo"
  Cuando completa el nombre y selecciona opciones (parcial, sustrato, sin análisis)
  Y hace clic en "Guardar"
  Entonces el botón debe mostrar spinner y texto "Guardando..." y deshabilitarse
  Y el grupo debe aparecer en la tabla sin recargar la página
  Y debe mostrarse un toast de éxito "Se creó un nuevo grupo"

Scenario: Crear grupo con nombre duplicado
  Dado que el usuario ingresa un nombre de grupo que ya existe
  Cuando hace clic en "Guardar"
  Entonces el backend debe rechazar la operación
  Y debe mostrarse un toast informativo "Este grupo ya se encuentra registrado"

Scenario: Crear grupo sin nombre
  Dado que el usuario NO ingresa un nombre
  Cuando hace clic en "Guardar"
  Entonces el backend debe rechazar la operación
  Y debe mostrarse un toast warning "Faltan datos requeridos para crear el grupo"
```

### HU-03: Editar un grupo existente

**Como** usuario del módulo de Compras,
**Quiero** poder editar el nombre y las propiedades de un grupo existente,
**Para** corregir o actualizar la clasificación sin perder los materiales asociados.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Editar grupo exitosamente
  Dado que existe un grupo en la tabla
  Cuando el usuario hace clic en el icono de editar (lápiz) en la fila del grupo
  Entonces debe abrirse el modal de edición con los datos actuales precargados
  Cuando el usuario modifica el nombre y/o checkboxes
  Y hace clic en "Guardar cambios"
  Entonces el botón debe mostrar spinner
  Y la tabla debe actualizarse con los nuevos datos sin recargar

Scenario: Editar grupo sin cambiar el nombre
  Dado que el usuario abre la edición de un grupo
  Cuando hace clic en "Guardar cambios" sin modificar nada
  Entonces debe actualizarse correctamente (mismos datos, sin error)
```

### HU-04: Eliminar un grupo

**Como** usuario del módulo de Compras,
**Quiero** poder eliminar un grupo de materiales,
**Para** mantener limpia la clasificación cuando una categoría ya no es necesaria.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Eliminar grupo con confirmación
  Dado que existe un grupo en la tabla
  Cuando el usuario hace clic en el icono de eliminar (papelera)
  Entonces debe aparecer un diálogo de confirmación SweetAlert2 con texto "¿Eliminar este grupo?"
  Cuando el usuario confirma la eliminación
  Entonces el grupo debe desaparecer de la tabla (soft-delete)
  Y debe mostrarse un toast de éxito "Se eliminó el grupo"

Scenario: Cancelar eliminación
  Dado que el usuario hace clic en eliminar un grupo
  Cuando el diálogo de confirmación se muestra
  Y el usuario hace clic en "Cancelar"
  Entonces el grupo NO debe eliminarse
  Y la tabla debe permanecer igual
```

### HU-05: Visualizar materiales de un grupo (acordeón anidado 3 niveles)

**Como** usuario del módulo de Compras,
**Quiero** expandir una card de grupo para ver sus materiales organizados en un acordeón de 3 niveles (nombre → marca → detalle),
**Para** inspeccionar rápidamente qué materiales pertenecen a cada categoría sin abrir modales.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Expandir grupo con materiales
  Dado que un grupo tiene materiales asociados
  Cuando el usuario hace clic en el header de la card
  Entonces debe mostrarse el cuerpo expandido con un acordeón anidado de 3 niveles
  Y el Nivel 1 agrupa materiales por nombre (con gramaje/calibre si es sustrato)
  Y cada grupo de nombre muestra un badge con el total de unidades

Scenario: Expandir nivel 1 (nombre de material)
  Dado que un grupo está expandido y tiene materiales
  Cuando el usuario hace clic en un nombre de material
  Entonces debe expandirse el Nivel 2 mostrando las marcas (fabricantes) asociadas
  Y cada marca muestra un badge con la cantidad de unidades

Scenario: Expandir nivel 2 (marca)
  Dado que el Nivel 1 está expandido
  Cuando el usuario hace clic en una marca
  Entonces debe expandirse el Nivel 3 mostrando una tabla sortable con el detalle
  Y la tabla incluye: Material, Serie, Código, Acciones (editar/eliminar)
  Y las columnas Material, Serie y Código son sorteables al hacer clic

Scenario: Expandir grupo sin materiales
  Dado que un grupo NO tiene materiales asociados
  Cuando el usuario hace clic en el header de la card
  Entonces debe mostrarse el mensaje "No hay materiales en este grupo" con un icono de caja abierta

Scenario: Colapsar grupo
  Dado que un grupo está expandido
  Cuando el usuario hace clic nuevamente en el header
  Entonces la card debe colapsarse y ocultar todo el contenido anidado

Scenario: Colapsar nivel individual
  Dado que un nombre de material está expandido mostrando marcas
  Cuando el usuario hace clic nuevamente en el nombre
  Entonces solo ese nombre debe colapsarse, sin afectar los demás niveles
```

### HU-06: Buscar y ordenar grupos

**Como** usuario del módulo de Compras,
**Quiero** poder buscar grupos por nombre y ordenar la tabla por cualquier columna,
**Para** encontrar rápidamente el grupo que necesito.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Buscar grupos por nombre
  Dado que hay múltiples grupos en la tabla
  Cuando el usuario escribe en el campo de búsqueda "Tintas"
  Entonces solo deben mostrarse los grupos cuyo nombre contenga "Tintas" (case insensitive)
  Y la paginación debe reiniciarse a la página 1

Scenario: Ordenar por columna Nombre
  Dado que la tabla muestra grupos
  Cuando el usuario hace clic en el header "Nombre"
  Entonces los grupos deben ordenarse alfabéticamente A-Z
  Cuando el usuario hace clic nuevamente
  Entonces los grupos deben ordenarse Z-A

Scenario: Ordenar por columna Tipo
  Dado que la tabla muestra grupos
  Cuando el usuario hace clic en el header "Tipo"
  Entonces los grupos deben ordenarse mostrando primero "Parcial" y luego "Total"
  Y el icono de sort debe reflejar la dirección actual

Scenario: Sin resultados de búsqueda
  Dado que el usuario ha escrito un término de búsqueda que no coincide con ningún grupo
  Entonces la tabla debe mostrarse vacía (sin filas)
  Y no debe mostrarse el empty state completo
```

### HU-07: Gestionar materiales dentro de un grupo

**Como** usuario del módulo de Compras,
**Quiero** poder agregar, editar y eliminar materiales desde el footer de la card expandida,
**Para** mantener actualizado el inventario de materiales sin cambiar de pantalla.

#### Criterios de Aceptación (Gherkin)

```gherkin
Scenario: Agregar material a un grupo
  Dado que un grupo está expandido
  Cuando el usuario hace clic en "Agregar Material" en el footer de la card
  Entonces debe abrirse el modal "Nuevo Material" con el grupo pre-seleccionado
  Cuando completa los campos requeridos (nombre, fabricante, serie, código)
  Y campos condicionales según el tipo de grupo (calibre/gramaje para sustratos, color/tinte para tintas con radios Cyan/Magenta/Amarillo/Negro/Pantone, cinta para cajas)
  Y hace clic en "Guardar"
  Entonces el material debe aparecer en el acordeón sin recargar

Scenario: Editar material
  Dado que existe un material en el detalle expandido (Nivel 3)
  Cuando el usuario hace clic en el icono de editar del material
  Entonces debe abrirse el modal "Editar Material" con los datos precargados
  Cuando modifica los campos y guarda
  Entonces la tabla de detalle debe reflejar los cambios

Scenario: Eliminar material
  Dado que existe un material en el detalle expandido (Nivel 3)
  Cuando el usuario hace clic en el icono de eliminar del material
  Entonces debe aparecer un diálogo de confirmación
  Cuando confirma la eliminación
  Entonces el material debe eliminarse y el contador del grupo debe actualizarse

Scenario: Validación de formulario de material con radios de tinta
  Dado que el modal de nuevo material está abierto para un grupo de tipo Tintas
  Cuando el usuario selecciona "Pantone" en los radios de color
  Entonces debe aparecer un input adicional para escribir el código Pantone
  Y el botón "Guardar" se habilita solo si se completó el código Pantone

Scenario: Validación de formulario de material
  Dado que el modal de nuevo material está abierto
  Cuando faltan campos requeridos (grupo, fabricante, nombre, serie, código)
  Entonces el botón "Guardar" debe estar deshabilitado
  Cuando se completan todos los campos requeridos
  Entonces el botón "Guardar" debe habilitarse
```

---

## 4. UX/UI, COMPONENTES Y ESTADOS

### 4.1 Layout general

```
<app-page-layout>
  ├── <app-section-header> (title="Grupo de materiales", icon="fa-shopping-cart", color="green")
  ├── <button> Nuevo Grupo
  ├── [Global search input]
  └── <div class="cards-container">
       ├── <div class="card grupo-card">  ← card por grupo
       │    ├── <div class="card-header"> (clickable)
       │    │    ├── [icono] [nombre grupo] [tipo badge (Parcial/Total)]
       │    │    └── [editar] [eliminar] [contador materiales] [chevron ▼]
       │    ├── <div class="card-content"> (expandible, max-height transition)
       │    │    ├── Nivel 1: <div class="name-card"> (por nombre material)
       │    │    │    ├── header clickable: [▶] [nombre] [total und.]
       │    │    │    └── Nivel 2: <div class="brand-card"> (por marca)
       │    │    │         ├── header clickable: [▶] [marca] [total und.]
       │    │    │         └── Nivel 3: <table.sub-table> (sortable)
       │    │    │              ├── Material (sort) | Serie (sort) | Código (sort) | Acciones
       │    │    │              └── filas con editar/eliminar
       │    │    └── ... (más name-cards)
       │    └── <div class="card-footer">
       │         └── [➕ Agregar Material]
       └── <div class="pagination"> ...
```

### 4.2 Componentes

| Componente | Archivos | Propósito |
|---|---|---|
| `GruposComponent` | `grupos.component.ts/html/scss` | Contenedor principal: cards, búsqueda, paginación, acordeón anidado 3 niveles |
| `NuevoGrupoComponent` | `nuevo-grupo/nuevo-grupo.component.ts/html/scss` | Modal de crear/editar grupo |
| `NuevoMaterialComponent` | `nuevo-material/nuevo-material.component.ts/html/scss` | Modal de crear/editar material |
| `MaterialesComponent` (legacy) | `materiales/materiales.component.ts/html/scss` | Reemplazado por acordeón inline |
| `GruposService` | `services/grupos.service.ts` | Comunicación Socket.io para CRUD de grupos |
| `Grupo` (modelo) | `compras/models/modelos-compra.ts` | Clase Grupo: nombre, trato, icono, parcial, otro, _id |

### 4.3 Estados de componentes

#### Cards de grupos (`GruposComponent`)

| Estado | Condición | UI |
|---|---|---|
| **Loading** | `cargando && api.grupos.length === 0` | 3 skeleton cards estilo OCP con pulse animation |
| **Empty** | `!cargando && api.grupos.length === 0` | Empty state: icono `fa-cubes`, título, hint, flecha animada bounce-up |
| **Data** | `api.grupos.length > 0` | Cards paginadas con header, body expandible y footer |
| **No search results** | `searchTerm` sin match en ningún grupo | Sin cards visibles (solo paginación oculta) |
| **Card expanded** | `expandedGrupoId === grupo._id` | Card body visible con acordeón anidado |
| **Name expanded** | `expandedNameKey === nameGroup.key` | Nivel 2 (marcas) visible dentro del nombre |
| **Brand expanded** | `expandedBrandKey === 'nameKey\|alias'` | Nivel 3 (tabla detalle) visible dentro de la marca |

#### Modal Nuevo Grupo (`NuevoGrupoComponent`)

| Estado | Condición | UI |
|---|---|---|
| **Default** | Modal abierto, `nuevo === true` | Formulario vacío, botón "Guardar" habilitado |
| **Saving** | `guardando === true` | Botón deshabilitado, icono `fa-spinner fa-pulse`, texto "Guardando..." |
| **Error** | Backend rechaza | Toast con mensaje de error (sin cerrar modal) |

#### Modal Nuevo Material (`NuevoMaterialComponent`)

| Estado | Condición | UI |
|---|---|---|
| **Default** | Modal abierto | Formulario con grupo pre-seleccionado o selector |
| **Grupo seleccionado = Sustrato** | `esSustrato === true` | Muestra campos extra: Calibre (pt) + Gramaje (g/m²) |
| **Grupo seleccionado = Tintas** | `esTinta === true` | Muestra campo extra: Color |
| **Grupo seleccionado = Cajas** | `esCaja === true` | Muestra campo extra: Metros de cinta |
| **Formulario inválido** | `formValido === false` | Botón "Guardar" deshabilitado |
| **Saving** | `guardando === true` | Botón deshabilitado con spinner |

### 4.4 Estados de componentes interactivos

| Elemento | Default | Hover | Focus | Active | Disabled |
|---|---|---|---|---|---|
| Botón "Nuevo Grupo" (`.button.is-info`) | Fondo azul `--accent-blue` | Brillo/opacidad sutil | Outline del navegador | Presionado | N/A |
| Botón "Guardar" (`.button.is-success`) | Fondo verde `--status-success` | Brillo | Outline | Spinner `fa-pulse` | Opacidad 0.5, cursor not-allowed |
| Icono editar (`.fa-edit.green`) | Color `--accent-green` | Opacidad reducida | N/A | N/A | N/A |
| Icono eliminar (`.fa-trash-alt.red`) | Color `--accent-red` | Opacidad reducida | N/A | N/A | N/A |
| Chevron card header (`.chevron-btn`) | Color `--text-muted` | Rotación 180deg (0.3s) | N/A | N/A | N/A |
| Header sortable (`th.is-clickable`) | Color `--text-muted` | Cursor pointer, color `--accent-blue` | N/A | N/A | N/A |
| Card header (`.card-header`) | Fondo `--bg-secondary` | Fondo `--hover-bg` | N/A | N/A | N/A |
| Card body expandido | `max-height: 3000px`, padding | Transition 0.4s ease | N/A | N/A | N/A |
| Input de búsqueda | Borde `--border-color` | Borde con color de acento | Outline | N/A | N/A |
| Botón de paginación (`.button.is-small`) | Fondo `--bg-secondary` | `--hover-bg` | Outline | Presionado | Opacidad 0.4 |

### 4.5 Responsive

| Breakpoint | Comportamiento |
|---|---|---|
| **Desktop (>1024px)** | Cards con ancho completo. Tabla de detalle (Nivel 3) con todas las columnas visibles. |
| **Tablet (768-1024px)** | Mismas cards, se reduce padding. Acordeón con overflow-x auto en detalle. |
| **Mobile (<768px)** | Cards ocupan 100% del ancho. Botones de acción se mantienen visibles. Modal ocupa 96vw con max-width. Empty state centrado con padding reducido. |

---

## 5. EL MAPA DE CAMINOS (PATHS DE LÓGICA)

### 5.1 Happy Path — Crear un grupo

```
1. Usuario hace clic en "Nuevo Grupo"
2. Modal `app-nuevo-grupo` se abre con `nuevo = true`
3. Usuario ingresa "Barniz UV" en el campo nombre
4. Usuario marca checkbox "Entrega parcial"
5. Usuario hace clic en "Guardar"
6. `guardando = true`, botón se deshabilita, muestra spinner
7. `GruposService.GuardarGrupo({ nombre: 'Barniz UV', parcial: true, icono: 'fa-cube', trato: false, otro: false })`
8. Socket.io emite `CLIENTE:NuevoGrupo` al backend
9. Backend: valida que no exista duplicado, crea documento en MongoDB
10. Backend: emite `SERVIDOR:enviaMensaje({ mensaje: 'Se creó un nuevo grupo', icon: 'success' })`
11. Backend: llama a `emitGrupos()` → emite `cargarGrupos` con lista actualizada
12. Frontend: recibe `SERVIDOR:enviaMensaje`, lo guarda en `api.mensaje`
13. Frontend: recibe `cargarGrupos`, actualiza `api.grupos`
14. `cerrarModal()` emite `onCloseModal`, `guardando = false`
15. Toast de éxito aparece por 5 segundos
16. Nuevo grupo "Barniz UV" aparece en la tabla
```

### 5.2 Happy Path — Expandir grupo y navegar acordeón anidado

```
1. Usuario hace clic en header de card "Tintas"
2. `expandedGrupoId = 'id-de-tintas'`
3. Card body se expande con max-height transition 0.4s, muestra footer
4. `getMaterialesDelGrupo('id-de-tintas')` retorna array de materiales
5. `getNameGroups('id-de-tintas')` agrupa por nombre (Nivel 1) con brands anidados (Nivel 2)
6. Se muestran name-cards: "Cyan" (5 und.), "Magenta" (3 und.), etc.
7. Usuario hace clic en "Cyan"
8. `expandedNameKey = 'Cyan'`
9. Se muestran brand-cards dentro: "Kodak: 2 und.", "BASF: 3 und."
10. Usuario hace clic en "Kodak"
11. `expandedBrandKey = 'Cyan|Kodak'`
12. Se muestra tabla de detalle (Nivel 3) con sort: Material | Serie | Código | Acciones
```

### 5.3 Happy Path — Paginación

```
1. Existen 25 grupos en la tabla
2. pageSize = 10, currentPage = 1
3. Se muestran grupos 1-10
4. Usuario hace clic en ">" → currentPage = 2
5. Se muestran grupos 11-20
6. Usuario cambia pageSize a 25 → currentPage = 1
7. Se muestran todos los 25 grupos
```

### 5.4 Edge Cases

| Edge Case | Comportamiento esperado |
|---|---|
| **Doble clic rápido en "Guardar"** | `guardando = true` impide el segundo clic porque `[disabled]="guardando"` |
| **Clic repetido en chevron expandir** | `toggleExpand` alterna correctamente: siempre muestra/oculta sin duplicar filas |
| **Clic en editar mientras el grupo está expandido** | Modal de edición se abre normalmente, expand no interfiere |
| **Eliminar grupo que tiene materiales asociados** | El soft-delete del grupo no elimina los materiales (FK queda huérfana). Esto es un gap conocido: los materiales deben limpiarse o reasignarse. |
| **Búsqueda con caracteres especiales** | `toLowerCase()` + `includes()` — funciona con acentos, mayúsculas, caracteres Unicode |
| **Página 1 con 0 resultados tras búsqueda** | `currentPage` se resetea a 1 en `onSearchChange()` |
| **Cambiar pageSize a 100 con 3 grupos** | `totalPages = 1`, no hay error |
| **Abrir modal de nuevo material sin grupo seleccionado** | Selector de grupo se muestra, con opción de seleccionar cualquier grupo |
| **Editar material cambiando de grupo** | El atributo `grupo` del material se actualiza; el material se mueve visualmente al grupo correcto tras recarga de datos |
| **Cerrar modal haciendo clic en X** | Se dispara `cerrar_()` que resetea el formulario y emite `onCloseModal_` |
| **Concurrencia: dos usuarios crean el mismo grupo simultáneamente** | La validación `findOne({ nombre })` en backend puede fallar en condiciones de carrera; se acepta como riesgo menor |

### 5.5 Sad Paths (Manejo de Errores)

#### Errores de validación en Frontend

| Escenario | Validación | UI |
|---|---|---|
| Material sin nombre | `!this.nombre` | Botón "Guardar" deshabilitado |
| Material sin fabricante | `this.Fabricante === ''` | Botón "Guardar" deshabilitado |
| Material sin serie | `!this.serie` | Botón "Guardar" deshabilitado |
| Material sin código | `!this.codigo` | Botón "Guardar" deshabilitado |
| Material sin grupo | `!this.grupo` | Botón "Guardar" deshabilitado |
| Sustrato sin calibre | `esSustrato && !this.calibre` | Botón "Guardar" deshabilitado |
| Sustrato sin gramaje | `esSustrato && !this.gramaje` | Botón "Guardar" deshabilitado |
| Tinta sin color | `esTinta && !this.color` | Botón "Guardar" deshabilitado |
| Caja sin cinta | `esCaja && !this.cinta` | Botón "Guardar" deshabilitado |
| Grupo sin nombre | No validado en frontend (solo en backend) → se envía y backend responde con error | Toast warning |

#### Errores de Servidor/Backend (mapeo HTTP)

El sistema usa Socket.io (no HTTP REST), pero los mensajes de error se mapean a códigos HTTP equivalentes para referencia:

| Situación | Código HTTP equivalente | Mensaje de error (backend → frontend) | Toast al usuario |
|---|---|---|---|
| Grupo duplicado | 409 Conflict | `{ mensaje: 'Este grupo ya se encuentra registrado', icon: 'info' }` | Toast info amarillo |
| Faltan datos requeridos | 400 Bad Request | `{ mensaje: 'Faltan datos requeridos para crear el grupo', icon: 'warning' }` | Toast warning naranja |
| Error en creación | 500 Internal | `{ mensaje: 'Hubo un error en la creación del grupo', icon: 'error' }` | Toast error rojo |
| Error en edición | 500 Internal | `{ mensaje: 'Hubo un error en la edición del grupo', icon: 'error' }` | Toast error rojo |
| Error en eliminación | 500 Internal | `{ mensaje: 'Hubo un error en la eliminación del grupo', icon: 'error' }` | Toast error rojo |
| Error al buscar grupos | 500 Internal | `console.error('Error al buscar grupos:', error)` (no visible al usuario) | Silencioso |

#### Estado de Red (Offline)

| Escenario | Comportamiento |
|---|---|
| **Socket.io desconectado** | La tabla muestra los últimos datos cargados en memoria (`api.grupos`). No hay indicador visual de desconexión actualmente. |
| **Intento de crear/editar/eliminar sin conexión** | El evento Socket.io se emite pero nunca llega al backend. No hay feedback para el usuario. No se muestra error. |
| **Reconexión** | Socket.io reconecta automáticamente. No hay resincronización automática de datos — el usuario debe recargar la página. |
| **Mejora sugerida (no implementada)** | Mostrar un banner "Sin conexión. Los cambios no se guardarán." cuando `socket.io.connected === false`. |

---

## 6. ARQUITECTURA Y DETALLES TÉCNICOS

### 6.1 Contrato de API (Socket.io Events)

#### Eventos de Cliente → Servidor

| Evento | Payload | Descripción |
|---|---|---|
| `CLIENTE:buscarGrupos` | `void` | Solicita la lista completa de grupos |
| `CLIENTE:NuevoGrupo` | `{ nombre: string, parcial: boolean, icono: string, trato: boolean, otro: boolean }` | Crea un nuevo grupo |
| `CLIENTE:EditarGrupo` | `{ id: string, nombre: string, parcial?: boolean, icono?: string, trato?: boolean, otro?: boolean }` | Actualiza un grupo existente |
| `CLIENTE:deleteGrupo` | `string` (id del grupo) | Elimina (soft-delete) un grupo por ID |

#### Eventos de Servidor → Cliente

| Evento | Payload | Descripción |
|---|---|---|
| `cargarGrupos` | `Grupo[]` | Lista actualizada de grupos (emitido tras CRUD o por solicitud) |
| `SERVIDOR:enviaMensaje` | `{ mensaje: string, icon: 'success' \| 'error' \| 'info' \| 'warning' }` | Mensaje de feedback para el usuario |
| `SERVER:NuevoGrupo` | `Grupo` | Grupo individual creado (se agrega al array local) |

#### Response exitoso (ej: `cargarGrupos`)

```json
[
  {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "nombre": "Tintas",
    "parcial": false,
    "icono": "fa-cube",
    "trato": false,
    "otro": false,
    "borrado": false,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-05-20T14:30:00.000Z"
  }
]
```

#### Response error (ej: `SERVIDOR:enviaMensaje`)

```json
{
  "mensaje": "Este grupo ya se encuentra registrado",
  "icon": "info"
}
```

### 6.2 Modelo/Estructura de Datos

#### Colección: `grupo` (MongoDB/Mongoose)

| Campo | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | Auto | Identificador único |
| `nombre` | `String` | Sí | — | Nombre del grupo (ej: "Tintas", "Barnices") |
| `parcial` | `Boolean` | Sí | — | Indica si admite entrega parcial |
| `icono` | `String` | No | `'fa-cube'` | Clase de Font Awesome para el icono del grupo |
| `trato` | `Boolean` | No | `false` | Si es `true`, los materiales se tratan como sustratos (requieren calibre + gramaje) |
| `otro` | `Boolean` | No | `false` | Si es `true`, el material se trata sin análisis de laboratorio |
| `borrado` | `Boolean` | No | `false` | Soft-delete: `true` = eliminado lógicamente |
| `createdAt` | `Date` | Auto | `timestamps: true` | Fecha de creación (Mongoose) |
| `updatedAt` | `Date` | Auto | `timestamps: true` | Fecha de última actualización (Mongoose) |

#### Clase TypeScript: `Grupo` (modelos-compra.ts)

```typescript
export class Grupo {
  constructor(
    public nombre: string,
    public trato?: boolean,
    public icono?: string,
    public parcial?: boolean,
    public otro?: boolean,
    public _id?: string,
  ) {}
}
```

#### Relaciones

```
Grupo (1) ────< Material (N)
  La FK `material.grupo` almacena el ObjectId del grupo.
  Los materiales se filtran vía `MaterialesService.filtrarGrupos(grupoId)`.
```

### 6.3 Procesos Asíncronos / Workers

| Proceso | Disparador | Descripción |
|---|---|---|
| `emitGrupos()` | Después de cada CRUD en backend | Emite `cargarGrupos` a todos los clientes conectados vía Socket.io para sincronización en tiempo real |
| `console.log` / `console.error` | Cada operación CRUD | Log en servidor para depuración (no hay sistema de logging centralizado actualmente) |

---

## 7. TELEMETRÍA Y ANALÍTICAS

### 7.1 Eventos de Tracking

| Evento | Disparador | Propiedades del evento |
|---|---|---|
| `grupo_creado` | Usuario hace clic en "Guardar" en modal nuevo grupo | `{ grupo_nombre: string, parcial: boolean, trato: boolean, otro: boolean }` |
| `grupo_editado` | Usuario hace clic en "Guardar cambios" en modal editar grupo | `{ grupo_id: string, cambios: { nombre?: string, parcial?: boolean, trato?: boolean, otro?: boolean } }` |
| `grupo_eliminado` | Usuario confirma eliminación en SweetAlert2 | `{ grupo_id: string, grupo_nombre: string }` |
| `grupo_expandido` | Usuario expande acordeón de grupo | `{ grupo_id: string, grupo_nombre: string, materiales_count: number }` |
| `grupo_busqueda` | Usuario escribe en el campo de búsqueda | `{ termino: string, resultados: number }` |
| `material_creado` | Usuario guarda un nuevo material | `{ grupo_id: string, nombre: string, fabricante_id: string, es_sustrato: boolean }` |
| `material_editado` | Usuario edita un material | `{ material_id: string, grupo_id: string }` |
| `material_eliminado` | Usuario elimina un material | `{ material_id: string, grupo_id: string }` |

Formato sugerido para Mixpanel/Segment:

```json
{
  "event": "grupo_creado",
  "properties": {
    "grupo_nombre": "Barniz UV",
    "parcial": true,
    "trato": false,
    "otro": false,
    "timestamp": "2026-06-05T10:30:00.000Z",
    "usuario_id": "665a...",
    "modulo": "compras"
  }
}
```

### 7.2 Logs Críticos (Backend)

| Evento | Nivel | Mensaje | Datos adicionales |
|---|---|---|---|
| Grupo creado exitosamente | `info` | `Se creó un nuevo grupo` | `{ nombre, parcial, trato, otro }` |
| Grupo creado duplicado | `warn` | `Este grupo ya se encuentra registrado` | `{ nombre }` |
| Error al crear grupo | `error` | `Hubo un error en la creación del grupo` | `{ nombre, error: err.message }` |
| Grupo editado exitosamente | `info` | `Se editó un grupo` | `{ id, nombre }` |
| Error al editar grupo | `error` | `Error al editar grupo` | `{ id, error: err.message }` |
| Grupo eliminado (soft) | `info` | `Se eliminó un grupo` | `{ id }` |
| Error al eliminar grupo | `error` | `Hubo un error en la eliminación del grupo` | `{ id, error: err.message }` |
| Error al buscar grupos | `error` | `Error al buscar grupos` | `{ error: err.message }` |
| Error al emitir grupos | `error` | `Error al emitir grupos` | `{ error: err.message }` |

Formato de log sugerido (estructurado):

```javascript
console.log(JSON.stringify({
  level: 'info',
  event: 'grupo_creado',
  timestamp: new Date().toISOString(),
  data: { nombre: 'Barniz UV', parcial: true },
  socketId: socket.id
}));
```
