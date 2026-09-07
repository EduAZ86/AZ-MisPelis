import React, { useCallback } from "react";
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useGetSearch } from "@features/catalog";
import { getImageUrl } from "@services/tmdb";
import { NavHeader } from "@core/components/NavHeader";
import { TabScreen, useTabScrollInsets } from "@core/components/TabScreen";
import { useTheme } from "@core/providers/ThemeProvider";
import { useSearchQuery, setSearchQuery } from "@core/searchStore";
import type { TmdbMedia } from "@core/types";

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const scrollInsets = useTabScrollInsets(56);
  const query = useSearchQuery();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
    useGetSearch(query);

  const results = data?.pages.flat() ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = ({ item }: { item: TmdbMedia }) => {
    const poster = getImageUrl(item.poster_path, "w200");
    return (
      <TouchableOpacity
        style={[styles.resultItem, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/${item.media_type === "tv" ? "series" : item.media_type}/${item.id}`)}
      >
        {poster ? (
          <Image source={{ uri: poster }} style={styles.resultPoster} />
        ) : (
          <View style={[styles.resultPoster, { backgroundColor: colors.surfaceAlt }]} />
        )}
        <View style={styles.resultInfo}>
          <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{item.title ?? item.name ?? "Sin título"}</Text>
            <Text style={[styles.resultMeta, { color: colors.textMuted }]}>
              {(item.release_date ?? item.first_air_date ?? "").slice(0, 4) || "—"} · {item.vote_average?.toFixed(1) ?? "—"}
              {item.meta_score != null ? ` · MS ${item.meta_score}` : ""}
            </Text>
          <Text style={[styles.resultType, { color: colors.gold }]}>{item.media_type === "movie" ? "Película" : "Serie"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TabScreen
      floatingHeader={<NavHeader title="Buscar" />}
    >
      {!isTablet && (
        <View style={[styles.searchBar, { paddingTop: scrollInsets.paddingTop, paddingHorizontal: 12 }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Buscar películas y series..."
            value={query}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textFaint}
          />
        </View>
      )}
      {query.length >= 2 && (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingTop: isTablet ? scrollInsets.paddingTop : 12, paddingBottom: scrollInsets.paddingBottom }]}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={hasNextPage && isFetchingNextPage ? <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} /> : null}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
      {query.length >= 2 && !isLoading && !results.length && <Text style={[styles.empty, { color: colors.textMuted }]}>No se encontraron resultados</Text>}
      {isError && <Text style={[styles.error, { color: colors.danger }]}>Error al buscar</Text>}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  searchBar: { padding: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  listContent: { padding: 12, paddingBottom: 24 },
  resultItem: { flexDirection: "row", borderRadius: 16, overflow: "hidden" },
  resultPoster: { width: 80, height: 120 },
  resultInfo: { flex: 1, padding: 12, justifyContent: "center" },
  resultTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  resultMeta: { fontSize: 13 },
  resultType: { fontSize: 12, marginTop: 4 },
  separator: { height: 8 },
  footerLoader: { padding: 16 },
  empty: { textAlign: "center", marginTop: 24 },
  error: { textAlign: "center", marginTop: 24 },
});