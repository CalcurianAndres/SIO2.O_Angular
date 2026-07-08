# TECH — TASK-066: Ocultar campos dimensionales de sustrato en OCP para materiales no sustrato

## Resumen

Cambio localizado en el componente `NuevoOrdenComponent` (~30 LOC modificadas). No requiere cambios en backend, modelos, servicios ni templates adicionales.

## Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `compras/ordenes/nuevo-orden/nuevo-orden.component.ts` | Lógica de filtrado + nueva propiedad `esSustrato` |
| `compras/ordenes/nuevo-orden/nuevo-orden.component.html` | Condiciones `*ngIf` para campos dimensionales |

## Análisis arquitectónico

### Árbol de dependencias

```
NuevoOrdenComponent
├── MaterialesService.materiales[]    # cada material tiene: { grupo: { trato: boolean } }
├── FabricantesService
├── ProveedoresService
└── OpoligraficaService
```

El `MaterialesService` ya expone `buscarSoloSustrato()` y `filtrarPorFabricante()`. Los materiales se cargan con el objeto `grupo` poblado, por lo que `material.grupo.trato` está disponible en el frontend sin cambios en el backend.

### Estado actual (código relevante)

**`condiciones()` — L.60-69:**
```typescript
condiciones(e: any) {
    const fabricante = this.fabricantes.buscarFabricantesPorId(e.value);
    if (!fabricante || !fabricante[0]) return;
    const grupo = fabricante[0].grupo;
    const tieneTrato = grupo.some((item) => item.trato === true);
    this.Sustratos =
      tieneTrato && this.materiales.materiales
        ? this.materiales.materiales.filter((m: any) => String(m.fabricante._id) === e.value)
        : [];
  }
```

Problema: `tieneTrato` se evalúa sobre los grupos del **fabricante**, no del **material individual**.

**Template L.53 — Llave de los campos dimensionales:**
```html
<div class="columns is-multiline is-variable is-2" *ngIf="Fabricant_Sustrato">
```

## Implementación

### 1. Modificar `condiciones()` — cargar todos los materiales del fabricante

Eliminar el filtro por `tieneTrato`. Ahora siempre se cargan **todos** los materiales del fabricante seleccionado:

```typescript
condiciones(e: any) {
    const fabricante = this.fabricantes.buscarFabricantesPorId(e.value);
    if (!fabricante || !fabricante[0]) return;
    // Cargar TODOS los materiales del fabricante, no solo los de grupos con trato
    this.Sustratos = this.materiales.materiales
      ? this.materiales.materiales.filter((m: any) => String(m.fabricante._id) === e.value)
      : [];
}
```

### 2. Agregar propiedad `esSustrato`

```typescript
public esSustrato = false;
```

### 3. Modificar `onMaterialChange()` — evaluar `material.grupo.trato`

```typescript
onMaterialChange(id: any) {
    if (!id) {
      this.esSustrato = false;
      return;
    }
    const material = this.Sustratos.find((s) => s._id === id || String(s._id) === String(id));
    if (!material) {
      this.esSustrato = false;
      return;
    }
    this.esSustrato = material.grupo?.trato === true;
    this.material.nombre = material.nombre;
    this.material.gramaje = this.esSustrato ? (material.gramaje || '') : '';
    this.material.calibre = this.esSustrato ? (material.calibre || '') : '';
    this.material.unidad = this.material.unidad || 'Und';
    this.material.alto = '';
    this.material.ancho = '';
    this.material.bobina = false;
}
```

### 4. Modificar template — condiciones basadas en `esSustrato`

**Campo dimensional container:**
```html
<div class="columns is-multiline is-variable is-2" *ngIf="Fabricant_Sustrato && esSustrato">
```

**Opción del dropdown (L.46) — mostrar gramaje/calibre solo si es sustrato:**
```html
<option *ngFor="let s of Sustratos" [ngValue]="s._id">
  {{ s.nombre }}<ng-container *ngIf="s.grupo?.trato"> — {{ s.gramaje }}g {{ s.calibre }}pt</ng-container>
</option>
```

### 5. Resumen del pedido — ocultar tags dimensionales para no sustratos

Se mantienen los `*ngIf` existentes en la tabla (`*ngIf="pedido.ancho"`, etc.) porque los campos se guardan vacíos para no sustratos. No requiere cambio.

### 6. Reset al cambiar de fabricante

En `condiciones()`, agregar reseteo de `esSustrato`:

```typescript
this.esSustrato = false;
this.material__ = '';
```

## Ingeniería inversa de datos

Los materiales en `MaterialesService.materiales[]` incluyen `grupo` poblado con `{ _id, nombre, trato }`. Esto se confirma en:

- `materiales.service.ts:38` → `mat.grupo.trato === true` (buscarSoloSustrato)
- `materiales.service.ts:48` → `x.grupo._id` (filtrarGrupos)

No se requieren cambios en poblamiento de queries del backend.

## Estados y transiciones

| Evento | `esSustrato` | Sustratos[] | Campos visibles |
|--------|-------------|-------------|-----------------|
| Inicio | false | [] | Ninguno |
| Seleccionar proveedor | false | [] | Ninguno |
| Seleccionar fabricante | false | Todos los materiales del fabricante | Solo cantidad/unidad/precio |
| Seleccionar material sustrato | true | (sin cambio) | Alto, Ancho, Calibre, Gramaje, Bobina |
| Seleccionar material no sustrato | false | (sin cambio) | Solo cantidad/unidad/precio |
| Cambiar fabricante | false | (nuevos materiales) | Solo cantidad/unidad/precio |
| Deseleccionar material (null) | false | (sin cambio) | Solo cantidad/unidad/precio |

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Material sin grupo poblado (null) | Baja | `material.grupo?.trato` con optional chaining → false |
| Regression: fabricante con solo sustratos | Media | Probar caso: el comportamiento debe ser idéntico al actual |
| Materiales sin `gramaje`/`calibre` en su documento | Media | Se auto-cargan como string vacío; no se renderizan por `*ngIf` |

## Rollout

- **No requiere migración de datos**
- **No requiere cambios en backend**
- **No requiere cambios en el schema de BD**
- **Commit único** en `SIO2.O_Angular`

## Pruebas

Las pruebas son manuales siguiendo los criterios de éxito de PRODUCT.md:

1. **Caso mixto:** Fabricante con materiales sustrato y no sustrato → verificar que al alternar entre ambos los campos se ocultan/muestran
2. **Caso solo no sustrato:** Fabricante de tintas → sin campos dimensionales
3. **Caso solo sustrato:** Fabricante de cartulinas → campos dimensionales visibles (regresión)
4. **Guardado:** Verificar en BD que `pedido[].alto/ancho/gramaje/calibre` sean `undefined` o vacío para ítems no sustrato
