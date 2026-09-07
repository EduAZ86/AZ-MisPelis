import React, { useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getImageUrl } from "@services/tmdb";
import { useGetDetail, useGetServers, useGetSeason, useServerSelection } from "@features/catalog";
import { VideoPlayerView, useMediaSourceResolver } from "@features/player";
import { useFavorites } from "@features/favorites";
import { useApiErrors } from "@core/hooks/useApiErrors";
import { NavHeader } from "@core/components/NavHeader";
import { GlassPanel } from "@core/components/Glass";
import { useTheme } from "@core/providers/ThemeProvider";
import type { ThemeTokens } from "@core/theme";
import type { StreamSource, TmdbEpisode } from "@core/types";

export default function TVScreen() {
  const { colors, radius, glass } = useTheme();
  const styles = React.useMemo(() => createSeriesStyles(colors, radius), [colors, radius]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { id } = useLocalSearchParams<{ id: string }>();
  const tvId = Number(id);
  const { toggle, isFavorite } = useFavorites();

  const { data: detail, isLoading, isError, error: detailError } = useGetDetail("tv", tvId);

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [showSources, setShowSources] = useState(false);
  const [playSource, setPlaySource] = useState<StreamSource | null>(null);

  const { data: servers, isLoading: serversLoading, isError: serversError, refetch: loadServers } =
    useGetServers(
      { type: "tv", id: tvId, season: selectedSeason, episode: selectedEpisode },
      showSources
    );

  const { data: episodes, isLoading: episodesLoading } = useGetSeason(tvId, selectedSeason);

  useApiErrors([detailError]);

  const {
    sources,
    filteredSources,
    languages,
    servers: serverList,
    selectedKey,
    languageFilter,
    serverFilter,
    selectSource,
    setLanguageFilter,
    setServerFilter,
    setSources,
  } = useServerSelection(servers ?? []);

  const { resolveSource, error: resolveError } = useMediaSourceResolver({
    input: { type: "tv", id: tvId, season: selectedSeason, episode: selectedEpisode },
  });

  React.useEffect(() => {
    if (servers && servers.length > 0) {
      setSources(servers);
    }
  }, [servers, setSources]);

  const handleSeasonPress = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1);
    setShowSources(false);
    setPlaySource(null);
  };

  const handleEpisodePress = (episode: number) => {
    setSelectedEpisode(episode);
    setShowSources(true);
    setPlaySource(null);
    loadServers();
  };

  const handleSelectSource = async (source: StreamSource) => {
    selectSource(source);
    const resolved = await resolveSource(source);
    if (resolved) {
      setPlaySource(resolved);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !detail) {
    return <View style={styles.centered}><Text style={[styles.error, { color: colors.danger }]}>Error al cargar la serie</Text></View>;
  }

  const title = detail.name;
  const year = detail.first_air_date?.slice(0, 4);
  const genres = detail.genres?.map((g: { name: string }) => g.name).join(" · ") || "";
  const poster = getImageUrl(detail.poster_path, "w500") ?? "";
  const backdrop = getImageUrl(detail.backdrop_path, "w780");
  const seasons = detail.seasons?.filter((s: { season_number: number }) => s.season_number > 0) || [];

  const currentSeasonData = detail.seasons?.find(
    (s: { season_number: number; episode_count: number }) => s.season_number === selectedSeason
  );
  const episodeCount = currentSeasonData?.episode_count ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <NavHeader showBack showFavorites />

      {isTablet && (
        <TouchableOpacity
          style={[styles.tabletBack, { top: insets.top + 8, left: 16 }]}
          onPress={() => router.back()}
        >
          <GlassPanel style={styles.tabletBackBtn}>
            <Ionicons name="chevron-back" size={20} color={glass.active} suppressHighlighting />
          </GlassPanel>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.backdropContainer}>
          {backdrop && <Image source={{ uri: backdrop }} style={styles.backdrop} />}
          <View style={styles.backdropGradient} />
          <View style={styles.headerContent}>
            {poster && <Image source={{ uri: poster }} style={styles.poster} />}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {year && <Text style={styles.year}>{year}</Text>}
              {genres && <Text style={styles.genres}>{genres}</Text>}
              <TouchableOpacity
                style={[styles.btn, isFavorite(tvId, "tv") ? styles.btnActive : styles.btnOutline]}
                onPress={() => toggle({ id: tvId, type: "tv", title: title ?? "", poster, addedAt: 0 })}
              >
                <Text style={styles.btnText}>{isFavorite(tvId, "tv") ? "★ Favorito" : "☆ Favoritos"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.cream }]}>Sinopsis</Text>
          <Text style={[styles.overview, { color: colors.textMuted }]}>{detail.overview || "Sin sinopsis disponible"}</Text>
        </View>

        {seasons.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.cream }]}>Temporadas</Text>
            <FlatList
              data={seasons}
              keyExtractor={(s: { season_number: number }) => String(s.season_number)}
              renderItem={({ item }: { item: { season_number: number } }) => (
                <TouchableOpacity
                  style={[
                    styles.seasonBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    selectedSeason === item.season_number && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => handleSeasonPress(item.season_number)}
                >
                  <Text style={[styles.seasonBtnText, { color: colors.text }, selectedSeason === item.season_number && { fontWeight: "700" }]}>
                    Temporada {item.season_number}
                  </Text>
                </TouchableOpacity>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seasonListContent}
            />
          </View>
        )}

        {(currentSeasonData || episodesLoading) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.cream }]}>Episodios - Temporada {selectedSeason}</Text>
            {episodesLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.episodesLoader} />
            ) : episodes && episodes.length > 0 ? (
              <View style={styles.episodeGrid}>
                {episodes.map((ep: TmdbEpisode) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    selected={selectedEpisode === ep.episode_number}
                    onPress={() => handleEpisodePress(ep.episode_number)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.episodeGrid}>
                {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep: number) => (
                  <TouchableOpacity
                    key={ep}
                    style={[
                      styles.episodeBtn,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      selectedEpisode === ep && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => handleEpisodePress(ep)}
                  >
                    <View style={[styles.episodePlaceholder, { backgroundColor: colors.surfaceAlt }]}>
                      <Text style={[styles.episodePlaceholderNumber, { color: colors.textFaint }]}>{ep}</Text>
                    </View>
                    <Text style={[styles.episodeName, { color: colors.text }]} numberOfLines={1}>Episodio {ep}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {showSources && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.cream }]}>Fuentes disponibles</Text>
            {serversLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />
            ) : serversError ? (
              <Text style={[styles.error, { color: colors.danger }]}>Error al cargar fuentes</Text>
            ) : (
              <>
                <View style={styles.filterRow}>
                  <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Idioma:</Text>
                  {languages.map((lang: string) => (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        styles.filterChip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        languageFilter === lang && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setLanguageFilter(languageFilter === lang ? null : lang)}
                    >
                      <Text style={[styles.filterChipText, { color: colors.text }]}>{lang}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.filterRow}>
                  <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Servidor:</Text>
                  {serverList.map((s: string) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.filterChip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        serverFilter === s && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setServerFilter(serverFilter === s ? null : s)}
                    >
                      <Text style={[styles.filterChipText, { color: colors.text }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {filteredSources.map((source: StreamSource) => (
                  <TouchableOpacity
                    key={source.key}
                    style={[
                      styles.sourceItem,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      selectedKey === source.key && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                    ]}
                    onPress={() => handleSelectSource(source)}
                  >
                    <View style={styles.sourceInfo}>
                      <Text style={[styles.sourceLanguage, { color: colors.primary }]}>{source.language}</Text>
                      <Text style={[styles.sourceServer, { color: colors.creamMuted }]}>{source.mirror}</Text>
                      <Text style={[styles.sourceQuality, { color: colors.textMuted }]}>{source.quality}</Text>
                    </View>
                    {selectedKey === source.key && (
                      <View style={[styles.sourceSelectedIndicator, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}

        {playSource && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.cream }]}>Reproductor</Text>
            <VideoPlayerView
              currentSource={playSource}
              sources={sources}
              onSelectSource={handleSelectSource}
              playbackError={resolveError}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EpisodeCard({
  episode,
  selected,
  onPress,
}: {
  episode: TmdbEpisode;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, radius } = useTheme();
  const still = getImageUrl(episode.still_path, "w300");
  return (
    <TouchableOpacity
      style={[{ width: "47.5%", borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }, selected && { borderColor: colors.primary, backgroundColor: colors.surfaceAlt }]}
      onPress={onPress}
    >
      <View style={{ position: "relative" }}>
        {still ? (
          <Image source={{ uri: still }} style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.surfaceAlt }} />
        ) : (
          <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.textFaint, fontSize: 22, fontWeight: "800" }}>{episode.episode_number}</Text>
          </View>
        )}
        <View style={{ position: "absolute", bottom: 6, left: 6, backgroundColor: colors.overlay, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ color: colors.cream, fontSize: 11, fontWeight: "700" }}>{episode.episode_number}</Text>
        </View>
        {selected && <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderWidth: 3, borderColor: colors.primary, borderRadius: radius.md }} />}
      </View>
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: "500", padding: 8, minHeight: 44 }} numberOfLines={2}>{episode.name || `Episodio ${episode.episode_number}`}</Text>
    </TouchableOpacity>
  );
}

function createSeriesStyles(colors: ThemeTokens["colors"], radius: ThemeTokens["radius"]) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 24 },
  backdropContainer: { position: "relative", minHeight: 360 },
  backdrop: { width: "100%", height: 360, resizeMode: "cover" },
  backdropGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  headerContent: { flexDirection: "row", padding: 16, gap: 16 },
  poster: { width: 120, height: 180, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primaryDark },
  titleContainer: { flex: 1, justifyContent: "center", paddingBottom: 8 },
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  year: { color: colors.creamMuted, fontSize: 14, marginTop: 2 },
  genres: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.md, alignItems: "center" },
  btnPrimary: { backgroundColor: colors.primary },
  btnOutline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
  btnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  btnText: { color: colors.text, fontWeight: "600", fontSize: 14 },
  playBtn: { marginTop: 12, width: "100%" },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  overview: { fontSize: 14, lineHeight: 22 },
  error: { marginTop: 8, textAlign: "center" },
  seasonListContent: { paddingHorizontal: 16, gap: 8 },
  seasonBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1 },
  seasonBtnText: { fontSize: 13, fontWeight: "500" },
  episodesLoader: { marginTop: 16 },
  episodeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 0 },
  episodeCard: { width: "47.5%", borderRadius: radius.md, borderWidth: 1, overflow: "hidden" },
  episodeThumbWrap: { position: "relative" },
  episodeThumb: { width: "100%", aspectRatio: 16 / 9 },
  episodePlaceholderNumber: { fontSize: 22, fontWeight: "800" },
  episodeBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  episodeBadgeText: { fontSize: 11, fontWeight: "700" },
  episodeSelectedRing: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderWidth: 3, borderRadius: radius.md },
  episodeName: { fontSize: 12, fontWeight: "500", padding: 8, minHeight: 44 },
  episodeBtn: { flex: 1, minWidth: 60, paddingVertical: 10, borderRadius: radius.md, alignItems: "center", borderWidth: 1 },
  episodePlaceholder: { width: "100%", aspectRatio: 16 / 9, borderRadius: radius.sm },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  filterLabel: { marginRight: 8, alignSelf: "center" },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: "500" },
  sourceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 8,
    borderWidth: 1,
  },
  sourceInfo: { flexDirection: "row", gap: 12, flex: 1 },
  sourceLanguage: { fontWeight: "600", fontSize: 13 },
  sourceServer: { fontSize: 13 },
  sourceQuality: { fontSize: 12 },
  sourceSelectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tabletBack: {
    position: "absolute",
    zIndex: 10,
  },
  tabletBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
}