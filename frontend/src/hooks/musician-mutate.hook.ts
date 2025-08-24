import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { followMusician, unfollowMusician, updateMusicianInfo } from "../fetchs/musician.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";

const useMusicianCommon = () => {
  const refetchQueriesData = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey[0];
        return (
          queryKey === QueryKey.GET_FOLLOWING_MUSICIANS ||
          queryKey === QueryKey.GET_TARGET_MUSICIAN ||
          queryKey === QueryKey.GET_PROFILE_USER_INFO ||
          queryKey === QueryKey.GET_PROFILE_COLLECTION_INFO
        );
      },
    });
  };

  return { refetchQueriesData };
};

export const useUpdateMusicianMutation = (opts: object = {}) => {
  const { refetchQueriesData } = useMusicianCommon();

  const mutation = useMutation({
    mutationKey: [MutationKey.UPDATE_TARGET_MUSICIAN_INFO],
    mutationFn: updateMusicianInfo,
    onSuccess: (data) => {
      const { name } = data;

      // refetch related queries
      refetchQueriesData();

      // display success message
      toast.success(`"${name}" musician is updated`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

export const useFollowMusicianMutation = (opts: object = {}) => {
  const { refetchQueriesData } = useMusicianCommon();

  const mutation = useMutation({
    mutationKey: [MutationKey.FOLLOW_TARGET_MUSICIAN],
    mutationFn: followMusician,
    onSuccess: (data) => {
      const { name } = data;

      // refetch related queries
      refetchQueriesData();

      // display success message
      toast.success(`You are now following "${name}"`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

export const useUnfollowMusicianMutation = (closeModalFn?: () => void, opts: object = {}) => {
  const { refetchQueriesData } = useMusicianCommon();

  const mutation = useMutation({
    mutationKey: [MutationKey.UNFOLLOW_TARGET_MUSICIAN],
    mutationFn: unfollowMusician,
    onSuccess: (data) => {
      const { name } = data;

      // refetch related queries
      refetchQueriesData();

      // close modal
      closeModalFn?.();

      // display success message
      toast.success(`You have unfollowed "${name}"`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
