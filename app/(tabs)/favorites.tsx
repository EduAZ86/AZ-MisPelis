import React, { useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFavorites, type FavoriteItem, useContinueWatching, type ContinueWatchingItem } from "@features/favorites";
import { NavHeader } from "@core/components/NavHeader";
import { TabScreen, useTabScrollInsets } from "@core/components/TabScreen";
import { useTheme } from "@core/providers/ThemeProvider";

type LibraryItem = FavoriteItem | ContinueWatchingItem;

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { favorites, toggle } = useFavorites();
  const { items: continueWatching, remove: removeContinue } = useContinueWatching();
  const [activeTab, setActiveTab] = useState<"favs" | "continue">("favs");
  const scrollInsets = useTabScrollInsets(56);

  const data = activeTab === "favs" ? favorites : continueWatching;

  const renderItem = ({ item }: { item: LibraryItem }) => {
    const isTV = item.type === "tv";
    const season = isTV && "season" in item ? item.season : undefined;
    const episode = isTV && "episode" in item ? item.episode : undefined;
    const progress = "progress" in item ? item.progress : 0;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/${item.type === "tv" ? "series" : item.type}/${item.id}${season ? `?season=${season}&episode=${episode}` : ""}`)}
      >
        {item.poster ? (
          <Image source={{ uri: item.poster }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, { backgroundColor: colors.surfaceAlt }]} />
        )}
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          {isTV && season && episode && (
            <Text style={[styles.episode, { color: colors.gold }]}>T{season} E{episode}</Text>
          )}
          {isTV && "progress" in item && (
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { flex: progress, backgroundColor: colors.primary }]} />
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.removeBtn, { backgroundColor: colors.primaryDark }]}
          onPress={(e) => {
            e.stopPropagation();
            if (activeTab === "favs") toggle(item);
            else removeContinue(item.id, item.type, season, episode);
          }}
        >
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <TabScreen
      floatingHeader={<NavHeader title="Mi biblioteca" />}
    >
      <View style={[styles.header, { paddingTop: scrollInsets.paddingTop }]}>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, activeTab === "favs" && styles.tabActive]} onPress={() => setActiveTab("favs")}>
            <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === "favs" && styles.tabTextActive, { color: colors.text }]}>Favoritos ({favorites.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === "continue" && styles.tabActive]} onPress={() => setActiveTab("continue")}>
            <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === "continue" && styles.tabTextActive, { color: colors.text }]}>Continuar viendo ({continueWatching.length})</Text>
          </TouchableOpacity>
        </View>
      </View>
      {data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {activeTab === "favs" ? "No tienes favoritos aún" : "No hay contenido en progreso"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => `${item.type}-${item.id}-${("season" in item ? item.season : "") ?? ""}-${("episode" in item ? item.episode : "") ?? ""}`}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: scrollInsets.paddingBottom }]}
          horizontal={false}
          numColumns={3}
          showsVerticalScrollIndicator={false}
        />
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16 },
  headerTitle: { fontSize: 28, fontWeight: "800", marginBottom: 12 },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  tabActive: { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.45)" },
  tabText: { fontSize: 13, fontWeight: "500" },
  tabTextActive: { fontWeight: "700" },
  listContent: { paddingHorizontal: 4, paddingBottom: 24 },
  card: { width: "30%", marginRight: "3%", marginBottom: 16, borderRadius: 12, overflow: "hidden", position: "relative" },
  poster: { width: "100%", height: 160 },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8 },
  title: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
  episode: { fontSize: 10 },
  progressBar: { height: 3, borderRadius: 1.5, marginTop: 4, overflow: "hidden" },
  progressFill: { height: "100%" },
  removeBtn: { position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  removeBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { fontSize: 16, textAlign: "center" },
});