import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { InvalidateQueryFilters, useMutation } from "@tanstack/react-query";

import Modal from "./modal.component";
import InputBox from "./input-box.component";
import ImageLabel from "./image-label.component";
import Loader from "./loader.component";

import {
  defaultsPlaylistEditData,
  DefaultsPlaylistEditType,
} from "../constants/form-default-data.constant";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { generateResPlaylist } from "../constants/data-type.constant";
import usePlaylistState from "../states/playlist.state";
import { updatePlaylist } from "../fetchs/playlist.fetch";
import queryClient from "../config/query-client.config";
import { timeoutForDelay } from "../lib/timeout.lib";

const PlaylistEditModal = () => {
  const { activePlaylistEditModal, closePlaylistEditModal, setCoverImageSrc } =
    usePlaylistState();
  const { active, playlist } = activePlaylistEditModal;
  const {
    _id: playlistId,
    cover_image,
    title,
  } = (playlist as generateResPlaylist) ?? {};

  const [titleValue, setTitleValue] = useState<string>("");

  // update playlist mutation
  const { mutate: updateUserPlaylist, isPending } = useMutation({
    mutationKey: [MutationKey.UPDATE_PLAYLIST],
    mutationFn: updatePlaylist,
    onSuccess: async (data) => {
      // Invalidate target query dependencies to refetch playlist query
      await queryClient.invalidateQueries([
        QueryKey.GET_TARGET_PLAYLIST,
      ] as InvalidateQueryFilters);

      await queryClient.invalidateQueries([
        QueryKey.GET_USER_PLAYLISTS,
      ] as InvalidateQueryFilters);

      // update client cover image
      setCoverImageSrc(data.cover_image);

      toast.success("Playlist updated successfully");

      // close modal
      handleCloseModal();
    },
    onError: () => {
      toast.error("Failed to update playlist");
    },
  });

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(() => {
      closePlaylistEditModal();
      reset();
    });
  };

  // initial form state
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isValid },
  } = useForm<DefaultsPlaylistEditType>({
    defaultValues: { ...defaultsPlaylistEditData },
    mode: "onChange",
  });

  // submit form
  const onSubmit: SubmitHandler<DefaultsPlaylistEditType> = async (value) => {
    const { coverImage, ...params } = value;

    updateUserPlaylist({ playlistId, awsImageUrl: coverImage, ...params });
  };

  useEffect(() => {
    setTitleValue(title);
  }, [title]);

  return (
    <Modal
      title="Edit details"
      activeState={active}
      closeModalFn={handleCloseModal}
      className={{ wrapper: `w-[600px]`, title: `text-left` }}
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
          id="coverImage"
          imgSrc={cover_image}
          playlistId={playlistId}
          formValueState={{ name: "coverImage", setValue }}
          className={`
            w-[15rem]
            h-[15rem]
            min-w-[15rem]
            min-h-[15rem]
          `}
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
            id="title"
            type="text"
            placeholder="Title"
            value={titleValue || ""}
            disabled={isPending}
            {...register("title", {
              required: true,
              validate: (value) => value !== playlist?.title,
            })}
            onChange={(e) => {
              setTitleValue(e.target.value);
              register("title").onChange(e); // Manually trigger onChange to avoid specifying it more than once
            }}
          />

          {/* Description */}
          <textarea
            id="description"
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
            disabled={!isValid || isPending}
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
