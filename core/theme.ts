const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

const dark = {
  colors: {
    background: "#000000",
    surface: "#1C0F11",
    surfaceAlt: "#2A1518",
    border: "#3E2226",
    borderLight: "#5A2A2E",
    primary: "#C62828",
    primaryDark: "#7F1616",
    primarySoft: "rgba(198, 40, 40, 0.18)",
    cream: "#F3E7C9",
    creamMuted: "#D9C9A8",
    gold: "#E9B44C",
    text: "#F8F4EE",
    textMuted: "#B39B94",
    textFaint: "#7A655F",
    danger: "#E53935",
    info: "#2196F3",
    warning: "#FF9800",
    gray: "#9E9E9E",
    overlay: "rgba(0, 0, 0, 0.85)",
  },
  glass: {
    bg: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.22)",
    highlight: "rgba(255, 255, 255, 0.18)",
    active: "#FFFFFF",
    inactive: "rgba(255, 255, 255, 0.5)",
  },
  radius,
} as const;

const light = {
  colors: {
    background: "#F4EFE6",
    surface: "#FFFFFF",
    surfaceAlt: "#EBE4D8",
    border: "#E0D6C8",
    borderLight: "#D2C6B6",
    primary: "#C62828",
    primaryDark: "#7F1616",
    primarySoft: "rgba(198, 40, 40, 0.12)",
    cream: "#3D2A1C",
    creamMuted: "#6E5F5A",
    gold: "#C4922A",
    text: "#1C1416",
    textMuted: "#6E5F5A",
    textFaint: "#9A8B86",
    danger: "#C62828",
    info: "#1565C0",
    warning: "#E65100",
    gray: "#8D8D8D",
    overlay: "rgba(244, 239, 230, 0.82)",
  },
  glass: {
    bg: "rgba(255, 255, 255, 0.55)",
    border: "rgba(0, 0, 0, 0.08)",
    highlight: "rgba(255, 255, 255, 0.8)",
    active: "#1C1416",
    inactive: "rgba(0, 0, 0, 0.4)",
  },
  radius,
} as const;

export const themes = { dark, light } as const;
export type ThemeMode = keyof typeof themes;
export type ThemeTokens = {
  colors: { [K in keyof typeof dark.colors]: string };
  glass: { [K in keyof typeof dark.glass]: string };
  radius: typeof radius;
};

export const theme = dark;

export const APP_META = {
  version: "1.5.2",
  releaseDate: "6 de septiembre de 2026",
  developer: {
    name: "Eduardo Ayaviri",
    role: "Frontend & Mobile Developer",
  },
} as const;