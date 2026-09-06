import { useState, useCallback } from "react";
import type { CatalogSection } from "./queryKeys";

export function useCatalogFilters() {
  const [activeSection, setActiveSection] = useState<CatalogSection>("trending");

  const setSection = useCallback((section: CatalogSection) => {
    setActiveSection(section);
  }, []);

  return { activeSection, setSection };
}