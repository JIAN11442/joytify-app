import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getHomepageRecommendedAlbums,
  getHomepageRecommendedLabels,
  getHomepageRecommendedSongs,
  getPopularMusicians,
  getRecentlyPlayedSongs,
} from "../fetchs/homepage.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import { LabelOptionsType } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";

type RecommendedItemsBySongIdsRequest = {
  initialPage?: number;
  songIds?: string[];
  opts?: object;
};

const useHomepageCommon = () => {
  const { authUser } = useUserState();
  const { _id: userId } = authUser ?? {};

  return { userId };
};

export const useGetPopularMusiciansQuery = (initialPage?: number, opts: object = {}) => {
  const [page, setPage] = useState(initialPage || 1);

  const { data: popularMusicians, ...rest } = useQuery({
    queryKey: [QueryKey.GET_POPULAR_MUSICIANS, page],
    queryFn: () => getPopularMusicians(page),
    staleTime: Infinity,
    ...opts,
  });

  return { popularMusicians, page, setPage, ...rest };
};

export const useGetRecentlyPlayedSongsQuery = (initialPage?: number, opts: object = {}) => {
  const [page, setPage] = useState(initialPage || 1);
  const { userId } = useHomepageCommon();

  const { data: recentlyPlayedSongs, ...rest } = useQuery({
    queryKey: [QueryKey.GET_RECENTLY_PLAYED_SONGS, page, userId],
    queryFn: () => getRecentlyPlayedSongs(page),
    staleTime: Infinity,
    enabled: !!userId,
    ...opts,
  });

  return { recentlyPlayedSongs, page, setPage, ...rest };
};

export const useGetRecommendedLabelsQuery = (
  type: LabelOptionsType,
  initialPage?: number,
  opts: object = {}
) => {
  const [page, setPage] = useState(initialPage || 1);

  const { data: recommendedLabels, ...rest } = useQuery({
    queryKey: [QueryKey.GET_HOMEPAGE_RECOMMENDED_LABELS, type, page],
    queryFn: () => getHomepageRecommendedLabels(type, page),
    staleTime: Infinity,
    ...opts,
  });

  return { recommendedLabels, page, setPage, ...rest };
};

export const useGetRecommendedSongsQuery = (request: RecommendedItemsBySongIdsRequest = {}) => {
  const { initialPage, songIds, opts } = request;

  const [page, setPage] = useState(initialPage || 1);

  const { data: recommendedSongs, ...rest } = useQuery({
    queryKey: [QueryKey.GET_HOMEPAGE_RECOMMENDED_SONGS, songIds, page],
    queryFn: () => getHomepageRecommendedSongs(page, songIds),
    staleTime: Infinity,
    ...opts,
  });

  return { recommendedSongs, page, setPage, ...rest };
};

export const useGetRecommendedAlbumsQuery = (request: RecommendedItemsBySongIdsRequest = {}) => {
  const { initialPage, songIds, opts } = request;

  const [page, setPage] = useState(initialPage || 1);

  const { data: recommendedAlbums, ...rest } = useQuery({
    queryKey: [QueryKey.GET_HOMEPAGE_RECOMMENDED_ALBUMS, songIds, page],
    queryFn: () => getHomepageRecommendedAlbums(page, songIds),
    staleTime: Infinity,
    ...opts,
  });

  return { recommendedAlbums, page, setPage, ...rest };
};
