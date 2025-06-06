import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Modal from "./modal.component";
import Loader from "./loader.component";
import InputBox from "./input-box.component";
import ImageLabel from "./image-label.component";

import { deleteFileFromAws } from "../fetchs/aws.fetch";
import { useUpdatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorPlaylistResponse } from "@joytify/shared-types/types";
import { DefaultEditPlaylistForm, FormMethods } from "../types/form.type";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { getModifiedFormData } from "../utils/get-form-data.util";
import { useScopedIntl } from "../hooks/intl.hook";

const PlaylistEditModal = () => {
  const { fm } = useScopedIntl();
  const playlistEditModalFm = fm("playlist.edit.modal");

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [playlistImage, setPlaylistImage] = useState<string | null>(null);
  const [closeModalPending, setCloseModalPending] = useState<boolean>(false);

  const { activePlaylistEditModal, closePlaylistEditModal } = usePlaylistState();
  const { active, playlist } = activePlaylistEditModal;
  const {
    _id: playlistId,
    title,
    description,
    coverImage,
  } = (playlist as RefactorPlaylistResponse) ?? {};

  const handleCloseModal = () => {
    timeoutForDelay(async () => {
      // start pending
      setCloseModalPending(true);

      // while coverImage is changed but not submitted,
      // delete that file store in AWS
      if (!isSubmitted && watch("coverImage") && watch("coverImage") !== coverImage) {
        try {
          await deleteFileFromAws(watch("coverImage"));
        } catch (error) {
          console.log("Failed to deleting file from AWS", error);
        }
      }

      // close modal
      closePlaylistEditModal();

      // end pending
      setCloseModalPending(false);

      // reset form
      reset();
    });
  };

  const { mutate: updatePlaylistFn, isPending } = useUpdatePlaylistMutation(
    playlistId,
    handleCloseModal
  );

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    trigger,
    watch,
    formState: { dirtyFields, isValid },
  } = useForm<DefaultEditPlaylistForm>({
    defaultValues: { title, description }, // it's necessary if you want to track form changes（dirtyFields）.
    mode: "onChange",
  });

  // check form if is modified
  const isModified = Object.keys(dirtyFields).length > 0;

  // form methods
  const formMethods: FormMethods<DefaultEditPlaylistForm> = {
    setFormValue: setValue,
    setFormError: setError,
    trigger,
  };

  // submit form
  const onSubmit: SubmitHandler<DefaultEditPlaylistForm> = async (value) => {
    const modifiedValues = getModifiedFormData(value, dirtyFields);

    updatePlaylistFn(modifiedValues);

    setIsSubmitted(true);
  };

  return (
    <Modal
      title={playlistEditModalFm("title")}
      activeState={active}
      closeModalFn={handleCloseModal}
      loading={closeModalPending}
      className={`w-[600px]`}
      tw={{ title: "text-left max-sm:text-center" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`
          flex
          max-sm:flex-col
          gap-5
          w-full
          h-fit
        `}
      >
        {/* Image input */}
        <ImageLabel
          src={playlistImage ?? coverImage}
          subfolder={UploadFolder.PLAYLISTS_IMAGE}
          formMethods={formMethods}
          setImgSrc={setPlaylistImage}
          className={`
            flex
            items-center
            justify-center
            max-sm:w-full
            max-sm:rounded-md
            bg-grey-dark
          `}
          tw={{ label: "w-[15rem] h-[15rem]" }}
          {...register("coverImage")}
        />

        {/* Text input */}
        <div
          className={`
            flex
            flex-col
            gap-3
            w-full
          `}
        >
          {/* Title */}
          <InputBox
            type="text"
            placeholder={playlistEditModalFm("input.title.placeholder")}
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

          {/* Description */}
          <textarea
            id="description"
            placeholder={playlistEditModalFm("input.description.placeholder")}
            defaultValue={description}
            disabled={isPending}
            className={`
              input-box
              h-full
              resize-none
            `}
            {...register("description", {
              validate: (val) => {
                if ((description?.length ?? 0) > 0 && val.length === 0) {
                  return false;
                }
              },
            })}
          />

          {/* Submit button */}
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
            {isPending ? (
              <Loader loader={{ size: 20 }} />
            ) : (
              playlistEditModalFm("input.button.submit")
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlaylistEditModal;
