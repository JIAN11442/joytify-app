import { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { SubmitHandler, useForm } from "react-hook-form";

import Modal from "./modal.component";
import PlaylistWarningContent from "./playlist-warning-content.component";
import SingleSelectInputBox from "./single-select-input-box.component";

import { useScopedIntl } from "../hooks/intl.hook";
import { useDeletePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { defaultMovingPlaylistData } from "../constants/form.constant";
import { RefactorPlaylistResponse } from "@joytify/types/types";
import { DefaultMovingPlaylistForm } from "../types/form.type";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const PlaylistDeleteModal = () => {
  const { fm } = useScopedIntl();
  const prefix = "playlist.delete.modal";
  const playlistDeleteModalFm = fm(prefix);

  const { activePlaylistDeleteModal, closePlaylistDeleteModal, userPlaylists } = usePlaylistState();
  const { active, playlist } = activePlaylistDeleteModal;

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

  const handleCloseModal = useCallback(() => {
    timeoutForDelay(() => {
      closePlaylistDeleteModal();
      reset();
    });
  }, [closePlaylistDeleteModal, reset]);

  const { mutate: deletePlaylistFn, isPending } = useDeletePlaylistMutation(handleCloseModal);

  const onSubmit: SubmitHandler<DefaultMovingPlaylistForm> = async (value) => {
    deletePlaylistFn({
      currentPlaylistId: playlist?._id || "",
      targetPlaylistId: value.playlistFor || "",
    });
  };

  return (
    <Modal activeState={active} closeModalFn={handleCloseModal} loading={isPending}>
      <PlaylistWarningContent
        playlist={playlist as RefactorPlaylistResponse}
        executeBtnText={playlistDeleteModalFm("execute.button.delete")}
        closeModalFn={handleCloseModal}
        onSubmit={handleSubmit(onSubmit)}
        isValid={isValid}
        isPending={isPending}
      >
        {/* warning content */}
        <p className={`text-[14px] text-red-500 leading-6`}>
          <FormattedMessage
            id={`${prefix}.warning.text`}
            values={{
              playlist: playlist?.title,
              hasSongs: playlist?.songs.length,
              additionalWarning:
                playlist && playlist?.songs.length > 0
                  ? playlistDeleteModalFm("warning.additional.text")
                  : "",
              strong: (chunks) => <strong className={`text-white`}>{chunks}</strong>,
            }}
          />
        </p>

        {/* Playlist options */}
        {(playlist?.songs.length ?? 0) > 0 && (
          <SingleSelectInputBox
            placeholder={playlistDeleteModalFm("select.input.placeholder")}
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
            tabIndex={-1}
            {...register("playlistFor", { required: false })}
          />
        )}
      </PlaylistWarningContent>
    </Modal>
  );
};

export default PlaylistDeleteModal;
