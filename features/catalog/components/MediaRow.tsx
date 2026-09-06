import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions } from "react-native";
import type { TmdbMedia } from "@core/types";
import { getImageUrl } from "@services/tmdb";
import { useTheme } from "@core/providers/ThemeProvider";

interface MediaCardProps {
  item: TmdbMedia;
  onPress: () => void;
}

export function MediaCard({ item, onPress }: MediaCardProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = width >= 768 ? 180 : 150;
  const title = item.title ?? item.name ?? "Sin título";
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  const poster = getImageUrl(item.poster_path, "w342");

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { width: cardWidth, backgroundColor: colors.surface }]}>
      {poster ? (
        <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, { backgroundColor: colors.surfaceAlt }]} />
      )}
      <View style={styles.overlay}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.year, { color: colors.creamMuted }]}>{year || "—"}</Text>
      </View>
      <View style={styles.rating}>
        <Text style={[styles.ratingText, { color: colors.gold }]}>★ {item.vote_average?.toFixed(1) ?? "—"}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
}

export function SectionHeader({ title, onViewAll }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.headerRow}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      {onViewAll ? (
        <TouchableOpacity onPress={onViewAll} hitSlop={8}>
          <Text style={[styles.viewAll, { color: colors.textMuted }]}>Ver todo ›</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

interface MediaRowProps {
  title?: string;
  onViewAll?: () => void;
  data: TmdbMedia[];
  onPressItem: (item: TmdbMedia) => void;
  loading?: boolean;
  onEndReached?: () => void;
}

export function MediaRow({ title, onViewAll, data, onPressItem, loading, onEndReached }: MediaRowProps) {
  const { colors } = useTheme();
  if (!data.length && !loading) return null;

  return (
    <View style={styles.rowContainer}>
      {title ? (
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
          {onViewAll ? (
            <TouchableOpacity onPress={onViewAll} hitSlop={8}>
              <Text style={[styles.viewAll, { color: colors.textMuted }]}>Ver todo ›</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
      <FlatList
        data={data}
        keyExtractor={(item) => `${item.media_type}-${item.id}`}
        renderItem={({ item }) => (
          <MediaCard item={item} onPress={() => onPressItem(item)} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={colors.gold} style={styles.footerLoader} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: 14,
    borderRadius: 16,
    overflow: "hidden",
  },
  poster: { width: "100%", aspectRatio: 2 / 3 },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  title: { fontSize: 12, fontWeight: "700", lineHeight: 16 },
  year: { fontSize: 10, marginTop: 2 },
  rating: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  ratingText: { fontSize: 11, fontWeight: "700" },
  rowContainer: { marginBottom: 24 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  viewAll: { fontSize: 13, fontWeight: "500" },
  listContent: { paddingHorizontal: 16 },
  footerLoader: { padding: 16 },
});