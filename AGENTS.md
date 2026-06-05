# SIOF — Angular 16.2 + Bulma 0.9.4 frontend for SIO (ERP/MES)

## Commands

```bash
npm install --legacy-peer-deps   # required (pdfmake/moment peer conflicts)
ng serve                         # dev at http://localhost:4200
npm run build                    # prod build (5MB warning / 20MB error budget)
npm run lint && npm run format && npm run lint:fix  # run in order
```

## Environment auto-detection (`src/environments/environment.ts`)

| Running via | apiUrl | wsUrl |
|-------------|--------|-------|
| `ng serve` (port 4200) | `http://localhost:3000/api` | `http://localhost:3000` |
| Office (host 192.168.0.22) | `https://192.168.0.22/api` | `https://192.168.0.22` |
| Docker / production | `/api` (relative) | `''` (same origin) |

## Architecture constraints

- **AuthGuard** protects all routes except login, asignacion, recibos. Token in `localStorage.getItem('TOKEN_SESSION')`.
- **Service Worker**: built via `ngsw-config.json` but `serviceWorker: false` in angular.json build options (registered in main.ts at `registerWhenStable:30000`).
- **CommonJS allowed deps**: pdfmake, moment, sweetalert2, rgb-lab (configured in angular.json).
- **Lazy modules**: compras, almacen, laboratorio, fases-ymaquinarias, ordenes, empleados, dashboard, login.
- **Never duplicate component declarations** across modules (Angular 16 throws).
- **Shared components** (`<app-page-layout>`, `<app-section-header>`, `<app-modal>`, `<app-toast>`, `<app-breadcrumb>`, `<app-skeleton>`) register in `SharedComponentsModule`, not `SharedModule`. Import `SharedModule` in feature modules.
- **Locale**: `es-ES`. `noImplicitAny: false` — `any` allowed without annotation.
- Import paths use **relative** `../shared/...`, not `src/app/...`.

## Theme / CSS

- **All colors via CSS custom properties** in `:root` (dark) and `[data-theme='light']`. Toggle saved in `localStorage.DARK_MODE`.
- **Never use hardcoded hex colors** (`#fff`, `#000`, `#333`, `#48c78e`, `#f03a5f`, `#3e8ed0`, etc.) in new code — always use CSS variables.
- **Sidebar is always dark**: uses `--sidebar-*` vars, never overridden in light theme. `--sidebar-bg: rgb(38,52,61)`.
- `--accent-*` = decorative, `--status-*` = data-driven indicators. Utility classes: `.text-success`, `.bg-danger`, `.border-top-warning`, `.icon-action`, `.btn-action-icon`.
- **`.darker`** class is position-dependent: `left: calc(var(--sidebar-width) + 15px)`.
- **Modal z-index**: `10000` (above sidebar's `1000`).
- **`color-mix(in srgb, ...)`** is safe — Angular build pipeline handles it.
- **`.box` is deprecated** in new code — use `.card` with CSS vars instead.
- Bulma overrides live in `styles.scss` (card, table, modal, input, button, message, tabs, menu, accordion, stat-card).

## Docker

SIOB has its own `docker-compose.yml` (backend + MongoDB).
SIOF has its own `Dockerfile` (multi-stage nginx, commented out in compose by default).
For development (hot-reload):

```bash
docker run -d --name mongo-sio -p 27017:27017 mongo  # start DB only
cd ../SIOB && npm run dev    # backend on :3000
npm start                    # frontend on :4200
```

SIOB's SSL certs (`c:/certificado/server/`) are optional — falls back to HTTP when missing. Set `SSL_KEY`/`SSL_CERT`/`SSL_CA` env vars to override paths.

## Tests

No tests exist. `ng test` runs Karma/Jasmine with nothing to execute.

## Linux dev setup

```bash
# Prerequisites: node 18+, npm, docker (for MongoDB only)

# 1. MongoDB
docker run -d --name mongo-sio -p 27017:27017 mongo

# 2. Backend
git clone https://github.com/CalcurianAndres/SIO2.0_Express.git
cd SIO2.0_Express && npm install && npm run dev   # :3000

# 3. Frontend
git clone https://github.com/CalcurianAndres/SIO2.O_Angular.git
cd SIO2.O_Angular && npm install --legacy-peer-deps && npm start   # :4200
```

## Production test (Docker all together)

```bash
# From SIOB directory (builds SIOF, copies to SIOB/public/, docker compose up):
../SIOB/setup.sh
# http://localhost
```

## Session Log — 2026-05-25

### Goal
Enable full product lifecycle: create/edit/PDF products with nested schema, seed enough data to create OPs.

### Code changes
- **`modelos-compra.ts`**: added `_id?: string` to `Producto` class.
- **`nuevo-producto.component.ts`**: added `toNested()` (flat → nested schema transform), `editando` getter, `GuardarProducto` with edit flow passthrough.
- **`nuevo-producto.component.html`**: dynamic modal title (`{{ editando ? 'Editar producto' : 'Nuevo producto' }}`).
- **`productos.component.ts`**: added `editarProducto(p)` + `fromNested(p)` (nested → flat reverse transform), resilient `DescargarPDF()` with optional chaining for empty subdocuments.
- **`productos.component.html`**: edit (pencil) icon row.
- **`productos.service.ts`**: safe navigation (`?.`) in `buscarPorClientes()`.

### Data seeded (MongoDB)
- **Grupos**: Tintas, Barniz de aceite, Barniz Acuoso, Solución de fuentes, Pega, Cajas de embalaje.
- **Fases**: Impresión, Troquelado, Cortado, Pegado.
- **Fabricantes**: Kodak Venezuela, BASF Química, Cartones Nacionales, Sun Chemical.
- **Maquinas**: Impresora 1, Troqueladora 1, Guillotina 1, Pegadora 1.
- **Materiales**: 63 total (19 sustratos, 15 tintas, 9 barnices, 6 pegas, 5 cajas, 3 soluciones de fuente).
- **Productos**: 4 (Cajita, Caja Chocolates 30x20, Folder tamaño carta, Cajita Feliz Genérica).
- **Órdenes de Compra**: 4 (OC-001/002/003/004-2026), cada una con pedido a un producto y cliente.
- **Fix**: All `ObjectId` references converted from strings to proper ObjectId across ocompras, productos, materials, maquinas.

## Session Log — 2026-05-29

### Goal
Standardize accordion sub-table with Bulma (OC-style), add Excel sorting to sub-table, reformat sustrato display, unify badge delete button, update documentation.

### Code changes
- **`grupos.component.scss`**: Removed custom Gilroy/uppercase overrides from `.sub-table th` — reset to Bulma defaults (`font-family: inherit`, `text-transform: none`, `letter-spacing: normal`, `color: inherit`) matching órdenes de compra style.
- **`grupos.component.ts`**: Added `matSortColumn`, `matSortDirection`, `matToggleSort()`. Updated `getPaginatedMateriales()` to sort by nombre, serie, fabricante, codigo, or product count before paginating.
- **`grupos.component.html`**: Made Serie header sortable (is-clickable + fa-sort icons). Changed material name cell for sustratos (`grupo.trato === true`) to display: `nombre marca calibrept gramajeg/m²`.
- **`clientes.component.html`**: Added `.is-striped` class for zebra rows (DESIGN_SPEC compliance).
- **`fabricantes-proveedores.component.html`**: Sorting columns (Excel-style).
- **`clientes.component.ts`**: Sorting columns (Excel-style).
- **`new-cliente.component.html`**: Badge delete button changed to Bulma `.delete is-small`.
- **Files `Bugs`, `Bugs.txt`, `Correcciones.txt`**: Updated with date stamp, reviewed tags, and new entries.

### Key decisions
- Sub-table headers reset to Bulma defaults (no custom font/uppercase) to match OC product table style.
- Serie column now sortable via `matToggleSort('serie')` with localeCompare.
- Sustrato material display: "nombre alias calibrept gramajeg/m²" when `grupo.trato && mat.calibre`.
- Bugs.txt old items tagged `[REVISADO]`, new items marked `[CORREGIDO]` only.

### Created
- `avance.md`, `changelog.md`, `task.md` in `/home/poligrafica/Work/SIO/`.

## Session Log — 2026-06-05

### Goal
Complete restructure of grupos from table+stacks to cards+3-level nested accordion; 4 smaller UI tasks; update documentation and commit.

### Code changes
- **`grupos.component.ts`**: Removed `getStacks()`, `getPaginatedStacks()`, `getStackTotalPages()`, `getPaginatedMateriales()`, `getProductCount()`, `expandedStackKey`, `materialGoToPage()`, `materialChangePageSize()`. Added `getNameGroups(grupoId)`, `toggleName(key)`, `toggleBrand(nameKey, alias)`, `getSortedItems(items)`, `expandedNameKey`, `expandedBrandKey`. Grouping key now includes `fabricante.alias`.
- **`grupos.component.html`**: Replaced `<table>` with `<div class="card grupo-card">` — card-header (clickable), card-content (max-height transition), card-footer (Agregar Material). 3-level nested accordion: name-card → brand-card → sortable sub-table.
- **`grupos.component.scss`**: OCP-style card design, nested mini-cards with border-left color accents, chevron rotations, max-height transitions.
- **`nuevo-material.component.ts`**: Added `pantoneCode`, `colores` enum, `esPantone` getter, `onColorChange()` reset logic.
- **`nuevo-material.component.html`**: 5 radio buttons (Cyan/Magenta/Amarillo/Negro/Pantone) replace free-text color input. Pantone input shown conditionally. Caja label → "Cantidad de cinta por caja (metros)".
- **`nuevo-material.component.scss`**: `.color-radios` flex layout.
- **`SPEC.md`**: Full rewrite — cards + 3-level accordion instead of table + stacks.
- **`grupos/materiales/materiales.component.ts`**: `selectedGrupo` property added for modal context.
- **`grupos/materiales/materiales.component.html`**: Minor alignment for modal context.

### SIO_CEREBRO documentation
- **MAP.md**: Created — root index with links to all vault modules.
- **004-Diagramas/Diagramas.md**: Created — ASCII flow diagrams for all modules (CRUD, navigation, states).
- **005-Arquitectura/README.md**: Created — stack overview, modules, Socket.io pattern, deployment.
- **CHANGELOG.md**: Centralized bitácora created.
- **workspace.json**: Cleaned dead references from `lastOpenFiles`.
- **Pendiente por cambios.md**: Content merged into Por implementar.md, marked obsolete.
- **001-Proyecto/Grupos.md**: Synced with SPEC.md (cards + 3-level accordion).

### Key decisions
- Cards instead of table rows: each group is a distinct Bulma `.card` matching OCP style.
- 3-level nested accordion replaces single-level stacks: Level 1 (nombre) → Level 2 (marca) → Level 3 (sortable detail).
- Column "Productos" removed entirely ("no es un almacén").
- Tinta color uses 5 radios (C/M/A/N/Pantone) instead of free text; Pantone opens secondary text input.
- All stack/page/material pagination removed — detail table renders all items flat from a brand group.
