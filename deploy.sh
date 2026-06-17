#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# deploy.sh — Build SIOF + copia a SIOB/src/public/
# Uso:   bash deploy.sh
# Efecto: Compila el frontend y lo copia al backend para
#         servir desde express.static('src/public/')
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SIOF_DIR="$(cd "$(dirname "$0")" && pwd)"
SIOB_DIR="$SIOF_DIR/../SIO2.0_Express"
PUBLIC_DIR="$SIOB_DIR/src/public"

echo "═══════════════════════════════════════════"
echo "  SIO — Build + Deploy Frontend"
echo "═══════════════════════════════════════════"
echo ""

# 1. Build Angular
echo "[1/2] Compilando SIOF (production)..."
cd "$SIOF_DIR"
npm run build -- --configuration production
echo "  ✓ Build completado"
echo ""

# 2. Copiar a SIOB
echo "[2/2] Copiando a SIOB/src/public/..."
rm -rf "$PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR"
cp -r "$SIOF_DIR/dist/sio-fe/"* "$PUBLIC_DIR/"
echo "  ✓ Frontend copiado a $PUBLIC_DIR"
echo ""

echo "═══════════════════════════════════════════"
echo "  LISTO!"
echo "  Frontend: apunta a http://localhost:3000"
echo "  (Reinicia SIOB si es necesario)"
echo "═══════════════════════════════════════════"
