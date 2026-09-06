import React, { useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useFavorites, type FavoriteItem, useContinueWatching, type ContinueWatchingItem } from "@features/favorites";

type LibraryItem = FavoriteItem | ContinueWatchingItem;

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggle } = useFavorites();
  const { items: continueWatching, remove: removeContinue } = useContinueWatching();
  const [activeTab, setActiveTab] = useState<"favs" | "continue">("favs");

  const data = activeTab === "favs" ? favorites : continueWatching;

  const renderItem = ({ item }: { item: LibraryItem }) => {
    const isTV = item.type === "tv";
    const season = isTV && "season" in item ? item.season : undefined;
    const episode = isTV && "episode" in item ? item.episode : undefined;
    const progress = "progress" in item ? item.progress : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/${item.type === "tv" ? "series" : item.type}/${item.id}${season ? `?season=${season}&episode=${episode}` : ""}`)}
      >
        {item.poster ? (
          <Image source={{ uri: item.poster }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.placeholder]} />
        )}
        <View style={styles.overlay}>
          <Text style={styles.title}>{item.title}</Text>
          {isTV && season && episode && (
            <Text style={styles.episode}>T{season} E{episode}</Text>
          )}
          {isTV && "progress" in item && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { flex: progress }]} />
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi biblioteca</Text>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, activeTab === "favs" && styles.tabActive]} onPress={() => setActiveTab("favs")}>
            <Text style={[styles.tabText, activeTab === "favs" && styles.tabTextActive]}>Favoritos ({favorites.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === "continue" && styles.tabActive]} onPress={() => setActiveTab("continue")}>
            <Text style={[styles.tabText, activeTab === "continue" && styles.tabTextActive]}>Continuar viendo ({continueWatching.length})</Text>
          </TouchableOpacity>
        </View>
      </View>
      {data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {activeTab === "favs" ? "No tienes favoritos aún" : "No hay contenido en progreso"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => `${item.type}-${item.id}-${("season" in item ? item.season : "") ?? ""}-${("episode" in item ? item.episode : "") ?? ""}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          horizontal={false}
          numColumns={3}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: { padding: 16 },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "800", marginBottom: 12 },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#1e1e1e", borderRadius: 20 },
  tabActive: { backgroundColor: "#4CAF50" },
  tabText: { color: "#aaa", fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  listContent: { paddingHorizontal: 4, paddingBottom: 24 },
  card: { width: "30%", marginRight: "3%", marginBottom: 16, borderRadius: 8, overflow: "hidden", backgroundColor: "#1e1e1e", position: "relative" },
  poster: { width: "100%", height: 160 },
  placeholder: { backgroundColor: "#2a2a2a" },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.8)" },
  title: { color: "#fff", fontSize: 11, fontWeight: "600", marginBottom: 2 },
  episode: { color: "#4CAF50", fontSize: 10 },
  progressBar: { height: 3, backgroundColor: "#333", borderRadius: 1.5, marginTop: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  removeBtn: { position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  removeBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { color: "#666", fontSize: 16, textAlign: "center" },
});