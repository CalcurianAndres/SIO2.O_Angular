# SIOF — Angular frontend for SIO (Sistema Integral de Operación)

## Quick start

```bash
npm install --legacy-peer-deps   # required: many peer dep conflicts
ng serve                         # dev server at http://localhost:4200
ng build --configuration development  # faster dev build
npm run build                    # production build (strict budgets: 5MB/8MB)
```

Monorepo root at `../package.json` — `npm start` launches both SIOB (backend) and SIOF concurrently.

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
- **API**: `https://192.168.0.22/api/` — token in `localStorage.getItem('TOKEN_SESSION')`
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
    components/      # Reusable: app-page-layout, app-section-header, app-modal
    shared.module.ts # Exports SafePipe, NumberFormatDirective, SharedComponentsModule
  models/index.ts    # Barrel export from compras/models
```

## Shared components

Import `SharedModule` in any feature module to use:
- `<app-page-layout>` — wraps content in container > card > .darker
- `<app-section-header>` — inputs: title, description, icon, color ('red'|'green'|'purple'|'blue'|'orange'|'teal'|'navy'), gradient
  - Module colors: Compras=green, Almacen=orange, Laboratorio=red, Producción (fases+maquinas+ordenes prod)=purple, Ventas=blue, Empleados=teal, Dashboard=navy
- `<app-modal>` — inputs: visible, title, longClass; output: onClose
- `<app-toast>` — auto-included in app component; use `ToastService` to push messages
- `<app-breadcrumb>` — auto-included in page-layout; builds from URL segments
- `<app-skeleton>` — loading placeholder (inputs: type='text'|'card'|'table'|'circle', rows, width)

After creating new shared components, restart Angular Language Service (`Ctrl+Shift+P` → "Angular: Restart Angular Language Service").

## Theme / Dark Mode

- Toggle in profile menu (user avatar in sidebar). Preference saved in `localStorage.DARK_MODE`.
- CSS custom properties in `:root` (dark) and `[data-theme='light']` (light).
- **Sidebar is always dark** — uses `--sidebar-*` variables (never overridden in light theme):
  - `--sidebar-bg: rgb(38,52,61)`, `--sidebar-text`, `--sidebar-text-heading`, `--sidebar-text-muted`, `--sidebar-border`, `--sidebar-accent`, `--sidebar-elevated`
- **`.darker` area**: `--bg-secondary: #3c3f41` (dark) / `#eef2f6` (light, bluish-gray)
- All Bulma components overridden with CSS variables in styles.scss (card, table, modal, input, button, message, tabs, menu, etc.)
- Modal z-index: `10000` (above sidebar's `1000`)
- Route transition: fade animation via `BrowserAnimationsModule` + `shared/animations.ts`

## Sidebar

CSS custom property `--sidebar-width` (65px collapsed, 240px expanded). All `.container_` and `.darker` elements use `calc(100vw - var(--sidebar-width) - 30px)` for responsive layout.

## Tests

No test files exist. `ng test` runs Karma/Jasmine framework but has nothing to execute.

## Key gotchas

- `npm install` **requires** `--legacy-peer-deps` (pre-existing conflicts in pdfmake/moment peer deps)
- Import paths use relative `../shared/...` (not `src/app/...`)
- `noImplicitAny: false` — `any` types are allowed without annotation
- The CSS class `.darker` is position-dependent on `--sidebar-width` (not a fixed width)
- Never duplicate component declarations across modules (Angular 16 throws)
- Service Worker auto-registers on build — no manual registration in `main.ts`
- When adding new CSS variables for themes, ensure sidebar-specific vars use `--sidebar-*` prefix so they stay dark in both themes
- Toast, breadcrumb, skeleton components — register in `SharedComponentsModule`, not `SharedModule`

## Docker / Entorno

### Estructura
```
Nueva carpeta/
├── docker-compose.yml    # Orquesta SIOF + SIOB + MongoDB
├── setup.bat             # Build SIOF → copia a SIOB → docker-compose up
├── SIOF/
│   ├── Dockerfile        # nginx multi-stage
│   ├── nginx.conf        # SPA + proxy /api + /socket.io a siob:3000
│   └── .dockerignore
└── SIOB/
    ├── Dockerfile        # Express multi-stage (ya existía)
    ├── docker-compose.yml# Solo SIOB + MongoDB (independiente)
    └── .dockerignore
```

### Desarrollo en casa (hot-reload)
```bash
# Terminal 1 — MongoDB
docker run -d --name mongo-sio -p 27017:27017 mongo

# Terminal 2 — Backend
cd SIOB && npm run dev          # nodemon en src/ (puerto 3000)

# Terminal 3 — Frontend
cd SIOF && npm start            # ng serve (puerto 4200)
```

El environment de SIOF detecta automáticamente si está en ng serve (puerto 4200)
y apunta a `http://localhost:3000`. En producción usa URLs relativas.

### Probar todo junto (Docker)
```bash
setup.bat   # build SIOF → copia a SIOB/public/ → docker-compose up -d
# Abrir http://localhost
```

### SSL
SIOB intenta cargar certs de `c:/certificado/server/`. Si no existen (casa),
cae automáticamente a HTTP. Forzar HTTPS con env vars:
`SSL_KEY`, `SSL_CERT`, `SSL_CA`.

### Environment auto-detection (SIOF)
En `src/environments/environment.ts`:
- Puerto 4200 (ng serve) → `http://localhost:3000`
- Host 192.168.0.22 (oficina) → `https://192.168.0.22`
- Cualquier otro (Docker/producción) → URLs relativas (mismo origen)
