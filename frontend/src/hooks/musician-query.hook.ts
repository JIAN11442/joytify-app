import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "../constants/query-client-key.constant";
import {
  getFollowingMusicians,
  getMusicianById,
  getRecommendedMusicians,
} from "../fetchs/musician.fetch";

export const useGetMusicianByIdQuery = (id: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: musician, ...rest } = useQuery({
    queryKey: [QueryKey.GET_TARGET_MUSICIAN, id],
    queryFn: async () => {
      try {
        const musician = await getMusicianById(id);

        return musician;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !isQueryError,
    ...opts,
  });

  return { musician, ...rest };
};

export const useGetFollowingMusiciansQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: musicians, ...rest } = useQuery({
    queryKey: [QueryKey.GET_FOLLOWING_MUSICIANS],
    queryFn: async () => {
      try {
        const musicians = await getFollowingMusicians();

        return musicians;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !isQueryError,
    ...opts,
  });

  return { musicians, ...rest };
};

export const useGetRecommendedMusiciansQuery = (musicianId: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: recommendedMusicians, ...rest } = useQuery({
    queryKey: [QueryKey.GET_RECOMMENDED_MUSICIANS, musicianId],
    queryFn: async () => {
      try {
        const musician = await getRecommendedMusicians(musicianId);

        return musician;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !isQueryError,
    ...opts,
  });

  return { recommendedMusicians, ...rest };
};
