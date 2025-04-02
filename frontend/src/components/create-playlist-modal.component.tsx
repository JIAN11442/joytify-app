import { SubmitHandler, useForm } from "react-hook-form";

import OptionCreateModal from "./option-create-modal.component";
import { useCreatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { defaultCreatePlaylistData } from "../constants/form.constant";
import { DefaultCreatePlaylistForm } from "../types/form.type";
import useUploadModalState from "../states/upload-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const CreatePlaylistModal = () => {
  const { activeCreatePlaylistModal, closeCreatePlaylistModal } = useUploadModalState();
  const { active, options } = activeCreatePlaylistModal;

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(() => {
      closeCreatePlaylistModal();
      reset();
    });
  };

  // create playlist mutation
  const { mutate: createPlaylistFn } = useCreatePlaylistMutation(handleCloseModal);

  const {
    register,
    reset,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: { ...defaultCreatePlaylistData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<DefaultCreatePlaylistForm> = async (value) => {
    const { playlist } = value;

    createPlaylistFn(playlist);
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
          return !options?.some((opt) => opt.toLowerCase() === value.toLowerCase());
        },
      })}
    />
  );
};

export default CreatePlaylistModal;
