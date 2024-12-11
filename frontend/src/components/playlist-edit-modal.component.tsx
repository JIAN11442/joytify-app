import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import Modal from "./modal.component";
import InputBox from "./input-box.component";
import ImageLabel from "./image-label.component";
import Loader from "./loader.component";

import {
  defaultPlaylistEditData,
  EditPlaylistForm,
  FormMethods,
} from "../constants/form.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import { refactorResPlaylist } from "../constants/axios-response.constant";
import { usePlaylistById, usePlaylists } from "../hooks/playlist.hook";
import { updatePlaylist } from "../fetchs/playlist.fetch";
import { deleteFileFromAws } from "../fetchs/aws.fetch";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const PlaylistEditModal = () => {
  const modifiedFieldsRef = useRef<string[]>([]);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { activePlaylistEditModal, closePlaylistEditModal } =
    usePlaylistState();
  const { active, playlist } = activePlaylistEditModal;
  const { _id: playlistId } = (playlist as refactorResPlaylist) ?? {};

  const { refetch: playlistsRefetch } = usePlaylists();
  const { refetch: targetPlaylistRefetch } = usePlaylistById(playlistId);

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(async () => {
      const isFileDeletionRequired =
        !isSubmitted && modifiedFieldsRef.current.includes("coverImage");
      const currentCoverImage = watch("coverImage");

      // while coverImage is changed but not submitted,
      // delete that file store in AWS
      if (isFileDeletionRequired && currentCoverImage) {
        try {
          await deleteFileFromAws(watch("coverImage"));
        } catch (error) {
          console.log("Failed to deleting file from AWS", error);
        }
      }

      closePlaylistEditModal();
      reset();
    });
  };

  // update playlist mutation
  const { mutate: updateUserPlaylist, isPending } = useMutation({
    mutationKey: [MutationKey.UPDATE_PLAYLIST],
    mutationFn: updatePlaylist,
    onSuccess: async () => {
      // refetch user playlists query
      playlistsRefetch();

      // refetch target playlist query
      targetPlaylistRefetch();

      // close modal
      handleCloseModal();

      // display success message
      toast.success("Playlist updated successfully");
    },
    onError: () => {
      toast.error("Failed to update playlist");
    },
  });

  // initial form state
  const { register, handleSubmit, setValue, setError, reset, trigger, watch } =
    useForm<EditPlaylistForm>({
      defaultValues: { ...defaultPlaylistEditData },
      mode: "onChange",
    });

  // form methods
  const formMethods: FormMethods<EditPlaylistForm> = {
    setFormValue: setValue,
    setFormError: setError,
    trigger,
  };

  // submit form
  const onSubmit: SubmitHandler<EditPlaylistForm> = async (value) => {
    const { coverImage, ...params } = value;

    updateUserPlaylist({ playlistId, awsImageUrl: coverImage, ...params });

    setIsSubmitted(true);
  };

  // initialize default form value
  useEffect(() => {
    if (playlist) {
      reset({
        title: playlist?.title,
        description: playlist?.description,
        coverImage: playlist?.cover_image,
      });
    }
  }, [playlist, reset]);

  // listen for changes in the form fields
  useEffect(() => {
    if (!playlist) return;

    // subscribe to changes in the form values using watch
    // or using observable.subscribe()
    const subscription = watch((val) => {
      const fieldsToCheck = {
        title: playlist?.title,
        description: playlist?.description,
        coverImage: playlist?.cover_image,
      };

      // get all changed fields
      const changedFields = Object.entries(fieldsToCheck)
        .filter(([field, originalValue]) => {
          return val[field as keyof typeof val] !== originalValue;
        })
        .map(([field]) => field);

      // update modified state
      setIsModified(!!changedFields.length);

      // use a ref to store modified fields for accessing the latest value without re-rendering.
      // useState is unsuitable here due to closure issues in the onClick function.
      modifiedFieldsRef.current = changedFields;
    });

    // clean function
    return () => subscription.unsubscribe();
  }, [playlist, watch, modifiedFieldsRef]);

  return (
    <Modal
      title="Edit details"
      activeState={active}
      closeModalFn={handleCloseModal}
      className={`w-[600px]`}
      tw={{ title: `text-left` }}
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
          src={watch("coverImage")}
          playlistId={playlistId}
          formMethods={formMethods}
          className={`
            w-[15rem]
            h-[15rem]
            min-w-[15rem]
            min-h-[15rem]
          `}
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
            value={watch("title")}
            placeholder="Title"
            formMethods={formMethods}
            disabled={isPending}
            {...register("title")}
          />

          {/* Description */}
          <textarea
            id="description"
            value={watch("description")}
            placeholder="Description"
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
