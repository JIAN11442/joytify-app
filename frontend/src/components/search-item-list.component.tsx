import { FormattedMessage } from "react-intl";
import SongCardList from "./song-card-list.component";
import AlbumCardList from "./album-card-list.component";
import LabelCardList from "./label-card-list.component";
import MusicianCardList from "./musician-card-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { SearchFilterOptions } from "@joytify/shared-types/constants";
import {
  RefactorAlbumResponse,
  RefactorMusicianResponse,
  RefactorSearchLabelResponse,
  RefactorSongResponse,
  SearchFilterType,
} from "@joytify/shared-types/types";

type SearchItemListProps = {
  fm: ScopedFormatMessage;
  type: SearchFilterType;
  items:
    | RefactorSongResponse[]
    | RefactorMusicianResponse[]
    | RefactorAlbumResponse[]
    | RefactorSearchLabelResponse[];
  searchQuery: string;
};

const SearchItemList: React.FC<SearchItemListProps> = ({ fm, type, items, searchQuery }) => {
  const { SONGS, MUSICIANS, ALBUMS, GENRES_AND_TAGS, LANGUAGES } = SearchFilterOptions;

  const searchFilterTypeFm = fm("search.filterType");

  if (!items || items.length === 0) {
    return (
      <p
        className={`
          py-10 
          pl-10
          text-neutral-500 
          bg-neutral-800/30
          rounded-md
      `}
      >
        <FormattedMessage
          id="search.filterItem.noFound"
          values={{
            type: searchFilterTypeFm(`${type}`).toLowerCase(),
            searchQuery: searchQuery,
            strong: (chunks) => <strong className={`text-neutral-300`}>{chunks}</strong>,
          }}
        />
      </p>
    );
  }

  switch (type) {
    case SONGS: {
      const songs = items as RefactorSongResponse[];
      return (
        <SongCardList
          songs={songs}
          className={`flex overflow-x-auto hidden-scrollbar`}
          tw={{ card: "w-[200px] max-sm:w-[180px]" }}
        />
      );
    }

    case MUSICIANS: {
      const musicians = items as RefactorMusicianResponse[];
      return (
        <MusicianCardList
          musicians={musicians}
          className={`flex overflow-x-auto hidden-scrollbar`}
          tw={{ card: "w-[200px] max-sm:w-[180px]" }}
        />
      );
    }

    case ALBUMS: {
      const albums = items as RefactorAlbumResponse[];
      return (
        <AlbumCardList
          albums={albums}
          className={`flex overflow-x-auto hidden-scrollbar`}
          tw={{ card: "w-[200px] max-sm:w-[180px]" }}
        />
      );
    }

    case GENRES_AND_TAGS: {
      const genresAndTags = items as RefactorSearchLabelResponse[];
      return (
        <LabelCardList
          labels={genresAndTags}
          className={`flex overflow-x-auto hidden-scrollbar`}
          tw={{ card: "w-[200px] max-sm:w-[180px]" }}
        />
      );
    }

    case LANGUAGES: {
      const languages = items as RefactorSearchLabelResponse[];
      return (
        <LabelCardList
          labels={languages}
          className={`flex overflow-x-auto hidden-scrollbar`}
          tw={{ card: "w-[200px] max-sm:w-[180px]" }}
        />
      );
    }
  }
};

export default SearchItemList;
