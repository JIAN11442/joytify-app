import {
  GridCardListSkeleton,
  CircleCardListSkeleton,
  GridCardListSectionSkeleton,
  SongTableListSkeleton,
} from "./skeleton-loading.component";
import { SearchFilterOptions } from "@joytify/shared-types/constants";
import { SearchFilterType } from "@joytify/shared-types/types";

type SearchFilterSkeletonProps = {
  type: SearchFilterType;
};

const SearchFilterSkeleton: React.FC<SearchFilterSkeletonProps> = ({ type }) => {
  const { ALL, SONGS, ALBUMS, MUSICIANS, GENRES_AND_TAGS, LANGUAGES } = SearchFilterOptions;

  switch (type) {
    case ALL: {
      return <GridCardListSectionSkeleton sectionCount={4} listCount={5} />;
    }

    case SONGS: {
      return <SongTableListSkeleton listCount={4} />;
    }

    case ALBUMS:
    case GENRES_AND_TAGS:
    case LANGUAGES: {
      return <GridCardListSkeleton count={4} tw={{ image: "h-[180px]" }} />;
    }

    case MUSICIANS: {
      return <CircleCardListSkeleton count={4} />;
    }
  }
};

export default SearchFilterSkeleton;
