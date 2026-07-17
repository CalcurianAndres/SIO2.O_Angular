# TECH — TASK-069: Gestión de almacenes externos

## Resumen

Creación de nuevo modelo `Almacenes` (backend + frontend) con CRUD completo via Socket.io. Nuevo componente Angular para gestión de almacenes. Modificación del modelo `Almacen` para referenciar almacén destino.

## Archivos afectados

| Archivo | Cambio | Tipo |
|---------|--------|------|
| `SIO2.0_Express/src/models/almacenes.js` | Nuevo modelo Mongoose | Nuevo |
| `SIO2.0_Express/events/almacenEvents.js` | Eventos CRUD para almacenes | Modificado |
| `SIO2.0_Express/src/sockets.js` | Import del nuevo event handler | Modificado |
| `SIO2.0_Express/src/models/almacen.js` | Agregar campo `almacen_id` ref a `almacenes` | Modificado |
| `SIO2.O_Angular/src/app/services/almacen.service.ts` | Métodos CRUD para almacenes | Modificado |
| `SIO2.O_Angular/src/app/almacen/almacenes/almacenes.component.ts` | Nuevo componente lista + CRUD | Nuevo |
| `SIO2.O_Angular/src/app/almacen/almacenes/almacenes.component.html` | Template del componente | Nuevo |
| `SIO2.O_Angular/src/app/almacen/almacenes/almacenes.component.scss` | Estilos | Nuevo |
| `SIO2.O_Angular/src/app/almacen/almacen-routing.module.ts` | Ruta `/almacen/almacenes` | Modificado |
| `SIO2.O_Angular/src/app/almacen/almacen.module.ts` | Declaración del nuevo componente | Modificado |
| `SIO2.O_Angular/src/app/almacen/recepcion/recepcion.component.ts` | Selector de almacén destino (usa AlmacenesService) | Modificado |
| `SIO2.O_Angular/src/app/almacen/recepcion/recepcion.component.html` | Selector de almacén destino | Modificado |

## Análisis arquitectónico

### Árbol de dependencias

```
AlmacenesComponent (nuevo)
├── AlmacenService (métodos CRUD para almacenes via Socket.io)
└── ToastService (feedback)

RecepcionComponent (existente, modificado)
├── AlmacenService.almacenes[] ← para selector de destino
└── ... (resto sin cambios)
```

### Nuevo modelo: Almacenes

```javascript
// SIO2.0_Express/src/models/almacenes.js
let AlmacenesSchema = new Schema({
    borrado:  { type: Boolean, default: false },
    nombre:   { type: String, required: true, unique: true },
    descripcion: { type: String },
    por_defecto: { type: Boolean, default: false }  // true solo para Poligráfica
}, { timestamps: true });
```

### Modelo existente modificado: Almacen

```javascript
// SIO2.0_Express/src/models/almacen.js — agregar campo
almacen_id: { type: Schema.Types.ObjectId, ref: 'almacenes' }
```

## Implementación

### 1. Backend — Modelo `almacenes.js`

Schema con:
- `nombre`: String, required, unique
- `descripcion`: String, opcional
- `borrado`: Boolean, default false
- `por_defecto`: Boolean, default false (solo Poligráfica)

### 2. Backend — Eventos Socket.io

Agregar en `almacenEvents.js` los siguientes eventos:

| Cliente → Servidor | Acción |
|-------------------|--------|
| `CLIENTE:BuscarAlmacenes` | Devuelve todos los almacenes no borrados, ordenados por nombre |
| `CLIENTE:NuevoAlmacen` | Crea o actualiza un almacén (upsert por _id) |
| `CLIENTE:EliminarAlmacen` | Soft delete (borrado: true). Verificar que no tenga materiales antes de eliminar |

### 3. Backend — Seed data

Al iniciar el sistema por primera vez (o en un script de seed), crear "Poligráfica Industrial" como almacén por defecto:

```javascript
{ nombre: 'Poligráfica Industrial', por_defecto: true }
```

### 4. Frontend — `AlmacenService`

Agregar métodos:
```typescript
BuscarAlmacenes()        // CLIENTE:BuscarAlmacenes → SERVER:Almacenes
GuardarAlmacenExt(data)  // CLIENTE:NuevoAlmacen
EliminarAlmacen(id)      // CLIENTE:EliminarAlmacen
```

### 5. Frontend — `AlmacenesComponent`

Nuevo componente standalone con:
- Lista de almacenes en cards (como el patrón de departamentos/cargos)
- Input + botón "Agregar" para crear nuevo
- Edición inline (click en nombre → input)
- Botón eliminar con confirmación SweetAlert2
- Indicador visual para almacén por defecto (Poligráfica)
- Badge con conteo de materiales por almacén (si aplica)

### 6. Frontend — Routing

```typescript
{ path: 'almacenes', component: AlmacenesComponent }
```

### 7. Integración con Recepción

En `recepcion.component.ts`, al hacer clic en "Enviar a almacén":
1. Obtener lista de almacenes desde `AlmacenService.almacenes`
2. Mostrar selector modal/select con los almacenes
3. Al confirmar, incluir `almacen_id` en el payload de `NuevoAlmacen`

## Ingeniería inversa de datos

- No hay datos preexistentes de almacenes — se crea desde cero
- Materiales existentes en `Almacen` no tienen `almacen_id` (opcional, null = Poligráfica legacy)

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Materiales legacy sin almacen_id | Alta | Default a Poligráfica en la UI (null/undefined = Poligráfica) |
| Eliminar almacén con materiales | Baja | Validación backend: check `Almacen.find({ almacen_id })` antes de borrar |
| Nombre duplicado | Media | Unique index en Mongoose + validación frontend |

## Rollout

- Seed: crear "Poligráfica Industrial" con `por_defecto: true`
- Los materiales existentes sin `almacen_id` se muestran como "Poligráfica Industrial" en la UI

## Pruebas

1. Crear almacén "Depósito Este" → aparece en lista
2. Editar nombre → se actualiza
3. Eliminar almacén vacío → se elimina
4. Eliminar almacén con materiales → error
5. Verificar que Poligráfica no se puede eliminar
6. En recepción, seleccionar almacén destino → material se guarda con referencia correcta
