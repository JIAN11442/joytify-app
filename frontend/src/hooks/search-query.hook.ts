import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSearchContentByType } from "../fetchs/search.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import { SearchFilterType } from "@joytify/shared-types/types";

type GetSearchContentByTypeQuery = {
  type: SearchFilterType;
  query: string;
  opts?: object;
};

type SearchPrevRef = {
  type: SearchFilterType;
  query: string;
};

export const useSearchContentByTypeQuery = ({
  type,
  query,
  opts = {},
}: GetSearchContentByTypeQuery) => {
  const [page, setPage] = useState(1);
  const [isQueryError, setIsQueryError] = useState(false);
  const prevTypeRef = useRef<SearchPrevRef>({ type, query });

  useEffect(() => {
    const el = prevTypeRef.current;

    if (el.type !== type || el.query !== query) {
      setPage(1);
      prevTypeRef.current = { type, query };
    }
  }, [type, query]);

  const { data: searchContent, ...rest } = useQuery({
    queryKey: [QueryKey.GET_SEARCH_CONTENT_BY_TYPE, type, query, page],
    queryFn: async () => {
      try {
        const content = await getSearchContentByType({ type, query, page });

        return content;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !isQueryError,

    // keep placeholder data for same type (pagination),
    // clear for different type (filter change)
    placeholderData: (prev, prevQuery) => {
      const prevType = prevQuery?.queryKey[1];
      return prevType === type ? prev : undefined;
    },
    ...opts,
  });

  return { searchContent, page, setPage, ...rest };
};
