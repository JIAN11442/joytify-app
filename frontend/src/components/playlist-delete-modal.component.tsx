import { SubmitHandler, useForm } from "react-hook-form";

import Modal from "./modal.component";
import PlaylistWarningContent from "./playlist-warning-content.component";
import SingleSelectInputBox from "./single-select-input-box.component";

import { useDeletePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { defaultMovingPlaylistData } from "../constants/form.constant";
import { DefaultMovingPlaylistForm } from "../types/form.type";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const PlaylistDeleteModal = () => {
  const { activePlaylistDeleteModal, closePlaylistDeleteModal, userPlaylists } = usePlaylistState();
  const { active, playlist } = activePlaylistDeleteModal;

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(() => {
      closePlaylistDeleteModal();
      reset();
    });
  };

  // delete playlist mutation
  const { mutate: deletePlaylistFn, isPending } = useDeletePlaylistMutation(handleCloseModal);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    trigger,
    formState: { isValid },
  } = useForm<DefaultMovingPlaylistForm>({
    defaultValues: { ...defaultMovingPlaylistData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<DefaultMovingPlaylistForm> = async (value) => {
    deletePlaylistFn({
      currentPlaylistId: playlist?._id || "",
      targetPlaylistId: value.playlistFor || "",
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
          <span className={`font-bold text-white`}>{playlist?.title}</span> from your library, and
          you won't be able to restore it again.{" "}
          {(playlist?.songs.length ?? 0) > 0 &&
            `Otherwise, you also can choose to transfer all the songs from this playlist to another one, or opt not to transfer them.`}
        </p>

        {/* Playlist options */}
        {(playlist?.songs.length ?? 0) > 0 && (
          <SingleSelectInputBox
            placeholder="Click to choose a playlist"
            options={
              userPlaylists
                ?.filter((opt) => opt._id !== playlist?._id)
                .map((opt) => ({
                  id: opt._id,
                  title: opt.title,
                })) || []
            }
            formMethods={{
              setFormValue: setValue,
              setFormError: setError,
              trigger,
            }}
            disabled={isPending}
            {...register("playlistFor", { required: false })}
          />
        )}
      </PlaylistWarningContent>
    </Modal>
  );
};

export default PlaylistDeleteModal;
