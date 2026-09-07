import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, useWindowDimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MediaGrid, FilterModal, sortLabelFor, useCatalogFilters, useDiscoverSeries, useGetSeriesGenres } from "@features/catalog";
import { NavHeader } from "@core/components/NavHeader";
import { TabScreen } from "@core/components/TabScreen";
import { useTheme } from "@core/providers/ThemeProvider";
import { setNavFilterChips } from "@core/navFilterStore";
import type { TmdbMedia } from "@core/types";

export default function SeriesCatalogScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const params = useLocalSearchParams<{ genre?: string }>();
  const { filters, applyFilters, setGenre } = useCatalogFilters();
  const [filterOpen, setFilterOpen] = useState(false);

  React.useEffect(() => {
    if (params.genre) {
      setGenre(Number(params.genre));
    }
  }, [params.genre, setGenre]);

  const { data: genres } = useGetSeriesGenres();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useDiscoverSeries(filters);

  const items = data?.pages.flat() ?? [];

  React.useEffect(() => {
    setNavFilterChips({
      sortLabel: `⇅ ${sortLabelFor(filters.sortBy)}`,
      genreLabel: filters.genre ? (genres?.find((g) => g.id === filters.genre)?.name ?? "Género") : null,
      yearLabel: filters.year,
      onOpen: () => setFilterOpen(true),
      onClearGenre: () => applyFilters({ ...filters, genre: null }),
      onClearYear: () => applyFilters({ ...filters, year: null }),
    });
    return () => setNavFilterChips(null);
  }, [filters, genres, applyFilters]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePress = (item: TmdbMedia) => {
    router.push(`/series/${item.id}`);
  };

  const filterBar = (
    <View style={[styles.filterBar, !isTablet && { paddingTop: 0, paddingHorizontal: 8 }]}>
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
  );

  return (
    <TabScreen
      floatingHeader={
        <View>
          <NavHeader title="Series" />
          {!isTablet && filterBar}
        </View>
      }
    >
      <MediaGrid
        data={items}
        onPressItem={handlePress}
        onEndReached={loadMore}
        loading={isLoading || isFetchingNextPage}
        emptyText="No se encontraron series con estos filtros"
      />

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilters}
        filters={filters}
        genres={genres ?? []}
        type="tv"
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