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

After creating new shared components, restart Angular Language Service (`Ctrl+Shift+P` → "Angular: Restart Angular Language Service").

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
