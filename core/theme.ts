export const theme = {
  colors: {
    // Fondo negro con matiz rojizo (sala de cine)
    background: "#0B0607",
    surface: "#1C0F11",
    surfaceAlt: "#2A1518",
    border: "#3E2226",
    borderLight: "#5A2A2E",
    // Rojo cine (alfombra / cortina del logo)
    primary: "#C62828",
    primaryDark: "#7F1616",
    primarySoft: "rgba(198, 40, 40, 0.18)",
    // Crema de palomitas
    cream: "#F3E7C9",
    creamMuted: "#D9C9A8",
    // Dorado (borda del logo)
    gold: "#E9B44C",
    // Texto
    text: "#F8F4EE",
    textMuted: "#B39B94",
    textFaint: "#7A655F",
    // Utilidades
    danger: "#E53935",
    info: "#2196F3",
    warning: "#FF9800",
    gray: "#9E9E9E",
    overlay: "rgba(11, 6, 7, 0.85)",
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    pill: 999,
  },
} as const;

export type Theme = typeof theme;
