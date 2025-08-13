import { SubmitHandler, useForm } from "react-hook-form";

import CreateOptionModal from "./create-option-modal.component";
import { useCreatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { defaultCreatePlaylistData } from "../constants/form.constant";
import { DefaultCreatePlaylistForm } from "../types/form.type";
import useUploadModalState from "../states/upload-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { useScopedIntl } from "../hooks/intl.hook";

const CreatePlaylistModal = () => {
  const { fm } = useScopedIntl();
  const createOptionTypeFm = fm("song.create.option.type");

  const { activeCreatePlaylistModal, closeCreatePlaylistModal } = useUploadModalState();
  const { active, options } = activeCreatePlaylistModal;

  const handleCloseModal = () => {
    timeoutForDelay(() => {
      closeCreatePlaylistModal();
      reset();
    });
  };

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
    createPlaylistFn({ title: playlist });
  };

  return (
    <CreateOptionModal
      type={createOptionTypeFm("playlist")}
      active={active}
      closeModalFn={handleCloseModal}
      autoCloseModal={false}
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
