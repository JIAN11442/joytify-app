import { useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
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

import { useGetLabels } from "../hooks/label.hook";
import { usePlaylists } from "../hooks/playlist.hook";
import { useGetAlbums } from "../hooks/album.hook";
import { createSongData } from "../fetchs/song.fetch";
import { removeAlbum } from "../fetchs/album.fetch";
import { deleteLabel } from "../fetchs/label.fetch";

import LabelOptions from "../constants/label.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import {
  defaultSongData,
  FormMethods,
  SongForm,
} from "../constants/form.constant";
import useUploadModalState from "../states/upload-modal.state";

import { navigate } from "../lib/navigate.lib";
import { timeoutForDelay } from "../lib/timeout.lib";

const UploadModal = () => {
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const {
    activeUploadModal,
    closeUploadModal,
    activeAdvancedSettings,
    activeCreateLabelModal,
    activeCreatePlaylistModal,
    activeCreateAlbumModal,
    setActiveCreateAlbumModal,
    setActiveAdvancedSettings,
    setActiveCreatePlaylistModal,
  } = useUploadModalState();

  const { playlists, refetch: playlistRefetch } = usePlaylists();
  const { labels, refetch: labelRefetch } = useGetLabels();
  const { albums, refetch: albumRefetch } = useGetAlbums();

  // create song mutation
  const { mutate: createNewSong, isPending } = useMutation({
    mutationKey: [MutationKey.CREATE_NEW_SONG],
    mutationFn: createSongData,
    onSuccess: (data) => {
      const { title, playlist_for } = data;

      // close modal
      closeUploadModal();

      // reset form input value
      reset(defaultSongData);

      // refetch user playlists
      playlistRefetch();

      // display success message
      toast.success(`“${title}” has been created successfully`);

      // navigate to playlist
      navigate(`/playlist/${playlist_for}`);
    },
    onError: (error) => toast.error(error.message),
  });

  // delete label mutation
  const { mutate: deleteTargetLabel } = useMutation({
    mutationKey: [MutationKey.DELETE_LABEL_OPTION],
    mutationFn: deleteLabel,
    onSuccess: (data) => {
      const { label } = data;

      // refetch query label
      labelRefetch();

      // display deleted success message
      toast.success(`"${label}" already deleted`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // delete album mutation
  const { mutate: deleteTargetAlbum } = useMutation({
    mutationKey: [MutationKey.DELETE_ALBUM_OPTION],
    mutationFn: removeAlbum,
    onSuccess: (data) => {
      const { title } = data;

      // refetch get albums query
      albumRefetch();

      // display success message
      toast.success(`"${title}" already deleted`);
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
      // generate albums structure to string array
      const options = albums?.map((album) => album.title) || [];

      setActiveCreateAlbumModal({ active: true, options, albumRefetch });
    });
  };

  // get form data
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    trigger,
    reset,
    watch,
    formState: { isValid },
  } = useForm<SongForm>({
    defaultValues: { ...defaultSongData },
    mode: "onChange",
  });

  const formMethods: FormMethods<SongForm> = useMemo(
    () => ({
      setFormValue: setValue,
      setFormError: setError,
      trigger,
    }),
    []
  );

  const onSubmit: SubmitHandler<SongForm> = async (value) => {
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
        !activeCreateAlbumModal.active &&
        !isPending
      }
      className={`
        ${
          activeAdvancedSettings &&
          `
            md:min-w-[80vw]  
            lg:min-w-[70vw] 
          `
        }`}
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
              type="text"
              title="Enter a song title"
              placeholder="Song title"
              disabled={isPending}
              required
              {...register("title", { required: true })}
            />

            {/* Song artist */}
            <InputBox
              type="text"
              title="Enter song artist"
              placeholder="Song artist"
              warning={[
                "If there is more than one artist, please separate them with a comma. [e.g., John, Jason]",
              ]}
              formMethods={formMethods}
              disabled={isPending}
              toArray={true}
              required
              {...register("artist", { required: true })}
            />

            {/* Song file */}
            <InputBox
              type="file"
              accept=".mp3"
              title="Select a song file (*.mp3)"
              disabled={isPending}
              className={`p-3`}
              required
              {...register("songFile", { required: true })}
            />

            {/* Song Playlist */}
            <SingleSelectInputBox
              title="Select a playlist"
              placeholder="Click to choose a playlist"
              formMethods={formMethods}
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
              type="file"
              accept=".png, .jpg, .jpeg"
              title="Select an image file (*.png)"
              disabled={isPending}
              {...register("imageFile")}
            />

            {/* Song lyricist */}
            <InputBox
              type="text"
              title="Enter song lyricist"
              placeholder="Song lyricist"
              warning={[
                "If there is more than one lyricist, please separate them with a comma. [e.g., John, Jason]",
              ]}
              formMethods={formMethods}
              disabled={isPending}
              toArray={true}
              {...register("lyricists")}
            />

            {/* Song composer */}
            <InputBox
              type="text"
              title="Enter song composer"
              placeholder="Song composer"
              warning={[
                "If there is more than one composer, please separate them with a comma. [e.g., John, Jason]",
              ]}
              syncWithOtherInput={{
                active: !!watch("lyricists")?.length,
                syncVal: watch("lyricists"),
              }}
              formMethods={formMethods}
              disabled={isPending}
              toArray={true}
              {...register("composers")}
            />

            {/* Album */}
            <SingleSelectInputBox
              title="Select an album"
              placeholder="Click to choose an album"
              formMethods={formMethods}
              options={
                albums?.map((album) => ({
                  id: album._id,
                  title: album.title,
                })) || []
              }
              createNewFn={handleActiveCreateAlbumModal}
              deleteOptFn={deleteTargetAlbum}
              autoCloseMenuFn={!activeCreateAlbumModal.active}
              disabled={isPending}
              {...register("album")}
            />

            {/* Language */}
            <MultiSelectInputBox
              id="language"
              title="Select one or more languages for the song"
              placeholder="Click to choose song language"
              formMethods={formMethods}
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
              deleteOptFn={deleteTargetLabel}
              queryRefetch={labelRefetch}
              autoCloseMenuFn={!activeCreateLabelModal.active}
              disabled={isPending}
              {...register("languages")}
            />

            {/* Genres */}
            <MultiSelectInputBox
              id="genre"
              title="Select one or more genres for the song"
              placeholder="Click to choose song genre"
              formMethods={formMethods}
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
              deleteOptFn={deleteTargetLabel}
              queryRefetch={labelRefetch}
              autoCloseMenuFn={!activeCreateLabelModal.active}
              disabled={isPending}
              {...register("genres")}
            />

            {/* Tags */}
            <MultiSelectInputBox
              id="tag"
              title="Select one or more tags for the song"
              placeholder="Click to choose song tags"
              formMethods={formMethods}
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
              deleteOptFn={deleteTargetLabel}
              queryRefetch={labelRefetch}
              autoCloseMenuFn={!activeCreateLabelModal.active}
              disabled={isPending}
              {...register("tags")}
            />

            {/* Release Date */}
            <CalendarInputBox
              id="releaseDate"
              title="Select the release date of song"
              disabled={isPending}
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
