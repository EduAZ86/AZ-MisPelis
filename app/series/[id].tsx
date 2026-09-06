import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getImageUrl } from "@services/tmdb";
import { useGetDetail, useGetServers, useGetSeason, useServerSelection } from "@features/catalog";
import { VideoPlayerView, useMediaSourceResolver } from "@features/player";
import { useFavorites } from "@features/favorites";
import { useApiErrors } from "@core/hooks/useApiErrors";
import { NavHeader } from "@core/components/NavHeader";
import { theme } from "@core/theme";
import type { StreamSource, TmdbEpisode } from "@core/types";

const { colors, radius } = theme;

export default function TVScreen() {
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
    selectedSource,
    selectedKey,
    languageFilter,
    serverFilter,
    selectSource,
    setLanguageFilter,
    setServerFilter,
    setSources,
  } = useServerSelection(servers ?? []);

  const { resolveSource, isResolving, error: resolveError } = useMediaSourceResolver({
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

  const handlePlay = async () => {
    if (!selectedSource) return;
    const resolved = await resolveSource(selectedSource);
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
    return <View style={styles.centered}><Text style={styles.error}>Error al cargar la serie</Text></View>;
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.backdropContainer}>
          {backdrop && <Image source={{ uri: backdrop }} style={styles.backdrop} />}
          <View style={styles.gradient} />
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
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.overview}>{detail.overview || "Sin sinopsis disponible"}</Text>
        </View>

        {seasons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Temporadas</Text>
            <FlatList
              data={seasons}
              keyExtractor={(s: { season_number: number }) => String(s.season_number)}
              renderItem={({ item }: { item: { season_number: number } }) => (
                <TouchableOpacity
                  style={[
                    styles.seasonBtn,
                    selectedSeason === item.season_number && styles.seasonBtnActive,
                  ]}
                  onPress={() => handleSeasonPress(item.season_number)}
                >
                  <Text style={[styles.seasonBtnText, selectedSeason === item.season_number && styles.seasonBtnTextActive]}>
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
            <Text style={styles.sectionTitle}>Episodios - Temporada {selectedSeason}</Text>
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
                      selectedEpisode === ep && styles.episodeBtnActive,
                    ]}
                    onPress={() => handleEpisodePress(ep)}
                  >
                    <View style={[styles.episodePlaceholder]}>
                      <Text style={styles.episodePlaceholderNumber}>{ep}</Text>
                    </View>
                    <Text style={styles.episodeName} numberOfLines={1}>Episodio {ep}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {showSources && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fuentes disponibles</Text>
            {serversLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />
            ) : serversError ? (
              <Text style={styles.error}>Error al cargar fuentes</Text>
            ) : (
              <>
                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>Idioma:</Text>
                  {languages.map((lang: string) => (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        styles.filterChip,
                        languageFilter === lang && styles.filterChipActive,
                      ]}
                      onPress={() => setLanguageFilter(languageFilter === lang ? null : lang)}
                    >
                      <Text style={styles.filterChipText}>{lang}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>Servidor:</Text>
                  {serverList.map((s: string) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.filterChip,
                        serverFilter === s && styles.filterChipActive,
                      ]}
                      onPress={() => setServerFilter(serverFilter === s ? null : s)}
                    >
                      <Text style={styles.filterChipText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {filteredSources.map((source: StreamSource) => (
                  <TouchableOpacity
                    key={source.key}
                    style={[
                      styles.sourceItem,
                      selectedKey === source.key && styles.sourceItemSelected,
                    ]}
                    onPress={() => selectSource(source)}
                  >
                    <View style={styles.sourceInfo}>
                      <Text style={styles.sourceLanguage}>{source.language}</Text>
                      <Text style={styles.sourceServer}>{source.mirror}</Text>
                      <Text style={styles.sourceQuality}>{source.quality}</Text>
                    </View>
                    {selectedKey === source.key && (
                      <View style={styles.sourceSelectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
                {selectedSource && (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnPrimary, styles.playBtn]}
                    onPress={handlePlay}
                    disabled={isResolving}
                  >
                    <Text style={styles.btnText}>
                      {isResolving ? "Resolviendo..." : "Reproducir"}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {playSource && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reproductor</Text>
            <VideoPlayerView
              currentSource={playSource}
              sources={sources}
              onSelectSource={selectSource}
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
  const still = getImageUrl(episode.still_path, "w300");
  return (
    <TouchableOpacity
      style={[styles.episodeCard, selected && styles.episodeCardSelected]}
      onPress={onPress}
    >
      <View style={styles.episodeThumbWrap}>
        {still ? (
          <Image source={{ uri: still }} style={styles.episodeThumb} />
        ) : (
          <View style={[styles.episodeThumb, styles.episodeThumbEmpty]}>
            <Text style={styles.episodePlaceholderNumber}>{episode.episode_number}</Text>
          </View>
        )}
        <View style={styles.episodeBadge}>
          <Text style={styles.episodeBadgeText}>{episode.episode_number}</Text>
        </View>
        {selected && <View style={styles.episodeSelectedRing} />}
      </View>
      <Text style={styles.episodeName} numberOfLines={2}>{episode.name || `Episodio ${episode.episode_number}`}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 24 },
  backdropContainer: { position: "relative", height: 300 },
  backdrop: { ...StyleSheet.absoluteFill },
  gradient: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  headerContent: { flex: 1, flexDirection: "row", padding: 16, alignItems: "flex-end", gap: 16 },
  poster: { width: 120, height: 180, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primaryDark },
  titleContainer: { flex: 1, justifyContent: "flex-end", paddingBottom: 8 },
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
  sectionTitle: { color: colors.cream, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  overview: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  error: { color: colors.danger, marginTop: 8, textAlign: "center" },
  seasonListContent: { paddingHorizontal: 16, gap: 8 },
  seasonBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  seasonBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  seasonBtnText: { color: colors.text, fontSize: 13, fontWeight: "500" },
  seasonBtnTextActive: { color: colors.text, fontWeight: "700" },
  episodesLoader: { marginTop: 16 },
  episodeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 0 },
  episodeCard: { width: "47.5%", borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  episodeCardSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  episodeThumbWrap: { position: "relative" },
  episodeThumb: { width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.surfaceAlt },
  episodeThumbEmpty: { alignItems: "center", justifyContent: "center" },
  episodePlaceholderNumber: { color: colors.textFaint, fontSize: 22, fontWeight: "800" },
  episodeBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: colors.overlay,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  episodeBadgeText: { color: colors.cream, fontSize: 11, fontWeight: "700" },
  episodeSelectedRing: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderWidth: 3, borderColor: colors.primary, borderRadius: radius.md },
  episodeName: { color: colors.text, fontSize: 12, fontWeight: "500", padding: 8, minHeight: 44 },
  episodeBtn: { flex: 1, minWidth: 60, paddingVertical: 10, backgroundColor: colors.surface, borderRadius: radius.md, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  episodeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  episodePlaceholder: { width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center", borderRadius: radius.sm },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  filterLabel: { color: colors.textMuted, marginRight: 8, alignSelf: "center" },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.text, fontSize: 12, fontWeight: "500" },
  sourceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceItemSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  sourceInfo: { flexDirection: "row", gap: 12, flex: 1 },
  sourceLanguage: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  sourceServer: { color: colors.creamMuted, fontSize: 13 },
  sourceQuality: { color: colors.textMuted, fontSize: 12 },
  sourceSelectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});