import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import type { TmdbMedia } from "@core/types";
import { getImageUrl } from "@services/tmdb";
import { theme } from "@core/theme";

const { colors, radius } = theme;

interface MediaCardProps {
  item: TmdbMedia;
  onPress: () => void;
}

export function MediaCard({ item, onPress }: MediaCardProps) {
  const title = item.title ?? item.name ?? "Sin título";
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  const poster = getImageUrl(item.poster_path, "w342");

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {poster ? (
        <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.placeholder]} />
      )}
      <View style={styles.overlay}>
        <Text style={styles.title}>{title}</Text>
        {year && <Text style={styles.year}>{year}</Text>}
      </View>
      <View style={styles.rating}>
        <Text style={styles.ratingText}>{item.vote_average?.toFixed(1) ?? "—"}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface MediaRowProps {
  title: string;
  data: TmdbMedia[];
  onPressItem: (item: TmdbMedia) => void;
  loading?: boolean;
  onEndReached?: () => void;
}

export function MediaRow({ title, data, onPressItem, loading, onEndReached }: MediaRowProps) {
  if (!data.length && !loading) return null;

  return (
    <View style={styles.rowContainer}>
      <Text style={styles.rowTitle}>{title}</Text>
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
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 140, marginRight: 12, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  poster: { width: "100%", height: 210 },
  placeholder: { backgroundColor: colors.surfaceAlt },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: colors.overlay },
  title: { color: colors.text, fontSize: 11, fontWeight: "600" },
  year: { color: colors.creamMuted, fontSize: 10 },
  rating: { position: "absolute", top: 4, right: 4, backgroundColor: colors.overlay, borderRadius: radius.sm, paddingHorizontal: 4, paddingVertical: 1 },
  ratingText: { color: colors.gold, fontSize: 10, fontWeight: "600" },
  rowContainer: { marginBottom: 16 },
  rowTitle: { color: colors.cream, fontSize: 16, fontWeight: "700", marginBottom: 8, paddingHorizontal: 4 },
  listContent: { paddingHorizontal: 4 },
  footerLoader: { padding: 16 },
});