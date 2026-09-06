import React from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "@core/providers/ThemeProvider";

export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= 768;
}

interface GlassPanelProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GlassPanel({ children, style }: GlassPanelProps) {
  const { glass, radius } = useTheme();

  return (
    <View
      style={[
        {
          borderRadius: radius.pill,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 12,
        },
        style,
      ]}
    >
      <View
        style={{
          overflow: "hidden",
          borderRadius: radius.pill,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: glass.border,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: glass.bg }]}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: glass.highlight,
          }}
        />
        {children}
      </View>
    </View>
  );
}
