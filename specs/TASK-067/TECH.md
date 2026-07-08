# TECH — TASK-067: Mejoras en listado OCP: énfasis N°, sort, filtro Activas, fecha permanente, cierre automático

## Resumen

Cambios en frontend (3 archivos: .ts, .html, .scss) y backend (3 archivos: model, 2 event handlers). ~100 LOC total.

## Archivos afectados

| Archivo | Cambio | LOC aprox |
|---------|--------|-----------|
| `SIO2.O_Angular/.../ordenes.component.ts` | Nuevas propiedades: `sortAsc`, `fechaDesde`, `fechaHasta`. Nuevos getters: `ordenesActivas`, `fabricantesUnicas`. Nuevos métodos: `toggleSort()`, `filtrarPorFabricante()`. Modificado getter `ordenesVisibles` para incluir sort + active filter + date range. Eliminados: `buscarPorFecha()`, `buscarPorFecha_cliente()`, `PorClientes`. | ~50 |
| `SIO2.O_Angular/.../ordenes.component.html` | Header reordenado, date range siempre visible, sort toggle, 4 pestañas (Activas/Por N°/Por proveedor/Por fabricante), status badge condicional. | ~30 |
| `SIO2.O_Angular/.../ordenes.component.scss` | Nuevas clases: `.order-number-emphasis`, `.order-header-meta`, `.sort-tab`. Removidas clases muertas. | ~30 |
| `SIO2.0_Express/models/orden-poligrafica.js` | Agregados campos `estado` (String, enum Abierta/Cerrada, default 'Abierta') y `fecha_cierre` (Date) | ~5 |
| `SIO2.0_Express/events/opoligraficaEvents.js` | Agregado `.sort({ numero: -1 })` a `EmitirOrdenes()` | ~1 |
| `SIO2.0_Express/events/almacenEvents.js` | Agregada importación de modelos + lógica post-`almacen.create` para auto-close OCP | ~15 |

## Análisis arquitectónico

### Árbol de dependencias

```
OrdenesComponent
├── OpoligraficaService.orden[]     # { numero, proveedor, estado, fecha_cierre, pedido[], ... }
├── BreadcrumbService
├── PageLayoutService
├── ToastService
└── Router

AlmacenEvents (backend)
├── Recepcion model
├── Almacen model
└── ordenPoligrafica model
    └── opoligraficaEvents.EmitirOrdenes()  # re-emit after close
```

### Estado actual (código relevante)

**`ordenes.component.ts` — Getter `ordenesVisibles` actual:**
```typescript
get ordenesVisibles() {
  if (this.filtrados.length > 0) return this.filtrados;
  return this.api.orden;
}
```
No tiene ordenamiento, ni filtro de estado, ni filtro por fecha.

**Template header actual:**
```html
<div class="card-header-title">
  <span class="order-provider">{{ orden.proveedor?.nombre_proveedor || orden.proveedor?.nombre }}</span>
  <span class="order-number">OCP: {{ addSlice(orden.numero) }}</span>
  <span class="tag" [class.is-success]="orden.estado === 'Abierta'" [class.is-danger]="orden.estado === 'Cerrada'">
    {{ orden.estado }}
  </span>
</div>
```
Número pequeño, proveedor primero, no hay énfasis.

## Implementación

### 1. Modelo backend — `orden-poligrafica.js`

Agregar al schema:
```javascript
estado: { type: String, enum: ['Abierta', 'Cerrada'], default: 'Abierta' },
fecha_cierre: { type: Date }
```

### 2. Backend events — `opoligraficaEvents.js`

En `EmitirOrdenes()`, agregar `.sort({ numero: -1 })` al find().

### 3. Backend events — `almacenEvents.js`

Después de `almacen.create(data)` exitoso:
1. Buscar la `Recepcion` referenciada en `data.recepcion`
2. Si existe, obtener la `ordenPoligrafica` del primer item: `recepcion.pedido[0].ordenPoligrafica`
3. Buscar todos los `Almacen` documents que tengan `pedido.ordenPoligrafica === ordenPoligrafica._id`
4. Poblar la OCP y verificar si todos los `pedido._id` están cubiertos en almacén
5. Si están todos cubiertos, hacer `ordenPoligrafica.findByIdAndUpdate(ocpId, { estado: 'Cerrada', fecha_cierre: new Date() })`
6. Re-emitir ordenes via `opoligraficaEvents.EmitirOrdenes()`

### 4. Frontend — `ordenes.component.ts`

**Nuevas propiedades:**
```typescript
public sortAsc = false;
public fechaDesde = '';
public fechaHasta = '';
```

**Nuevo getter `ordenesActivas`:**
```typescript
get ordenesActivas() {
  return this.api.orden.filter((o) => o.estado !== 'Cerrada');
}
```

**Nuevo getter `fabricantesUnicas`:**
```typescript
get fabricantesUnicas() {
  const set = new Set<string>();
  for (const o of this.api.orden) {
    for (const p of o.pedido || []) {
      const alias = p.material?.fabricante?.alias || p.material?.fabricante?.nombre;
      if (alias) set.add(alias);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
```

**Getter `ordenesVisibles` modificado:**
```typescript
get ordenesVisibles() {
  let list = this.filtrados.length > 0 ? this.filtrados : [...this.api.orden];

  // En modo 'home' (Activas), filtrar solo no cerradas
  if (this.filterMode === 'home' && this.filtrados.length === 0) {
    list = list.filter((o) => o.estado !== 'Cerrada');
  }

  // Filtro por fecha si ambas están definidas
  if (this.fechaDesde && this.fechaHasta) {
    const desde = new Date(this.fechaDesde + 'T00:00:00');
    const hasta = new Date(this.fechaHasta + 'T23:59:59');
    list = list.filter((o) => {
      const c = new Date(o.createdAt);
      return c >= desde && c <= hasta;
    });
  }

  // Ordenar por numero
  list.sort((a, b) => this.sortAsc ? a.numero - b.numero : b.numero - a.numero);

  return list;
}
```

**Nuevo método `toggleSort()`:**
```typescript
toggleSort() {
  this.sortAsc = !this.sortAsc;
}
```

**Nuevo método `filtrarPorFabricante(target)`:**
```typescript
filtrarPorFabricante(target: any) {
  const term = typeof target === 'string' ? target : target?.value || '';
  if (!term || term === 'all') {
    this.filtrados = [];
    return;
  }
  this.filtrados = this.api.orden.filter((o) =>
    o.pedido?.some((p) => {
      const alias = p.material?.fabricante?.alias || p.material?.fabricante?.nombre;
      return alias === term;
    })
  );
}
```

**Eliminar (`filterMode === 'date'` y `buscarPorFecha`):**
Remover el bloque de `setFilter` para mode `'date'`. El filtro por fecha ahora se aplica siempre desde `ordenesVisibles`.

**Eliminar (`buscarPorFecha_cliente` y `PorClientes`):**
Son dead code, referencia campos que no existen en el modelo OCP.

### 5. Frontend — `ordenes.component.html`

**Header reordenado:**
```html
<div class="card-header-title">
  <div class="order-header-info">
    <span class="order-number-emphasis">OCP: {{ addSlice(orden.numero) }}</span>
    <div class="order-header-meta">
      <span class="order-provider">{{ orden.proveedor?.nombre_proveedor || orden.proveedor?.nombre }}</span>
      <span class="tag order-status-badge" [class.badge-open]="orden.estado !== 'Cerrada'" [class.badge-closed]="orden.estado === 'Cerrada'">
        {{ orden.estado || 'Abierta' }}
      </span>
    </div>
  </div>
</div>
```

**Date range siempre visible:**
```html
<div class="field has-addons">
  <div class="control"><input class="input" type="date" [(ngModel)]="fechaDesde" (ngModelChange)="changeFilter('home')"></div>
  <div class="control"><input class="input" type="date" [(ngModel)]="fechaHasta" (ngModelChange)="changeFilter('home')"></div>
  <div class="control" *ngIf="fechaDesde || fechaHasta">
    <button class="button" (click)="fechaDesde=''; fechaHasta=''; changeFilter('home')">✕</button>
  </div>
</div>
```

**Tabs actualizados:**
- Remover tab "Todas", "Por fecha"
- Agregar "Activas", "Por fabricante"
- Botón sort al lado de las tabs

### 6. Frontend — `ordenes.component.scss`

Ver archivo SCSS actual (ya implementado).

## Ingeniería inversa de datos

La relación entre `Recepcion` y `Almacen` es: `Almacen.recepcion` → `Recepcion._id`. La relación entre `Recepcion` y `ordenPoligrafica` es: `Recepcion.pedido[].ordenPoligrafica` → `ordenPoligrafica._id`.

Para el auto-close, la cadena es:
```
almacen.recepcion → recepcion._id → recepcion.pedido[0].ordenPoligrafica → ordenPoligrafica._id
```

No todos los items de `recepcion.pedido` tienen `ordenPoligrafica` poblado. Verificar con optional chaining.

## Estados y transiciones

| Evento | sortAsc | fechaDesde/fechaHasta | Lista visible |
|--------|---------|----------------------|---------------|
| Carga inicial | false | ''/'' | Todas activas, desc por número |
| Click sort | true | ''/'' | Todas activas, asc por número |
| Click sort otra vez | false | ''/'' | Todas activas, desc por número |
| Seleccionar fechas | false | '2026-01-01'/'2026-01-31' | Activas en ese rango, desc |
| Tab "Por N°" | false | ''/'' | Todas (sin filtro estado), desc |
| Tab "Activas" | false | ''/'' | Solo activas, desc |
| Auto-close OCP | sin cambio | sin cambio | OCP desaparece de Activas |

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Recepcion no poblada al hacer create en almacén | Media | Guard clause: if (!data.recepcion) return |
| pedido[0].ordenPoligrafica undefined | Media | Optional chaining en toda la cadena |
| Regresión: filtros existentes dejan de funcionar | Media | Probar cada modo de filtro individualmente |
| Auto-close ejecutándose múltiples veces | Baja | findByIdAndUpdate con upsert=false; segunda vez no cambia nada |
| OCP sin pedido | Baja | Guard clause en auto-close |

## Rollout

| Paso | Detalle |
|------|---------|
| 1 | Actualizar modelo backend (`orden-poligrafica.js`) |
| 2 | Actualizar `opoligraficaEvents.js` — agregar sort |
| 3 | Actualizar `almacenEvents.js` — auto-close logic |
| 4 | Actualizar frontend `.ts` — propiedades, getters, métodos |
| 5 | Actualizar frontend `.html` — layout, tabs, header |
| 6 | Actualizar frontend `.scss` — nuevas clases |
| 7 | Verificar con órdenes existentes (backward compatible) |
| 8 | Verificar auto-close con flujo completo |

## Pruebas

1. **Regresión tabs:** Click en cada pestaña, verificar que filtran correctamente
2. **Sort:** Click en toggle, verificar orden ascendente/descendente
3. **Fechas:** Seleccionar rango, verificar filtro; click ✕, verificar que se limpia
4. **Activas:** Crear OCP, cerrarla via BD, verificar que desaparece de Activas
5. **Auto-close:** Flujo completo: OCP → Recepción → Análisis → Almacén → OCP cerrada
