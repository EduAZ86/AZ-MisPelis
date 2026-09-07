import React from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GlassPanel } from "@core/components/Glass";
import { useTheme } from "@core/providers/ThemeProvider";

interface NavHeaderProps {
  title?: string;
  showBack?: boolean;
  showFavorites?: boolean;
  logo?: boolean;
  rightElement?: React.ReactNode;
}

export function NavHeader({ title, showBack = false, showFavorites = false, logo = false, rightElement }: NavHeaderProps) {
  const router = useRouter();
  const { colors, glass, radius } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  if (isTablet) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showBack ? (
        <GlassPanel style={styles.iconBtn}>
          <Ionicons
            name="chevron-back"
            size={18}
            color={glass.active}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            suppressHighlighting
          />
        </GlassPanel>
      ) : null}

      {logo ? (
        <Image
          source={require("../../assets/pelusito.png")}
          style={[styles.logo, { borderColor: colors.primary, borderRadius: radius.md }]}
        />
      ) : null}

      {title ? <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text> : null}

      <View style={styles.spacer} />

      {rightElement}

      {showFavorites ? (
        <GlassPanel style={styles.iconBtn}>
          <Ionicons
            name="heart"
            size={18}
            color={glass.active}
            onPress={() => router.push("/favorites")}
            suppressHighlighting
          />
        </GlassPanel>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
  },
  logo: { width: 36, height: 36, borderWidth: 1.5 },
  title: { fontSize: 17, fontWeight: "700", flexShrink: 1 },
  spacer: { flex: 1 },
});