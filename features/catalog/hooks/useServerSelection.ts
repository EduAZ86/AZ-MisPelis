import { useState, useCallback, useMemo } from "react";
import type { StreamSource } from "@core/types";

interface ServerSelectionState {
  sources: StreamSource[];
  selectedKey: string | null;
  languageFilter: string | null;
  serverFilter: string | null;
}

export function useServerSelection(initialSources: StreamSource[] = []) {
  const [state, setState] = useState<ServerSelectionState>({
    sources: initialSources,
    selectedKey: null,
    languageFilter: null,
    serverFilter: null,
  });

  const setSources = useCallback((sources: StreamSource[]) => {
    setState((prev) => ({
      ...prev,
      sources,
      selectedKey: prev.selectedKey ?? sources[0]?.key ?? null,
    }));
  }, []);

  const selectSource = useCallback((source: StreamSource) => {
    setState((prev) => ({ ...prev, selectedKey: source.key }));
  }, []);

  const setLanguageFilter = useCallback((language: string | null) => {
    setState((prev) => ({ ...prev, languageFilter: language }));
  }, []);

  const setServerFilter = useCallback((server: string | null) => {
    setState((prev) => ({ ...prev, serverFilter: server }));
  }, []);

  const groupedByLanguage = useMemo(() => {
    const groups: Record<string, StreamSource[]> = {};
    for (const source of state.sources) {
      const lang = source.language;
      if (!groups[lang]) groups[lang] = [];
      groups[lang].push(source);
    }
    return groups;
  }, [state.sources]);

  const filteredSources = useMemo(() => {
    let sources = state.sources;
    if (state.languageFilter) {
      sources = sources.filter((s) => s.language === state.languageFilter);
    }
    if (state.serverFilter) {
      sources = sources.filter((s) => s.mirror === state.serverFilter);
    }
    return sources;
  }, [state.sources, state.languageFilter, state.serverFilter]);

  const languages = useMemo(() => Array.from(new Set(state.sources.map((s) => s.language))), [state.sources]);
  const servers = useMemo(() => Array.from(new Set(state.sources.map((s) => s.mirror))), [state.sources]);

  const selectedSource = useMemo(
    () => state.sources.find((s) => s.key === state.selectedKey) ?? null,
    [state.sources, state.selectedKey]
  );

  return {
    sources: state.sources,
    groupedByLanguage,
    filteredSources,
    languages,
    servers,
    selectedSource,
    selectedKey: state.selectedKey,
    languageFilter: state.languageFilter,
    serverFilter: state.serverFilter,
    setSources,
    selectSource,
    setLanguageFilter,
    setServerFilter,
  };
}