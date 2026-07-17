# PRODUCT — TASK-068: Correcciones en Recepción de materiales y flujo de bobinas

## Problema

El módulo de recepción de almacén presenta varios problemas de UX y lógica de flujo que dificultan su uso diario:

1. Al abrir el modal de nueva recepción sin datos, el placeholder dice "seleccionar proveedor" genéricamente
2. El selector de proveedor muestra todos los proveedores, incluso aquellos sin órdenes de compra activas
3. El input de "Tipo" (F/N) es tan pequeño que al seleccionar un valor no se ve el texto seleccionado
4. La etiqueta "Control" debería decir "N Control" (Número de Control)
5. Proveedores no venezolanos no deberían requerir Número de Control (Control debe inhabilitarse)
6. El campo "Base Imponible" usa un formato numérico manual distinto al resto del sistema
7. Las bobinas pasan por laboratorio innecesariamente — deberían ir directo a almacén
8. No se especifica a qué almacén se envía el material (siempre debería solicitarse un almacén destino)
9. Materiales de proveedores externos no deberían requerir análisis de laboratorio

### Causa raíz

El módulo de recepción fue construido antes de que existieran los almacenes externos como concepto, y antes del sistema de formato numérico global. El flujo de bobinas se diseñó siguiendo el mismo patrón de materiales regulares (recepción → análisis → almacén) sin considerar que las bobinas no requieren análisis de laboratorio.

## Comportamiento deseado

### Reglas de negocio

| # | Regla | Descripción |
|---|-------|-------------|
| 1 | Mensaje empty state | Cuando no hay recepciones, mostrar "No hay recepciones registradas" en lugar de "seleccionar proveedor" |
| 2 | Proveedores filtrados | Al crear recepción, solo mostrar proveedores que tengan al menos una OCP activa (`estado === 'Abierta'`) |
| 3 | Input Tipo legible | Aumentar el ancho del select de Tipo (F/N) para que el valor seleccionado sea visible |
| 4 | Etiqueta Control | Cambiar label "Control" por "N Control" |
| 5 | Control según país | Si `proveedor.pais !== 'Venezuela'`, deshabilitar el input "N Control" y mostrar tooltip "No aplica para proveedores internacionales" |
| 6 | Formato Base Imponible | Usar la directiva global `numberFormat` (punto en miles, coma en decimales) como todos los demás campos del sistema |
| 7 | Bobinas → almacén directo | Materiales marcados como bobina no pasan por análisis de laboratorio; al enviar, van directo a almacén y se notifica |
| 8 | Almacén destino siempre | Al enviar material a almacén, siempre solicitar seleccionar el almacén destino (Poligráfica o externo) |
| 9 | Externo sin laboratorio | Si el proveedor es externo (`proveedor.pais !== 'Venezuela'` o tiene `identificacion_fiscal`), no requerir análisis de laboratorio |

### Flujo de usuario: Recepción general

1. Usuario entra a `/almacen/recepcion` → ve lista de recepciones. Si no hay ninguna, ve mensaje "No hay recepciones registradas" con icono.
2. Usuario hace clic en "Nueva recepción" → modal se abre.
3. Selector "Proveedor" solo muestra proveedores con OCP activa.
4. Usuario selecciona proveedor → se valida `proveedor.pais`:
   - Si `pais !== 'Venezuela'` → "N Control" se deshabilita, tooltip informativo
   - Si `pais === 'Venezuela'` o `pais` vacío → "N Control" permanece habilitado
5. Input "Tipo" (F/N) con ancho suficiente para ver el valor seleccionado.
6. Campo "Base Imponible" usa formato numérico global (punto miles, coma decimal).

### Flujo de usuario: Bobinas

1. Usuario recibe material tipo bobina (unidad 't' o `bobina: true` en el pedido).
2. Al hacer clic en "Enviar a almacén", se omite el paso de laboratorio.
3. El sistema muestra selector de almacén destino y notifica que el material va a almacén sin análisis.
4. El material se registra en almacén directamente.

### Flujo de usuario: Envío a almacén

1. Usuario selecciona material(es) a enviar a almacén.
2. Sistema muestra selector de almacén destino (Poligráfica o algún almacén externo).
3. Si el material es bobina o proveedor externo, se omite validación de análisis.
4. Si el material es regular y proveedor venezolano, se requiere análisis aprobado antes de enviar.
5. Material se guarda en almacén con referencia al almacén destino.

### Invariantes

- Siempre debe haber al menos un almacén en el sistema (Poligráfica por defecto)
- Un material no puede estar en dos almacenes simultáneamente
- El cambio de formato de Base Imponible no debe romper registros existentes
- La deshabilitación de Control para proveedores internacionales no debe impedir guardar la recepción
- Bobinas: no se crea registro de análisis, solo de almacén

### Criterios de éxito

- [ ] Modal de nueva recepción solo muestra proveedores con OCP activa
- [ ] Input Tipo (F/N) tiene ancho suficiente para mostrar el valor
- [ ] Label "Control" cambiado a "N Control"
- [ ] "N Control" deshabilitado cuando proveedor no es venezolano
- [ ] Base Imponible usa formato numérico global consistente
- [ ] Bobinas enviadas a almacén sin pasar por laboratorio
- [ ] Al enviar a almacén, siempre se solicita seleccionar almacén destino
- [ ] Materiales de proveedores externos no requieren análisis

### Validación

- Prueba manual: crear recepción con proveedor venezolano → N Control habilitado
- Prueba manual: crear recepción con proveedor extranjero → N Control deshabilitado
- Prueba manual: seleccionar bobina → no aparece opción de análisis, va directo a almacén
- Prueba manual: verificar que Base Imponible se formatea como los demás campos numéricos
