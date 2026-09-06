import React, { useState, useEffect } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { toast } from "sonner-native";
import { getErrorMessage } from "@core/errors";

function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        throwOnError: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: AsyncStorage,
      throttleTime: 1000 * 60,
    }),
  );

  useEffect(() => {
    if (Platform.OS !== "web") {
      const subscription = AppState.addEventListener("change", (status) => {
        focusManager.setFocused(status === "active");
      });
      return () => subscription.remove();
    }
  }, []);

  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      const appStateSubscription = AppState.addEventListener(
        "change",
        (status) => {
          setOnline(status === "active");
        },
      );
      return () => appStateSubscription.remove();
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24,
          buster: "",
        }}
      >
        {children}
      </PersistQueryClientProvider>
    </QueryClientProvider>
  );
}
