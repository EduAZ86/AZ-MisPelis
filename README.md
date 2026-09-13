<div align="center">

<img src="assets/icon.png" alt="misPelis" width="180" />

# 🎬 misPelis

![Plataformas](https://img.shields.io/badge/plataformas-iOS%20%7C%20iPadOS%20%7C%20Android%20%7C%20macOS-34d399?style=for-the-badge)
![Versión](https://img.shields.io/badge/versión-1.6.0-1f6feb?style=for-the-badge)

**Aplicación multiplataforma para descubrir y reproducir películas y series**, catalogadas en TMDB, con fuentes de video en español latino.

</div>

---

## 📝 Descripción

misPelis te permite explorar el catálogo completo de **TMDB** (tendencias, descubrimiento, géneros y detalle) y reproducir el contenido resolviendo **fuentes de streaming en español latino** de forma transparente. Todo el motor de resolución de fuentes corre dentro de la app, sin necesidad de un backend propio.

## ✨ Funcionalidades

- **Catálogo TMDB**: tendencias, descubrimiento, búsqueda, géneros y detalle con pósters, fondos y títulos multi-idioma.
- **Reproductor nativo**: soporte HLS con subtítulos y selección de servidor, idioma y calidad.
- **Fuentes en español latino**: resolución automática y priorización por idioma (Latino → Español → Subtitulado) y calidad (1080p → 720p → resto).
- **Favoritos y Continuar viendo**: persistencia local en tu dispositivo.
- **Diseño adaptativo**: experiencia optimizada para teléfono y iPadOS.

## 🏷️ Información del proyecto

| | |
|---|---|
| **Autor** | Eduardo Ayaviri (`eduardo@vert.run`) |
| **Última actualización** | 13 de septiembre de 2026 |
| **Versión actual** | 1.6.0 |

### Mejoras de esta versión (1.6.0) respecto a versiones anteriores

- **Soporte macOS (Designed for iPad)**: la app ahora puede compilarse y ejecutarse en Macs con Apple Silicon usando el binario de iPadOS.
- **Favoritos sincronizados**: estado compartido entre pantallas; marcar/desmarcar un favorito se refleja al instante en la biblioteca.
- **Continuar viendo funcional**: guarda título, póster y progreso reales, y reanuda la reproducción desde donde quedaste.
- **Icono oficial**: la app usa el logo "pelusito" en su icono nativo en iOS y Android.
- **Navegación en tablet corregida**: los botones de navegación ya no desaparecen en Películas/Series.
- **Reproductor mejorado**: al seleccionar un servidor la fuente se carga automáticamente (sin botón "Reproducir").
- **Biblioteca reorganizada**: "Continuar viendo", "Películas favoritas" y "Series favoritas" en secciones independientes.

Consulta el historial completo en [CHANGELOG.md](./CHANGELOG.md).

## 🚀 Instalación y ejecución

### Requisitos

- Node ≥ 20.19
- Xcode ≥ 26.4 (para iOS/macOS). Verificado con Xcode 26.6 desplegando a un iPad con iPadOS 27
- Android SDK 36 (para Android)
- Mac con Apple Silicon (para macOS)
- Cuenta de Apple (la personal **gratuita** permite instalar por cable; la app caduca a los ~7 días)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/EduAZ86/AZ-MisPelis.git
cd AZ-MisPelis

# 2. Instalar dependencias
npm install

# 3. Configurar el token de TMDB
#    Copia `.env.local.example` a `.env.local` y pega tu token:
#    EXPO_PUBLIC_TMDB_API_TOKEN=tu_token_aqui

# 4. Ejecutar
npm start          # Servidor de desarrollo Expo
npm run ios        # Ejecutar en simulador iOS
npm run android    # Ejecutar en emulador Android
```

### macOS (Designed for iPad)

La app corre en macOS mediante el binario de iPadOS ("Designed for iPad"), disponible **solo en Macs con Apple Silicon**. No es un target macOS nativo.

Requisitos: Mac Apple Silicon + Xcode. La primera compilación requiere una cuenta de Apple configurada en Xcode (firma automática).

```bash
# 1. Generar/actualizar el proyecto iOS (si `ios/` no existe)
npx expo prebuild --platform ios

# 2. Levantar Metro
npm start

# 3. Compilar para "My Mac"
npm run macos

# 4. Abrir el proyecto en Xcode para ejecutar
npm run macos:xcode
#    En Xcode: selecciona el scheme `misPelis` y el destino
#    "My Mac (Designed for iPad)", y pulsa Run (⌘R).
```

> Nota: ejecutar la app con `open` desde la terminal no funciona para builds de desarrollo; macOS instala y lanza las apps de iPad a través de Xcode.

### Release en iPad físico

Compila una app **standalone** (con el JS embebido, sin necesitar Metro) y la instala por cable en el iPad. Requiere que el iPad tenga **Developer Mode** activado y esté emparejado con este Mac.

```bash
# 1. Compilar (Release, firma automática) e instalar en el iPad
npm run ipad:release

# Alternativa manual
xcodebuild -workspace ios/misPelis.xcworkspace -scheme misPelis \
  -configuration Release \
  -destination 'platform=iOS,name=iPad Eduardo' \
  -derivedDataPath ios/build -allowProvisioningUpdates build
xcrun devicectl device install app --device 'iPad Eduardo' \
  ios/build/Build/Products/Release-iphoneos/misPelis.app

# 2. Tras la primera instalación, confía en el perfil de desarrollador en el iPad:
#    Ajustes > General > VPN y gestión de dispositivos > App de desarrollador > Confiar
```

Notas:
- Verificado con **Xcode 26.6** sobre un iPad con **iPadOS 27**.
- Con cuenta personal gratuita la app **caduca a los ~7 días**; reinstálala volviendo a correr el comando.
- Para compilar en **Release** para este Mac ("My Mac (Designed for iPad)"): `npm run macos:release` (se ejecuta desde Xcode).
- Evita tener corriendo otras apps con el bundle id `com.mispelis.app` (p. ej. la app Electron anterior) al lanzar en el Mac.

## ⚠️ Aviso legal

Este proyecto se ofrece con fines educativos y de uso personal. El contenido reproducido proviene de fuentes de terceros (mirrors) no controladas por el proyecto. Respeta la legislación aplicable y los términos de servicio de los proveedores en tu región.

---

<div align="center">

Hecho con ❤️ por Eduardo Ayaviri para el disfrute del cine y las series.

</div>
