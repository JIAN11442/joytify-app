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

const PlaylistEditModal = () => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [playlistImage, setPlaylistImage] = useState<string | null>(null);
  const [closeModalPending, setCloseModalPending] = useState<boolean>(false);

  const { activePlaylistEditModal, closePlaylistEditModal } = usePlaylistState();
  const { active, playlist } = activePlaylistEditModal;
  const {
    _id: playlistId,
    title,
    description,
    cover_image,
  } = (playlist as RefactorPlaylistResponse) ?? {};

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(async () => {
      // start pending
      setCloseModalPending(true);

      // while coverImage is changed but not submitted,
      // delete that file store in AWS
      if (!isSubmitted && watch("coverImage") && watch("coverImage") !== cover_image) {
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

  // update playlist mutation
  const { mutate: updatePlaylistFn, isPending } = useUpdatePlaylistMutation(
    playlistId,
    handleCloseModal
  );

  // initial form state
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    trigger,
    watch,
    formState: { dirtyFields },
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
    const { coverImage: cover_image, ...rest } = getModifiedFormData(value, dirtyFields);

    updatePlaylistFn({ cover_image, ...rest });

    setIsSubmitted(true);
  };

  return (
    <Modal
      title="Edit playlist"
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
          src={playlistImage ?? cover_image}
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
            placeholder="Title"
            defaultValue={title}
            formMethods={formMethods}
            disabled={isPending}
            autoFocus
            {...register("title")}
          />

          {/* Description */}
          <textarea
            id="description"
            placeholder="Description"
            defaultValue={description}
            disabled={isPending}
            className={`
              input-box
              h-full
              resize-none
            `}
            {...register("description")}
          />

          {/* Submit button */}
          <button
            disabled={!isModified || isPending}
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
            {isPending ? <Loader loader={{ size: 20 }} /> : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlaylistEditModal;
