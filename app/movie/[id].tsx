import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getImageUrl } from "@services/tmdb";
import { useGetDetail, useGetServers, useServerSelection } from "@features/catalog";
import { VideoPlayerView, useMediaSourceResolver } from "@features/player";
import { useFavorites } from "@features/favorites";
import { useApiErrors } from "@core/hooks/useApiErrors";
import { NavHeader } from "@core/components/NavHeader";
import { useTheme } from "@core/providers/ThemeProvider";
import type { ThemeTokens } from "@core/theme";
import type { StreamSource } from "@core/types";

export default function MovieScreen() {
  const { colors, radius } = useTheme();
  const styles = React.useMemo(() => createMovieStyles(colors, radius), [colors, radius]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = Number(id);
  const { toggle, isFavorite } = useFavorites();

  const { data: detail, isLoading, isError, error: detailError } = useGetDetail("movie", movieId);

  const [showSources, setShowSources] = useState(false);
  const [playSource, setPlaySource] = useState<StreamSource | null>(null);

  const { data: servers, isLoading: serversLoading, isError: serversError, refetch: loadServers } =
    useGetServers({ type: "movie", id: movieId }, showSources);

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
    input: { type: "movie", id: movieId },
  });

  React.useEffect(() => {
    if (servers && servers.length > 0) {
      setSources(servers);
    }
  }, [servers, setSources]);

  const handleLoadSources = () => {
    setShowSources(true);
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
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error al cargar la película</Text>
        <Text style={styles.retry} onPress={() => setShowSources(showSources)}>Reintentar</Text>
      </View>
    );
  }

  const title = detail.title;
  const year = detail.release_date?.slice(0, 4);
  const genres = detail.genres?.map((g: { name: string }) => g.name).join(" · ") || "";
  const poster = getImageUrl(detail.poster_path, "w500") ?? "";
  const backdrop = getImageUrl(detail.backdrop_path, "w780");

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
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleLoadSources}>
                  <Text style={styles.btnText}>
                    {serversLoading ? "Cargando..." : sources.length ? "Ver fuentes" : "Cargar fuentes"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, isFavorite(movieId, "movie") ? styles.btnActive : styles.btnOutline]}
                  onPress={() => toggle({ id: movieId, type: "movie", title: title ?? "", poster, addedAt: 0 })}
                >
                  <Text style={styles.btnText}>{isFavorite(movieId, "movie") ? "★ Favorito" : "☆ Favoritos"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.overview}>{detail.overview || "Sin sinopsis disponible"}</Text>
        </View>

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

function createMovieStyles(colors: ThemeTokens["colors"], radius: ThemeTokens["radius"]) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 24 },
  backdropContainer: { position: "relative", height: 300 },
  backdrop: { ...StyleSheet.absoluteFill },
  gradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
  },
  headerContent: { flex: 1, flexDirection: "row", padding: 16, alignItems: "flex-end", gap: 16 },
  poster: { width: 120, height: 180, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  titleContainer: { flex: 1, justifyContent: "flex-end", paddingBottom: 8 },
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  year: { color: colors.creamMuted, fontSize: 14, marginTop: 2 },
  genres: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: "center", minWidth: 100 },
  btnPrimary: { backgroundColor: colors.primary },
  btnOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary },
  btnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  btnText: { color: colors.text, fontWeight: "600", fontSize: 14 },
  playBtn: { marginTop: 12, width: "100%" },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: colors.cream, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  overview: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  error: { color: colors.danger, marginTop: 8, textAlign: "center" },
  retry: { color: "#4CAF50", marginTop: 8, textDecorationLine: "underline" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  filterLabel: { color: "#aaa", marginRight: 8, alignSelf: "center" },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: "#fff", fontSize: 12, fontWeight: "500" },
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
  sourceItemSelected: { borderColor: colors.primary, backgroundColor: "#1a3a1a" },
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
}
