import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@core/theme";

const { colors, radius } = theme;

interface NavHeaderProps {
  title?: string;
  showBack?: boolean;
  showFavorites?: boolean;
  logo?: boolean;
  rightElement?: React.ReactNode;
}

export function NavHeader({ title, showBack = false, showFavorites = false, logo = false, rightElement }: NavHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      {showBack ? (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        >
          <Text style={styles.icon}>‹</Text>
        </TouchableOpacity>
      ) : null}

      {logo ? <Image source={require("../../assets/pelusito.png")} style={styles.logo} /> : null}

      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}

      <View style={styles.spacer} />

      {rightElement}

      {showFavorites ? (
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/favorites")}>
          <Text style={styles.icon}>♥</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { color: colors.cream, fontSize: 22, fontWeight: "700", marginTop: -2 },
  logo: { width: 40, height: 40, borderRadius: radius.md, borderWidth: 2, borderColor: colors.primary },
  title: { color: colors.text, fontSize: 17, fontWeight: "700", flexShrink: 1 },
  spacer: { flex: 1 },
});