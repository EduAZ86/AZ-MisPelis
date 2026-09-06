import React from "react";
import { View, ScrollView, Text, ActivityIndicator, RefreshControl, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { CatalogSectionRow, type CatalogSection } from "@features/catalog";

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>misPelis</Text>
        </View>
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
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  scrollContent: { paddingBottom: 24 },
  header: { padding: 16 },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "800" },
});