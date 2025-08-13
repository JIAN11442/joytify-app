import { ScopedFormatMessage } from "../hooks/intl.hook";
import { SearchFilterOptions } from "@joytify/shared-types/constants";
import { SearchFilterType } from "@joytify/shared-types/types";

type FilterPanelItem = {
  id: string;
  key: SearchFilterType;
  title: string;
};

export const getSearchFilterPanelContent = (fm: ScopedFormatMessage): FilterPanelItem[] => {
  const searchFilterTypeFm = fm("search.filterType");

  const { ALL, SONGS, ALBUMS, MUSICIANS, GENRES_AND_TAGS, LANGUAGES } = SearchFilterOptions;

  return [
    {
      id: "search-filter-panel-all",
      key: ALL,
      title: searchFilterTypeFm("all"),
    },
    {
      id: "search-filter-panel-songs",
      key: SONGS,
      title: searchFilterTypeFm("songs"),
    },

    {
      id: "search-filter-panel-musicians",
      key: MUSICIANS,
      title: searchFilterTypeFm("musicians"),
    },
    {
      id: "search-filter-panel-albums",
      key: ALBUMS,
      title: searchFilterTypeFm("albums"),
    },
    {
      id: "search-filter-panel-genresAndTags",
      key: GENRES_AND_TAGS,
      title: searchFilterTypeFm("genresAndTags"),
    },
    {
      id: "search-filter-panel-languages",
      key: LANGUAGES,
      title: searchFilterTypeFm("languages"),
    },
  ];
};
