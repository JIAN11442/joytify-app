import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getAuthUserInfo,
  getProfileCollectionInfo,
  getProfileUserInfo,
} from "../fetchs/user.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import { ProfileCollectionsType } from "@joytify/types/types";
import useUserState from "../states/user.state";

type GetProfileUserInfoQueryRequest = {
  page: number;
  opts: object;
};

// get authenticated user info
export const useGetAuthUserInfoQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { setAuthUser, setIsFetchingAuthUser } = useUserState();

  const {
    data: authUser,
    isFetching,
    ...rest
  } = useQuery({
    queryKey: [QueryKey.GET_AUTH_USER_INFO], // When this hook is called multiple times with the same key, it will return the same data
    queryFn: async () => {
      try {
        const user = await getAuthUserInfo();

        return user;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    enabled: !isQueryError, // if get the query error, then stop the query (for loading)
    ...opts,
  });

  useEffect(() => {
    setAuthUser(authUser ?? null);
  }, [authUser]);

  useEffect(() => {
    setIsFetchingAuthUser(isFetching);
  }, [isFetching]);

  return { authUser, isFetching, ...rest };
};

// get profile user info
export const useGetProfileUserInfoQuery = ({
  page = 1,
  opts = {},
}: Partial<GetProfileUserInfoQueryRequest> = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { authUser, setProfileUser } = useUserState();
  const { _id: userId } = authUser ?? {};

  const { data: profileUser, ...rest } = useQuery({
    queryKey: [QueryKey.GET_PROFILE_USER_INFO, userId, page],
    queryFn: async () => {
      try {
        const user = await getProfileUserInfo(page);

        return user;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    placeholderData: (prev) => prev,
    enabled: !!userId && !isQueryError && page > 0,
    ...opts,
  });

  useEffect(() => {
    setProfileUser(profileUser ?? null);
  }, [profileUser]);

  return { profileUser, ...rest };
};

// get profile collection info
export const useGetProfileCollectionInfoQuery = (
  collection: ProfileCollectionsType,
  opts: object = {}
) => {
  const [page, setPage] = useState(1);
  const [isQueryError, setIsQueryError] = useState(false);

  const { authUser, setProfileCollectionDocs } = useUserState();
  const { _id: userId } = authUser ?? {};

  const { data: profileCollectionDocs, ...rest } = useQuery({
    queryKey: [QueryKey.GET_PROFILE_COLLECTION_INFO, userId, page, collection],
    queryFn: async () => {
      try {
        const collectionInfo = await getProfileCollectionInfo({ page, collection });

        setProfileCollectionDocs(collectionInfo);

        return collectionInfo;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
          setProfileCollectionDocs(null);
        }
      }
    },
    placeholderData: (prev) => prev, // keep the previous data when the query is fetching
    enabled: !!userId && !isQueryError && page > 0,
    ...opts,
  });

  return { profileCollectionDocs, page, setPage, ...rest };
};
