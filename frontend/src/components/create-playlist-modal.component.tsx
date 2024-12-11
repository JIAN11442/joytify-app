import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import OptionCreateModal from "./option-create-modal.component";
import {
  CreatePlaylistForm,
  defaultCreatePlaylistData,
} from "../constants/form.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import { createPlaylist } from "../fetchs/playlist.fetch";
import useUploadModalState from "../states/upload-modal.state";
import { usePlaylists } from "../hooks/playlist.hook";
import { timeoutForDelay } from "../lib/timeout.lib";

const CreatePlaylistModal = () => {
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
    onSuccess: (data) => {
      const { title } = data;

      // refetch playlist query
      playlistRefetch();

      // close create playlist modal
      handleCloseModal();

      // display success message
      toast.success(`"${title}" playlist is created`);
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
    defaultValues: { ...defaultCreatePlaylistData },
  });

  const onSubmit: SubmitHandler<CreatePlaylistForm> = async (value) => {
    const { playlist } = value;

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
          return !options?.some(
            (opt) => opt.toLowerCase() === value.toLowerCase()
          );
        },
      })}
    />
  );
};

export default CreatePlaylistModal;
