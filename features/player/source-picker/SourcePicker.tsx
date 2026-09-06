import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import type { StreamSource } from "@core/types";

interface SourcePickerProps {
  sources: StreamSource[];
  currentKey: string | null;
  onSelect: (source: StreamSource) => void;
}

const LANG_COLORS: Record<string, string> = {
  Latino: "#4CAF50",
  Español: "#2196F3",
  Castellano: "#2196F3",
  Subtitulado: "#FF9800",
  Inglés: "#9E9E9E",
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
              { borderLeftColor: LANG_COLORS[item.language] || "#666" },
            ]}
            onPress={() => onSelect(item)}
          >
            <View style={styles.info}>
              <Text style={styles.mirror}>{item.mirror}</Text>
              <View style={styles.badges}>
                <Text style={[styles.badge, { backgroundColor: LANG_COLORS[item.language] || "#666" }]}>
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
  title: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#fff" },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  itemActive: { backgroundColor: "#2a2a2a" },
  info: { flex: 1 },
  mirror: { color: "#fff", fontSize: 13, marginBottom: 4 },
  badges: { flexDirection: "row", gap: 6 },
  badge: { fontSize: 11, color: "#fff", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeDot: { color: "#4CAF50", fontSize: 20 },
});