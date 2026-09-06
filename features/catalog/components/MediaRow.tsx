import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import type { TmdbMedia } from "@core/types";
import { getImageUrl } from "@services/tmdb";

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
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#fff" style={styles.footerLoader} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 140, marginRight: 12, borderRadius: 8, overflow: "hidden", backgroundColor: "#1e1e1e" },
  poster: { width: "100%", height: 210 },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.7)" },
  title: { color: "#fff", fontSize: 11, fontWeight: "600" },
  year: { color: "#aaa", fontSize: 10 },
  rating: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.7)", borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  ratingText: { color: "#4CAF50", fontSize: 10, fontWeight: "600" },
  rowContainer: { marginBottom: 16 },
  rowTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 8, paddingHorizontal: 4 },
  listContent: { paddingHorizontal: 4 },
  placeholder: { backgroundColor: "#2a2a2a" },
  footerLoader: { padding: 16 },
});