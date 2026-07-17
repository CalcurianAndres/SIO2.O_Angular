# PRODUCT — TASK-070: Secciones en almacén Poligráfica para posicionamiento de material

## Problema

El almacén de Poligráfica Industrial no tiene una estructura interna de secciones o ubicaciones. Los materiales se registran en inventario sin indicar su posición física dentro del almacén, lo que dificulta localizarlos cuando se necesitan para producción.

### Causa raíz

El modelo `Almacen` (inventario) solo registra el material, lote, neto y recepción de origen — no contempla la ubicación física dentro del almacén.

## Comportamiento deseado

Poder definir secciones (ej: "Estantería A1", "Pasillo 3", "Zona de bobinas", etc.) dentro del almacén de Poligráfica, y al registrar material en inventario poder indicar en qué sección se encuentra.

### Regla de negocio

| # | Regla | Descripción |
|---|-------|-------------|
| 1 | Secciones por almacén | Cada almacén puede tener múltiples secciones con nombre único dentro del mismo almacén |
| 2 | Posición del material | Al enviar material a almacén, se debe poder seleccionar (opcionalmente) la sección donde se ubica |
| 3 | CRUD secciones | El sistema debe permitir crear, editar y eliminar secciones dentro de un almacén |
| 4 | Sección protegida | No se puede eliminar una sección que tenga materiales asignados |
| 5 | Vista por sección | En el inventario, los materiales deben poder agruparse o filtrarse por sección |

### Flujo de usuario: Gestión de secciones

1. Usuario va a la sección "Almacenes" → selecciona "Poligráfica Industrial".
2. Ve lista de secciones del almacén (inicialmente vacía, con sección "General" por defecto).
3. Puede agregar secciones con nombre (ej: "Zona A", "Estantería B3", "Bobinas").
4. Puede editar o eliminar secciones (solo si están vacías).

### Flujo de usuario: Asignación de sección al recibir material

1. Usuario envía material a almacén desde recepción.
2. Selector de almacén destino → al seleccionar un almacén, se muestran sus secciones.
3. Usuario puede seleccionar (opcional) la sección donde colocar el material.
4. Si no selecciona sección, se asigna a "General" por defecto.

### Flujo de usuario: Visualización en inventario

1. Usuario va a inventario y selecciona un almacén.
2. Los materiales se agrupan por sección dentro del almacén.
3. Puede ver qué materiales hay en cada sección.

### Invariantes

- Todo almacén tiene al menos la sección "General" (no eliminable)
- Una sección con materiales no se puede eliminar
- El nombre de sección debe ser único dentro del mismo almacén
- La sección es opcional al registrar material (default: "General")

### Criterios de éxito

- [ ] Sección "General" existe por defecto en cada almacén
- [ ] CRUD funcional: agregar, editar, eliminar secciones
- [ ] Al enviar material a almacén desde recepción, se puede seleccionar sección
- [ ] En inventario, los materiales se agrupan por sección
- [ ] Sección con materiales no se puede eliminar (protegida)

### Validación

- Prueba manual: crear secciones "Zona A" y "Bobinas" en Poligráfica
- Prueba manual: enviar material seleccionando sección "Zona A"
- Prueba manual: verificar que en inventario el material aparece bajo "Zona A"
- Prueba manual: intentar eliminar sección con materiales → error
