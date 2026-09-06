import React, { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useGetSearch } from "@features/catalog";
import { getImageUrl } from "@services/tmdb";
import { NavHeader } from "@core/components/NavHeader";
import { theme } from "@core/theme";
import type { TmdbMedia } from "@core/types";

const { colors, radius } = theme;

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
    useGetSearch(query);

  const results = data?.pages.flat() ?? [];

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = ({ item }: { item: TmdbMedia }) => {
    const poster = getImageUrl(item.poster_path, "w200");
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => router.push(`/${item.media_type === "tv" ? "series" : item.media_type}/${item.id}`)}
      >
        {poster ? (
          <Image source={{ uri: poster }} style={styles.resultPoster} />
        ) : (
          <View style={[styles.resultPoster, styles.placeholder]} />
        )}
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={1}>{item.title ?? item.name ?? "Sin título"}</Text>
          <Text style={styles.resultMeta}>
            {(item.release_date ?? item.first_air_date ?? "").slice(0, 4) || "—"} · {item.vote_average?.toFixed(1) ?? "—"}
          </Text>
          <Text style={styles.resultType}>{item.media_type === "movie" ? "Película" : "Serie"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavHeader showBack title="Buscar" />
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Buscar películas y series..."
          value={query}
          onChangeText={handleSearch}
          autoFocus
          placeholderTextColor={colors.textFaint}
        />
      </View>
      {query.length >= 2 && (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={hasNextPage && isFetchingNextPage ? <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} /> : null}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
      {query.length >= 2 && !isLoading && !results.length && <Text style={styles.empty}>No se encontraron resultados</Text>}
      {isError && <Text style={styles.error}>Error al buscar</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: { padding: 12 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContent: { padding: 12, paddingBottom: 24 },
  resultItem: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  resultPoster: { width: 80, height: 120 },
  placeholder: { backgroundColor: colors.surfaceAlt },
  resultInfo: { flex: 1, padding: 12, justifyContent: "center" },
  resultTitle: { color: colors.text, fontSize: 15, fontWeight: "600", marginBottom: 4 },
  resultMeta: { color: colors.textMuted, fontSize: 13 },
  resultType: { color: colors.primary, fontSize: 12, marginTop: 4 },
  separator: { height: 8 },
  footerLoader: { padding: 16 },
  empty: { color: colors.textFaint, textAlign: "center", marginTop: 24 },
  error: { color: colors.danger, textAlign: "center", marginTop: 24 },
});