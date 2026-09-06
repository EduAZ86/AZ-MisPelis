import React, { useState, useCallback } from "react";
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useGetSearch } from "@features/catalog";
import { getImageUrl } from "@services/tmdb";
import type { TmdbMedia } from "@core/types";

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
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Buscar películas y series..."
          value={query}
          onChangeText={handleSearch}
          autoFocus
          placeholderTextColor="#666"
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
          ListFooterComponent={hasNextPage && isFetchingNextPage ? <ActivityIndicator size="small" color="#fff" style={styles.footerLoader} /> : null}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
      {query.length >= 2 && !isLoading && !results.length && <Text style={styles.empty}>No se encontraron resultados</Text>}
      {isError && <Text style={styles.error}>Error al buscar</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  searchBar: { padding: 12 },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
  },
  listContent: { padding: 12, paddingBottom: 24 },
  resultItem: { flexDirection: "row", backgroundColor: "#1e1e1e", borderRadius: 8, overflow: "hidden" },
  resultPoster: { width: 80, height: 120 },
  placeholder: { backgroundColor: "#2a2a2a" },
  resultInfo: { flex: 1, padding: 12, justifyContent: "center" },
  resultTitle: { color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 4 },
  resultMeta: { color: "#aaa", fontSize: 13 },
  resultType: { color: "#4CAF50", fontSize: 12, marginTop: 4 },
  separator: { height: 8 },
  footerLoader: { padding: 16 },
  empty: { color: "#666", textAlign: "center", marginTop: 24 },
  error: { color: "#f44", textAlign: "center", marginTop: 24 },
});