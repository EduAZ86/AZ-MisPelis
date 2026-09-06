import React from "react";
import { Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@core/providers/ThemeProvider";

interface GenreChipDef {
  id: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: "movie" | "tv";
}

const CHIPS: GenreChipDef[] = [
  { id: 28, label: "Acción", icon: "flash", type: "movie" },
  { id: 12, label: "Aventura", icon: "rocket", type: "movie" },
  { id: 18, label: "Drama", icon: "sad", type: "movie" },
  { id: 35, label: "Comedia", icon: "happy", type: "movie" },
  { id: 878, label: "Ciencia Ficción", icon: "planet", type: "movie" },
  { id: 27, label: "Terror", icon: "skull", type: "movie" },
  { id: 16, label: "Animación", icon: "color-palette", type: "movie" },
];

export function GenreChips() {
  const router = useRouter();
  const { colors, radius, glass } = useTheme();

  const handlePress = (chip: GenreChipDef) => {
    const route = chip.type === "movie" ? "/peliculas" : "/series";
    router.push(`${route}?genre=${chip.id}` as never);
  };

  return (
    <FlatList
      data={CHIPS}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(chip) => `${chip.type}-${chip.id}`}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: glass.bg,
              borderColor: glass.border,
              borderRadius: radius.pill,
            },
          ]}
          onPress={() => handlePress(item)}
          activeOpacity={0.8}
        >
          <Ionicons name={item.icon} size={16} color={colors.gold} />
          <Text style={[styles.chipText, { color: colors.text }]}>{item.label}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16, gap: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { fontSize: 12, fontWeight: "600" },
});