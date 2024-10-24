import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { InvalidateQueryFilters, useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";

import Modal from "./modal.component";
import PlaylistWarningContent from "./playlist-warning-content.component";
import SingleSelectInputBox from "./single-select-input-box.component";

import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import {
  defaultsMovingPlaylistData,
  DefaultsMovingPlaylistType,
} from "../constants/form-default-data.constant";
import usePlaylistState from "../states/playlist.state";
import { deletePlaylist } from "../fetchs/playlist.fetch";
import queryClient from "../config/query-client.config";

const PlaylistDeleteModal = () => {
  const navigate = useNavigate();

  const { activeDeletePlaylistModal, closePlaylistDeleteModal, userPlaylists } =
    usePlaylistState();
  const { active, playlist } = activeDeletePlaylistModal;

  // delete playlist mutation
  const { mutate: deleteUserPlaylist, isPending } = useMutation({
    mutationKey: [MutationKey.DELETE_PLAYLIST],
    mutationFn: deletePlaylist,
    onSuccess: () => {
      handleCloseModal();

      queryClient.invalidateQueries([
        QueryKey.GET_USER_PLAYLISTS,
      ] as InvalidateQueryFilters);

      toast.success(`Playlist "${playlist?.title}" has been deleted.`);

      navigate("/");
    },
    onError: () => {
      toast.error(`Failed to delete playlist "${playlist?.title}".`);
    },
  });

  const handleCloseModal = () => {
    closePlaylistDeleteModal();
    reset();
  };

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    trigger,
    formState: { isValid },
  } = useForm<DefaultsMovingPlaylistType>({
    defaultValues: { ...defaultsMovingPlaylistData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<DefaultsMovingPlaylistType> = async (value) => {
    deleteUserPlaylist({
      currentPlaylistId: playlist?._id || "",
      targetPlaylistId: value.playlist_for || "",
    });
  };

  return (
    <Modal activeState={active} closeModalFn={handleCloseModal}>
      <PlaylistWarningContent
        playlist={playlist}
        executeBtnText="Delete"
        closeModalFn={handleCloseModal}
        onSubmit={handleSubmit(onSubmit)}
        isValid={isValid}
        isPending={isPending}
      >
        {/* Warning text */}
        <p className={`text-red-500/80`}>
          This will delete the playlist{" "}
          <span className={`font-bold text-white`}>{playlist?.title}</span> from
          your library, and you won't be able to restore it again.{" "}
          {(playlist?.songs.length ?? 0) > 0 &&
            `Otherwise, you also can choose to transfer all the songs from this playlist to another one, or opt not to transfer them.`}
        </p>

        {/* Playlist options */}
        <>
          {(playlist?.songs.length ?? 0) > 0 && (
            <SingleSelectInputBox
              id="playlist_for"
              placeholder="Click to choose a playlist"
              options={
                userPlaylists
                  ?.filter((opt) => opt._id !== playlist?._id)
                  .map((opt) => ({
                    id: opt._id,
                    title: opt.title,
                  })) || []
              }
              formValueState={{
                name: "playlist_for",
                setFormValue: setValue,
                setFormError: setError,
                trigger,
              }}
              disabled={isPending}
              {...register("playlist_for", { required: false })}
            />
          )}
        </>
      </PlaylistWarningContent>
    </Modal>
  );
};

export default PlaylistDeleteModal;
