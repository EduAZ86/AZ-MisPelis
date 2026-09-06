import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getImageUrl } from "@services/tmdb";
import { useGetDetail, useGetServers, useServerSelection } from "@features/catalog";
import { VideoPlayerView, useMediaSourceResolver } from "@features/player";
import { useFavorites } from "@features/favorites";
import { useApiErrors } from "@core/hooks/useApiErrors";
import type { StreamSource } from "@core/types";

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
    return <View style={styles.centered}><ActivityIndicator size="large" color="#fff" /></View>;
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

        {currentSeasonData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Episodios - Temporada {selectedSeason}</Text>
            <FlatList
              data={Array.from({ length: episodeCount }, (_, i) => i + 1)}
              keyExtractor={(ep: number) => String(ep)}
              renderItem={({ item }: { item: number }) => (
                <TouchableOpacity
                  style={[
                    styles.episodeBtn,
                    selectedEpisode === item && styles.episodeBtnActive,
                  ]}
                  onPress={() => handleEpisodePress(item)}
                >
                  <Text style={[styles.episodeBtnText, selectedEpisode === item && styles.episodeBtnTextActive]}>
                    Ep. {item}
                  </Text>
                </TouchableOpacity>
              )}
              numColumns={5}
              contentContainerStyle={styles.episodeGridContent}
            />
          </View>
        )}

        {showSources && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fuentes disponibles</Text>
            {serversLoading ? (
              <ActivityIndicator size="large" color="#4CAF50" style={styles.centered} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 24 },
  backdropContainer: { position: "relative", height: 300 },
  backdrop: { ...StyleSheet.absoluteFill },
  gradient: { ...StyleSheet.absoluteFill, backgroundColor: "transparent" },
  headerContent: { flex: 1, flexDirection: "row", padding: 16, alignItems: "flex-end", gap: 16 },
  poster: { width: 120, height: 180, borderRadius: 8, borderWidth: 1, borderColor: "#333" },
  titleContainer: { flex: 1, justifyContent: "flex-end", paddingBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  year: { color: "#aaa", fontSize: 14, marginTop: 2 },
  genres: { color: "#888", fontSize: 13, marginTop: 4 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: "center" },
  btnPrimary: { backgroundColor: "#4CAF50" },
  btnOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#4CAF50" },
  btnActive: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  playBtn: { marginTop: 12, width: "100%" },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  overview: { color: "#ccc", fontSize: 14, lineHeight: 22 },
  error: { color: "#f44", marginTop: 8, textAlign: "center" },
  seasonListContent: { paddingHorizontal: 16, gap: 8 },
  seasonBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#1e1e1e", borderRadius: 20, borderWidth: 1, borderColor: "#333" },
  seasonBtnActive: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  seasonBtnText: { color: "#fff", fontSize: 13, fontWeight: "500" },
  seasonBtnTextActive: { color: "#fff", fontWeight: "700" },
  episodeGridContent: { paddingHorizontal: 16, gap: 8 },
  episodeBtn: { flex: 1, minWidth: 60, paddingVertical: 10, backgroundColor: "#1e1e1e", borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#333" },
  episodeBtnActive: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  episodeBtnText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  episodeBtnTextActive: { color: "#fff", fontWeight: "700" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  filterLabel: { color: "#aaa", marginRight: 8, alignSelf: "center" },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
  },
  filterChipActive: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  filterChipText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  sourceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  sourceItemSelected: { borderColor: "#4CAF50", backgroundColor: "#1a3a1a" },
  sourceInfo: { flexDirection: "row", gap: 12, flex: 1 },
  sourceLanguage: { color: "#4CAF50", fontWeight: "600", fontSize: 13 },
  sourceServer: { color: "#aaa", fontSize: 13 },
  sourceQuality: { color: "#888", fontSize: 12 },
  sourceSelectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
});