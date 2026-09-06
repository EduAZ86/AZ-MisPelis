import { useState, useCallback } from "react";
import type { CatalogFilters, CatalogSortBy } from "@core/types";

export const DEFAULT_FILTERS: CatalogFilters = {
  genre: null,
  year: null,
  sortBy: "popularity.desc",
};

export function useCatalogFilters() {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);

  const applyFilters = useCallback((next: CatalogFilters) => {
    setFilters(next);
  }, []);

  const setGenre = useCallback((genre: number | null) => {
    setFilters((prev) => ({ ...prev, genre }));
  }, []);

  const setYear = useCallback((year: number | null) => {
    setFilters((prev) => ({ ...prev, year }));
  }, []);

  const setSortBy = useCallback((sortBy: CatalogSortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const reset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const isDirty = filters.genre !== null || filters.year !== null || filters.sortBy !== DEFAULT_FILTERS.sortBy;

  return { filters, isDirty, applyFilters, setGenre, setYear, setSortBy, reset };
}