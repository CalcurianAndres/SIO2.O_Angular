# Proveedores — Especificación

## Layout
- Responsive grid de tarjetas: 2 cols base, 3 cols ≥768px, 5 cols ≥1024px (`.grupo-grid`)
- Cada card: icono `fa-truck` + nombre del proveedor
- Botón "Nuevo Proveedor" arriba a la izquierda, debajo del section-header

## Estados visuales
| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && proveedores.length === 0` | Skeleton cards |
| Vacío | `!cargando && proveedores.length === 0` | "No hay proveedores registrados" con icono `fa-truck` |
| Datos | `proveedores.length > 0` | Grid de cards |

## Formularios
- Modal con Nombre, Dirección, RIF
- Sección Contactos: formulario horizontal (nombre, teléfono, correo, botón +) con tags inline
- Sección Fabricantes: selector dropdown + tags inline con delete
- Patrón `guardando`: botón se deshabilita, `fa-spinner fa-pulse`, texto "Guardando…"
- `guardando` se resetea via `ngOnChanges` al abrir el modal

### Estructura del modal
- Single `.modal-card` unificada (sin paneles flotantes)
- Head con icono `fa-truck` / `fa-edit` según modo
- Body con secciones divididas por `<hr class="modal-divider">`
- Labels de sección en `.section-label`: uppercase, muted, con icono
- Contactos y fabricantes agregados como tags inline con botón delete
- Botón guardar/editar siempre visible al final del body

## Visor de detalles
- Modal con head: icono `fa-truck` + nombre del proveedor
- Body con filas: Dirección, RIF
- Sección Contactos: tags con nombre, teléfono, correo inline
- Sección Fabricantes: tags con alias de cada fabricante
- Mensaje "Sin contactos registrados" / "Sin fabricantes asociados" cuando no hay datos
- Sin botones de acción (solo lectura + botón cerrar X)

## Flujo de datos
- `ProveedoresService` vía WebSockets (socket.io)
  - `CLIENTE:NuevoProveedor` / `CLIENTE:EditarProveedor` / `CLIENTE:deleteProveedor`
- Fabricantes para el selector vía `FabricantesService`

## Diseño visual
- Módulo Compras → color green
- Cards con header + footer de acciones (info, editar, eliminar)
- Dark/light via CSS variables

## BDD / Gherkin

```gherkin
Feature: Gestión de Proveedores
  Como usuario de compras quiero gestionar proveedores
  para administrar quién suministra cada material

  Background:
    Given el usuario ha iniciado sesión en el módulo de Compras

  Scenario: Crear proveedor exitosamente
    Given el usuario abre "Nuevo Proveedor"
    When completa Nombre, Dirección y RIF
    When agrega al menos un contacto
    When selecciona un fabricante
    Then el proveedor aparece en la grilla

  Scenario: Eliminar proveedor
    Given hay al menos un proveedor registrado
    When el usuario hace clic en el icono de eliminar
    Then se muestra confirmación "¿Eliminar este proveedor?"
    When el usuario confirma la eliminación
    Then el proveedor desaparece de la grilla

  Scenario: Editar proveedor
    Given hay al menos un proveedor registrado
    When el usuario hace clic en el icono de editar
    Then se abre el modal con los datos precargados
    When el usuario modifica los campos y guarda
    Then los cambios se reflejan en la grilla

  Scenario: Estado vacío
    Given no hay proveedores registrados
    Then se muestra mensaje "No hay proveedores registrados"
    And se muestra un icono de camión y una flecha apuntando al botón

  Scenario: Carga de datos
    Given la página de proveedores se está cargando
    Then se muestran tarjetas skeleton animadas
    When los datos llegan del servidor
    Then las tarjetas skeleton son reemplazadas por las tarjetas reales
```

## Mockup

```
┌─────────────────────────────────────────────────────┐
│  🛒 Proveedores                        [Nuevo +]    │
│  Gestión de proveedores y materiales                │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│ │ 🚚       │ │ 🚚       │ │ 🚚       │              │
│ │ Papeles  │ │ Químicos │ │ Envases  │              │
│ │ del Sur  │ │ C.A.     │ │ Global   │              │
│ ├─┬──┬──┬──┤ ├─┬──┬──┬──┤ ├─┬──┬──┬──┤              │
│ │ℹ│✏│🗑│  │ │ℹ│✏│🗑│  │ │ℹ│✏│🗑│  │              │
│ └─┴──┴──┴──┘ └─┴──┴──┴──┘ └─┴──┴──┴──┘              │
└─────────────────────────────────────────────────────┘
```
