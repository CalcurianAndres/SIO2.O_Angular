# Fases y Máquinas — Especificación

## Layout
- **Fases**: grilla responsive de tarjetas (`.grupo-grid`): 5 cols escritorio, 3 tablet, 2 móvil
  - Cada card: icono `fa-industry` + nombre + badge "parcial" (opcional)
  - Footer con acciones: info, editar, eliminar
- **Máquinas**: grilla responsive de tarjetas (`.grupo-grid`): 5 cols escritorio, 3 tablet, 2 móvil
  - Cada card: icono `fa-cog` + nombre + marca/modelo
  - Card content: fases como tags inline (máx 3 visibles + contador "+N")
  - Footer con acciones: info, editar, eliminar
- Módulo Fases y Maquinarias → color purple
- Botón "Nuevo" arriba a la izquierda debajo del section-header

## Estados visuales

### Fases (card grid)
| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && fases.length === 0` | 5 skeleton cards |
| Vacío | `!cargando && fases.length === 0` | Icono `fa-industry` + "No hay fases registradas" + flecha al botón |
| Datos | `fases.length > 0` | Grid de cards |

### Máquinas (card grid)
| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && maquinas.length === 0` | 5 skeleton cards |
| Vacío | `!cargando && maquinas.length === 0` | Icono `fa-cog` + "No hay máquinas registradas" + flecha |
| Datos | `maquinas.length > 0` | Grid de cards |

## Formularios

### Fases (crear/editar)
- Modal `.modal-card` único
- Head: icono `fa-plus-circle` / `fa-edit` + título
- Body: solo **Nombre** + **Descripción**
- Patrón `guardando`: `ngOnChanges` reset, `fa-spinner fa-pulse`, `[disabled]`, "Guardando…"
- Confirmación antes de eliminar con Swal

### Máquinas (crear/editar)
- Modal `.modal-card` único (sin `.added` flotante)
- Head con icono según modo
- Secciones divididas por `<hr class="modal-divider">` con `.section-label`:
  1. **Identificación**: nombre, marca, modelo (3 cols)
  2. **Especificaciones**: serial, año (2 cols)
  3. **Fases que ejecuta**: selector + botón + → tags inline `tag is-info` con ×
  4. **Pinzas**: input + botón + → tags inline `tag is-warning` con ×
  5. **Rendimiento**: und/hora, colores (2 cols)
- Patrón `guardando`
- Confirmación antes de eliminar

### Detalle (solo lectura)
- Head: icono `fa-info-circle` + nombre
- Body con `.detail-row`: `.detail-label` (uppercase, muted, icono) / `.detail-value` (bold)
- Fases/Máquinas relacionadas como badges inline `tag is-info is-light`
- Mensaje "Sin X registrados" cuando no hay datos
- Sin botones de acción (solo cerrar X)

## Flujo de datos
- **FasesService** vía WebSockets (socket.io)
  - `CLIENTE:nuevaFase` / `CLIENTE:EditFase` / `CLIENTE:deleteFase`
  - `SERVER:fase` → carga lista
  - `SERVIDOR:enviaMensaje` → feedback toast
- **MaquinasService** vía WebSockets (socket.io)
  - `CLIENTE:nuevaMaquina` / `CLIENTE:EditMaquina` / `CLIENTE:deleteMaquina`
  - `SERVER:maquina` → carga lista
  - `SERVIDOR:enviaMensaje` → feedback toast
- Relación: `Maquina.fases[]` contiene `_id` de `Fase`
- `MaquinasService.buscarMaquinaPorFases(faseId)` para detalle de fase

## Diseño visual
- Módulo Fases y Maquinarias → color purple
- Cards con icono purple, hover elevation
- Dark/light via CSS variables
- Skeleton con `skeleton-card` / `skeleton-row`
- Badges: `tag is-info is-light` para fases, `tag is-warning is-light` para pinzas

## BDD / Gherkin

```gherkin
Feature: Gestión de Fases de Producción
  Como usuario de producción quiero gestionar las fases del proceso
  para asignarlas a máquinas específicas

  Background:
    Given el usuario ha iniciado sesión en el módulo Fases y Maquinarias

  Scenario: Crear fase exitosamente
    Given el usuario abre "Nueva Fase"
    When completa Nombre y Descripción
    Then la fase aparece en la grilla

  Scenario: Editar fase
    Given hay al menos una fase registrada
    When el usuario hace clic en editar
    Then se abre el modal con los datos precargados
    When modifica campos y guarda
    Then los cambios se reflejan en la grilla

  Scenario: Eliminar fase con confirmación
    Given hay al menos una fase registrada
    When el usuario hace clic en eliminar
    Then se muestra confirmación "¿Eliminar esta fase?"
    When el usuario confirma
    Then la fase desaparece de la grilla

  Scenario: Ver detalle de fase con máquinas asociadas
    Given hay al menos una fase registrada
    When el usuario hace clic en info
    Then se muestra modal con nombre y descripción
    And se muestran las máquinas que ejecutan esta fase como badges
    Or "Sin máquinas asignadas" si no hay

  Scenario: Crear máquina con fases asignadas
    Given el usuario abre "Nueva Máquina"
    When completa nombre, marca, modelo, serial, año
    When selecciona fases desde el dropdown y las agrega como tags
    When agrega pinzas como tags
    When completa und/hora y colores
    Then la máquina aparece en la tabla con sus fases como badges

  Scenario: Ver detalle de máquina
    Given hay al menos una máquina registrada
    When el usuario hace clic en info
    Then se muestran todos los datos en formato detail-row
    And las fases se muestran como badges

  Scenario: Estado vacío fases
    Given no hay fases registradas
    Then se muestra mensaje "No hay fases registradas"
    And se muestra un icono de industria y una flecha apuntando al botón

  Scenario: Estado vacío máquinas
    Given no hay máquinas registradas
    Then se muestra mensaje "No hay máquinas registradas"

  Scenario: Carga de datos fases
    Given la página de fases se está cargando
    Then se muestran skeleton cards animadas
    When los datos llegan del servidor
    Then las skeleton cards son reemplazadas por las tarjetas reales

  Scenario: Carga de datos máquinas
    Given la página de máquinas se está cargando
    Then se muestran skeleton rows animadas
    When los datos llegan del servidor
    Then las skeleton rows son reemplazadas por la tabla real
```

## Mockup

```
┌───────────────────────────────────────────────────────────┐
│ 🏭 Fases de producción                      [Fase +]      │
│ Etapas del proceso productivo                             │
├───────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│ │ 🏭           │ │ 🏭           │ │ 🏭           │       │
│ │ Impresión    │ │ Troquelado   │ │ Pegado       │       │
│ │              │ │              │ │              │       │
│ │ [parcial]    │ │              │ │              │       │
│ ├─┬──┬──┬──────┤ ├─┬──┬──┬──────┤ ├─┬──┬──┬──────┤       │
│ │ℹ│✏│🗑│      │ │ℹ│✏│🗑│      │ │ℹ│✏│🗑│      │       │
│ └─┴──┴──┴──────┘ └─┴──┴──┴──────┘ └─┴──┴──┴──────┘       │
│ ┌──────────────┐ ┌──────────────┐                         │
│ │ 🏭           │ │ 🏭           │                         │
│ │ Corte        │ │ Empaque      │                         │
│ │              │ │              │                         │
│ ├─┬──┬──┬──────┤ ├─┬──┬──┬──────┤                         │
│ │ℹ│✏│🗑│      │ │ℹ│✏│🗑│      │                         │
│ └─┴──┴──┴──────┘ └─┴──┴──┴──────┘                         │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 🏭 Máquinas                                [Nueva Máq. +] │
│ Registro de maquinaria industrial                          │
├───────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│ │ ⚙️           │ │ ⚙️           │ │ ⚙️           │       │
│ │ Roland 700   │ │ Heidelberg   │ │ Komori       │       │
│ │ MAN          │ │ [Troquel]    │ │ [Impresión]  │       │
│ │ [Impresión]  │ │              │ │              │       │
│ ├─┬──┬──┬──────┤ ├─┬──┬──┬──────┤ ├─┬──┬──┬──────┤       │
│ │ℹ│✏│🗑│      │ │ℹ│✏│🗑│      │ │ℹ│✏│🗑│      │       │
│ └─┴──┴──┴──────┘ └─┴──┴──┴──────┘ └─┴──┴──┴──────┘       │
│ ┌──────────────┐ ┌──────────────┐                         │
│ │ ⚙️           │ │ ⚙️           │                         │
│ │ Bobst        │ │ Polar        │                         │
│ │ [Troquel]    │ │ [Guillotina] │                         │
│ │ [+2]         │ │              │                         │
│ ├─┬──┬──┬──────┤ ├─┬──┬──┬──────┤                         │
│ │ℹ│✏│🗑│      │ │ℹ│✏│🗑│      │                         │
│ └─┴──┴──┴──────┘ └─┴──┴──┴──────┘                         │
└───────────────────────────────────────────────────────────┘
```
