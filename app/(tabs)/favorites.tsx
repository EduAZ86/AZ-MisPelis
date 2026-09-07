import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useFavorites, type FavoriteItem, useContinueWatching, type ContinueWatchingItem } from "@features/favorites";
import { TabScreen, useTabScrollInsets } from "@core/components/TabScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@core/providers/ThemeProvider";

export default function FavoritesScreen() {
  const { colors, radius } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { favorites, toggle } = useFavorites();
  const { items: continueWatching, remove: removeContinue } = useContinueWatching();
  const scrollInsets = useTabScrollInsets(56);

  const movieFavorites = favorites.filter((f) => f.type === "movie");
  const seriesFavorites = favorites.filter((f) => f.type === "tv");

  const cardWidth = isTablet ? 150 : (width - 48) / 3;

  return (
    <TabScreen floatingHeader={null}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: isTablet ? insets.top + 16 : scrollInsets.paddingTop,
          paddingBottom: scrollInsets.paddingBottom,
          paddingHorizontal: 16,
        }}
      >
        {continueWatching.length > 0 && (
          <Section title="Continuar viendo">
            <FlatList
              data={continueWatching}
              keyExtractor={(item) => `cw-${item.type}-${item.id}-${item.season ?? ""}-${item.episode ?? ""}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowContent}
              renderItem={({ item }) => (
                <ContinueCard
                  item={item}
                  cardWidth={cardWidth}
                  colors={colors}
                  radius={radius}
                  onPress={() => router.push(`/${item.type === "tv" ? "series" : item.type}/${item.id}${item.season ? `?season=${item.season}&episode=${item.episode}` : ""}`)}
                  onRemove={() => removeContinue(item.id, item.type, item.season, item.episode)}
                />
              )}
            />
          </Section>
        )}

        {movieFavorites.length > 0 && (
          <Section title="Películas favoritas">
            <FlatList
              data={movieFavorites}
              keyExtractor={(item) => `fav-movie-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowContent}
              renderItem={({ item }) => (
                <FavoriteCard
                  item={item}
                  cardWidth={cardWidth}
                  colors={colors}
                  radius={radius}
                  onPress={() => router.push(`/movie/${item.id}`)}
                  onRemove={() => toggle(item)}
                />
              )}
            />
          </Section>
        )}

        {seriesFavorites.length > 0 && (
          <Section title="Series favoritas">
            <FlatList
              data={seriesFavorites}
              keyExtractor={(item) => `fav-tv-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowContent}
              renderItem={({ item }) => (
                <FavoriteCard
                  item={item}
                  cardWidth={cardWidth}
                  colors={colors}
                  radius={radius}
                  onPress={() => router.push(`/series/${item.id}`)}
                  onRemove={() => toggle(item)}
                />
              )}
            />
          </Section>
        )}

        {continueWatching.length === 0 && movieFavorites.length === 0 && seriesFavorites.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No tienes contenido en tu biblioteca
            </Text>
          </View>
        )}
      </ScrollView>
    </TabScreen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function ContinueCard({ item, cardWidth, colors, radius, onPress, onRemove }: {
  item: ContinueWatchingItem;
  cardWidth: number;
  colors: ReturnType<typeof useTheme>["colors"];
  radius: ReturnType<typeof useTheme>["radius"];
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.card, { width: cardWidth }]} onPress={onPress}>
      {item.poster ? (
        <Image source={{ uri: item.poster }} style={[styles.poster, { borderRadius: radius.md }]} />
      ) : (
        <View style={[styles.poster, { borderRadius: radius.md, backgroundColor: colors.surfaceAlt }]} />
      )}
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        {item.season && item.episode && (
          <Text style={[styles.episode, { color: colors.gold }]}>T{item.season} E{item.episode}</Text>
        )}
        {"progress" in item && (
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { flex: item.progress, backgroundColor: colors.primary }]} />
          </View>
        )}
      </View>
      <TouchableOpacity
        style={[styles.removeBtn, { backgroundColor: colors.primaryDark }]}
        onPress={(e) => { e.stopPropagation(); onRemove(); }}
      >
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function FavoriteCard({ item, cardWidth, colors, radius, onPress, onRemove }: {
  item: FavoriteItem;
  cardWidth: number;
  colors: ReturnType<typeof useTheme>["colors"];
  radius: ReturnType<typeof useTheme>["radius"];
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.card, { width: cardWidth }]} onPress={onPress}>
      {item.poster ? (
        <Image source={{ uri: item.poster }} style={[styles.poster, { borderRadius: radius.md }]} />
      ) : (
        <View style={[styles.poster, { borderRadius: radius.md, backgroundColor: colors.surfaceAlt }]} />
      )}
      <TouchableOpacity
        style={[styles.removeBtn, { backgroundColor: colors.primaryDark }]}
        onPress={(e) => { e.stopPropagation(); onRemove(); }}
      >
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  rowContent: {
    gap: 10,
  },
  card: {
    marginBottom: 8,
    position: "relative",
  },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  title: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
  episode: { fontSize: 10 },
  progressBar: { height: 3, borderRadius: 1.5, marginTop: 4, overflow: "hidden" },
  progressFill: { height: "100%" },
  removeBtn: { position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  removeBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { fontSize: 16, textAlign: "center" },
});