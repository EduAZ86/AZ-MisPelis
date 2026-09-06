import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MediaGrid, FilterModal, sortLabelFor, useCatalogFilters, useDiscoverMovies, useGetMovieGenres } from "@features/catalog";
import { NavHeader } from "@core/components/NavHeader";
import { TabScreen } from "@core/components/TabScreen";
import { useTheme } from "@core/providers/ThemeProvider";
import type { TmdbMedia } from "@core/types";

export default function PeliculasScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ genre?: string }>();
  const { filters, applyFilters, setGenre } = useCatalogFilters();
  const [filterOpen, setFilterOpen] = useState(false);

  React.useEffect(() => {
    if (params.genre) {
      setGenre(Number(params.genre));
    }
  }, [params.genre, setGenre]);

  const { data: genres } = useGetMovieGenres();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useDiscoverMovies(filters);

  const items = data?.pages.flat() ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePress = (item: TmdbMedia) => {
    router.push(`/movie/${item.id}`);
  };

  return (
    <TabScreen
      floatingHeader={
        <View>
          <NavHeader title="Películas" />
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              <TouchableOpacity style={[styles.chip, styles.chipActive]} onPress={() => setFilterOpen(true)}>
                <Text style={[styles.chipText, { color: colors.textMuted }, styles.chipTextActive, { color: colors.text }]}>⇅ {sortLabelFor(filters.sortBy)}</Text>
              </TouchableOpacity>
              {filters.genre ? (
                <TouchableOpacity style={[styles.chip, styles.chipActive]} onPress={() => applyFilters({ ...filters, genre: null })}>
                  <Text style={[styles.chipText, { color: colors.textMuted }, styles.chipTextActive, { color: colors.text }]}>
                    {genres?.find((g) => g.id === filters.genre)?.name ?? "Género"} ✕
                  </Text>
                </TouchableOpacity>
              ) : null}
              {filters.year ? (
                <TouchableOpacity style={[styles.chip, styles.chipActive]} onPress={() => applyFilters({ ...filters, year: null })}>
                  <Text style={[styles.chipText, { color: colors.textMuted }, styles.chipTextActive, { color: colors.text }]}>{filters.year} ✕</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.chip} onPress={() => setFilterOpen(true)}>
                <Text style={[styles.chipText, { color: colors.textMuted }]}>Filtrar…</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      }
    >
      <MediaGrid
        data={items}
        onPressItem={handlePress}
        onEndReached={loadMore}
        loading={isLoading || isFetchingNextPage}
        emptyText="No se encontraron películas con estos filtros"
      />

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilters}
        filters={filters}
        genres={genres ?? []}
        type="movie"
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  filterBar: { paddingHorizontal: 8, paddingBottom: 8 },
  filterContent: { gap: 8, paddingHorizontal: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  chipActive: { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.45)" },
  chipText: { fontSize: 12, fontWeight: "500" },
  chipTextActive: { fontWeight: "700" },
});