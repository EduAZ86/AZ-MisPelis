import React from "react";
import { MediaRow } from "./MediaRow";
import { useGetMovieSection } from "../hooks/useGetMovie";
import { useGetSeriesSection } from "../hooks/useGetSeries";
import type { CatalogSection } from "../hooks/queryKeys";

interface CatalogSectionRowProps {
  section: CatalogSection;
  title: string;
  onPressItem: (item: { media_type: string; id: number }) => void;
}

function SectionRowMovies({ section, title, onPressItem }: CatalogSectionRowProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetMovieSection(section);

  const items = data?.pages.flat() ?? [];

  return (
    <MediaRow
      title={title}
      data={items}
      onPressItem={onPressItem}
      loading={isLoading}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
    />
  );
}

function SectionRowSeries({ section, title, onPressItem }: CatalogSectionRowProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetSeriesSection(section);

  const items = data?.pages.flat() ?? [];

  return (
    <MediaRow
      title={title}
      data={items}
      onPressItem={onPressItem}
      loading={isLoading}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
    />
  );
}

export function CatalogSectionRow({ section, title, onPressItem }: CatalogSectionRowProps) {
  const isMovie = section.startsWith("movie-") || section === "trending";

  if (isMovie) {
    return <SectionRowMovies section={section} title={title} onPressItem={onPressItem} />;
  }
  return <SectionRowSeries section={section} title={title} onPressItem={onPressItem} />;
}