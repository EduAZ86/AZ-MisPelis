import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFavorites, type FavoriteItem, useContinueWatching, type ContinueWatchingItem } from "@features/favorites";
import { NavHeader } from "@core/components/NavHeader";
import { theme } from "@core/theme";

const { colors, radius } = theme;

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
      <NavHeader showBack title="Mi biblioteca" />
      <View style={styles.header}>
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16 },
  headerTitle: { color: colors.cream, fontSize: 28, fontWeight: "800", marginBottom: 12 },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: colors.text, fontWeight: "700" },
  listContent: { paddingHorizontal: 4, paddingBottom: 24 },
  card: { width: "30%", marginRight: "3%", marginBottom: 16, borderRadius: 8, overflow: "hidden", backgroundColor: colors.surface, position: "relative", borderWidth: 1, borderColor: colors.border },
  poster: { width: "100%", height: 160 },
  placeholder: { backgroundColor: colors.surfaceAlt },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: colors.overlay },
  title: { color: colors.text, fontSize: 11, fontWeight: "600", marginBottom: 2 },
  episode: { color: colors.gold, fontSize: 10 },
  progressBar: { height: 3, backgroundColor: colors.border, borderRadius: 1.5, marginTop: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.primary },
  removeBtn: { position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center" },
  removeBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { color: colors.textFaint, fontSize: 16, textAlign: "center" },
});