# Certificados de Calidad — Especificación

## Layout
- **KPI Cards**: 3 cards en fila con patrón `kpi-card` del DESIGN_SPEC (kpi-orange, kpi-red, kpi-green)
  - Total OPs → naranja
  - Por muestrear → rojo
  - Certificados emitidos → verde
- **Buscador**: input de texto global con icono de búsqueda, debajo de KPIs
- **Tabla compacta**: zebra stripes, hover, sin scroll horizontal
  - Columnas: OP | Producto | Cantidad | Acción (Iniciar Muestreo)
  - Paginación inferior: 10/25/50/100 registros
- **Modal de muestreo ISO 2859-1**: modal ancho (98%) con secciones separadas por `hr.modal-divider`
- Módulo Laboratorio → color red

## Estados visuales

| Estado | Condición | UI |
|--------|-----------|----|
| Carga | `cargando && items.length === 0` | 5 skeleton rows (`app-skeleton type="table"`) |
| Vacío | `!cargando && filteredItems.length === 0` | Icono `fa-flask` + "No hay órdenes de producción disponibles" |
| Datos | `filteredItems.length > 0` | Tabla paginada con KPI cards |

## KPIs
- **Total OPs**: cantidad de registros en `OproduccionService.orden`
- **Por muestrear**: OPs sin certificado asociado
- **Certificados emitidos**: OPs con certificado completado
- Calculados dinámicamente desde `OproduccionService.orden`

## Tabla de OPs
- Búsqueda global por número de OP o nombre de producto
- Botón "Iniciar Muestreo" → abre modal con OP y lote precargados
- Los query params `?op=X&producto=Y&cantidad=Z` filtran automáticamente al llegar desde ProductoTerminado

## Modal de Muestreo (ISO 2859-1)
- **Header**: icono `fa-microscope` + "Muestreo: OP X — Producto" + botón cerrar
- **Configuración del plan** (columns is-multiline):
  - Tamaño del Lote (auto-fill desde cantidad de OP)
  - Nivel de Inspección (I/II/III/S1-S4)
  - Severidad del Plan (Normal/Rigurosa/Reducida)
- **Progreso**: barra de progreso con contador n de sampleSize
- **Inspección de color**: 5 cards (Negro/Cyan/Magenta/Pantone 109/Pantone 2035) con select Cumple/No Cumple
- **Evaluación dimensional**: Alto, Largo, Ancho, Barniz (con N/A toggle), Cód. Barra, Imagen/Texto, Troquel (select Cumple/No Cumple)
- **Registro de defectos**: selector de defecto (Crítico/Mayor/Menor), cantidad defectuosa, observaciones, contadores de límites AQL
- **Tablas de historial**: Mediciones Físicas (9 columnas) + Defectos (4 columnas)
- **Footer**: botón "Finalizar y Guardar" (deshabilitado hasta completar muestreo) + "Cerrar"
- Totalmente consistente con DESIGN_SPEC (Bulma fields, modal-divider, botones con iconos)

## Flujo de datos
- `OproduccionService.orden[]` → población de tabla de OPs
- `IsoService.getLetterCode()` / `getSamplingPlan()` → plan de muestreo ISO 2859-1
- Datos vía WebSockets (socket.io)
- Query params desde `ActivatedRoute` para filtrar al navegar desde ProductoTerminado
- PDF generado con `pdfmake-wrapper` (mantiene la estructura actual del certificado)

## Diseño visual
- Módulo Laboratorio → color red
- KPIs con gradientes via CSS variables (`kpi-orange`, `kpi-red`, `kpi-green`)
- Tabla compacta con zebra stripes, hover, paginación
- Dark/light via CSS variables
- Skeleton con `app-skeleton type="table"` durante carga
- Modal con `.modal-card` estándar y secciones con `hr.modal-divider`

## BDD / Gherkin

```gherkin
Feature: Certificados de calidad
  Como usuario de laboratorio quiero realizar muestreos ISO 2859-1
  para generar certificados de análisis de producto terminado

  Background:
    Given el usuario ha iniciado sesión en el módulo de Laboratorio
    And las órdenes de producción están cargadas vía WebSocket

  Scenario: Visualizar KPI cards con totales
    Given hay OPs en el sistema
    Then se muestran 3 KPI cards con total OPs, por muestrear y emitidos
    And los valores se calculan dinámicamente desde los datos

  Scenario: Filtrar OPs por búsqueda
    Given hay OPs registradas en la tabla
    When el usuario escribe "2026" en el buscador
    Then la tabla muestra solo las OPs cuyo número contiene "2026"
    And la paginación se resetea a la página 1

  Scenario: Iniciar muestreo desde tabla
    Given hay al menos una OP en la tabla
    When el usuario hace clic en "Iniciar Muestreo"
    Then se abre el modal de muestreo con el lote precargado
    And el tamaño del lote se auto-completa con la cantidad de la OP

  Scenario: Navegar desde ProductoTerminado con query params
    Given el usuario viene desde ProductoTerminado con ?op=2026001&producto=Caja&cantidad=5700
    Then la tabla se filtra mostrando la OP 2026001
    And el campo de búsqueda muestra "2026001"

  Scenario: Registrar mediciones y defectos
    Given el modal de muestreo está abierto
    When el usuario ingresa una muestra y registra mediciones dimensionales
    Then la medición aparece en el historial de mediciones físicas
    When el usuario selecciona un defecto y lo reporta
    Then el defecto aparece en el registro de defectos
    And los contadores de criticidad se actualizan

  Scenario: Lote rechazado por defectos críticos
    Given hay un defecto crítico registrado
    When la cantidad de defectos críticos alcanza el límite de rechazo
    Then el estado del lote cambia a "Rechazado"
    And los contadores se muestran en rojo

  Scenario: Descargar certificado PDF
    Given el plan de muestreo está definido
    When el usuario hace clic en "Descargar Certificado"
    Then se genera y descarga un PDF con los resultados del análisis

  Scenario: Estado vacío
    Given no hay OPs disponibles
    Then se muestra mensaje "No hay órdenes de producción disponibles"
    And se muestra un icono de laboratorio

  Scenario: Carga de datos
    Given la página de certificados se está cargando
    Then se muestran skeleton rows animadas
    When los datos llegan del servidor
    Then las skeleton rows son reemplazadas por la tabla real
```

## Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ 🔬 Certificados de calidad                     [Rojo]      │
│ Generación de certificados de análisis                     │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐    │
│ │ 📋 45          │ │ ⏳ 12          │ │ ✅ 33          │    │
│ │ Total OPs      │ │ Por muestrear  │ │ Emitidos       │    │
│ │ ▼ naranja      │ │ ▼ rojo         │ │ ▼ verde        │    │
│ └────────────────┘ └────────────────┘ └────────────────┘    │
│                                                             │
│ [🔍 Buscar OP o producto...                   ]             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ OP        │ Producto         │ Cantidad   │ Acción      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 2026001   │ Cajita Feliz     │     5,700  │ [▶ Muestreo]│ │
│ │ 2026002   │ Caja Familiar    │     3,200  │ [▶ Muestreo]│ │
│ │ 2026003   │ Estuche Premium  │    12,000  │ [▶ Muestreo]│ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Mostrando 1-3 de 3                    [10] 25 50 100    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌── Modal: Muestreo OP 2026001 ───────────────────────────┐ │
│ │ 🔬 Muestreo: OP 2026001 — Cajita Feliz              ✕  │ │
│ ├────────────────────────────────────────────────────────-┤ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 📊 Muestreo de producto terminado  [📄 Descargar]  │ │ │
│ │ │ ─────────────────────────────────────────────────  │ │ │
│ │ │ Tamaño Lote: [5700]  Nivel: [II 🔽]  Seve: [Nrm 🔽]│ │ │
│ │ │ ─────────────────────────────────────────────────  │ │ │
│ │ │ Muestreo              n = 200                       │ │ │
│ │ │ ████████████░░░░░░░░░  50%                         │ │ │
│ │ │ ─────────────────────────────────────────────────  │ │ │
│ │ │ 🎨 Inspección visual de color                      │ │ │
│ │ │ ┌────────────┐ ┌────────────┐ ┌────────────┐      │ │ │
│ │ │ │ Negro (K)  │ │ Cyan (C)   │ │ Magenta (M)│      │ │ │
│ │ │ │ [Cumple 🔽]│ │ [Cumple 🔽]│ │ [Cumple 🔽]│      │ │ │
│ │ │ └────────────┘ └────────────┘ └────────────┘      │ │ │
│ │ │ ─────────────────────────────────────────────────  │ │ │
│ │ │ 📏 Evaluación dimensional     🐛 Defectos         │ │ │
│ │ │ Alto [___] N/A Largo [___] N/A│[--Defecto--] 🔽   │ │ │
│ │ │ Ancho[___] N/A Barniz[___] N/A│Cant [__] Obs [___] │ │ │
│ │ │ Cód.B [Cumple🔽] Img/T [Cum🔽]│[🐛 Reportar]      │ │ │
│ │ │ [➕ Registrar Medición]      │ Crit:0/1 May:0/2   │ │ │
│ │ │ ─────────────────────────────────────────────────  │ │ │
│ │ │ 📋 Historial Mediciones │ 🐛 Registro Defectos   │ │ │
│ │ │ ┌──┬───┬───┬───┬───┬──┐ │ ┌──┬──────┬────┬──┐   │ │ │
│ │ │ │C │Al │La │An │Ba │CB│ │ │C │Defect│Tipo│🚮│   │ │ │
│ │ │ └──┴───┴───┴───┴───┴──┘ │ └──┴──────┴────┴──┘   │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ [💾 Finalizar y Guardar]          [Cerrar]              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
