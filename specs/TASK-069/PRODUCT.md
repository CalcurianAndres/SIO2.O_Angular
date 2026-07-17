# PRODUCT — TASK-069: Gestión de almacenes externos

## Problema

Actualmente todo el material recibido se envía a una única ubicación de almacén (Poligráfica Industrial). No existe la posibilidad de registrar almacenes externos (clientes, terceros, otros depósitos) como destinos alternativos para los materiales. Cuando se recibe material que debe ir a un almacén externo, no hay forma de registrarlo ni de hacer seguimiento.

### Causa raíz

El modelo `Almacen` (inventario) es una colección plana sin concepto de "almacén" como entidad. No existe un modelo `Almacenes` que permita crear múltiples ubicaciones de almacenamiento.

## Comportamiento deseado

Poder crear, editar y eliminar almacenes externos (cada uno con su nombre), y poder seleccionar el almacén destino al enviar material desde recepción. El almacén "Poligráfica Industrial" debe existir por defecto como almacén principal.

### Regla de negocio

| # | Regla | Descripción |
|---|-------|-------------|
| 1 | CRUD almacenes | El sistema debe permitir crear, editar y eliminar almacenes (cada uno con nombre único) |
| 2 | Almacén por defecto | "Poligráfica Industrial" debe existir como almacén predeterminado al iniciar el sistema (seed) |
| 3 | Almacén destino | Al enviar material desde recepción, el usuario debe seleccionar a qué almacén va dirigido |
| 4 | Nombre único | No pueden existir dos almacenes con el mismo nombre |
| 5 | Eliminación protegida | No se puede eliminar un almacén que tenga materiales registrados |
| 6 | Visibilidad | Los almacenes externos se listan en una nueva sección del módulo de almacén |

### Flujo de usuario: Gestión de almacenes

1. Usuario va a una nueva sección "Almacenes" en el módulo de almacén.
2. Ve lista de almacenes (Poligráfica + externos).
3. Puede crear nuevo almacén con nombre y descripción opcional.
4. Puede editar nombre de almacén existente.
5. Puede eliminar un almacén vacío (sin materiales asignados).

### Flujo de usuario: Envío a almacén desde recepción

1. Usuario selecciona material(es) a enviar a almacén.
2. Aparece selector con todos los almacenes registrados (Poligráfica + externos).
3. Usuario selecciona destino y confirma.
4. Material se guarda en `Almacen` (inventario) con referencia al `almacen_id` seleccionado.

### Invariantes

- "Poligráfica Industrial" no se puede eliminar (es el almacén principal del sistema)
- Un almacén con materiales no se puede eliminar
- El nombre del almacén no puede estar vacío ni duplicado

### Criterios de éxito

- [ ] Sección "Almacenes" visible en el módulo de almacén
- [ ] CRUD funcional: crear, editar, eliminar almacenes
- [ ] "Poligráfica Industrial" existe como almacén por defecto
- [ ] Al enviar material a almacén desde recepción, se puede seleccionar el destino
- [ ] Almacén con materiales no se puede eliminar (protegido)
- [ ] Nombres duplicados son rechazados

### Validación

- Prueba manual: crear 3 almacenes externos, verificar que aparecen en la lista
- Prueba manual: enviar material a un almacén externo, verificar que aparece en el inventario de ese almacén
- Prueba manual: intentar eliminar almacén con materiales → error
- Prueba manual: intentar crear almacén con nombre duplicado → error
