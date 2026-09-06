import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { QueryProvider } from "@core/providers/QueryProvider";
import { Toaster } from "sonner-native";
import { theme } from "@core/theme";

const { colors, radius } = theme;

export default function RootLayout() {
  return (
    <QueryProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="search" />
        <Stack.Screen name="movie/[id]" />
        <Stack.Screen name="series/[id]" />
        <Stack.Screen name="favorites" />
      </Stack>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { backgroundColor: colors.surface },
          descriptionStyle: { color: "#fff" },
        }}
      />
    </QueryProvider>
  );
}

// Error boundary global: un error de render nunca rompe la app.
// expo-router llama este componente si una pantalla lanza durante el render.
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={boundaryStyles.container}>
      <Text style={boundaryStyles.emoji}>🎬</Text>
      <Text style={boundaryStyles.title}>Algo salió mal</Text>
      <Text style={boundaryStyles.message}>{error.message || "Error inesperado"}</Text>
      <TouchableOpacity style={boundaryStyles.button} onPress={retry}>
        <Text style={boundaryStyles.buttonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
}

const boundaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { color: colors.cream, fontSize: 22, fontWeight: "800", marginBottom: 8 },
  message: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginBottom: 24 },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: colors.text, fontWeight: "700", fontSize: 15 },
});