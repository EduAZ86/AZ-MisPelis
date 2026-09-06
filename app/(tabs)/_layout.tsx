import React from "react";
import { Tabs } from "expo-router";
import { GlassTabBar } from "@core/components/GlassTabBar";
import { useTheme } from "@core/providers/ThemeProvider";

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="peliculas" options={{ title: "Películas" }} />
      <Tabs.Screen name="series" options={{ title: "Series" }} />
      <Tabs.Screen name="search" options={{ title: "Buscar" }} />
      <Tabs.Screen name="favorites" options={{ title: "Biblioteca" }} />
    </Tabs>
  );
}