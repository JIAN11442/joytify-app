import toast from "react-hot-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import OptionCreateModal from "./option-create-modal.component";
import { createAlbum } from "../fetchs/album.fetch";
import {
  CreateAlbumForm,
  defaultCreateAlbumData,
} from "../constants/form.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import useUploadModalState from "../states/upload-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const CreateAlbumModal = () => {
  const { activeCreateAlbumModal, setActiveCreateAlbumModal } =
    useUploadModalState();
  const { active, options, albumRefetch } = activeCreateAlbumModal;

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(() => {
      setActiveCreateAlbumModal({
        active: false,
        options: null,
        albumRefetch: null,
      });

      reset();
    });
  };

  // create album mutation
  const { mutate: createUserAlbum } = useMutation({
    mutationKey: [MutationKey.CREATE_ALBUM_OPTION],
    mutationFn: createAlbum,
    onSuccess: (data) => {
      const { title } = data;

      // refetch album query
      if (albumRefetch) {
        albumRefetch();
      }

      // close modal
      handleCloseModal();

      // display success message
      toast.success(`"${title}" album is created`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CreateAlbumForm>({
    defaultValues: { ...defaultCreateAlbumData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<CreateAlbumForm> = async (value) => {
    const { title } = value;

    if (title) {
      createUserAlbum({ title });
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
