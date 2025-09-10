import { useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Modal from "./modal.component";
import Loader from "./loader.component";
import InputBox from "./input-box.component";
import ImageLabel from "./image-label.component";
import { deleteFileFromAws } from "../fetchs/aws.fetch";
import { useScopedIntl } from "../hooks/intl.hook";
import { useUpdateSongInfoMutation } from "../hooks/song-mutate.hook";
import { UploadFolder } from "@joytify/types/constants";
import { DefaultSongEditForm, FormMethods } from "../types/form.type";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { getModifiedFormData } from "../utils/get-form-data.util";

const SongEditModal = () => {
  const { fm } = useScopedIntl();
  const songEditModalFm = fm("song.edit.modal");

  const [songImage, setSongImage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [closeModalPending, setCloseModalPending] = useState<boolean>(false);

  const { activeSongEditModal, setActiveSongEditModal } = useSongState();
  const { active, song } = activeSongEditModal;
  const { _id: songId, title, imageUrl } = song ?? {};

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    trigger,
    watch,
    formState: { dirtyFields, isValid },
  } = useForm<DefaultSongEditForm>({
    defaultValues: { title, imageUrl },
    mode: "onChange",
  });

  const handleCloseModal = useCallback(() => {
    timeoutForDelay(async () => {
      setCloseModalPending(true);

      const currentImageUrl = watch("imageUrl");

      if (!isSubmitted && currentImageUrl && currentImageUrl !== imageUrl) {
        try {
          await deleteFileFromAws(currentImageUrl);
        } catch (error) {
          console.log("Failed to deleting file from AWS", error);
        }
      }

      // close modal
      setActiveSongEditModal({ active: false, song: null });

      // end pending
      setCloseModalPending(false);

      // reset form
      reset();
    });
  }, [isSubmitted, watch, imageUrl, setActiveSongEditModal, reset]);

  const { mutate: updateSongInfoFn, isPending } = useUpdateSongInfoMutation(
    songId ?? "",
    handleCloseModal
  );

  const isModified = Object.keys(dirtyFields).length > 0;
  const formMethods: FormMethods<DefaultSongEditForm> = {
    setFormValue: setValue,
    setFormError: setError,
    trigger,
  };

  const onSubmit: SubmitHandler<DefaultSongEditForm> = async (value) => {
    const modifiedValues = getModifiedFormData(value, dirtyFields);

    updateSongInfoFn(modifiedValues);
    setIsSubmitted(true);
  };

  return (
    <Modal
      title={songEditModalFm("title")}
      activeState={active}
      closeModalFn={handleCloseModal}
      loading={closeModalPending}
      tw={{ title: "text-left max-sm:text-center" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`
          flex
          flex-col
          w-full
          gap-3
          items-center
        `}
      >
        {/* image */}
        <ImageLabel
          src={songImage ?? imageUrl}
          subfolder={UploadFolder.SONGS_IMAGE}
          formMethods={formMethods}
          setImgSrc={setSongImage}
          className={`
            flex
            w-full
            items-center
            justify-center
            bg-grey-dark
            rounded-lg
          `}
          tw={{ label: "w-[15rem] h-[15rem]" }}
          {...register("imageUrl")}
        />

        {/* title */}
        <InputBox
          type="text"
          title={songEditModalFm("input.title.label")}
          placeholder={songEditModalFm("input.title.placeholder")}
          defaultValue={title}
          formMethods={formMethods}
          disabled={isPending}
          autoFocus
          {...register("title", {
            validate: (value) => {
              if ((title?.length ?? 0) > 0 && value.length === 0) {
                return false;
              }
            },
          })}
        />

        {/* submit button */}
        <button
          disabled={!isModified || !isValid || isPending}
          className={`
            mt-2
            submit-btn
            py-2
            capitalize
            text-sm
            rounded-full
            outline-none
          `}
        >
          {isPending ? <Loader loader={{ size: 20 }} /> : songEditModalFm("input.button.submit")}
        </button>
      </form>
    </Modal>
  );
};

export default SongEditModal;
