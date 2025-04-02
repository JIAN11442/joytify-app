import { SubmitHandler, useForm } from "react-hook-form";

import OptionCreateModal from "./option-create-modal.component";
import { useCreateAlbumMutation } from "../hooks/album-mutate.hook";
import { defaultCreateAlbumData } from "../constants/form.constant";
import { DefaultCreateAlbumForm } from "../types/form.type";
import useUploadModalState from "../states/upload-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const CreateAlbumModal = () => {
  const { activeCreateAlbumModal, closeCreateAlbumModal } = useUploadModalState();
  const { active, options } = activeCreateAlbumModal;

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(() => {
      closeCreateAlbumModal();
      reset();
    });
  };

  // create album mutation
  const { mutate: createAlbumFn } = useCreateAlbumMutation(handleCloseModal);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<DefaultCreateAlbumForm>({
    defaultValues: { ...defaultCreateAlbumData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<DefaultCreateAlbumForm> = async (value) => {
    const { title } = value;

    if (title) {
      createAlbumFn({ title });
    }
  };

  return (
    <OptionCreateModal
      type="album"
      active={active}
      closeModalFn={handleCloseModal}
      autoCloseModalFn={false}
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
