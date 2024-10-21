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

import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import {
  defaultsSongData,
  DefaultsSongType,
} from "../constants/form-default-data.constant";
import usePlaylistState from "../states/playlist.state";
import useUploadModalState from "../states/upload-modal.state";
import { createSongData } from "../fetchs/song.fetch";
import { timeoutForDelay } from "../lib/timeout.lib";
import queryClient from "../config/query-client.config";
import { useGetLabel } from "../hooks/label.hook";

const UploadModal = () => {
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [songName, setSongName] = useState("");
  const { userPlaylists } = usePlaylistState();

  const {
    activeUploadModal,
    closeUploadModal,
    activeAdvancedSettings,
    activeCreateLabelModal,
    setActiveAdvancedSettings,
  } = useUploadModalState();

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

  // create song mutation
  const { mutate: createNewSongData, isPending } = useMutation({
    mutationKey: [MutationKey.CREATE_NEW_SONG],
    mutationFn: createSongData,
    onSuccess: () => {
      // refetch user playlists
      queryClient.invalidateQueries([
        QueryKey.GET_USER_PLAYLISTS,
      ] as InvalidateQueryFilters);

      closeUploadModal();

      toast.success(`“${songName}” has been created successfully`);

      reset(defaultsSongData);
    },
    onError: (error) => toast.error(error.message),
  });

  // get form data
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    trigger,
    reset,
    formState: { isValid },
  } = useForm<DefaultsSongType>({
    defaultValues: { ...defaultsSongData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<DefaultsSongType> = async (value) => {
    const { title } = value;

    if (title) {
      setSongName(title);
    }

    console.log(value);

    // createNewSongData(value);
  };

  const { labels } = useGetLabel();

  return (
    <Modal
      title="Add a song"
      description="upload an mp3 file"
      activeState={activeUploadModal}
      closeModalFn={closeUploadModal}
      closeBtnDisabled={isPending}
      autoCloseModalFn={!activeCreateLabelModal.active && !isPending}
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
            w-full
            ${
              activeAdvancedSettings
                ? `
                    max-md:flex
                    max-md:flex-col
                    max-md:gap-3
                    md:grid
                    md:grid-cols-2
                    md:gap-5
                  `
                : `
                    flex
                    flex-col
                    gap-3
                  `
            }
          `}
        >
          {/* Basic setting */}
          <div
            className={`
              flex
              flex-col
              gap-4
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
              title="Enter a song artist"
              placeholder="Song artist"
              warning={[
                "If there is more than one artist, please separate them with a comma. [e.g., John, Jason]",
              ]}
              formValueState={{
                name: "artist",
                setFormValue: setValue,
                trigger,
              }}
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
              title="Select a song file"
              disabled={isPending}
              required
              className={`p-3`}
              {...register("songFile", { required: true })}
            />

            {/* Song cover art file */}
            <InputBox
              id="imageFile"
              type="file"
              accept=".png, .jpg, .jpeg"
              title="Select an image file"
              disabled={isPending}
              required
              {...register("imageFile", { required: true })}
            />

            {/* Song Playlist */}
            <SingleSelectInputBox
              id="playlist_for"
              title="Select a playlist"
              placeholder="Click to choose a playlist"
              formValueState={{
                name: "playlist_for",
                setFormValue: setValue,
                setFormError: setError,
                trigger,
              }}
              options={
                userPlaylists?.map((playlist) => ({
                  id: playlist?._id,
                  title: playlist?.title,
                })) || []
              }
              disabled={isPending}
              required
              {...register("playlist_for", {
                required: true,
                validate: (val) =>
                  userPlaylists
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
               gap-4
            `}
          >
            {/* Song composer */}
            <InputBox
              id="composer"
              type="text"
              title="Enter song composer"
              placeholder="Song composer"
              warning={[
                "If there is more than one composer, please separate them with a comma. [e.g., John, Jason]",
              ]}
              formValueState={{
                name: "composers",
                setFormValue: setValue,
                trigger,
              }}
              toArray={true}
              disabled={isPending}
            />

            {/* Language */}
            <MultiSelectInputBox
              id="language"
              title="Select one or more language of song"
              placeholder="Click to choose song language"
              autoCloseMenuFn={!activeCreateLabelModal.active}
              formValueState={{ name: "languages", setFormValue: setValue }}
              options={
                {
                  type: "language",
                  labels: {
                    defaults: labels?.default.language,
                    ...(labels?.created?.language && {
                      created: labels.created.language,
                    }),
                  },
                } as OptionType
              }
              disabled={isPending}
            />
          </AnimationWrapper>
        </div>

        {/* Submit button */}
        <div
          className={`
            flex
            items-center
            justify-center
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
