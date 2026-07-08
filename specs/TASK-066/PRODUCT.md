# PRODUCT — TASK-066: Ocultar campos dimensionales de sustrato en OCP para materiales no sustrato

## Problema

Al crear una Orden de Compra a Proveedores (OCP) en `/compras/ordenes`, el modal de creación muestra los campos **Alto**, **Ancho**, **Calibre** y **Gramaje** para **todos** los materiales del fabricante seleccionado, incluso cuando el material individual no es un sustrato.

### Causa raíz

La función `condiciones()` (nuevo-orden.component.ts:60-69) verifica si **algún** grupo del fabricante tiene `trato === true`. Si es así, **todos** los materiales de ese fabricante se cargan como "sustratos" y se muestran los campos dimensionales, sin importar el grupo real de cada material.

**Ejemplo concreto:** Un fabricante produce Tintas (no sustrato) y Sustratos (sí sustrato). Al seleccionarlo, la OCP muestra gramaje/calibre/ancho/alto incluso para las tintas.

## Comportamiento deseado

El sistema debe evaluar si el **material individual** pertenece a un grupo con `trato === true`, y solo entonces mostrar los campos dimensionales.

### Regla de negocio

| Condición | Campos visibles |
|-----------|----------------|
| El material seleccionado pertenece a un grupo con `trato === true` | Alto, Ancho, Calibre, Gramaje + Bobina |
| El material seleccionado pertenece a un grupo con `trato === false` | Solo Cantidad, Unidad, Precio USD |

### Flujo de usuario

1. Usuario selecciona **Proveedor** → se filtran fabricantes (sin cambio)
2. Usuario selecciona **Fabricante** → se cargan **todos** los materiales de ese fabricante (cambio: ya no se filtran solo sustratos)
3. Usuario selecciona **Material**:
   - Si `material.grupo.trato === true` → se muestran campos dimensionales
   - Si `material.grupo.trato === false/undefined` → se ocultan campos dimensionales
4. Usuario llena los campos visibles y agrega al pedido

### Invariantes

- Un material sin grupo (`grupo` null/undefined) se trata como no sustrato → sin campos dimensionales
- Un material cuyo grupo no tiene población `trato` se trata como no sustrato
- Los valores de gramaje/calibre solo se auto-cargan desde el documento del material si este es sustrato
- El campo Bobina solo se muestra si el material es sustrato **y** la unidad es `t` (toneladas)
- La etiqueta del dropdown de materiales cambia de "Material" a "Material" (sin cambio) pero el placeholder del option muestra siempre nombre sin sufijos dimensionales para no-sustratos

### Criterios de éxito

- [ ] Al seleccionar un material no sustrato (ej. Tinta), los campos Alto, Ancho, Calibre, Gramaje y Bobina NO aparecen
- [ ] Al seleccionar un material sustrato (ej. Cartulina), los campos Alto, Ancho, Calibre, Gramaje y Bobina SÍ aparecen (comportamiento actual)
- [ ] Materiales mixtos del mismo fabricante funcionan correctamente: al cambiar entre un sustrato y un no sustrato, los campos se muestran/ocultan dinámicamente
- [ ] El resumen del pedido (tabla) oculta tags dimensionales para ítems no sustrato
- [ ] La orden guardada en BD no contiene valores basura en campos dimensionales para ítems no sustrato

### Validación

- Prueba manual: crear OCP con un fabricante que tenga materiales mixtos (sustrato + no sustrato)
- Prueba manual: crear OCP con un fabricante que solo tenga no sustratos (ej. tintas)
- Prueba manual: crear OCP con un fabricante que solo tenga sustratos (comportamiento actual debe mantenerse idéntico)
