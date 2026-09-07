import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { GlassPanel, useIsTablet } from "@core/components/Glass";
import { useTheme } from "@core/providers/ThemeProvider";
import { useSearchQuery, setSearchQuery } from "@core/searchStore";
import { useNavFilterChips } from "@core/navFilterStore";

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
  const router = useRouter();
  const searchQuery = useSearchQuery();
  const navFilterChips = useNavFilterChips();

  if (isTablet) {
    const activeRoute = state.routes[state.index]?.name;
    const searchMode = activeRoute === "search";
    const filterMode =
      (activeRoute === "peliculas" || activeRoute === "series") && navFilterChips !== null;

    return (
      <View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill, { justifyContent: "flex-start" }]}
      >
        <View style={[styles.tabletBar, { top: insets.top }]}>
          <GlassPanel style={[styles.tabletBarInner, { borderRadius: radius.pill }]}>
            <View style={styles.tabletRow}>
              <View style={styles.tabletBrand}>
                <Image
                  source={require("../../assets/pelusito.png")}
                  style={styles.tabletLogo}
                />
                <Text style={[styles.tabletBrandText, { color: colors.text }]}>Mis Pelis</Text>
              </View>

              <View style={styles.tabletTabs}>
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
                    <TabButtonTablet
                      key={route.key}
                      tab={tab}
                      focused={focused}
                      onPress={onPress}
                      gold={colors.gold}
                      inactive={glass.inactive}
                    />
                  );
                })}
              </View>

              <TouchableOpacity style={styles.tabletActions} onPress={() => router.push("/settings")} activeOpacity={0.7}>
                <Ionicons
                  name="settings-outline"
                  size={18}
                  color={glass.inactive}
                  suppressHighlighting
                />
              </TouchableOpacity>
            </View>

            {searchMode ? (
              <View style={styles.tabletSearchRow}>
                <View style={styles.tabletSearchInputWrap}>
                  <TextInput
                    style={[styles.tabletSearchInput, { color: colors.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar películas y series..."
                    placeholderTextColor={glass.inactive}
                    autoCorrect={false}
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery("")}
                      hitSlop={8}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="close-circle" size={20} color={glass.inactive} suppressHighlighting />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : null}

            {filterMode && navFilterChips ? (
              <View style={styles.tabletFilterChips}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabletFilterChipsContent}>
                  <TouchableOpacity
                    style={[styles.tabletFilterChip, styles.tabletFilterChipActive]}
                    onPress={navFilterChips.onOpen}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabletFilterChipText, { color: colors.text }]}>
                      {navFilterChips.sortLabel}
                    </Text>
                  </TouchableOpacity>
                  {navFilterChips.genreLabel ? (
                    <TouchableOpacity
                      style={[styles.tabletFilterChip, styles.tabletFilterChipActive]}
                      onPress={navFilterChips.onClearGenre}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.tabletFilterChipText, { color: colors.text }]}>
                        {navFilterChips.genreLabel} ✕
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {navFilterChips.yearLabel ? (
                    <TouchableOpacity
                      style={[styles.tabletFilterChip, styles.tabletFilterChipActive]}
                      onPress={navFilterChips.onClearYear}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.tabletFilterChipText, { color: colors.text }]}>
                        {navFilterChips.yearLabel} ✕
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={styles.tabletFilterChip}
                    onPress={navFilterChips.onOpen}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabletFilterChipText, { color: glass.inactive }]}>Filtrar…</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            ) : null}
          </GlassPanel>
        </View>
      </View>
    );
  }

  const position = { bottom: Math.max(insets.bottom, 8) };

  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        { justifyContent: "flex-end", alignItems: "center" },
      ]}
    >
      <View style={[styles.barWrap, position]}>
        <GlassPanel style={styles.bar}>
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

function TabButtonTablet({
  tab,
  focused,
  onPress,
  gold,
  inactive,
}: {
  tab: TabDef;
  focused: boolean;
  onPress: () => void;
  gold: string;
  inactive: string;
}) {
  return (
    <View style={styles.tabletTabWrap}>
      <TouchableOpacity style={styles.tabletTouch} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={tab.icon} size={18} color={focused ? gold : inactive} suppressHighlighting />
        <Text style={[styles.tabletLabel, { color: focused ? gold : inactive }]}>{tab.label}</Text>
      </TouchableOpacity>
    </View>
  );
}

function TabButton({
  tab,
  focused,
  onPress,
  gold,
  inactive,
}: {
  tab: TabDef;
  focused: boolean;
  onPress: () => void;
  gold: string;
  inactive: string;
}) {
  return (
    <View style={styles.tabWrap}>
      <TouchableOpacity style={styles.touch} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={tab.icon} size={20} color={focused ? gold : inactive} suppressHighlighting />
        <Text style={[styles.label, { color: focused ? gold : inactive }]}>{tab.label}</Text>
      </TouchableOpacity>
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
  bar: { borderRadius: 28, minHeight: 68 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  tabWrap: { flex: 1, alignItems: "center" },
  touch: { alignItems: "center", justifyContent: "center", paddingVertical: 12, minWidth: 48, minHeight: 44 },
  label: { fontSize: 10, fontWeight: "500", marginTop: 2 },

  tabletBar: {
    position: "absolute",
    alignSelf: "center",
  },
  tabletBarInner: {
  },
  tabletRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 12,
  },
  tabletBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 16,
  },
  tabletLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  tabletBrandText: {
    fontSize: 15,
    fontWeight: "700",
  },
  tabletTabs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabletTabWrap: {
    alignItems: "center",
  },
  tabletTouch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 999,
    minHeight: 44,
  },
  tabletLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  tabletSearchRow: {
    alignSelf: "stretch",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  tabletSearchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 40,
  },
  tabletSearchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  tabletFilterChips: {
    alignSelf: "stretch",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  tabletFilterChipsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  tabletFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  tabletFilterChipActive: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderColor: "rgba(255,255,255,0.42)",
  },
  tabletFilterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabletActions: {
    marginLeft: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});