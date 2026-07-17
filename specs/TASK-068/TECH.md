# TECH — TASK-068: Correcciones en Recepción de materiales y flujo de bobinas

## Resumen

Cambios localizados en el frontend (componentes `nueva-recepcion` y `recepcion`) y un cambio menor en el backend (referencia a `almacen_id`). No requiere nuevos modelos ni migraciones de datos.

## Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `almacen/recepcion/nueva-recepcion/nueva-recepcion.component.ts` | Filtro proveedores, validación país, Base Imponible, control label |
| `almacen/recepcion/nueva-recepcion/nueva-recepcion.component.html` | Mensaje empty state, ancho Tipo, label N Control, disable Control |
| `almacen/recepcion/recepcion.component.ts` | Flujo bobinas (saltar laboratorio), selector almacén destino |
| `almacen/recepcion/recepcion.component.html` | Botón Almacén con selector de destino, mensaje empty state |
| `almacen/recepcion/recepcion.component.scss` | Ajustes de ancho para input Tipo |
| `SIO2.0_Express/models/almacen.js` | Campo opcional `almacen_id` para referencia al almacén destino |

## Análisis arquitectónico

### Árbol de dependencias

```
NuevaRecepcionComponent
├── RecepcionService (Socket.io)
├── OrdenPoligrafica service
├── ProveedoresService
└── OpoligraficaService (para filtrar proveedores con OCP activa)

RecepcionComponent (main list)
├── RecepcionService
├── AlmacenService
├── BobinasService
└── AlmacenesService (nuevo, para listar almacenes destino)
```

### Estado actual

1. **Selector de proveedor** (`nueva-recepcion.component.html:32-42`): Muestra `this.proveedores.proveedores` (todos los proveedores). No hay filtro por OCP activa.
2. **Input Tipo**: Select con `class="input"` estándar, sin control de ancho. El texto "F - " o "N - " se trunca.
3. **Label "Control"**: Texto fijo "Control" sin prefijo.
4. **Control habilitado siempre**: No hay lógica de país para deshabilitarlo.
5. **Base Imponible** (`nueva-recepcion.component.ts:301`): Usa formateo manual (`onInputChange()`) con puntos y coma, distinto a la directiva global `numberFormat`.
6. **Bobinas**: Siguen el mismo flujo que materiales regulares (pasan por `poseeAnalisis()` en recepcion.component.html).
7. **Envío a almacén**: No hay selector de almacén destino — se asume almacén único.
8. **Empty state**: El modal de nueva recepción se abre sin validación previa.

## Implementación

### 1. Filtrar proveedores con OCP activa

En `nueva-recepcion.component.ts`, modificar el getter `opcionesProveedor` (o el método equivalente) para filtrar:

```typescript
get proveedoresConOCPActiva() {
  // OCPs activas = aquellas con estado === 'Abierta'
  const activas = this.opoligrafica.orden.filter(o => o.estado === 'Abierta');
  const proveedorIds = new Set(activas.map(o => o.proveedor?._id));
  return this.proveedores.proveedores.filter(p => proveedorIds.has(p._id));
}
```

### 2. Aumentar ancho del input Tipo

En `nueva-recepcion.component.scss`, agregar:

```scss
.tipo-select {
  min-width: 120px;
}
```

En el template, agregar clase al select.

### 3. Cambiar label "Control" → "N Control"

Cambiar texto en template de `Control` a `N Control`.

### 4. Inhabilitar N Control si proveedor no es venezolano

En `nueva-recepcion.component.ts`:

```typescript
get esProveedorVenezolano(): boolean {
  const prov = this.proveedores.proveedores.find(p => p._id === this.proveedor_);
  return prov?.pais === 'Venezuela' || !prov?.pais;
}
```

En template: `[disabled]="!esProveedorVenezolano"` en el input N Control. Mostrar tooltip cuando está deshabilitado.

### 5. Base Imponible con formato global

Reemplazar el formateo manual (`onInputChange`, `keyDownEvent`, `keyUpEvent`) con la directiva `numberFormat` que ya existe en el sistema. El campo debe comportarse como todos los demás campos numéricos del sistema.

### 6. Flujo bobinas: saltar laboratorio

En `recepcion.component.html`, modificar la condición del botón "Almacén":
- Material bobina (unidad 't' o pedido.bobina === true): no requiere `poseeAnalisis()`
- Material externo: no requiere `poseeAnalisis()`
- Material regular + venezolano: requiere `poseeAnalisis()` (comportamiento actual)

En la lógica de `EnviarAlmacen()`:
- Bobinas: no crear registro de análisis, ir directo a almacén
- Marcar recepción como procesada sin pasar por laboratorio

### 7. Selector de almacén destino

Al hacer clic en "Almacén", antes de guardar, mostrar un modal/select con los almacenes disponibles (obtenidos del nuevo servicio `AlmacenesService`).

Agregar campo opcional `almacen_id` al modelo `Almacen` para referenciar el almacén destino.

### 8. Mensaje empty state

En `recepcion.component.html`, cuando `recepciones.length === 0` y `!cargando`:
```html
<div class="empty-state">
  <i class="fas fa-warehouse empty-icon"></i>
  <p>No hay recepciones registradas</p>
</div>
```

## Ingeniería inversa de datos

- Los proveedores en `ProveedoresService.proveedores[]` tienen `pais` como string (ej: 'Venezuela')
- Las OCP en `OpoligraficaService.orden[]` tienen `estado` ('Abierta'/'Cerrada') y `proveedor._id`
- Los materiales en `RecepcionService.recepciones[].materiales[][]` tienen `unidad` ('t' para bobinas)
- No existe aún el modelo `Almacenes` — se crea en TASK-069

## Estados y transiciones

| Escenario | poseeAnalisis() | Selector almacén | N Control |
|-----------|:---:|:---:|:---:|
| Material regular + Vzla | Requerido | Visible | Habilitado |
| Material bobina | No requerido | Visible | Habilitado |
| Material regular + Extranjero | No requerido | Visible | Deshabilitado |
| Material bobina + Extranjero | No requerido | Visible | Deshabilitado |

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Proveedor sin `pais` definido | Media | Tratar como venezolano (default: Control habilitado) |
| OCP sin `proveedor._id` poblado | Baja | Guard clause con optional chaining |
| Base Imponible con formato legacy en BD | Media | El formateo es solo visual; el valor guardado no cambia |
| Regresión en envío a almacén | Media | Probar flujo completo con cada tipo de material |

## Rollout

- No requiere migración de datos
- No requiere cambios en el schema de BD (campo `almacen_id` opcional en Almacen)
- Dependencia de TASK-069 (modelo Almacenes) para el selector de destino
- Commits separados por feature dentro del mismo task

## Pruebas

1. Crear recepción con proveedor venezolano → N Control habilitado
2. Crear recepción con proveedor extranjero → N Control deshabilitado
3. Verificar que Base Imponible usa formato global
4. Enviar bobina a almacén → no requiere análisis
5. Enviar material regular a almacén → requiere análisis
6. Verificar empty state cuando no hay recepciones
