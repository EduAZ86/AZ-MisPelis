import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, useWindowDimensions, ViewToken } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { TmdbMedia } from "@core/types";
import { getImageUrl } from "@services/tmdb";
import { useGetMovieGenres, useGetSeriesGenres } from "@features/catalog";
import { useTheme } from "@core/providers/ThemeProvider";

interface HeroCardProps {
  items: TmdbMedia[];
  onPressItem: (item: TmdbMedia) => void;
}

export function HeroCard({ items, onPressItem }: HeroCardProps) {
  const { colors, radius } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const listRef = useRef<FlatList<TmdbMedia>>(null);
  const [index, setIndex] = useState(0);

  const { data: movieGenres } = useGetMovieGenres();
  const { data: seriesGenres } = useGetSeriesGenres();
  const genreMap = new Map<number, string>();
  movieGenres?.forEach((g) => genreMap.set(g.id, g.name));
  seriesGenres?.forEach((g) => genreMap.set(g.id, g.name));

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => {
      const next = (index + 1) % items.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }, 6000);
    return () => clearInterval(timer);
  }, [index, items.length]);

  const onViewableChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<TmdbMedia>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setIndex(viewableItems[0].index);
      }
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: TmdbMedia }) => {
      const backdrop = getImageUrl(item.backdrop_path, "original");
      const title = item.title ?? item.name ?? "Sin título";
      const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
      const genres = (item.genre_ids ?? [])
        .map((id) => genreMap.get(id))
        .filter(Boolean)
        .slice(0, 3)
        .join(" · ");

      return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => onPressItem(item)} style={[styles.card, { width: width - 32, backgroundColor: colors.surface }]}>
          {backdrop ? (
            <Image source={{ uri: backdrop }} style={styles.backdrop} resizeMode="cover" />
          ) : (
            <View style={[styles.backdrop, { backgroundColor: colors.surfaceAlt }]} />
          )}
          <View style={styles.fade} />
          <View style={styles.content}>
            <View style={[styles.badge, { borderRadius: radius.pill }]}>
              <Text style={[styles.badgeText, { color: colors.gold }]}>Tendencias</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            <Text style={styles.meta} numberOfLines={1}>
              {[year, genres].filter(Boolean).join("  ·  ")}
            </Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.watchBtn, { borderRadius: radius.pill }]}
                onPress={() => router.push(`/${item.media_type === "tv" ? "series" : "movie"}/${item.id}`)}
              >
                <Ionicons name="play" size={16} color="#111" />
                <Text style={styles.watchText}>Ver ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, genreMap.size, colors, radius]
  );

  if (!items.length) {
    return <View style={[styles.card, { width: width - 32, height: 260, backgroundColor: colors.surfaceAlt }]} />;
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `${item.media_type}-${item.id}`}
        renderItem={renderItem}
        snapToInterval={width - 32}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      />
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && [styles.dotActive, { backgroundColor: colors.text }]]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  listContent: { paddingHorizontal: 16 },
  card: {
    height: 240,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
  },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  fade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  content: { position: "absolute", left: 20, right: 20, bottom: 20 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(233,180,76,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(233,180,76,0.4)",
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  title: { color: "#F8F4EE", fontSize: 22, fontWeight: "800", textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 8 },
  meta: { color: "#D9C9A8", fontSize: 12, marginTop: 4 },
  actionsRow: { flexDirection: "row", marginTop: 12 },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  watchText: { color: "#111", fontSize: 13, fontWeight: "700" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.25)" },
  dotActive: { width: 18 },
});

