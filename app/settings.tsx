import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { NavHeader } from "@core/components/NavHeader";
import { GlassPanel } from "@core/components/Glass";
import { useTheme } from "@core/providers/ThemeProvider";
import { APP_META } from "@core/theme";

export default function SettingsScreen() {
  const { colors, radius, glass, mode, setMode } = useTheme();
  const styles = createStyles(colors, radius, glass);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const version = Constants.expoConfig?.version ?? APP_META.version;

  return (
    <SafeAreaView style={styles.container}>
      <NavHeader showBack title="Ajustes" />

      {isTablet && (
        <TouchableOpacity
          style={[styles.tabletBack, { top: insets.top + 8, left: 16 }]}
          onPress={() => router.back()}
        >
          <GlassPanel style={styles.tabletBackBtn}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={glass.active}
              suppressHighlighting
            />
          </GlassPanel>
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={[styles.body, isTablet && { paddingTop: 56 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Apariencia</Text>
        <View style={styles.row}>
          <ModeChip
            label="Nocturno"
            icon="moon"
            active={mode === "dark"}
            onPress={() => setMode("dark")}
            colors={colors}
            radius={radius}
          />
          <ModeChip
            label="Diurno"
            icon="sunny"
            active={mode === "light"}
            onPress={() => setMode("light")}
            colors={colors}
            radius={radius}
          />
        </View>

        <Text style={styles.section}>Acerca de</Text>
        <View style={styles.card}>
          <InfoRow label="Versión" value={version} colors={colors} />
          <View style={styles.divider} />
          <InfoRow label="Fecha" value={APP_META.releaseDate} colors={colors} />
        </View>

        <Text style={styles.section}>Desarrollador</Text>
        <View style={styles.card}>
          <Text style={styles.devName}>{APP_META.developer.name}</Text>
          <Text style={styles.devRole}>{APP_META.developer.role}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeChip({
  label,
  icon,
  active,
  onPress,
  colors,
  radius,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
  radius: ReturnType<typeof useTheme>["radius"];
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 14,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: active ? colors.gold : colors.border,
          backgroundColor: active ? colors.primarySoft : colors.surface,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={active ? colors.gold : colors.textMuted}
      />
      <Text
        style={{
          color: active ? colors.text : colors.textMuted,
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
        {value}
      </Text>
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>["colors"],
  radius: ReturnType<typeof useTheme>["radius"],
  glass: ReturnType<typeof useTheme>["glass"],
) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    body: { padding: 16, paddingTop: 26, paddingBottom: 40 },
    section: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: 10,
      marginTop: 8,
    },
    row: { flexDirection: "row", gap: 10, marginBottom: 24 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: glass.border,
      padding: 16,
      gap: 8,
      marginBottom: 24,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    devName: { color: colors.text, fontSize: 17, fontWeight: "800" },
    devRole: { color: colors.textMuted, fontSize: 13, fontWeight: "500" },
    tabletBack: {
      position: "absolute",
      zIndex: 10,
    },
    tabletBackBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
  });
}
