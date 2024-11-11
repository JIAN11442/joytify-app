import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { InvalidateQueryFilters, useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaCircleInfo } from "react-icons/fa6";
import { IoCaretBack } from "react-icons/io5";

import Modal from "./modal.component";
import InputBox from "./input-box.component";
import Loader from "./loader.component";
import Icon from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";
import SingleSelectInputBox from "./single-select-input-box.component";
import MultiSelectInputBox, {
  OptionType,
} from "./multi-select-input-box.component";
import CalendarInputBox from "./calendar-input-box.component";

import {
  defaultsSongData,
  DefaultsSongType,
} from "../constants/form-default-data.constant";
import LabelOptions from "../constants/label-type.constant";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { useGetLabel } from "../hooks/label.hook";
import { usePlaylists } from "../hooks/playlist.hook";
import { createSongData } from "../fetchs/song.fetch";
import { deleteLabel } from "../fetchs/label.fetch";
import useLabelState from "../states/label.state";
import useUploadModalState from "../states/upload-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import queryClient from "../config/query-client.config";

const UploadModal = () => {
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [songName, setSongName] = useState("");

  const {
    activeUploadModal,
    closeUploadModal,
    activeAdvancedSettings,
    activeCreateLabelModal,
    activeCreatePlaylistModal,
    setActiveCreateLabelModal,
    setActiveAdvancedSettings,
    setActiveCreatePlaylistModal,
  } = useUploadModalState();
  const { deletedLabel } = useLabelState();

  const { playlists } = usePlaylists();
  const { labels, refetch } = useGetLabel();

  // create song mutation
  const { mutate: createNewSong, isPending } = useMutation({
    mutationKey: [MutationKey.CREATE_NEW_SONG],
    mutationFn: createSongData,
    onSuccess: () => {
      // close modal
      closeUploadModal();

      // reset form input value
      reset(defaultsSongData);

      // refetch user playlists
      queryClient.invalidateQueries([
        QueryKey.GET_USER_PLAYLISTS,
      ] as InvalidateQueryFilters);

      // display successfully message
      toast.success(`“${songName}” has been created successfully`);
    },
    onError: (error) => toast.error(error.message),
  });

  // delete label mutation
  const { mutate: deleteTargetLabel } = useMutation({
    mutationKey: [MutationKey.DELETE_LABEL_OPTION],
    mutationFn: deleteLabel,
    onSuccess: () => {
      // refetch get labels query
      refetch();
      // display successfully message
      toast.success(`"${deletedLabel}" already deleted`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // handle active advanced settings
  const handleActiveAdvancedSettings = () => {
    timeoutForDelay(() => {
      setActiveAdvancedSettings(true);
    });
  };

  // handle inactive advanced settings
  const handleInactiveAdvancedSettings = () => {
    timeoutForDelay(() => {
      setActiveAdvancedSettings(false);
    });
  };

  // handle active create playlist modal
  const handleActiveCreatePlaylistModal = () => {
    timeoutForDelay(() => {
      setActiveCreatePlaylistModal({
        active: true,
        options: playlists?.map((playlist) => playlist.title) || null,
      });
    });
  };

  // handle active create album modal
  const handleActiveCreateAlbumModal = () => {
    timeoutForDelay(() => {
      setActiveCreateLabelModal({
        type: LabelOptions.ALBUM,
        active: true,
        options: {
          type: LabelOptions.ALBUM,
          labels: labels
            ? {
                defaults: labels.default?.album || null,
                created: labels.created?.album || null,
              }
            : null,
        } as OptionType,
      });
    });
  };

  // get form data
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    trigger,
    reset,
    formState: { isValid },
  } = useForm<DefaultsSongType>({
    defaultValues: { ...defaultsSongData },
    mode: "onChange",
  });

  const defaultFormMethods = {
    setFormValue: setValue,
    setFormError: setError,
    trigger,
  };

  const onSubmit: SubmitHandler<DefaultsSongType> = async (value) => {
    const { title } = value;

    if (title) {
      setSongName(title);
    }

    createNewSong(value);
  };

  return (
    <Modal
      title="Add a song"
      description="upload an mp3 file"
      activeState={activeUploadModal}
      closeModalFn={closeUploadModal}
      closeBtnDisabled={isPending}
      autoCloseModalFn={
        !activeCreateLabelModal.active &&
        !activeCreatePlaylistModal.active &&
        !isPending
      }
      className={{
        wrapper: `
          ${
            activeAdvancedSettings &&
            `
              md:min-w-[80vw]  
              lg:min-w-[70vw] 
            `
          }
          
        `,
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`
          flex
          flex-col
          w-full
          gap-3
        `}
      >
        {/* turn back button */}
        <>
          {activeAdvancedSettings && (
            <button
              type="button"
              onClick={handleInactiveAdvancedSettings}
              disabled={isPending}
              className={`
                absolute
                group
                top-5
                left-5
                hover-btn
                ${isPending && "no-hover"}
              `}
            >
              <Icon
                name={IoCaretBack}
                className={`
                  text-neutral-400
                  ${!isPending && "group-hover:text-white"}
                `}
              />
            </button>
          )}
        </>

        {/* input */}
        <div
          className={`
            flex
            flex-col
            w-full
            gap-4
          `}
        >
          {/* Basic setting */}
          <div
            className={`
              flex
              flex-col
              gap-5
              ${activeAdvancedSettings && "md:grid md:grid-cols-2"}
            `}
          >
            {/* Song title */}
            <InputBox
              id="title"
              type="text"
              title="Enter a song title"
              placeholder="Song title"
              disabled={isPending}
              required
              {...register("title", { required: true })}
            />

            {/* Song artist */}
            <InputBox
              id="artist"
              type="text"
              title="Enter song artist"
              placeholder="Song artist"
              warning={[
                "If there is more than one artist, please separate them with a comma. [e.g., John, Jason]",
              ]}
              formMethods={{ ...defaultFormMethods, name: "artist" }}
              toArray={true}
              disabled={isPending}
              required
              {...register("artist", { required: true })}
            />

            {/* Song file */}
            <InputBox
              id="songFile"
              type="file"
              accept=".mp3"
              title="Select a song file (*.mp3)"
              disabled={isPending}
              required
              className={`p-3`}
              {...register("songFile", { required: true })}
            />

            {/* Song Playlist */}
            <SingleSelectInputBox
              id="playlist_for"
              title="Select a playlist"
              placeholder="Click to choose a playlist"
              formMethods={{ ...defaultFormMethods, name: "playlist_for" }}
              options={
                playlists?.map((playlist) => ({
                  id: playlist._id,
                  title: playlist.title,
                })) || []
              }
              createNewFn={handleActiveCreatePlaylistModal}
              autoCloseMenuFn={!activeCreatePlaylistModal.active}
              disabled={isPending}
              required
              {...register("playlist_for", {
                required: true,
                validate: (val) =>
                  playlists
                    ?.map((playlist) => playlist._id)
                    .includes(val ?? ""),
              })}
            />
          </div>

          {/* Advance setting button */}
          <>
            {!activeAdvancedSettings && (
              <div
                className={`
                  flex
                  items-center
                  justify-end
                  text-sm
                  ${
                    isValid && !isPending
                      ? "text-green-custom"
                      : "text-neutral-700"
                  }
                  ${!isPending && "hover:underline"}
                `}
              >
                <button
                  type="button"
                  onClick={handleActiveAdvancedSettings}
                  disabled={isPending}
                  className={`
                    flex
                    gap-2
                    items-center
                    justify-center
                    transition
                    ${isValid && !isPending ? "animate-bounce" : ""}
                  `}
                >
                  <Icon name={FaCircleInfo} />
                  <p>Advance Settings</p>
                </button>
              </div>
            )}
          </>

          {/* Advance setting */}
          <AnimationWrapper
            key="advance-setting"
            visible={activeAdvancedSettings}
            className={`
               flex
               flex-col
               gap-5
               ${activeAdvancedSettings && "md:grid md:grid-cols-2"}
            `}
          >
            {/* Song cover art file */}
            <InputBox
              id="imageFile"
              type="file"
              accept=".png, .jpg, .jpeg"
              title="Select an image file (*.png)"
              disabled={isPending}
              {...register("imageFile")}
            />

            {/* Song lyricist */}
            <InputBox
              id="lyricist"
              type="text"
              title="Enter song lyricist"
              placeholder="Song lyricist"
              warning={[
                "If there is more than one lyricist, please separate them with a comma. [e.g., John, Jason]",
              ]}
              formMethods={{ ...defaultFormMethods, name: "lyricists" }}
              toArray={true}
              disabled={isPending}
            />

            {/* Song composer */}
            <InputBox
              id="composer"
              type="text"
              title="Enter song composer"
              placeholder="Song composer"
              warning={[
                "If there is more than one composer, please separate them with a comma. [e.g., John, Jason]",
              ]}
              formMethods={{ ...defaultFormMethods, name: "composers" }}
              syncWithOtherInput={{
                active: !!watch("lyricists")?.length,
                syncVal: watch("lyricists"),
              }}
              toArray={true}
              disabled={isPending}
            />

            {/* Album */}
            <SingleSelectInputBox
              id="album"
              title="Select an album"
              placeholder="Click to choose an album"
              formMethods={{ ...defaultFormMethods, name: "album" }}
              options={
                labels?.created?.album
                  ? labels?.created?.album.map((opt) => ({
                      id: opt.id,
                      title: opt.label,
                    }))
                  : []
              }
              createNewFn={handleActiveCreateAlbumModal}
              deleteOptFn={deleteTargetLabel}
              autoCloseMenuFn={!activeCreateLabelModal.active}
            />

            {/* Language */}
            <MultiSelectInputBox
              id="language"
              title="Select one or more languages for the song"
              placeholder="Click to choose song language"
              formMethods={{ ...defaultFormMethods, name: "languages" }}
              options={
                {
                  type: LabelOptions.LANGUAGE,
                  labels: labels
                    ? {
                        defaults: labels.default?.language || null,
                        created: labels.created?.language || null,
                      }
                    : null,
                } as OptionType
              }
              autoCloseMenuFn={!activeCreateLabelModal.active}
              disabled={isPending}
            />

            {/* Genres */}
            <MultiSelectInputBox
              id="genre"
              title="Select one or more genres for the song"
              placeholder="Click to choose song genre"
              formMethods={{ ...defaultFormMethods, name: "genres" }}
              options={
                {
                  type: LabelOptions.GENRE,
                  labels: labels
                    ? {
                        defaults: labels.default?.genre || null,
                        created: labels.created?.genre || null,
                      }
                    : null,
                } as OptionType
              }
              autoCloseMenuFn={!activeCreateLabelModal.active}
              disabled={isPending}
            />

            {/* Tags */}
            <MultiSelectInputBox
              id="tag"
              title="Select one or more tags for the song"
              placeholder="Click to choose song tags"
              formMethods={{ ...defaultFormMethods, name: "tags" }}
              options={
                {
                  type: LabelOptions.TAG,
                  labels: labels
                    ? {
                        defaults: labels.default?.tag || null,
                        created: labels.created?.tag || null,
                      }
                    : null,
                } as OptionType
              }
              autoCloseMenuFn={!activeCreateLabelModal.active}
              disabled={isPending}
            />

            {/* Release Date */}
            <CalendarInputBox
              id="releaseDate"
              title="Select the release date of song"
              {...register("releaseDate")}
            />
          </AnimationWrapper>
        </div>

        {/* Submit button */}
        <div
          className={`
            flex
            items-center
            justify-center
            ${activeAdvancedSettings && "mt-3"}
          `}
        >
          <button
            ref={submitBtnRef}
            type="submit"
            disabled={!isValid || isPending}
            className={`
              mt-2
              submit-btn
              ${activeAdvancedSettings && `lg:w-1/2 lg:rounded-full`}
              capitalize
              text-sm
              outline-none
            `}
          >
            {isPending ? <Loader loader={{ size: 20 }} /> : "Create Song"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadModal;
