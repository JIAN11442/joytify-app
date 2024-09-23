import { useEffect, useRef, useState } from "react";
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
import SelectInputBox from "./select-input-box.component";

import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { reqUpload } from "../constants/data-type.constant";
import {
  defaultsSongData,
  DefaultsSongType,
} from "../constants/form-default-data.constant";
import usePlaylistState from "../states/playlist.state";
import useUploadModalState from "../states/upload-modal.state";
import { createSongData } from "../fetchs/song.fetch";
import { timeoutForDelay } from "../lib/timeout.lib";
import queryClient from "../config/query-client.config";

const UploadModal = () => {
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [songName, setSongName] = useState("");
  const { userPlaylists } = usePlaylistState();

  const {
    isActiveModal,
    closeUploadModal,
    isActiveAdvancedSettings,
    setIsActiveAdvancedSettings,
  } = useUploadModalState();

  // handle input onKeyDown
  const handleMoveToNextElement = (
    e: React.KeyboardEvent<HTMLInputElement>,
    next: React.RefObject<HTMLButtonElement> | reqUpload,
    condition: string | boolean = e.currentTarget.value.length > 0
  ) => {
    if (e.key === "Enter" && condition) {
      if (typeof next === "string") {
        setFocus(next);
      } else if (next?.current) {
        next.current.focus();
      }
    }
  };

  // handle active advanced settings
  const handleActiveAdvancedSettings = () => {
    timeoutForDelay(() => {
      setIsActiveAdvancedSettings(true);
    });
  };

  // handle inactive advanced settings
  const handleInactiveAdvancedSettings = () => {
    timeoutForDelay(() => {
      setIsActiveAdvancedSettings(false);
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

      reset();
    },
    onError: (error) => toast.error(error.message),
  });

  // get form data
  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    reset,
    formState: { isValid },
  } = useForm<DefaultsSongType>({
    defaultValues: { ...defaultsSongData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<DefaultsSongType> = async (value) => {
    setSongName(value.title);

    createNewSongData(value);
  };

  return (
    <Modal
      title="Add a song"
      description="upload an mp3 file"
      activeState={isActiveModal}
      closeModalFn={closeUploadModal}
      className={{
        wrapper: `
        ${isActiveAdvancedSettings && "lg:min-w-[70vw]"}
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
          {isActiveAdvancedSettings && (
            <button
              onClick={handleInactiveAdvancedSettings}
              className={`
                absolute
                top-5
                left-5
                hover-btn
              `}
            >
              <Icon name={IoCaretBack} />
            </button>
          )}
        </>

        {/* input */}
        <div
          className={`
            w-full
            ${
              isActiveAdvancedSettings &&
              `
                lg:grid
                grid-cols-2
                lg:gap-5
                max-lg:flex
                max-lg:flex-col
                max-lg:gap-3
              `
            }
          `}
        >
          {/* Basic setting */}
          <div
            className={`
              flex
              flex-col
              gap-3
            `}
          >
            {/* Song title */}
            <InputBox
              id="song-title"
              type="text"
              placeholder="Song Title"
              onKeyDown={(e) => handleMoveToNextElement(e, "artist")}
              {...register("title", { required: true })}
            />

            {/* Song artist */}
            <InputBox
              id="song-artist"
              type="text"
              placeholder="Song Artist"
              onKeyDown={(e) => handleMoveToNextElement(e, "songFile")}
              {...register("artist", { required: true })}
            />

            {/* Song file */}
            <div
              className={`
                flex
                flex-col
                gap-2
                mt-2
              `}
            >
              <p
                className={`
                  text-sm
                  text-grey-custom/50
                `}
              >
                Select a song file
              </p>

              <InputBox
                id="song-file"
                type="file"
                accept=".mp3"
                onKeyDown={(e) => handleMoveToNextElement(e, "imageFile")}
                className={`p-3`}
                {...register("songFile", { required: true })}
              />
            </div>

            {/* Song cover art file */}
            <div
              className={`
                flex
                flex-col
                gap-2
                mt-2
              `}
            >
              <p
                className={`
                  text-sm
                  text-grey-custom/50
                `}
              >
                Select an image file
              </p>

              <InputBox
                id="song-image"
                type="file"
                accept=".png, .jpg, .jpeg"
                onKeyDown={(e) =>
                  handleMoveToNextElement(
                    e,
                    isActiveAdvancedSettings ? "songComposer" : submitBtnRef
                  )
                }
                {...register("imageFile", { required: true })}
              />
            </div>

            {/* Song Playlist */}
            <SelectInputBox
              id="playlist_for"
              title="Select a playlist"
              formValueState={{ name: "playlist_for", setFormValue: setValue }}
              placeholder="Click to choose a playlist"
              options={
                userPlaylists?.map((playlist) => ({
                  id: playlist?._id,
                  title: playlist?.title,
                })) || []
              }
              {...register("playlist_for", {
                required: true,
              })}
              onChange={(e) => register("playlist_for").onChange(e)}
            />

            {/* Advance setting */}
            <>
              {!isActiveAdvancedSettings && (
                <div
                  className={`
                    flex
                    items-center
                    justify-end
                    text-sm
                    ${isValid ? "text-green-custom" : "text-neutral-700"}
                    hover:underline
                  `}
                >
                  <button
                    type="button"
                    // form will recognize the first button as submit button
                    // so we need to prevent the default behavior
                    // to avoid the form to submit when the button is clicked
                    onClick={handleActiveAdvancedSettings}
                    className={`
                      flex
                      gap-2
                      items-center
                      justify-center
                      transition
                      ${isValid ? "animate-bounce" : ""}
                    `}
                  >
                    <Icon name={FaCircleInfo} />
                    <p>Advance Settings</p>
                  </button>
                </div>
              )}
            </>
          </div>

          {/* Advance setting */}
          <AnimationWrapper
            key="advance-setting"
            visible={isActiveAdvancedSettings}
            className={`
               flex
               flex-col
               gap-3 
            `}
          >
            {/* Song composer */}
            <InputBox
              id="songComposer"
              type="text"
              placeholder="Song Composer"
              onKeyDown={(e) => handleMoveToNextElement(e, submitBtnRef)}
              {...register("songComposer", { required: false })}
            />

            {/* Language */}
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
              ${isActiveAdvancedSettings ? `lg:w-1/2 lg:rounded-full` : ""}
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
