# PRODUCT — TASK-067: Mejoras en listado OCP: énfasis N°, sort, filtro Activas, fecha permanente, cierre automático

## Problema

El listado de órdenes de compra a proveedores (OCP) carece de herramientas básicas de productividad: no hay forma de ordenar, el filtro por rango de fecha está oculto tras una pestaña, no hay una vista rápida de órdenes activas (no cerradas), y el número de OCP no tiene énfasis visual pese a ser el dato principal de identificación. Además, las OCP deben cerrarse automáticamente cuando todos sus materiales han sido recibidos en almacén.

### Causa raíz

El componente fue diseñado inicialmente con una vista plana sin considerar el ciclo de vida completo de la OCP (creación → recepción → análisis → almacén → cierre).

## Comportamiento deseado

1. El número de OCP debe ser el elemento visual dominante en cada card (grande, negrita, monospace, color azul accent), ubicado **primero** en el header, con el proveedor y el badge de estado debajo.
2. Debe existir un botón toggle de ordenamiento (⬆/⬇) visible en la barra de pestañas, con default "más nueva primero" (descendente por número).
3. El tab "Todas" se renombra a "Activas". En modo Activas, solo se muestran órdenes con `estado !== 'Cerrada'`. Los demás filtros (Por N°, Por proveedor, Por fabricante) operan sobre **todas** las órdenes (abiertas + cerradas).
4. El filtro por rango de fecha debe estar **siempre visible** (remover de las pestañas), con botón ✕ para limpiar ambas fechas.
5. Una OCP debe cerrarse automáticamente cuando **todos** los materiales de su pedido han sido enviados a almacén (flujo: Recepción → Análisis → Enviar a Almacén → auto-close OCP).

### Regla de negocio

| Regla | Descripción |
|-------|------------|
| Énfasis N° | OCP en header: fuente 1.25rem, weight 800, monospace, color `--accent-blue`. Proveedor + badge debajo en línea secundaria. |
| Sort default | `sortAsc = false` → descendente (más nueva primero). Toggle invierte dirección. |
| Modo Activas | `filterMode === 'home'` → solo `estado !== 'Cerrada'`. Cualquier otro filtro ignora estado. |
| Fecha siempre visible | Inputs `fechaDesde` / `fechaHasta` siempre presentes. Filtran `createdAt` cuando ambos están definidos. Botón ✕ los resetea. |
| Auto-close | Backend verifica al crear un documento en `almacen`: si todos los `pedido._id` de la OCP están en almacén, actualiza `estado = 'Cerrada'` y `fecha_cierre = new Date()`. |

### Flujo de usuario

1. Usuario entra a `/compras/ordenes` → ve "Activas" activo por defecto, solo OCPs no cerradas, ordenadas descendente por número.
2. Usuario hace clic en "Por N°" → input de búsqueda aparece, todas las OCPs visibles (incluyendo cerradas), el resultado se filtra por número.
3. Usuario hace clic en botón ↕ → orden se invierte (ascendente), el icono cambia.
4. Usuario selecciona fechas → lista se filtra por rango de `createdAt`. Usuario hace clic en ✕ → fechas se limpian, filtro se remueve.
5. Usuario va a Almacén → Recepción → completa análisis → "Enviar a Almacén" → si todos los items de la OCP están en almacén, la OCP se cierra automáticamente.

### Invariantes

- El tab "Activas" nunca muestra órdenes cerradas
- El contador de "Activas" solo cuenta órdenes no cerradas
- El contador de "Cerradas" solo cuenta órdenes cerradas
- El sort aplica a la lista completa (no solo a la página visible)
- El filtro por fecha aplica `createdAt >= fechaDesde && createdAt <= fechaHasta` (inclusive)
- El auto-close no debe corromper OCPs con `pedido` vacío
- El auto-close solo se ejecuta una vez (segunda vez find-and-update es no-op)

### Criterios de éxito

- [ ] Al cargar el componente, la lista muestra OCPs descendente, con "Activas" activo
- [ ] El header de cada OCP muestra el número grande/azul/monospace primero, proveedor + badge debajo
- [ ] Toggle sort invierte el orden, icono refleja dirección actual
- [ ] Switch a "Por N°" muestra todas las OCPs (incluyendo cerradas) filtrables por número
- [ ] Fechas siempre visibles; al definir ambas, la lista se filtra
- [ ] ✕ limpia las fechas y el filtro
- [ ] Al enviar el último material de una OCP a almacén, la OCP cambia a estado "Cerrada" y aparece fecha_cierre
- [ ] Una OCP cerrada ya no aparece en "Activas"

### Validación

- Prueba manual: crear 3 OCPs (2 abiertas, 1 cerrada), verificar que Activas solo muestra 2, "Por N°" muestra 3
- Prueba manual: crear OCP con 2 materiales, recibir ambos y enviar a almacén, verificar que OCP cambia a Cerrada
- Prueba manual: crear OCP con 2 materiales, recibir solo 1, verificar que OCP sigue Abierta
