# TECH — TASK-070: Secciones en almacén Poligráfica para posicionamiento de material

## Resumen

Creación de nuevo modelo `Secciones` (subdocumento o colección independiente) para segmentar los almacenes en zonas/estanterías. Modificación del modelo `Almacen` para referenciar sección. Nuevo componente UI para gestión de secciones y selector en el flujo de envío a almacén.

## Archivos afectados

| Archivo | Cambio | Tipo |
|---------|--------|------|
| `SIO2.0_Express/src/models/secciones.js` | Nuevo modelo Mongoose | Nuevo |
| `SIO2.0_Express/events/almacenEvents.js` | Eventos CRUD para secciones | Modificado |
| `SIO2.0_Express/src/models/almacen.js` | Agregar campo `seccion_id` | Modificado |
| `SIO2.O_Angular/src/app/services/almacen.service.ts` | Métodos CRUD para secciones | Modificado |
| `SIO2.O_Angular/src/app/almacen/almacenes/secciones.component.ts` | Nuevo componente gestión de secciones | Nuevo |
| `SIO2.O_Angular/src/app/almacen/almacenes/secciones.component.html` | Template | Nuevo |
| `SIO2.O_Angular/src/app/almacen/almacenes/secciones.component.scss` | Estilos | Nuevo |
| `SIO2.O_Angular/src/app/almacen/almacen-routing.module.ts` | Ruta hija para secciones | Modificado |
| `SIO2.O_Angular/src/app/almacen/almacen.module.ts` | Declaración del nuevo componente | Modificado |
| `SIO2.O_Angular/src/app/almacen/recepcion/recepcion.component.ts` | Selector de sección al enviar a almacén | Modificado |
| `SIO2.O_Angular/src/app/almacen/recepcion/recepcion.component.html` | Selector de sección | Modificado |
| `SIO2.O_Angular/src/app/almacen/almacenado/almacenado.component.ts` | Vista de inventario agrupada por sección | Modificado |
| `SIO2.O_Angular/src/app/almacen/almacenado/almacenado.component.html` | Grupo/sección en tabla de inventario | Modificado |

## Análisis arquitectónico

### Árbol de dependencias

```
SeccionesComponent (nuevo)
├── AlmacenService (métodos CRUD secciones)
└── ToastService

AlmacenadoComponent (inventario, modificado)
├── AlmacenService.almacenes[] (con seccion_id poblado)
└── Agrupación por almacén → sección

RecepcionComponent (modificado)
└── Al seleccionar almacén destino → cargar secciones de ese almacén
```

### Nuevo modelo: Secciones

```javascript
// SIO2.0_Express/src/models/secciones.js
let SeccionesSchema = new Schema({
    borrado:     { type: Boolean, default: false },
    nombre:      { type: String, required: true },
    almacen_id:  { type: Schema.Types.ObjectId, ref: 'almacenes', required: true },
    por_defecto: { type: Boolean, default: false }  // true solo para "General"
}, { timestamps: true });

// Índice compuesto: nombre único dentro del mismo almacén
SeccionesSchema.index({ nombre: 1, almacen_id: 1 }, { unique: true });
```

### Modelo existente modificado: Almacen

```javascript
// SIO2.0_Express/src/models/almacen.js — agregar campo
seccion_id: { type: Schema.Types.ObjectId, ref: 'secciones' }
```

## Implementación

### 1. Backend — Modelo `secciones.js`

- `nombre`: String, required
- `almacen_id`: ObjectId ref a `almacenes`, required
- `borrado`: Boolean, default false
- `por_defecto`: Boolean, default false
- Índice único compuesto: `{ nombre: 1, almacen_id: 1 }`

### 2. Backend — Seed data

Al crear un almacén nuevo, automáticamente crear sección "General" como `por_defecto: true`.

Para el seed inicial de Poligráfica:
```javascript
// Crear junto con el almacén
{ nombre: 'General', almacen_id: poligrafica._id, por_defecto: true }
```

### 3. Backend — Eventos Socket.io

| Cliente → Servidor | Acción |
|-------------------|--------|
| `CLIENTE:BuscarSecciones` | Devuelve secciones de un almacén (filtro por `almacen_id`) |
| `CLIENTE:NuevaSeccion` | Crea o actualiza sección |
| `CLIENTE:EliminarSeccion` | Soft delete. Verificar que no tenga materiales |

### 4. Frontend — `SeccionesComponent`

Modal o vista embebida dentro de la página de detalle de almacén:
- Lista de secciones del almacén seleccionado
- Input + botón "Agregar sección"
- Edición inline del nombre
- Botón eliminar con confirmación
- Sección "General" no eliminable (ocultar botón eliminar)

### 5. Frontend — Integración con envío a almacén

En `recepcion.component.ts`, al seleccionar un almacén destino:
1. Cargar secciones de ese almacén via `AlmacenService`
2. Mostrar select secundario con las secciones
3. Opción por defecto: "General"
4. Incluir `seccion_id` en el payload al guardar

### 6. Frontend — Inventario agrupado por sección

En `almacenado.component.ts`:
- Al seleccionar un almacén, agrupar materiales por `seccion_id`
- Mostrar cada sección como un grupo expandible con sus materiales
- Si el material no tiene `seccion_id`, agrupar bajo "General"

## Ingeniería inversa de datos

- Materiales existentes en `Almacen` no tienen `seccion_id` → se muestran como "General"
- Las secciones son hijas de un almacén (relación 1:N)

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Materiales legacy sin seccion_id | Alta | Mostrar como "General" en la UI |
| Sección "General" eliminada por error | Baja | Proteger con `por_defecto: true` (backend impide soft-delete) |
| Nombre de sección duplicado en mismo almacén | Media | Índice único compuesto + validación frontend |

## Rollout

- Seed: crear sección "General" para Poligráfica (y para cualquier almacén nuevo automáticamente)
- No requiere migración de materiales existentes

## Pruebas

1. Verificar que "General" existe al crear un almacén
2. Crear sección "Zona A" en Poligráfica
3. En recepción, enviar material a Poligráfica → sección "Zona A"
4. En inventario, ver material agrupado bajo "Zona A"
5. Intentar eliminar "General" → error
6. Intentar eliminar sección con materiales → error
