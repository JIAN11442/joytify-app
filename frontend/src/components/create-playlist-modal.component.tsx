import { SubmitHandler, useForm } from "react-hook-form";
import { timeoutForDelay } from "../lib/timeout.lib";
import useUploadModalState from "../states/upload-modal.state";
import OptionCreateModal from "./option-create-modal.component";
import {
  defaultsCreatePlaylistData,
  DefaultsCreatePlaylistType,
} from "../constants/form-default-data.constant";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "../constants/query-client-key.constant";
import { createPlaylist } from "../fetchs/playlist.fetch";
import { usePlaylists } from "../hooks/playlist.hook";
import toast from "react-hot-toast";
import { useState } from "react";

const CreatePlaylistModal = () => {
  const [formVal, setFormVal] = useState("");
  const { refetch: playlistRefetch } = usePlaylists();

  const { activeCreatePlaylistModal, setActiveCreatePlaylistModal } =
    useUploadModalState();
  const { active, options } = activeCreatePlaylistModal;

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(() => {
      setActiveCreatePlaylistModal({ active: false, options: null });
    });
    reset();
  };

  // create playlist mutation
  const { mutate: createUserPlaylist } = useMutation({
    mutationKey: [MutationKey.CREATE_USER_PLAYLIST],
    mutationFn: createPlaylist,
    onSuccess: () => {
      // display success message
      toast.success(`"${formVal}" playlist is created`);
      // refetch playlist query
      playlistRefetch();
      // close create playlist modal
      handleCloseModal();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    register,
    reset,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: { ...defaultsCreatePlaylistData },
  });

  const onSubmit: SubmitHandler<DefaultsCreatePlaylistType> = async (value) => {
    const { playlist } = value;

    setFormVal(playlist);
    createUserPlaylist(playlist);
  };

  return (
    <OptionCreateModal
      type="playlist"
      active={active}
      closeModalFn={handleCloseModal}
      autoCloseModalFn={false}
      formOnSubmit={handleSubmit(onSubmit)}
      registerValidState={isValid}
      {...register("playlist", {
        required: true,
        validate: (value) => {
          return !options?.some((opt) => opt === value);
        },
      })}
    />
  );
};

export default CreatePlaylistModal;
