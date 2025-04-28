import { SubmitHandler, useForm } from "react-hook-form";

import { useCreateAlbumMutation } from "../hooks/album-mutate.hook";
import CreateOptionModal from "./create-option-modal.component";
import { defaultCreateAlbumData } from "../constants/form.constant";
import { DefaultCreateAlbumForm } from "../types/form.type";
import useUploadModalState from "../states/upload-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const CreateAlbumModal = () => {
  const { activeCreateAlbumModal, closeCreateAlbumModal } = useUploadModalState();
  const { active, options } = activeCreateAlbumModal;

  const handleCloseModal = () => {
    timeoutForDelay(() => {
      closeCreateAlbumModal();
      reset();
    });
  };

  const { mutate: createAlbumFn } = useCreateAlbumMutation(handleCloseModal);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<DefaultCreateAlbumForm>({
    defaultValues: defaultCreateAlbumData,
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<DefaultCreateAlbumForm> = async (value) => {
    const { title } = value;

    if (title) {
      createAlbumFn({ title });
    }
  };

  return (
    <CreateOptionModal
      type="album"
      active={active}
      closeModalFn={handleCloseModal}
      autoCloseModal={false}
      formOnSubmit={handleSubmit(onSubmit)}
      registerValidState={isValid}
      {...register("title", {
        required: true,
        validate: (value) => {
          return !options?.some((opt) => opt === value);
        },
      })}
    />
  );
};

export default CreateAlbumModal;
