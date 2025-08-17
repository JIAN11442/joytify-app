import { twMerge } from "tailwind-merge";
import { FormattedMessage } from "react-intl";

import Loader from "./loader.component";
import {
  GridCardSkeleton,
  CircleCardSkeleton,
  SongTableTrSkeleton,
} from "./skeleton-loading.component";
import AlbumCardList from "./album-card-list.component";
import LabelCardList from "./label-card-list.component";
import SearchAllList from "./search-all-list.component";
import SongTableList from "./song-table-list.component";
import MusicianCardList from "./musician-card-list.component";
import SearchFilterSkeleton from "./search-filter-skeleton.component";
import SearchPaginationList from "./search-pagination-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { useSearchContentByTypeQuery } from "../hooks/search-query.hook";
import { SearchFilterOptions } from "@joytify/shared-types/constants";
import {
  SearchAlbumResponse,
  SearchAllResponse,
  SearchFilterType,
  SearchLabelResponse,
  SearchMusicianResponse,
  SearchSongResponse,
} from "@joytify/shared-types/types";

type SearchFilterContentProps = {
  fm: ScopedFormatMessage;
  searchFilter: SearchFilterType;
  searchQuery: string;
};

const SearchFilterContent: React.FC<SearchFilterContentProps> = ({
  fm,
  searchFilter,
  searchQuery,
}) => {
  const searchFilterTypeFm = fm("search.filterType");

  const { ALL, SONGS, MUSICIANS, ALBUMS, GENRES_AND_TAGS, LANGUAGES } = SearchFilterOptions;

  const { searchContent, page, setPage, isLoading, isFetching } = useSearchContentByTypeQuery({
    type: searchFilter,
    query: searchQuery,
  });

  const pageControl = { page, setPage };

  const NoFoundMessage = ({ className }: { className?: string }) => {
    return (
      <p
        className={twMerge(
          `
          py-10
          text-[14px]
          text-center
          text-neutral-500
          tracking-widest
          `,
          className
        )}
      >
        <FormattedMessage
          id="search.filterItem.noFound"
          values={{
            type: searchFilterTypeFm(`${searchFilter}`).toLowerCase(),
            searchQuery: searchQuery,
            strong: (chunks) => <strong className={`text-neutral-300`}>{chunks}</strong>,
          }}
        />
      </p>
    );
  };

  if (isLoading) {
    return <SearchFilterSkeleton type={searchFilter} />;
  }

  if (!searchContent) {
    return <p>Something went wrong</p>;
  }

  switch (searchFilter) {
    case ALL: {
      const docs = searchContent as SearchAllResponse;

      return (
        <>
          {isFetching && <Loader loader={{ name: "BeatLoader", size: 12 }} />}
          <SearchAllList fm={fm} docs={docs} searchQuery={searchQuery} />
        </>
      );
    }

    case SONGS: {
      const { docs, totalDocs, page } = searchContent as SearchSongResponse;

      return (
        <SearchPaginationList
          fm={fm}
          totalDocs={totalDocs}
          currentPage={page}
          currentDocsLength={docs.length}
          pageControl={pageControl}
          tw={{ divider: "-mt-2" }}
        >
          <div>
            <SongTableList
              fm={fm}
              songs={docs}
              switchFunc={false}
              noFoundMessage={<NoFoundMessage />}
            >
              {isFetching && (
                <>
                  <SongTableTrSkeleton />
                  <SongTableTrSkeleton />
                </>
              )}
            </SongTableList>
          </div>
        </SearchPaginationList>
      );
    }

    case MUSICIANS: {
      const { docs, totalDocs, page } = searchContent as SearchMusicianResponse;

      if (!docs || docs.length === 0) {
        return <NoFoundMessage className={`mt-10`} />;
      }

      return (
        <SearchPaginationList
          fm={fm}
          totalDocs={totalDocs}
          currentPage={page}
          currentDocsLength={docs.length}
          pageControl={pageControl}
          divider={false}
          tw={{ pagination: "mt-10" }}
        >
          <MusicianCardList musicians={docs}>
            {isFetching && (
              <>
                <CircleCardSkeleton />
                <CircleCardSkeleton />
              </>
            )}
          </MusicianCardList>
        </SearchPaginationList>
      );
    }

    case ALBUMS: {
      const { docs, totalDocs, page } = searchContent as SearchAlbumResponse;

      if (!docs || docs.length === 0) {
        return <NoFoundMessage className={`mt-10`} />;
      }

      return (
        <SearchPaginationList
          fm={fm}
          totalDocs={totalDocs}
          currentPage={page}
          currentDocsLength={docs.length}
          pageControl={pageControl}
          divider={false}
          tw={{ pagination: "mt-10" }}
        >
          <AlbumCardList albums={docs}>
            {isFetching && (
              <>
                <GridCardSkeleton />
                <GridCardSkeleton />
              </>
            )}
          </AlbumCardList>
        </SearchPaginationList>
      );
    }

    case GENRES_AND_TAGS:
    case LANGUAGES: {
      const { docs, totalDocs, page } = searchContent as SearchLabelResponse;

      if (!docs || docs.length === 0) {
        return <NoFoundMessage className={`mt-10`} />;
      }

      return (
        <SearchPaginationList
          fm={fm}
          totalDocs={totalDocs}
          currentPage={page}
          currentDocsLength={docs.length}
          pageControl={pageControl}
          divider={false}
          tw={{ pagination: "mt-10" }}
        >
          <LabelCardList labels={docs}>
            {isFetching && (
              <>
                <GridCardSkeleton />
                <GridCardSkeleton />
              </>
            )}
          </LabelCardList>
        </SearchPaginationList>
      );
    }

    default:
      return <p>Unsupported filter type</p>;
  }
};

export default SearchFilterContent;
