# Fabricantes — Especificación

## Layout
- Responsive grid de tarjetas: 2 cols base, 3 cols ≥768px, 5 cols ≥1024px (`.grupo-grid`)
- Cada card: icono `fa-industry` + nombre + alias + badge "Proveedor directo"
- Botón "Nuevo Fabricante" arriba a la izquierda, debajo del section-header

## Estados visuales
| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && fabricantes.length === 0` | Skeleton cards |
| Vacío | `!cargando && fabricantes.length === 0` | "No hay fabricantes registrados" con icono `fa-industry` |
| Datos | `fabricantes.length > 0` | Grid de cards |

## Formularios
- Modal con Razón social, Alias, Origen (país + estado), Grupo que fabrica
- "Proveedor directo" checkbox revela: Dirección, Rif, Contactos (Nombre, Teléfono, Correo, Cargo)
- Acordeón "Ver información de proveedor" en modo edición
- Validación de correo en tiempo real
- Patrón `guardando`: botón se deshabilita, `fa-spinner fa-pulse`, texto "Guardando…"
- `guardando` se resetea via `ngOnChanges` al abrir el modal

### Estructura del modal
- Single `.modal-card` unificada (sin paneles `.added` flotantes)
- Head con icono `fa-industry` / `fa-edit` según modo
- Body con secciones divididas por `<hr class="modal-divider">`
- Labels de sección en `.section-label`: uppercase, muted, con icono
- Orígenes y grupos agregados se muestran como tags inline con botón delete
- Formulario de contacto en horizontal (`columns is-mobile`) en vez de vertical
- Select de países iterado desde el TS via `*ngFor`, no hardcoded en HTML
- Botón guardar/editar siempre visible al final del body

## Visor de detalles
- Modal de solo lectura, se abre al hacer clic en icono info `fa-info-circle` de cada card
- Head con icono `fa-industry` + nombre del fabricante + badge "Proveedor" si aplica
- Body con secciones divididas por `<hr class="modal-divider">`
- Campos en filas con label/vale: label uppercase muted + icono, value en bold
- Orígenes como tags `is-info is-light` con `fa-flag`
- Grupos como tags `is-info is-light` con `fa-cube`
- Mensaje "Sin orígenes registrados" / "Sin grupos asociados" cuando no hay datos
- Sin botones de acción (solo lectura + botón cerrar X)

## Flujo de datos
- `FabricantesService` vía WebSockets (socket.io)
  - `CLIENTE:NuevoFabricante` / `CLIENTE:deleteFabricante` / `CLIENTE:EditarFabricante`
- Si `proveedor_directo`, también crea/edita en `ProveedoresService`

## Diseño visual
- Módulo Compras → color green
- Cards con header + footer de acciones (info, editar, eliminar)
- Dark/light via CSS variables

## BDD / Gherkin

```gherkin
Feature: Registro de Fabricantes
  Como usuario de compras quiero registrar fabricantes de materia prima
  para homologarlos y asociarlos a grupos de materiales

  Background:
    Given el usuario ha iniciado sesión en el módulo de Compras

  Scenario: Crear fabricante exitosamente
    Given el usuario abre "Nuevo Fabricante"
    When completa Razón social, Alias, Origen y Grupo
    Then el fabricante aparece en la grilla

  Scenario: Fabricante también es proveedor directo
    Given el usuario activa "Proveedor directo"
    When completa Dirección, RIF y al menos un Contacto
    Then el fabricante se guarda con datos de proveedor

  Scenario: Eliminar fabricante
    Given hay al menos un fabricante registrado
    When el usuario hace clic en el icono de eliminar
    Then se muestra confirmación "¿Eliminar este Fabricante?"
    When el usuario confirma la eliminación
    Then el fabricante desaparece de la grilla

  Scenario: Editar fabricante
    Given hay al menos un fabricante registrado
    When el usuario hace clic en el icono de editar
    Then se abre el modal con los datos precargados
    When el usuario modifica los campos y guarda
    Then los cambios se reflejan en la grilla

  Scenario: Estado vacío
    Given no hay fabricantes registrados
    Then se muestra mensaje "No hay fabricantes registrados"
    And se muestra un icono de industria y una flecha apuntando al botón

  Scenario: Carga de datos
    Given la página de fabricantes se está cargando
    Then se muestran tarjetas skeleton animadas
    When los datos llegan del servidor
    Then las tarjetas skeleton son reemplazadas por las tarjetas reales
```

## Mockup

```
┌─────────────────────────────────────────────────────┐
│  🛒 Fabricantes                        [Nuevo +]    │
│  Registro de fabricantes homologados                │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│ │ 🏭       │ │ 🏭       │ │ 🏭       │              │
│ │ Papeles  │ │ Químicos │ │ Envases  │              │
│ │ del Sur  │ │ ABC      │ │ Global   │              │
│ │ [Prov]   │ │          │ │          │              │
│ ├─┬──┬──┬──┤ ├─┬──┬──┬──┤ ├─┬──┬──┬──┤              │
│ │ℹ│✏│🗑│  │ │ℹ│✏│🗑│  │ │ℹ│✏│🗑│  │              │
│ └─┴──┴──┴──┘ └─┴──┴──┴──┘ └─┴──┴──┴──┘              │
│ ┌──────────┐ ┌──────────┐                            │
│ │ 🏭       │ │ 🏭       │                            │
│ │ ...      │ │ ...      │                            │
│ └──────────┘ └──────────┘                            │
└─────────────────────────────────────────────────────┘
```
