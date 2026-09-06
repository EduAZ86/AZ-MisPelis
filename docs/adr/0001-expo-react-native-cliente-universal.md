# ADR-0001: Cliente universal Expo (React Native) como base multiplataforma

- Estado: Aceptada
- Fecha: 2026-09-05

## Contexto

Necesitamos una app que corra en iOS, iPadOS, Android (MVP) y macOS (fase 2).
La app anterior (`misPelis/`, Next.js + Electron) solo corre en macOS porque
empaqueta un servidor Next standalone, Chromium (Playwright) y Electron.

## Decisión

Usar **Expo SDK 56** con **expo-router** y **React Native 0.85 / React 19.2.3**.

## Alternativas

- **Flutter:** excelente cobertura multiplataforma pero exige reescribir todo en Dart; no se reutiliza el conocimiento ni el TypeScript existente.
- **Capacitor (envolver Next.js):** mínimo rework pero UX frágil (WKWebView, HLS con headers custom, riesgo de rechazo en tiendas).

## Consecuencias

- Una sola base TypeScript; navegación file-based equivalente a Next.js App Router (curva de aprendizaje mínima para el equipo).
- macOS en fase 2 vía `react-native-macos` (ADR-0005); es el punto menos maduro del stack.
- Requisitos de build: Node ≥ 20.19, Xcode ≥ 26.4, iOS mínimo 16.4 (datos de la tabla de compatibilidad de SDK 56).
- Requiere cuenta Apple Developer para distribución iOS.
