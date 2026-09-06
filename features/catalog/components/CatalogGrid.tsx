import React, { useState } from "react";
import {
  View,
  useWindowDimensions,
  Text,
  Image,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getImageUrl } from "@services/tmdb";
import { useTabScrollInsets } from "@core/components/TabScreen";
import { theme } from "@core/theme";
import type { TmdbMedia, TmdbGenre, CatalogFilters, CatalogSortBy } from "@core/types";

const { colors, radius } = theme;

const SORT_OPTIONS: { value: CatalogSortBy; label: string; movieOnly?: boolean }[] = [
  { value: "popularity.desc", label: "Populares (vistas)" },
  { value: "vote_average.desc", label: "Mejor puntuación" },
  { value: "vote_count.desc", label: "Más votadas" },
  { value: "release_date.desc", label: "Más recientes", movieOnly: true },
  { value: "revenue.desc", label: "Taquilla", movieOnly: true },
];

export function sortLabelFor(sortBy: CatalogSortBy): string {
  return SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Populares";
}

function yearOptions(): (number | null)[] {
  const years: (number | null)[] = [null];
  const current = new Date().getFullYear();
  for (let y = current; y >= 1990; y--) years.push(y);
  return years;
}

// ---------- MediaGrid ----------

interface MediaGridProps {
  data: TmdbMedia[];
  onPressItem: (item: TmdbMedia) => void;
  onEndReached?: () => void;
  loading?: boolean;
  emptyText?: string;
  headerHeight?: number;
}

export function MediaGrid({ data, onPressItem, onEndReached, loading, emptyText, headerHeight = 96 }: MediaGridProps) {
  const { width } = useWindowDimensions();
  const scrollInsets = useTabScrollInsets(headerHeight);
  const numColumns = width >= 1200 ? 6 : width >= 768 ? 4 : 3;
  const cardWidth = `${96 / numColumns}%` as `${number}%`;
  const horizontalPadding = width >= 768 ? 16 : 12;

  if (!loading && !data.length) {
    return <Text style={gridStyles.empty}>{emptyText ?? "No hay resultados"}</Text>;
  }

  return (
    <FlatList
      key={numColumns}
      data={data}
      keyExtractor={(item) => `${item.media_type}-${item.id}`}
      renderItem={({ item }) => (
        <TouchableOpacity style={[gridStyles.card, { width: cardWidth }]} onPress={() => onPressItem(item)}>
          {getImageUrl(item.poster_path, "w342") ? (
            <Image source={{ uri: getImageUrl(item.poster_path, "w342") }} style={gridStyles.poster} />
          ) : (
            <View style={[gridStyles.poster, gridStyles.placeholder]} />
          )}
          <View style={gridStyles.overlay}>
            <Text style={gridStyles.title} numberOfLines={1}>{item.title ?? item.name ?? "Sin título"}</Text>
            <View style={gridStyles.metaRow}>
              <Text style={gridStyles.year}>
                {(item.release_date ?? item.first_air_date ?? "").slice(0, 4) || "—"}
              </Text>
              <Text style={gridStyles.rating}>★ {item.vote_average?.toFixed(1) ?? "—"}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      numColumns={numColumns}
      columnWrapperStyle={gridStyles.column}
      contentContainerStyle={[
        gridStyles.listContent,
        { paddingHorizontal: horizontalPadding, paddingTop: scrollInsets.paddingTop, paddingBottom: scrollInsets.paddingBottom },
      ]}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator size="small" color={colors.primary} style={gridStyles.footer} /> : null}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ---------- FilterModal ----------

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: CatalogFilters) => void;
  filters: CatalogFilters;
  genres: TmdbGenre[];
  type: "movie" | "tv";
}

export function FilterModal({ visible, onClose, onApply, filters, genres, type }: FilterModalProps) {
  const [draft, setDraft] = useState<CatalogFilters>(filters);

  const years = yearOptions();
  const sortOptions = SORT_OPTIONS.filter((o) => type === "movie" || !o.movieOnly);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onShow={() => setDraft(filters)}
      onRequestClose={onClose}
    >
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Filtrar</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={modalStyles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.body} showsVerticalScrollIndicator={false}>
            <Text style={modalStyles.sectionTitle}>Ordenar por</Text>
            <View style={modalStyles.chips}>
              {sortOptions.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  active={draft.sortBy === opt.value}
                  onPress={() => setDraft((d) => ({ ...d, sortBy: opt.value }))}
                />
              ))}
            </View>

            <Text style={modalStyles.sectionTitle}>Año</Text>
            <View style={modalStyles.chips}>
              {years.map((y) => (
                <Chip
                  key={String(y)}
                  label={y === null ? "Todo" : String(y)}
                  active={draft.year === y}
                  onPress={() => setDraft((d) => ({ ...d, year: y }))}
                />
              ))}
            </View>

            <Text style={modalStyles.sectionTitle}>Género</Text>
            <View style={modalStyles.chips}>
              <Chip
                label="Todos"
                active={draft.genre === null}
                onPress={() => setDraft((d) => ({ ...d, genre: null }))}
              />
              {genres.map((g) => (
                <Chip
                  key={g.id}
                  label={g.name}
                  active={draft.genre === g.id}
                  onPress={() => setDraft((d) => ({ ...d, genre: g.id }))}
                />
              ))}
            </View>
          </ScrollView>

          <View style={modalStyles.footer}>
            <TouchableOpacity
              style={[modalStyles.footerBtn, modalStyles.clearBtn]}
              onPress={() => setDraft({ genre: null, year: null, sortBy: "popularity.desc" })}
            >
              <Text style={modalStyles.clearText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.footerBtn, modalStyles.applyBtn]}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            >
              <Text style={modalStyles.applyText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[modalStyles.chip, active && modalStyles.chipActive]} onPress={onPress}>
      <Text style={[modalStyles.chipText, active && modalStyles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------- Estilos ----------

const gridStyles = StyleSheet.create({
  listContent: { paddingHorizontal: 12, paddingBottom: 24 },
  column: { justifyContent: "space-between" },
  card: { marginBottom: 12, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface },
  poster: { width: "100%", aspectRatio: 2 / 3 },
  placeholder: { backgroundColor: colors.surfaceAlt },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 6, paddingTop: 14, backgroundColor: "rgba(0,0,0,0.6)" },
  title: { color: colors.text, fontSize: 10, fontWeight: "600" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  year: { color: colors.creamMuted, fontSize: 9 },
  rating: { color: colors.gold, fontSize: 9, fontWeight: "600" },
  footer: { padding: 16 },
  empty: { color: colors.textFaint, textAlign: "center", marginTop: 40 },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "rgba(12,8,9,0.97)", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.16)", maxHeight: "80%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)" },
  title: { color: colors.cream, fontSize: 18, fontWeight: "800" },
  close: { color: colors.textMuted, fontSize: 18, padding: 4 },
  body: { paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { color: colors.cream, fontSize: 14, fontWeight: "700", marginBottom: 8, marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  chipActive: { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.45)" },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: "500" },
  chipTextActive: { color: colors.text, fontWeight: "700" },
  footer: { flexDirection: "row", gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" },
  footerBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: "center" },
  clearBtn: { backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  clearText: { color: colors.textMuted, fontWeight: "600" },
  applyBtn: { backgroundColor: "rgba(255,255,255,0.92)" },
  applyText: { color: "#111", fontWeight: "700" },
});