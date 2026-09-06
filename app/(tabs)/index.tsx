import React from "react";
import { ScrollView, StyleSheet, Text, View, Image, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CatalogSectionRow, HeroCard, GenreChips, SectionHeader, useGetMovieSection } from "@features/catalog";
import type { TmdbMedia } from "@core/types";
import { TabScreen, useTabScrollInsets } from "@core/components/TabScreen";
import { GlassPanel } from "@core/components/Glass";
import { useTheme } from "@core/providers/ThemeProvider";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, glass, radius } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const scrollInsets = useTabScrollInsets(56);
  const { data: trending } = useGetMovieSection("trending");
  const trendingItems = trending?.pages.flat().slice(0, 5) ?? [];

  const handlePress = (item: { media_type: string; id: number } | TmdbMedia) => {
    const routeType = item.media_type === "tv" ? "series" : item.media_type;
    router.push(`/${routeType}/${item.id}`);
  };

  const maxRowWidth = isTablet ? 720 : undefined;
  const rowStyle = maxRowWidth ? { width: maxRowWidth, alignSelf: "center" as const } : undefined;

  return (
    <TabScreen
      floatingHeader={
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/pelusito.png")}
              style={[styles.logo, { borderRadius: radius.md, borderColor: colors.primary }]}
            />
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>AZ</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Mis Pelis</Text>
            </View>
          </View>
          <GlassPanel style={styles.headerBtn}>
            <Ionicons
              name="settings-outline"
              size={18}
              color={glass.active}
              onPress={() => router.push("/settings")}
              suppressHighlighting
            />
          </GlassPanel>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollInsets}>
        <View style={rowStyle}>
          <HeroCard items={trendingItems} onPressItem={handlePress} />
        </View>

        <View style={rowStyle}>
          <SectionHeader title="Películas populares" onViewAll={() => router.push("/peliculas")} />
        </View>
        <View style={rowStyle}>
          <CatalogSectionRow section="movie-popular" title="" onPressItem={handlePress} />
        </View>

        <View style={rowStyle}>
          <SectionHeader title="Series populares" onViewAll={() => router.push("/series")} />
        </View>
        <View style={rowStyle}>
          <CatalogSectionRow section="tv-popular" title="" onPressItem={handlePress} />
        </View>

        <View style={[styles.genresBlock, rowStyle]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Géneros</Text>
          <GenreChips />
        </View>

        <View style={rowStyle}>
          <CatalogSectionRow section="movie-top" title="Películas mejor valoradas" onPressItem={handlePress} />
        </View>
        <View style={rowStyle}>
          <CatalogSectionRow section="tv-top" title="Series mejor valoradas" onPressItem={handlePress} />
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40, borderWidth: 1.5 },
  headerTitle: { fontSize: 20, fontWeight: "800", lineHeight: 22 },
  headerSubtitle: { fontSize: 12, fontWeight: "600" },
  headerBtn: { width: 36, height: 36 },
  genresBlock: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10, paddingHorizontal: 16 },
});