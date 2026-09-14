<div align="center">

<img src="assets/icon.png" alt="misPelis" width="180" />

# 🎬 misPelis

![Plataformas](https://img.shields.io/badge/plataformas-iOS%20%7C%20iPadOS%20%7C%20Android-34d399?style=for-the-badge)
![Versión](https://img.shields.io/badge/versión-1.5.3-1f6feb?style=for-the-badge)

**Aplicación multiplataforma para descubrir y reproducir películas y series**, catalogadas en TMDB, con fuentes de video en español latino.

[![Descargar APK](https://img.shields.io/badge/⬇️%20Descargar%20APK%20Android-1.5.3-3ddc84?style=for-the-badge)](https://github.com/EduAZ86/AZ-MisPelis/releases/download/v1.5.3/misPelis-1.5.3.apk)

</div>

---

## 📥 Descargar

**[⬇️ Descargar misPelis 1.5.3 para Android (APK)](https://github.com/EduAZ86/AZ-MisPelis/releases/download/v1.5.3/misPelis-1.5.3.apk)** (~118 MB)

- **Versión:** 1.5.3 (`versionCode 10503`)
- **Requisitos:** Android 7.0+ / Android TV
- **Instalación:** descarga el APK en tu dispositivo, habilita "Instalar apps de origen desconocido" y ábrelo para instalar.
- **Nota:** el APK está firmado con la debug keystore; pensado para uso personal y pruebas, no para Google Play.

Todas las versiones están disponibles en la página de [Releases](https://github.com/EduAZ86/AZ-MisPelis/releases).

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

|                          |                                              |
| ------------------------ | -------------------------------------------- |
| **Autor**                | Eduardo Ayaviri (`eduardoayaviri@gmail.com`) |
| **Última actualización** | 13 de septiembre de 2026                     |
| **Versión actual**       | 1.5.3                                        |

### Mejoras de esta versión (1.5.3) respecto a versiones anteriores

- **Favoritos con estado compartido**: marcar o desmarcar un favorito en el detalle de una película o serie ahora se refleja al instante en todas las pantallas, incluida la tab Biblioteca (antes requería reiniciar la app).
- **"Continuar viendo" con datos reales**: el progreso de reproducción guarda el título, póster y metascore reales, y se reanuda desde la posición exacta donde lo dejaste.
- **Sincronización del reproductor**: el progreso se guarda cada ~5 s durante la reproducción y la entrada se limpia automáticamente al terminar el video.
- **Icono oficial**: la app usa el logo "pelusito" en su icono nativo en iOS y Android.
- **Navegación en tablet corregida**: los botones de navegación ya no desaparecen en Películas/Series, y ahora siempre hay una forma de volver desde cualquier pantalla.
- **Filtros y búsqueda integrados en la barra de navegación** (iPadOS).
- **Reproductor mejorado**: al seleccionar un servidor la fuente se carga automáticamente (sin botón "Reproducir"), y el video ya no se recorta en iPad.
- **Metascore**: puedes ver y ordenar el catálogo por puntuación Metascore.

Consulta el historial completo en [CHANGELOG.md](./CHANGELOG.md).

## 🚀 Instalación y ejecución

### Requisitos

- Node ≥ 20.19
- Xcode ≥ 26.4 (para iOS)
- Android SDK 36 (para Android)

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

## ⚠️ Aviso legal

Este proyecto se ofrece con fines educativos y de uso personal. El contenido reproducido proviene de fuentes de terceros (mirrors) no controladas por el proyecto. Respeta la legislación aplicable y los términos de servicio de los proveedores en tu región.

---

<div align="center">

Hecho con ❤️ por Eduardo Ayaviri para el disfrute del cine y las series.

</div>
