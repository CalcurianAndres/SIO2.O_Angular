# Categorías — Especificación

## Layout
- Grilla responsive de tarjetas (`.grupo-grid`): 5 cols escritorio, 3 tablet, 2 móvil
- Cada card: icono `fa-tag` + nombre
- Footer con acciones: editar, eliminar
- Módulo Fases y Maquinarias → color purple
- Botón "Categoría +" arriba a la izquierda debajo del section-header

## Estados visuales
| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && categorias.length === 0` | 5 skeleton cards |
| Vacío | `!cargando && categorias.length === 0` | Icono `fa-tag` + "No hay categorías registradas" + flecha al botón |
| Datos | `categorias.length > 0` | Grid de cards |

## Formularios

### Categoría (crear/editar)
- Modal `.modal-card` único
- Head: icono `fa-plus-circle` / `fa-edit` + título
- Body: solo campo **Nombre**
- Patrón `guardando`: `ngOnChanges` reset, `fa-spinner fa-pulse`, `[disabled]`, "Guardando…"
- Confirmación antes de eliminar con Swal

### Detalle
- No aplica — la card muestra el nombre directamente

## Flujo de datos
- **CategoriasService** vía WebSockets (socket.io)
  - `CLIENTE:nuevaCategoria` / `CLIENTE:EditCategoria` / `CLIENTE:deleteCategoria`
  - `SERVER:categoria` → carga lista
  - `SERVIDOR:enviaMensaje` → feedback toast

## Diseño visual
- Módulo Fases y Maquinarias → color purple
- Cards con icono purple, hover elevation
- Dark/light via CSS variables
- Skeleton con shimmer gradient

## BDD / Gherkin

```gherkin
Feature: Gestión de Categorías de Producto
  Como usuario de producción quiero gestionar categorías de producto
  para clasificar los productos que fabricamos

  Background:
    Given el usuario ha iniciado sesión en el módulo Fases y Maquinarias

  Scenario: Crear categoría exitosamente
    Given el usuario abre "Nueva Categoría"
    When completa el Nombre
    Then la categoría aparece en la grilla

  Scenario: Editar categoría
    Given hay al menos una categoría registrada
    When el usuario hace clic en editar
    Then se abre el modal con el nombre precargado
    When modifica el nombre y guarda
    Then los cambios se reflejan en la grilla

  Scenario: Eliminar categoría con confirmación
    Given hay al menos una categoría registrada
    When el usuario hace clic en eliminar
    Then se muestra confirmación "¿Eliminar esta categoría?"
    When el usuario confirma
    Then la categoría desaparece de la grilla

  Scenario: Estado vacío
    Given no hay categorías registradas
    Then se muestra mensaje "No hay categorías registradas"
    And se muestra un icono de etiqueta y una flecha apuntando al botón

  Scenario: Carga de datos
    Given la página de categorías se está cargando
    Then se muestran skeleton cards animadas
    When los datos llegan del servidor
    Then las skeleton cards son reemplazadas por las tarjetas reales
```

## Mockup

```
┌───────────────────────────────────────────────────────────┐
│ 🏭 Categorías                              [Categoría +]  │
│ Clasificación de los productos                            │
├───────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│ │ 🏷️           │ │ 🏷️           │ │ 🏷️           │       │
│ │ Bolsas       │ │ Empaques     │ │ Etiquetas    │       │
│ │              │ │              │ │              │       │
│ ├─┬──┬──┬──────┤ ├─┬──┬──┬──────┤ ├─┬──┬──┬──────┤       │
│ │✏│🗑│  │      │ │✏│🗑│  │      │ │✏│🗑│  │      │       │
│ └─┴──┴──┴──────┘ └─┴──┴──┴──────┘ └─┴──┴──┴──────┘       │
│ ┌──────────────┐ ┌──────────────┐                         │
│ │ 🏷️           │ │ 🏷️           │                         │
│ │ Folders      │ │ Cajas        │                         │
│ │              │ │              │                         │
│ ├─┬──┬──┬──────┤ ├─┬──┬──┬──────┤                         │
│ │✏│🗑│  │      │ │✏│🗑│  │      │                         │
│ └─┴──┴──┴──────┘ └─┴──┴──┴──────┘                         │
└───────────────────────────────────────────────────────────┘
```
