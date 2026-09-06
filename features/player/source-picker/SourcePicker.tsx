import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import type { StreamSource } from "@core/types";
import { theme } from "@core/theme";

const { colors, radius } = theme;

interface SourcePickerProps {
  sources: StreamSource[];
  currentKey: string | null;
  onSelect: (source: StreamSource) => void;
}

const LANG_COLORS: Record<string, string> = {
  Latino: theme.colors.primary,
  Español: colors.info,
  Castellano: colors.info,
  Subtitulado: colors.warning,
  Inglés: colors.gray,
};

export function SourcePicker({ sources, currentKey, onSelect }: SourcePickerProps) {
  if (sources.length <= 1) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fuentes disponibles</Text>
      <FlatList
        data={sources}
        keyExtractor={(s) => s.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              item.key === currentKey && styles.itemActive,
              { borderLeftColor: LANG_COLORS[item.language] || colors.gray },
            ]}
            onPress={() => onSelect(item)}
          >
            <View style={styles.info}>
              <Text style={styles.mirror}>{item.mirror}</Text>
              <View style={styles.badges}>
                <Text style={[styles.badge, { backgroundColor: LANG_COLORS[item.language] || colors.gray }]}>
                  {item.language}
                </Text>
                <Text style={styles.badge}>{item.quality}</Text>
              </View>
            </View>
            {item.key === currentKey && <Text style={styles.activeDot}>\u2022</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  title: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: colors.cream },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  itemActive: { backgroundColor: colors.surfaceAlt },
  info: { flex: 1 },
  mirror: { color: colors.text, fontSize: 13, marginBottom: 4 },
  badges: { flexDirection: "row", gap: 6 },
  badge: { fontSize: 11, color: colors.text, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeDot: { color: colors.primary, fontSize: 20 },
});