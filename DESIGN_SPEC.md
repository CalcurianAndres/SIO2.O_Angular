# Especificación de Diseño — Contenido Interno (SIO)

## Framework
- **Tailwind CSS** + **Bulma** (ambos coexistiendo)

## Tema
- Dark y light mode via CSS custom properties
- Adaptable siempre a ambos temas
- Modelo moderno UI/UX industrial

## Estructura de página
Dentro de `<app-page-layout>`:
```
<app-section-header color="[modulo]" title="..." description="..." icon="..." />
<button>Nuevo</button>  ← arriba a la izquierda
[filtros / búsqueda global]
[tabla paginada]  ← o cards en vistas especiales
```

## Tablas
- Densidad: siempre compacta
- Filas: zebra sutil
- Búsqueda global arriba
- Paginación abajo (10/25/50/100)
- Scroll horizontal en tablas anchas

## Botones de acción
- Arriba a la izquierda, debajo del section-header
- Botones de creación: usar siempre prefijo **"Nuevo/a"** + nombre del recurso (ej: "Nueva Recepción", "Nuevo Proveedor", "Nuevo Grupo"). No usar solo el nombre del recurso.

## KPI Cards

### Estructura HTML
```html
<div class="columns is-variable is-2">
  <div class="column">
    <div class="kpi-card kpi-orange">
      <div class="kpi-number">{{ valor }}</div>
      <div class="kpi-label">Label <strong>bold</strong></div>
      <div class="kpi-period">período</div>
    </div>
  </div>
  <div class="column">
    <div class="kpi-card kpi-green">
      <div class="kpi-number">{{ valor }}</div>
      <div class="kpi-label">Label <strong>bold</strong></div>
      <div class="kpi-period">período</div>
    </div>
  </div>
  <div class="column">
    <div class="kpi-card kpi-blue">
      <div class="kpi-number">{{ valor }}</div>
      <div class="kpi-label">Label <strong>bold</strong></div>
      <div class="kpi-period">período</div>
    </div>
  </div>
</div>
```

### Estilos (SCSS)
```scss
.kpi-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  position: relative;
  overflow: hidden;
}
.kpi-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.08;
}
.kpi-orange::before { background: linear-gradient(135deg, var(--status-warning), #ff8c00); }
.kpi-green::before  { background: linear-gradient(135deg, var(--status-success), #00c853); }
.kpi-blue::before   { background: linear-gradient(135deg, var(--accent-blue), #2979ff); }
.kpi-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}
.kpi-orange .kpi-number { color: var(--status-warning); }
.kpi-green  .kpi-number { color: var(--status-success); }
.kpi-blue   .kpi-number { color: var(--accent-blue); }
.kpi-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}
.kpi-period {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.15rem;
}
```

### Colores por tipo

| Clase | Cuándo usar | Gradiente fondo (8% opacity) |
|-------|-------------|------------------------------|
| `kpi-orange` | Activos / Mes / Pendientes | `var(--status-warning)` → `#ff8c00` |
| `kpi-green` | Completados / Año / Éxito | `var(--status-success)` → `#00c853` |
| `kpi-blue` | Totales / Cerrados / Generales | `var(--accent-blue)` → `#2979ff` |

### Layout
- 3 cards en fila con `columns is-variable is-2` dentro de `<app-page-layout>`
- Posición: entre los botones de acción y los filtros/tabla
- Sin waves SVG, sin hardcoded gradients — usar exclusivamente CSS variables

## Formularios
- Siempre en modal (crear y editar)
- Tamaño del modal: variable según contenido
- Inputs en fila: usar `columns is-multiline` de Bulma en vez de `field is-grouped` para evitar overflow horizontal
- Inputs numéricos: prefiere `column is-2` o `is-narrow` según contexto

## Modales

### Estructura general
- Single `.modal-card` unificada (sin paneles flotantes `.added` separados)
- Head: **siempre incluye icono** (`<i class="fas fa-...">`) + título descriptivo, botón X (`.delete.red_cross`)
- Body scrollable con secciones divididas por `<hr class="modal-divider">`
- Labels de sección en `.section-label`: uppercase, muted, con icono (`<i>`)
- Ítems agregados (orígenes, grupos, contactos) como tags/badges inline, no tablas separadas
- Botón guardar/editar siempre visible al final del body
- Selectores con muchas opciones (ej: países) iterados desde el TS, no hardcoded en HTML

### Patrón `guardando`
- `guardando: boolean` en el TS del componente hijo
- Se resetea a `false` vía `ngOnChanges` cuando el modal se abre (`@Input()` cambia a true)
- Botón: `[disabled]="guardando"`
- Icono condicional: `fa-spinner fa-pulse` cuando `guardando`, `fa-save` cuando no
- Texto del botón cambia a "Guardando…" durante la operación

### Secciones condicionales
- **Checkbox reveal:** checkbox con `(change)="handler($event.target)"` muestra bloque con `*ngIf="flag"`
- **Link reveal:** link con `(click)="toggleFlag()"` muestra bloque al hacer clic

### Validación en formularios
- Botón de acción deshabilitado mientras precondiciones no se cumplan
- Validación de correo en tiempo real con expresión regular
- Placeholders en inputs para guiar al usuario

### Visor de detalles (solo lectura)
- Modal con head: icono + título + badge de estado (opcional)
- Body con secciones divididas por `<hr class="modal-divider">`
- Campos en filas: `.detail-row` con `.detail-label` (uppercase, muted, icono) y `.detail-value` (bold)
- Listas de ítems relacionadas como tags inline (`tag is-info is-light`)
- Mensaje empty-style cuando no hay datos en la sección ("Sin X registrados")
- Sin botones de acción; solo botón cerrar X en el head

## Formularios multi-paso (Step Wizard)

Para formularios extensos (ej: creación de producto con 6 secciones), usar un **step wizard** horizontal en un modal ancho en lugar de un modal scrollable único o un carrusel con `translateX`.

### Estructura del componente

```
@Input() nuevo              ← abre/cierra el modal
@Input() producto/data      ← objeto del modelo
@Output() onCloseModal      ← cierra modal

currentStep = 1             ← paso activo
totalSteps = steps.length
steps = [{ num, label, icon }]
guardando = false           ← patrón guardando
ngOnChanges → reset currentStep = 1 y guardando = false
```

### Layout del modal

```html
<div class="modal" [ngClass]="{ 'is-active': nuevo }">
  <div class="modal-card" style="width: 96vw; max-width: 1200px;">
    <!-- Head: icono + título -->
    <div class="modal-card-head">
      <p class="modal-card-title fuente"><i class="fas fa-industry"></i> Nuevo producto</p>
      <button class="delete red_cross" (click)="cerrar()" [disabled]="guardando"></button>
    </div>
    <div class="modal-card-body" style="max-height: 80vh; overflow-y: auto;">

      <!-- Step indicator (horizontal dots) -->
      <div class="step-indicator">...</div>

      <!-- Progress bar -->
      <div class="progress-wrapper">...</div>

      <hr class="modal-divider" />

      <!-- Step panels: *ngIf="currentStep === N" -->
      <div *ngIf="currentStep === 1" class="step-panel animate__animated animate__fadeIn">...</div>

      <hr class="modal-divider" />

      <!-- Navigation: Prev / Siguiente / Guardar -->
      <div class="step-nav">...</div>
    </div>
  </div>
</div>
```

### Step indicator

```html
<div class="step-indicator">
  <div class="step-dot-wrapper" *ngFor="let s of steps"
       (click)="goToStep(s.num)"
       [ngClass]="{ active: currentStep === s.num, completed: s.num < currentStep }">
    <div class="step-dot"><i class="fas" [ngClass]="s.icon"></i></div>
    <span class="step-label">{{ s.label }}</span>
  </div>
</div>
```

**CSS del indicador:**
```scss
.step-indicator {
  display: flex;
  gap: 0;
  overflow-x: auto;
}
.step-dot-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
  min-width: 70px;
}
// Línea conectora entre dots
.step-dot-wrapper::after {
  content: '';
  position: absolute;
  top: 18px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}
.step-dot-wrapper:last-child::after { display: none; }
.step-dot-wrapper.completed::after { background: var(--status-success); }
.step-dot-wrapper.active::after { background: var(--accent-blue); }

.step-dot {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  color: var(--text-muted);
  z-index: 1;
  transition: all 0.25s;
}
.step-dot-wrapper.completed .step-dot {
  background: var(--status-success);
  border-color: var(--status-success);
  color: #fff;
}
.step-dot-wrapper.active .step-dot {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
  color: #fff;
  transform: scale(1.1);
}
.step-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-top: 0.3rem;
  text-align: center;
  white-space: nowrap;
}
.step-dot-wrapper.active .step-label {
  color: var(--accent-blue);
  font-weight: 600;
}
.step-dot-wrapper.completed .step-label {
  color: var(--status-success);
}
```

### Progress bar

```html
<div class="progress-wrapper">
  <div class="progress-bar">
    <div class="progress-fill" [style.width.%]="progressPercentage"></div>
  </div>
  <span class="progress-text">{{ progressPercentage }}%</span>
</div>
```

```scss
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--status-success), var(--accent-blue));
  border-radius: 3px;
  transition: width 0.4s ease;
}
.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 2.5rem;
  text-align: right;
}
```

El progreso se calcula con un getter que cuenta campos llenos vs totales por paso:

```typescript
get progressPercentage(): number {
  let filled = 0, total = 0;
  // Step 1
  total += 3; if (p.cliente) filled++; if (p.producto) filled++; if (p.codigo) filled++;
  // Step 2...
  return total ? Math.round((filled / total) * 100) : 0;
}
```

### Paneles de paso

Cada paso es un `<div *ngIf="currentStep === N" class="step-panel animate__animated animate__fadeIn">` con inputs dentro de `columns is-multiline`. Elementos repetitivos (sustratos, tintas, barnices, máquinas) se agregan con:
- Selector + botón "+" (has-addons)
- Tags inline con botón × para eliminar
- Clases de color por tipo: `is-info` sustratos, `is-danger` tintas, `is-warning` barnices, `is-primary` máquinas

### Navegación entre pasos

```html
<div class="step-nav">
  <button class="button" (click)="prevStep()" [disabled]="currentStep === 1">
    <i class="fas fa-chevron-left"></i> Anterior
  </button>
  <button class="button is-info" *ngIf="currentStep < totalSteps" (click)="nextStep()">
    Siguiente <i class="fas fa-chevron-right"></i>
  </button>
  <button class="button is-success" *ngIf="currentStep === totalSteps"
          (click)="guardar()" [disabled]="guardando">
    <span class="icon"><i class="fas" [ngClass]="guardando ? 'fa-spinner fa-pulse' : 'fa-save'"></i></span>
    <span>{{ guardando ? 'Guardando…' : 'Guardar' }}</span>
  </button>
</div>
```

```scss
.step-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
```

### Lógica del wizard (TS)

```typescript
public currentStep = 1;
public steps = [
  { num: 1, label: 'Identificación', icon: 'fa-id-card' },
  { num: 2, label: 'Dimensiones',    icon: 'fa-ruler' },
  // ...
];
get totalSteps(): number { return this.steps.length; }

nextStep() { if (this.currentStep < this.totalSteps) this.currentStep++; }
prevStep() { if (this.currentStep > 1) this.currentStep--; }
goToStep(n: number) { if (n >= 1 && n <= this.totalSteps) this.currentStep = n; }

// Reset al abrir el modal
ngOnChanges(changes: SimpleChanges) {
  if (changes['nuevo']?.currentValue === true) {
    this.guardando = false;
    this.currentStep = 1;
  }
}
```

### Consideraciones
- No usar `translateX` ni `document.getElementById` para cambiar de paso — usar `*ngIf` con `currentStep` (Angular nativo, sin manipulación directa del DOM).
- El modal debe ser ancho (96vw / max-width 1200px) para albergar `columns is-multiline` de hasta 4 columnas.
- Cada paso debe tener un mínimo de `200px` de altura para evitar saltos visuales.
- Tags de ítems agregados: usar colores semánticos por tipo de recurso (sustrato=info, tinta=danger, barniz=warning, máquina=primary).

## Badges
- Usar badges mayormente para representar estados

## Iconos
- Usar iconos en la mayoría de elementos visuales (botones, headers, badges, tabs, menús, estados vacíos)
- Preferir iconos descriptivos que acompañen al texto, no reemplazarlo
- Mantener consistencia en la librería de iconos (Font Awesome)

## Estados vacíos
- Mensaje interactivo "No hay datos" con ícono

## Confirmaciones
- Siempre antes de eliminar o cancelar

## Loading
- Skeleton mientras cargan los datos

## Colores por módulo

| Módulo | Color |
|--------|-------|
| Laboratorio | Red |
| Fases y Maquinarias / Producción | Purple |
| Empleados | Teal |
| Compras | Green |
| Almacén | Orange |
| Dashboard / Usuarios | Navy |
| Órdenes / Clientes | Blue |
