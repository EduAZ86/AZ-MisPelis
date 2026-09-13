#!/usr/bin/env bash
# Instala misPelis en macOS como app iOS-on-Mac ("Designed for iPad"),
# sin abrir la app Xcode y sin Metro (Release con JS embebido).
# Ver README > macOS (Designed for iPad).
set -euo pipefail

cd "$(dirname "$0")/.."

APP_NAME="misPelis"
WORKSPACE="ios/misPelis.xcworkspace"
SCHEME="misPelis"
DERIVED_DATA="ios/build"
BUILD_APP="${DERIVED_DATA}/Build/Products/Release-iphoneos/${APP_NAME}.app"
INSTALL_DIR="${HOME}/Applications"
INSTALL_APP="${INSTALL_DIR}/${APP_NAME}.app"
DESTINATION="platform=macOS,variant=Designed for iPad"

echo "==> Compilando Release para Mac (Designed for iPad)..."
xcodebuild \
  -workspace "${WORKSPACE}" \
  -scheme "${SCHEME}" \
  -configuration Release \
  -destination "${DESTINATION}" \
  -derivedDataPath "${DERIVED_DATA}" \
  -allowProvisioningUpdates \
  build

if [ ! -d "${BUILD_APP}" ]; then
  echo "No se genero ${BUILD_APP}"
  exit 1
fi

echo "==> Creando wrapper en ${INSTALL_APP} ..."
rm -rf "${INSTALL_APP}"
mkdir -p "${INSTALL_APP}/Wrapper"
cp -R "${BUILD_APP}" "${INSTALL_APP}/Wrapper/${APP_NAME}.app"
ln -s "Wrapper/${APP_NAME}.app" "${INSTALL_APP}/WrappedBundle"

echo "==> Registrando en LaunchServices ..."
LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
"${LSREGISTER}" -f "${INSTALL_APP}"

echo "==> Abriendo la app ..."
open "${INSTALL_APP}"

echo "Listo: ${INSTALL_APP}"
echo "Disponible en Launchpad/Spotlight. Re-ejecuta este script cada ~7 dias (cuenta personal gratuita)."
