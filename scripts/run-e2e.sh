#!/usr/bin/env bash
# Tests E2E con Maestro (ver docs/e2e.md para requisitos)
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v maestro &> /dev/null; then
  echo "❌ Maestro CLI no está instalado."
  echo "   Instalar con: brew tap mobile-devops/tap && brew install mobile-devops-cli"
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "▶ Ejecutando todos los flujos de .maestro/"
  maestro test .maestro/
else
  echo "▶ Ejecutando: $*"
  maestro test "$@"
fi
