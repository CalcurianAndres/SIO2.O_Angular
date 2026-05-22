# SIOF — Angular frontend for SIO (Sistema Integral de Operación)

## Quick start

```bash
npm install --legacy-peer-deps   # required: many peer dep conflicts
ng serve                         # dev server at http://localhost:4200
npm start                        # same as ng serve
ng build --configuration development  # faster dev build
npm run build                    # production build (budgets: 5MB warning / 20MB error)
```

## Code quality (run in order)

```bash
npm run lint       # ESLint
npm run format     # Prettier (write)
npm run lint:fix   # ESLint auto-fix
```

Prettier: single quotes, semicolons, trailing commas, printWidth 120.

## Architecture

- **Angular 16.2** — Bulma CSS, SCSS, `@angular/service-worker` (PWA)
- **Lazy-loaded modules**: compras, almacen, laboratorio, fases-ymaquinarias, ordenes, empleados, dashboard, login
- **AuthGuard** on all routes except login, asignacion, recibos — validates via `LoginService.validarToken()`
- **API**: auto-detected (see Environment section) — token in `localStorage.getItem('TOKEN_SESSION')`
- **Locale**: `es-ES` (Spanish date/number formatting)
- **Service Worker**: registered with `registerWhenStable:30000`
- **CommonJS deps** (allowed in angular.json): pdfmake, moment, sweetalert2, rgb-lab
- **TypeScript**: strict mode but `noImplicitAny: false`, `strictTemplates: true`
- **Fonts**: Gilroy (local OTF) + Nunito (Google) + Font Awesome (CDN)

## Project structure

```
src/app/
  compras/           # Purchasing module (proveedores, ordenes, grupos, fabricantes, no-conformidades)
  almacen/           # Warehouse (recepcion, bobinas, almacenado, producto-terminado)
  laboratorio/       # Lab (analisis, especificaciones, defectos, certificado, etiquetas)
  fases-ymaquinarias/# Production phases & machinery (fases, maquinas, categorias, productos, preparacion-tintas)
  ordenes/           # Orders (clientes, compra, produccion, nueva-gestion)
  empleados/         # HR (trabajadores, horarios, departamentos, gestion)
  Dashboard/         # Admin (usuarios)
  login/             # Auth
  services/          # 35 services (CRUD for all entities + WebSocket)
  shared/
    navbar/          # Collapsible sidebar (65px/240px) + 9 sub-components
    components/      # Reusable: app-page-layout, app-section-header, app-modal, app-toast, app-breadcrumb, app-skeleton
    shared.module.ts # Exports SafePipe, NumberFormatDirective, SharedComponentsModule
  models/index.ts    # Barrel export from compras/models
```

## Environment auto-detection

`src/environments/environment.ts` and `environment.prod.ts` auto-detect the backend URL:

| Scenario | Detected by | apiUrl | wsUrl |
|----------|-------------|--------|-------|
| `ng serve` (dev) | port === '4200' | `http://localhost:3000/api` | `http://localhost:3000` |
| Office server | hostname === '192.168.0.22' | `https://192.168.0.22/api` | `https://192.168.0.22` |
| Docker / production | anything else | `/api` (relative) | `''` (same origin) |

## Shared components

Import `SharedModule` in any feature module to use:
- `<app-page-layout>` — wraps content in container > card > .darker
- `<app-section-header>` — inputs: title, description, icon, color ('red'|'green'|'purple'|'blue'|'orange'|'teal'|'navy'), gradient
  - Module colors: Compras=green, Almacen=orange, Laboratorio=red, Producción (fases+maquinas+ordenes prod)=purple, Ventas=blue, Empleados=teal, Dashboard=navy
- `<app-modal>` — inputs: visible, title, longClass; output: onClose
- `<app-toast>` — auto-included in app component; use `ToastService` to push messages
- `<app-breadcrumb>` — auto-included in page-layout; builds from URL segments
- `<app-skeleton>` — loading placeholder (inputs: type='text'|'card'|'table'|'circle', rows, width)

## Global CSS patterns (styles.scss)

### Theme / Dark Mode

- Toggle in profile menu. Preference saved in `localStorage.DARK_MODE`.
- CSS custom properties in `:root` (dark) and `[data-theme='light']` (light).
- **Sidebar is always dark** — uses `--sidebar-*` variables (never overridden in light theme).
- **`.darker` area**: `--bg-secondary: #454a4e` (dark) / `#eef2f6` (light, bluish-gray)
- **Card frame**: `--bg-card: #3c3f41` (dark) / `#ffffff` (light)
- **Modal z-index**: `10000` (above sidebar's `1000`)
- **Route transition**: fade animation via `BrowserAnimationsModule` + `shared/animations.ts`

### CSS Custom Properties

| Variable | Dark | Light | Purpose |
|----------|------|-------|---------|
| `--bg-primary` | `#26343d` | `#f0f2f5` | Page background |
| `--bg-secondary` | `#454a4e` | `#eef2f6` | Secondary/darker areas |
| `--bg-card` | `#3c3f41` | `#ffffff` | Card & surface backgrounds |
| `--text-primary` | `#9fadbc` | `#334155` | Body text |
| `--text-heading` | `#ffffff` | `#1a1a2e` | Headings |
| `--text-muted` | `#64748b` | `#94a3b8` | Muted/secondary text |
| `--border-color` | `#2d2f39` | `#e2e8f0` | Borders & dividers |
| `--accent-red` | `#ff4444` | `#dc2626` | Brand red (decorative) |
| `--accent-green` | `#48c78e` | `#16a34a` | Decorative green |
| `--accent-blue` | `#3b82f6` | `#2563eb` | Decorative blue |
| `--hover-bg` | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.05)` | Hover overlay |
| `--status-success` | `#4caf50` | `#2e7d32` | Success indicators |
| `--status-warning` | `#ffc107` | `#f9a825` | Warning indicators |
| `--status-danger` | `#ef5350` | `#c62828` | Danger/error |
| `--status-info` | `#42a5f5` | `#1565c0` | Info indicators |
| `--modal-backdrop` | `rgba(0,0,0,0.65)` | `rgba(0,0,0,0.4)` | Modal overlay |
| `--sidebar-bg` | `rgb(38,52,61)` | ← always dark | Sidebar background |
| `--sidebar-text` | `#9fadbc` | ← always dark | Sidebar text |
| `--sidebar-text-heading` | `#ffffff` | ← always dark | Sidebar headings |
| `--sidebar-accent` | `#ff4444` | ← always dark | Sidebar accent |
| `--stat-bg` | `#2a3843` | `#f8fafc` | Stat card background |
| `--stat-text` | `#ffffff` | `#475569` | Stat card text |

### Status utility classes

For data-driven status indicators (table cells, badges, icons):

```scss
.text-success / .text-danger / .text-warning / .text-info
.bg-success   / .bg-danger   / .bg-warning   / .bg-info
.border-top-success / .border-top-danger / .border-top-warning / .border-top-info
.border-left-success / .border-left-danger / .border-left-warning / .border-left-info
```

### Icon standards

```scss
.icon-action   // --accent-blue (clickable icons)
.icon-danger   // --accent-red (delete/danger icons)
.icon-edit     // --accent-green (edit icons)
.icon-muted    // --text-muted (inactive/secondary)
.btn-action-icon  // transparent bg + accent-blue text (icon-only buttons)
```

### Stat card pattern

```html
<div class="card stat-card">
  <div class="card-content">
    <div class="stat-number">42</div>
    <div class="stat-label">Label</div>
  </div>
</div>
```

### Accordion pattern (checkbox hack)

```html
<div class="accordion-item">
  <input type="checkbox" class="accordion-trigger" id="acc-1">
  <label class="accordion-header" for="acc-1">
    <span>Title</span>
    <span class="chevron-circle"><i class="fas fa-chevron-down"></i></span>
  </label>
  <div class="accordion-content">
    <div class="card"><div class="card-content">Content</div></div>
  </div>
</div>
```

### Bulma component overrides

All Bulma components overridden with CSS variables in styles.scss:

| Component | Key overrides |
|-----------|---------------|
| `.card` | `--bg-card`, `--card-shadow` |
| `.table` | `--bg-secondary` bg, `--border-color` borders, hover on rows |
| `.modal` | `--modal-backdrop` overlay, `--bg-card` head/foot, `--bg-secondary` body |
| `.input` / `.textarea` / `.select` | `--bg-secondary`, `--border-color`, red focus ring |
| `.button` | `--bg-secondary` default, `--status-*` for semantic variants (is-success, is-danger, etc.) |
| `.button.is-*` | All semantic variants use `color-mix()` for hover states |
| `.message` | tinted backgrounds via `color-mix(in srgb, var(--status-*), transparent)` |
| `.message.is-* .message-header` | Colored headers |
| `.tag` / `.tag.is-*` | Themed tags with semantic colors |
| `.notification.is-*` | Tinted backgrounds |
| `.progress.is-*` | Themed progress bars (webkit/moz/ms) |
| `.checkbox` | `--bg-card`, `--border-color`, `--status-success` checked |
| `.tabs` | `--text-primary`, `--accent-red` active |
| `.pagination` | `--bg-secondary`, `--accent-red` current |
| `.dropdown-menu` | `--bg-elevated` |
| `.panel` | `--bg-secondary` |

## Sidebar

CSS custom property `--sidebar-width` (65px collapsed, 240px expanded). All `.container_` and `.darker` elements use `calc(100vw - var(--sidebar-width) - 30px)` for responsive layout.

## Tests

No test files exist. `ng test` runs Karma/Jasmine framework but has nothing to execute.

## Docker / Entorno

### Estructura

```
Nueva carpeta/
├── docker-compose.yml    # Orquesta SIOF + SIOB + MongoDB
├── setup.bat             # Build SIOF → copia a SIOB → docker-compose up
├── SIOF/
│   ├── Dockerfile        # nginx multi-stage (node:18 build → nginx:alpine serve)
│   ├── nginx.conf        # SPA routing + proxy /api + /socket.io a siob:3000
│   └── .dockerignore
└── SIOB/
    ├── Dockerfile        # Express multi-stage (node:18-alpine)
    ├── docker-compose.yml# Solo SIOB + MongoDB (independiente)
    └── .dockerignore
```

### Desarrollo en casa (hot-reload)

```bash
# Terminal 1 — MongoDB
docker run -d --name mongo-sio -p 27017:27017 mongo

# Terminal 2 — Backend (SIOB)
cd SIOB && npm run dev          # nodemon, puerto 3000

# Terminal 3 — Frontend (SIOF)
cd SIOF && npm start            # ng serve, puerto 4200
```

El environment auto-detects ng serve (puerto 4200) y apunta a `http://localhost:3000`.

### Probar todo junto (Docker)

```bash
setup.bat   # build SIOF → copia a SIOB/public/ → docker-compose up -d
# Abrir http://localhost
```

### SSL

SIOB intenta cargar certs de `c:/certificado/server/`. Si no existen (casa), cae automáticamente a HTTP. Forzar HTTPS con env vars: `SSL_KEY`, `SSL_CERT`, `SSL_CA`.

## Key gotchas

- `npm install` **requires** `--legacy-peer-deps` (pre-existing conflicts in pdfmake/moment peer deps)
- Import paths use relative `../shared/...` (not `src/app/...`)
- `noImplicitAny: false` — `any` types are allowed without annotation
- The CSS class `.darker` is position-dependent on `--sidebar-width` (not a fixed width)
- Never duplicate component declarations across modules (Angular 16 throws)
- Service Worker auto-registers on build — no manual registration in `main.ts`
- When adding new CSS variables for themes, ensure sidebar-specific vars use `--sidebar-*` prefix so they stay dark in both themes
- Toast, breadcrumb, skeleton components — register in `SharedComponentsModule`, not `SharedModule`
- **Never use hardcoded hex colors** (`#fff`, `#000`, `#333`, etc.) in new code — always use CSS variables
- `.green`, `.red`, `.blue_` globals → use `var(--accent-*)` now (not hardcoded)
- New status indicators → use `--status-*` variables + utility classes (`.text-success`, `.bg-danger`, etc.)
- Bulma `.box` → use `.card` + CSS variables instead
- `color-mix(in srgb, ...)` is safe to use for hover/tinted variants — Angular's build pipeline handles it
