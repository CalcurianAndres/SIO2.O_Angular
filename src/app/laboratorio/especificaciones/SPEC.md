# Especificaciones — Especificación funcional y técnica

## 1. Resumen

Módulo del Laboratorio para gestionar parámetros y normas de calidad de materiales. Permite crear, editar, visualizar y filtrar especificaciones técnicas agrupadas por tipo de material (sustrato, tinta/barniz, cajas, pads, otros). Cada material puede tener hasta dos esquemas de especificación: `especificacion` (modelo Mongoose `especificacion`) y `especificacion2` (modelo `analisis`).

## 2. Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 16.2, Bulma 0.9.4, SweetAlert2, Font Awesome |
| Backend | Node.js, Express, Mongoose, Socket.io |
| BD | MongoDB — colecciones `especificacions` y `analisis` |
| Componentes compartidos | `<app-page-layout>`, `<app-section-header>`, `<app-skeleton>` |
| Servicio | `EspecificacionesService` (vía `WebSocketService`) |

## 3. Routing de tipo de grupo → formulario

| Grupo | Tipo de especificación | Modelo BD | Evento Socket.io |
|-------|----------------------|-----------|-----------------|
| `grupo.trato === true` | Sustrato | `especificacion` | `CLIENTE:nuevaEspecificacion` / `CLIENTE:EdicionEspecificacion` |
| `nombre === 'Tintas'` | Tinta | `especificacion` | `CLIENTE:nuevaEspecificacion` / `CLIENTE:EdicionEspecificacion` |
| `nombre === 'Barniz de aceite'` | Barniz | `especificacion` | `CLIENTE:nuevaEspecificacion` / `CLIENTE:EdicionEspecificacion` |
| `nombre === 'Cajas de embalaje'` | Caja | `analisis` (especificacion2) | `CLIENTE:nuevaEspecificacion2` |
| `nombre === 'Soportes de Embalaje'` | Pads | `analisis` (especificacion2) | `CLIENTE:nuevaEspecificacion2` |
| Cualquier otro | Otros (key-value dinámico) | `analisis` (especificacion2) | `CLIENTE:nuevaEspecificacion2` |

## 4. Layout de página

```
┌──────────────────────────────────────────────┐
│ <app-section-header> color="red" (Laboratorio)│
│   "Especificaciones — Parámetros y normas..." │
├──────────────────────────────────────────────┤
│ [Nuevo Grupo] (routerLink a /compras/grupos)  │
├──────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ │Total Gr.│ │Con Esp. │ │Sin Esp. │ ← KPIs   │
│ └─────────┘ └─────────┘ └─────────┘          │
├──────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ │Card1 │ │Card2 │ │Card3 │ │Card4 │ │Card5 ││
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
│   Grid responsivo de grupos (2→3→5 cols)     │
├──────────────────────────────────────────────┤
│ Tabla de materiales con especificación       │
│ ┌────────┬────────┬──────┬──────┬──────────┐│
│ │Nombre  │Fab.    │Serie │Origen│ Acciones ││
│ ├────────┼────────┼──────┼──────┼──────────┤│
│ │...     │...     │...   │...   │🔍✏️      ││
│ └────────┴────────┴──────┴──────┴──────────┘│
│ Paginación 10/25/50/100                     │
└──────────────────────────────────────────────┘
```

## 5. Estados visuales

| Estado | Condición | UI |
|--------|-----------|----|
| **Carga** | `cargando && grupos.grupos.length === 0` | 5 skeleton cards (`skeleton-card`) |
| **Vacío (sin grupos)** | `!cargando && grupos.grupos.length === 0` | Empty state: icono `fa-cubes`, texto "No hay grupos de materiales", hint "Crea grupos desde el módulo de Compras" |
| **Grupo seleccionado sin materiales especificados** | `filteredMateriales.length === 0` | Empty state: icono `fa-file-alt`, texto "Sin materiales con especificación", hint para crear |
| **Datos** | `filteredMateriales.length > 0` | Grid de cards + tabla zebra paginada |

## 6. Componentes

### 6.1 EspecificacionesComponent (padre)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `cargando` | `boolean` | Indica si los grupos aún no se han cargado |
| `grupoSelected` | `string` | Nombre del grupo actualmente seleccionado |
| `materialesEspecificados` | `any[]` | Materiales del grupo seleccionado que TIENEN especificación |
| `materiales_seleceted` | `any[]` | Materiales SIN especificación (para el modal nuevo) |
| `Especificacion` | `any` | Especificación actual para el modal de detalle |
| `especificacion_para_editar` | `any` | Especificación a editar |
| `Esp_otro` | `any` | Objeto temporal para especificaciones tipo "otros" (cajas, pads, dinámico) |
| `NUEVA_ESPECIFICACION` | `boolean` | Abre modal de tinta |
| `EDITAR_ESPECIFICACION` | `boolean` | Abre modal de edición de tinta |
| `NUEVO_SUSTRATO` | `boolean` | Abre modal de sustrato |
| `EDITAR_SUSTRATO` | `boolean` | Abre modal de edición de sustrato |
| `NUEVA_CAJA` | `boolean` | Abre modal de caja |
| `EDITAR_CAJA` | `boolean` | Abre modal de edición de caja |
| `NUEVO_PADS` | `boolean` | Abre modal de pads |
| `NUEVO_OTROS` | `boolean` | Abre modal de otros (creación) |
| `EDITAR_OTROS` | `boolean` | Abre modal de otros (edición) |
| `Detalle` | `boolean` | Abre modal de detalle |
| `currentPage` / `pageSize` | `number` | Paginación (default 10, opciones 10/25/50/100) |
| `sortColumn` / `sortDirection` | `string` | Ordenamiento (nombre, fabricante, serie, origen) |

**Métodos clave**:
- `seleccionarGrupo(grupo)` — filtra materiales por grupo y resetea paginación
- `nueva_especificacion(id)` — determina tipo según grupo y abre modal correcto
- `Editar(item)` — carga especificación existente y abre modal de edición según tipo
- `Detallar(data)` — abre modal de detalle con `especificacion2.especificacion` o `especificacion`
- `cerrarNuevo()` — cierra cualquier modal y refresca lista

**ngDoCheck**: Detecta cambios en `grupos.grupos.length` para inicializar `cargando = false` y seleccionar el primer grupo por defecto.

### 6.2 NuevaEspecificacionComponent (modal)

| @Input | Tipo | Propósito |
|--------|------|-----------|
| `NUEVA_ESPECIFICACION` | `boolean` | Muestra formulario de tinta |
| `NUEVO_SUSTRATO` | `boolean` | Muestra formulario de sustrato |
| `NUEVA_CAJA` | `boolean` | Muestra formulario de caja |
| `NUEVO_PADS` | `boolean` | Muestra formulario de pads |
| `NUEVO_OTROS` | `boolean` | Muestra formulario de otros |
| `Edicion` / `Edicion_sustrato` / `Edicion_cajas` / `EDITAR_OTROS` | `boolean` | Modo edición |
| `Materiales` | `any[]` | Lista de materiales sin especificación (selector) |
| `Editable` | `any` | Objeto de especificación a editar |
| `Esp_otro` | `any` | Objeto para tipo cajas/pads/otros |

**Modelos de datos del formulario**:

| Tipo | Campos | Estructura |
|------|--------|-----------|
| **Tinta** | viscosidad, rigidez, tack, finura, secado | `{min, max, con}` (range + unidad/condición) |
| **Sustrato** | gramaje, calibre (mm/pt/µm), cobb (top/back), curling, blancura | `{min, nom, max}` (rango con nominal) |
| **Cajas** | li_largo/li_ancho/li_alto, le_largo/le_ancho/le_alto, espesor | `{min, nom, max}` (plano) |
| **Pads** | largo, ancho, signado, espesor | `{min, nom, max}` (plano) |
| **Otros** | dinámico (key-value) | Pares nombre → valor añadidos por el usuario |

**NA Toggle**: Cada sección del formulario tiene un checkbox "N/A" que deshabilita los inputs de esa sección. Estados por tipo:
- Sustrato: `SustratoNA = {gramaje, calibre, cobb, curling, blancura}`
- Tinta: `TintaNA = {viscosidad, rigidez, tack, finura, secado}`
- Cajas: `CajasNA = {li, le, espesor}`
- Pads: `PadsNA = {largo, ancho, signado, espesor}`

**Validación**: `formValido` retorna `true` solo si `Material_selected !== '#'` (se seleccionó un material). En modo edición siempre retorna `true`.

**Métodos**:
- `guardar()` — emite `CLIENTE:nuevaEspecificacion` con datos de tinta/sustrato
- `guardar_sustrato()` — alias de guardar() para sustrato
- `Editar_()` — emite `CLIENTE:EdicionEspecificacion`
- `guardarPads()` — emite `CLIENTE:nuevaEspecificacion2`
- `GuardarOtro()` — añade par key-value a `Esp_otro` y emite `CLIENTE:nuevaEspecificacion2`
- `cerrar()` — resetea todos los formularios a valores iniciales y emite `onCloseModal`

### 6.3 DetallesEspecificacionComponent (modal de solo lectura)

| @Input | Tipo | Descripción |
|--------|------|-------------|
| `Especificacion` | `any` | Objeto de especificación a mostrar |
| `Detalle` | `any` | Truthy → abre modal |

Renderiza condicionalmente según las propiedades presentes:
- **Tinta/Barniz** (`viscosidad` existe): muestra viscosidad, rigidez, tack, finura, secado con formato `min - max / con`
- **Sustrato** (`gramaje` existe): tabla con filas de gramaje, calibre (mm/pt/µm), cobb (top/back), curling, blancura (min/nom/max)
- **Otros** (`apariencia` existe): muestra apariencia y pH
- **Cajas** (`li_alto_nom` existe): tabla con dimensiones internas y externas (largo/ancho/alto) + espesor (min/nom/max)

## 7. API — Contrato Socket.io

### 7.1 Eventos del cliente → servidor

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `CLIENTE:BuscarEspecificaciones` | _(sin payload)_ | Solicita todas las especificaciones activas |
| `CLIENTE:nuevaEspecificacion` | `{especificacion: object, material: string}` | Crea especificación en colección `especificacions` y vincula al material en `material.especificacion` |
| `CLIENTE:EdicionEspecificacion` | `{_id: string, ...fields}` | Actualiza campos de una especificación por `_id` |
| `CLIENTE:nuevaEspecificacion2` | `{especificacion: object, material: string}` | Crea o actualiza especificación en colección `analisis` y vincula en `material.especificacion2` |

### 7.2 Eventos del servidor → cliente

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `SERVER:Especificaciones` | `Especificacion[]` | Lista de especificaciones activas (modelo `especificacion`) |
| `SERVER:Especificaciones_` | `Prueba[]` | Lista de especificaciones activas (modelo `analisis`) |
| `SERVER:Materiales` | `Material[]` | Materiales actualizados post creación/edición (poblados con fabricante, especificacion, grupo) |
| `SERVIDOR:enviaMensaje` | `{mensaje: string, icon: 'success'\|'error'}` | Notificación toast para SweetAlert2 |

### 7.3 Flujo de creación (tinta/sustrato)

```
Usuario → [click +] → NuevaEspecificacionComponent.guardar()
  → EspecificacionesService.GuardarEspecificacion(data)
    → socket.emit('CLIENTE:nuevaEspecificacion', data)
      → Backend: especificacion.create(data.especificacion)
      → Backend: Material.findByIdAndUpdate(data.material, {especificacion: newId})
      → Backend: socket.emit('SERVER:Materiales', materiales)
      → Backend: socket.emit('SERVIDOR:enviaMensaje', {mensaje: 'Se creó...', icon: 'success'})
    → NuevaEspecificacionComponent.cerrar()
    → setTimeout → Swal.fire(toast)
    → onActualizar.emit()
```

### 7.4 Flujo de creación/edición (cajas/pads/otros)

```
Usuario → [click +] → NuevaEspecificacionComponent.GuardarOtro()
  → EspecificacionesService.GuardarEspecificacion2(data)
    → socket.emit('CLIENTE:nuevaEspecificacion2', data)
      → Backend: si _id existe → findByIdAndUpdate
      → Backend: si no _id → new prueba({especificacion}).save()
      → Backend: Material.findByIdAndUpdate(data.material, {especificacion2: id})
      → Backend: socket.emit('SERVER:Materiales', materiales)
      → Backend: socket.emit('SERVIDOR:enviaMensaje', ...)
    → cerra()
```

## 8. Modelo de datos

### 8.1 Colección `especificacions`

```javascript
{
  borrado: Boolean,          // soft delete, default false
  viscosidad: { min, max, con },
  rigidez: { min, max, con },
  tack: { min, max, con },
  finura: { min, max, con },
  secado: { min, max, con },
  gramaje: { min, nom, max },
  calibre: {
    pt: { min, nom, max },
    um: { min, nom, max },
    mm: { min, nom, max }
  },
  cobb: {
    top: { min, nom, max },
    back: { min, nom, max }
  },
  curling: { min, nom, max },
  blancura: { min, nom, max }
}
// timestamps: true (createdAt, updatedAt)
```

### 8.2 Colección `analisis` (especificacion2)

Almacenada como subdocumento `{ especificacion: { ... } }`. El esquema es dinámico — acepta cualquier campo (usado para cajas, pads, otros). Campos conocidos: `apariencia`, `ph_m`, `ph_M`, `li_largo_min/nom/max`, `li_ancho_min/nom/max`, `li_alto_min/nom/max`, `le_largo_min/nom/max`, `le_ancho_min/nom/max`, `le_alto_min/nom/max`, `espesor_min/nom/max`, `largo_min/nom/max`, `ancho_min/nom/max`, `signado_min/nom/max`, y pares dinámicos.

## 9. Gherkin — Escenarios clave

### 9.1 Crear especificación de tinta
```gherkin
DADO que el usuario está en la página de Especificaciones
Y existe un grupo "Tintas" con materiales sin especificación
CUANDO hace clic en [+] en la card del grupo "Tintas"
ENTONCES se abre el modal "Nueva especificación"
Y se muestra un selector de materiales sin especificar
Y se muestran los campos: Viscosidad, Rígidez, Tack, Finura, Secado
Y cada campo tiene inputs para Min, Max, y und/cond
Y cada sección tiene un checkbox "N/A"

CUANDO selecciona un material, completa los valores y hace clic en "Guardar"
ENTONCES se emite CLIENTE:nuevaEspecificacion
Y se muestra un toast "Se creó una nueva especificación"
Y el material desaparece del selector de sin-especificación
Y aparece en la tabla de materiales con especificación
```

### 9.2 Editar especificación
```gherkin
DADO que existe un material con especificación en la tabla
CUANDO el usuario hace clic en el icono ✏️
ENTONCES se abre el modal correspondiente (según tipo de grupo)
Y los campos se cargan con los valores existentes
Y no se muestra el selector de material (solo campos de especificación)

CUANDO modifica valores y hace clic en "Editar"
ENTONCES se emite CLIENTE:EdicionEspecificacion
Y se muestra un toast "Se ha editado la especificación"
Y la tabla se actualiza
```

### 9.3 Ver detalle de especificación
```gherkin
DADO que existe un material con especificación en la tabla
CUANDO el usuario hace clic en el icono 🔍
ENTONCES se abre un modal de solo lectura
Y se muestra la información formateada según el tipo:
- Tinta: viscosidad, rigidez, tack, finura, secado
- Sustrato: gramaje, calibre (pt/mm/µm), cobb (top/back), curling, blancura
- Cajas: dimensiones internas/externas, espesor
- Otros: apariencia, pH, y campos dinámicos
```

### 9.4 Navegación por grupos
```gherkin
DADO que existen múltiples grupos con materiales
CUANDO el usuario hace clic en una card de grupo
ENTONCES la card se marca como activa (card-active)
Y la tabla se actualiza para mostrar solo materiales de ese grupo
Y la paginación se resetea a página 1
Y el título cambia a "Especificaciones {nombreDelGrupo}"
```

### 9.5 Estados de carga y vacío
```gherkin
DADO que el usuario accede a la página
CUANDO los grupos aún no se han cargado (cargando = true)
ENTONCES se muestran 5 skeleton cards animadas

CUANDO no existen grupos registrados
ENTONCES se muestra empty state con icono fa-cubes
Y un mensaje "No hay grupos de materiales"
Y un hint para crearlos desde Compras

CUANDO existe un grupo seleccionado pero ningún material tiene especificación
ENTONCES se muestra empty state con icono fa-file-alt
Y un hint para agregar desde el icono [+] de la card
```

### 9.6 Paginación y ordenamiento
```gherkin
DADO que la tabla tiene más de 10 materiales
CUANDO se renderiza la tabla
ENTONCES se muestran solo los primeros 10 (default)
Y se muestran controles de paginación (anterior/siguiente + contador)
Y se puede cambiar a 25/50/100 ítems por página

CUANDO el usuario hace clic en un encabezado de columna (Nombre, Fabricante, Serie, Origen)
ENTONCES la tabla se reordena asc/desc alternadamente
Y se muestra el icono de sort correspondiente
Y la paginación se resetea
```

### 9.7 NA Toggle en formularios
```gherkin
DADO que el modal de creación está abierto
CUANDO el usuario marca "N/A" en una sección (ej: Viscosidad)
ENTONCES todos los inputs de esa sección se deshabilitan
Y los valores no se envían al guardar (pero sí se guardan los defaults 0)

CUANDO el usuario desmarca "N/A"
ENTONCES los inputs se habilitan nuevamente
```

### 9.8 Especificaciones de tipo "Otros" (campos dinámicos)
```gherkin
DADO que el grupo no es sustrato, tinta, barniz, caja ni pads
CUANDO el usuario abre el modal "Nueva especificación"
ENTONCES se muestra un campo para añadir pares clave-valor
Y los pares se agregan dinámicamente al objeto

CUANDO guarda
ENTONCES se emite CLIENTE:nuevaEspecificacion2
Y se almacena en la colección analisis como especificacion2 del material
```

## 10. Consideraciones de diseño

- **Colores**: Usar exclusivamente variables CSS (`--accent-*`, `--status-*`). Sin colores hardcodeados.
- **Iconos**: Font Awesome (`fa-flask`, `fa-plus-circle`, `fa-info-circle`, `fa-edit`, `fa-save`, `fa-cubes`, `fa-file-alt`, `fa-ruler`, `fa-box`, `fa-vial`).
- **Animaciones**: Clase `animate__animated animate__fadeInUp` en modals y cards.
- **Responsive grid**: 2 columnas base, 3 en ≥768px, 5 en ≥1024px.
- **Toasts**: SweetAlert2, posición `top-end`, duración 5s, con barra de progreso.
- **Z-index modal**: 10000 (por encima de sidebar 1000).

## 11. Telemetría / Logging sugerido

| Evento | Dato a registrar |
|--------|-----------------|
| Creación de especificación | Tipo (tinta/sustrato/caja/pads/otros), materialId, usuario, timestamp |
| Edición de especificación | Tipo, especificacionId, campos modificados, timestamp |
| Visualización de detalle | especificacionId, timestamp |
| Error en creación | tipo, materialId, error message, timestamp |
| Error en edición | especificacionId, error message, timestamp |
| Tiempo de carga | Duración entre `cargando=true` y primer grupo recibido |
| Uso de NA Toggle | Sección marcada como N/A por tipo de formulario |

## 12. Bugs conocidos / issues

- `EspecificacionesService.buscarEspecificacion()` asigna tanto `SERVER:Especificaciones` como `SERVER:Especificaciones_` a `this.especificaciones` — el segundo sobrescribe al primero, por lo que `especificaciones` siempre termina siendo la lista del modelo `analisis`.
- En el modal de cajas y Pads, el `*ngIf` para mostrar inputs de edición usa `!Edicion_sustrato` en lugar de `!Edicion_cajas` — los inputs de edición de cajas/pads nunca se renderizan (quedan en modo creación siempre).
- El método `Editar_()` no resetea `Esp_otro` después de editar — puede causar datos residuales en la siguiente apertura.
- `GuardarOtro()` emite `CLIENTE:nuevaEspecificacion2` incluso cuando no se ha añadido ningún par key-value (newKey vacío).
- `EspecificacionSustrato` se tipa como `EspecificacionSustrato` pero se usa `any` en el resto del componente — inconsistencia de tipos.
