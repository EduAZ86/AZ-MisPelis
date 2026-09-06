import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TABBAR_SPACE_PHONE, TABBAR_SPACE_TABLET } from "@core/components/GlassTabBar";
import { useTheme } from "@core/providers/ThemeProvider";

export function useTabScrollInsets(headerHeight = 56) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  return {
    paddingTop: isTablet ? 8 : insets.top + headerHeight,
    paddingBottom: isTablet ? 24 : TABBAR_SPACE_PHONE + insets.bottom,
  };
}

interface TabScreenProps {
  children: React.ReactNode;
  floatingHeader?: React.ReactNode;
}

export function TabScreen({ children, floatingHeader }: TabScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.content,
          { paddingTop: isTablet ? insets.top + TABBAR_SPACE_TABLET : 0 },
        ]}
      >
        {children}
      </View>

      {floatingHeader ? (
        <View
          pointerEvents="box-none"
          style={[styles.headerLayer, { paddingTop: insets.top }]}
        >
          {floatingHeader}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});