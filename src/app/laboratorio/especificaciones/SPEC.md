# Especificaciones — Especificación

## Layout
- **Page**: `<app-page-layout>` con `<app-section-header>` color red (módulo Laboratorio)
- **Grupos**: card grid responsive (2 cols base, 3 cols ≥768px, 5 cols ≥1024px)
- **Tabla de materiales**: zebra paginada (10/25/50/100) debajo del grid

## Estados visuales
| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && grupos.grupos.length === 0` | 5 skeleton cards |
| Vacío | `!cargando && grupos.grupos.length === 0` | Empty state con icono `fa-cubes` |
| Datos | `grupos.grupos.length > 0` | Grid de cards + tabla |

## Componentes
- **Grupos**: card grid con icono, nombre, badge parcial, footer con acciones (ver materiales, nueva especificación)
- **Materiales**: tabla zebra con Nombre, Fabricante, Serie, Origen, acciones (detalle, editar)
- **KPIs**: Total grupos, Con especificación, Sin especificación

## Modales
- `NuevaEspecificacionComponent` — creación/edición de especificaciones (existente)
- `DetallesEspecificacionComponent` — detalle de especificación (existente)
