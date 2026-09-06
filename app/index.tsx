import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CatalogSectionRow, type CatalogSection } from "@features/catalog";
import { NavHeader } from "@core/components/NavHeader";
import { theme } from "@core/theme";

const { colors } = theme;

const SECTIONS: { section: CatalogSection; title: string }[] = [
  { section: "trending", title: "Tendencias esta semana" },
  { section: "movie-popular", title: "Películas populares" },
  { section: "tv-popular", title: "Series populares" },
  { section: "movie-top", title: "Películas mejor valoradas" },
  { section: "tv-top", title: "Series mejor valoradas" },
];

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = (item: { media_type: string; id: number }) => {
    const routeType = item.media_type === "tv" ? "series" : item.media_type;
    router.push(`/${routeType}/${item.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavHeader logo title="misPelis" showFavorites />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map(({ section, title }) => (
          <CatalogSectionRow
            key={section}
            section={section}
            title={title}
            onPressItem={handlePress}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 24 },
});