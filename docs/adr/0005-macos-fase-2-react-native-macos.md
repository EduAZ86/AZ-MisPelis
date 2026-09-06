# ADR-0005: macOS en fase 2 vía react-native-macos

- Estado: Aceptada
- Fecha: 2026-09-05

## Contexto

El requisito incluye macOS. Con Expo, el soporte de macOS depende del fork
`react-native-macos` (mantenido por Microsoft), cuyo soporte dentro del ecosistema
Expo es parcial y menos maduro que iOS/Android.

## Decisión

MVP: **iOS + iPadOS + Android**. macOS se aborda en **fase 2** con
`react-native-macos`, reutilizando el mismo código JS/TS (capas `features/`,
`services/`, `core/` son agnósticas de plataforma).

## Consecuencias

- ✅ El MVP no se retrasa por el riesgo de la plataforma menos madura.
- ✅ El diseño por capas garantiza que macOS reutilice todo excepto pantallas/navegación específicas.
- ⚠️ Riesgo documentado: módulos nativos usados en MVP deben tener soporte `apple`/macOS o alternativas, para no bloquear la fase 2 (react-native-video histórico: soporte macOS; se validará en fase 2).
- Plan B si RN-macos fracasa: evaluar Mac Catalyst con un shell nativo mínimo que consuma los mismos `services/`.
