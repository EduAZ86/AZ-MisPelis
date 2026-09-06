import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import type { StreamSource } from "@core/types";
import { useTheme } from "@core/providers/ThemeProvider";

interface SourcePickerProps {
  sources: StreamSource[];
  currentKey: string | null;
  onSelect: (source: StreamSource) => void;
}

export function SourcePicker({ sources, currentKey, onSelect }: SourcePickerProps) {
  const { colors } = useTheme();
  if (sources.length <= 1) return null;

  const LANG_COLORS: Record<string, string> = {
    Latino: colors.primary,
    Español: colors.info,
    Castellano: colors.info,
    Subtitulado: colors.warning,
    Inglés: colors.gray,
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.cream }]}>Fuentes disponibles</Text>
      <FlatList
        data={sources}
        keyExtractor={(s) => s.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              item.key === currentKey && [styles.itemActive, { backgroundColor: colors.surfaceAlt }],
              { borderLeftColor: LANG_COLORS[item.language] || colors.gray, backgroundColor: colors.surface },
            ]}
            onPress={() => onSelect(item)}
          >
            <View style={styles.info}>
              <Text style={[styles.mirror, { color: colors.text }]}>{item.mirror}</Text>
              <View style={styles.badges}>
                <Text style={[styles.badge, { backgroundColor: LANG_COLORS[item.language] || colors.gray, color: colors.text }]}>
                  {item.language}
                </Text>
                <Text style={[styles.badge, { color: colors.text }]}>{item.quality}</Text>
              </View>
            </View>
            {item.key === currentKey && <Text style={[styles.activeDot, { color: colors.primary }]}>•</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  title: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  itemActive: {},
  info: { flex: 1 },
  mirror: { fontSize: 13, marginBottom: 4 },
  badges: { flexDirection: "row", gap: 6 },
  badge: { fontSize: 11, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeDot: { fontSize: 20 },
});