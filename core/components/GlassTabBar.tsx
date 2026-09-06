import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { GlassPanel, useIsTablet } from "@core/components/Glass";
import { useTheme } from "@core/providers/ThemeProvider";

interface TabDef {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabDef[] = [
  { name: "index", label: "Inicio", icon: "home" },
  { name: "peliculas", label: "Películas", icon: "film-outline" },
  { name: "series", label: "Series", icon: "tv-outline" },
  { name: "search", label: "Buscar", icon: "search" },
  { name: "favorites", label: "Biblioteca", icon: "heart-outline" },
];

export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isTablet = useIsTablet();
  const { colors, glass, radius } = useTheme();

  const position = isTablet
    ? { top: insets.top + 4 }
    : { bottom: Math.max(insets.bottom, 8) };

  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        { justifyContent: isTablet ? "flex-start" : "flex-end", alignItems: "center" },
      ]}
    >
      <View style={[styles.barWrap, position]}>
        <GlassPanel style={isTablet ? [styles.barTablet, { borderRadius: radius.pill }] : styles.bar}>
          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const tab = TABS.find((t) => t.name === route.name);
              if (!tab) return null;
              const focused = state.index === index;
              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };
              return (
                <TabButton
                  key={route.key}
                  tab={tab}
                  focused={focused}
                  onPress={onPress}
                  showLabels={!isTablet}
                  gold={colors.gold}
                  inactive={glass.inactive}
                />
              );
            })}
          </View>
        </GlassPanel>
      </View>
    </View>
  );
}

function TabButton({
  tab,
  focused,
  onPress,
  showLabels,
  gold,
  inactive,
}: {
  tab: TabDef;
  focused: boolean;
  onPress: () => void;
  showLabels: boolean;
  gold: string;
  inactive: string;
}) {
  return (
    <View style={styles.tabWrap}>
      <View style={styles.touch}>
        <Ionicons
          name={tab.icon}
          size={20}
          color={focused ? gold : inactive}
          onPress={onPress}
          suppressHighlighting
        />
        {showLabels ? (
          <Text onPress={onPress} style={[styles.label, { color: focused ? gold : inactive }]}>
            {tab.label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const TABBAR_SPACE_PHONE = 88;
export const TABBAR_SPACE_TABLET = 64;

const styles = StyleSheet.create({
  barWrap: {
    position: "absolute",
    alignSelf: "center",
    width: "90%",
    maxWidth: 560,
  },
  bar: { borderRadius: 28, minHeight: 58 },
  barTablet: { minHeight: 48 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabWrap: { flex: 1, alignItems: "center" },
  touch: { alignItems: "center", justifyContent: "center", paddingVertical: 2, minWidth: 48 },
  label: { fontSize: 10, fontWeight: "500", marginTop: 2 },
});