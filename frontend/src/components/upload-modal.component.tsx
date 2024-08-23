import { useMutation } from "@tanstack/react-query";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import Modal from "./modal.component";
import InputBox from "./input-box.component";
import Loader from "./loader.component";

import { uploadFileToAws, uploadSong } from "../fetchs/upload.fetch";
import useUploadModalState from "../states/upload-modal.state";
import MutationKey from "../constants/mutation-key.constant";
import { reqUpload } from "../constants/data-type.constant";
import Icon from "./react-icons.component";
import { FaCircleInfo } from "react-icons/fa6";
import AnimationWrapper from "./animation-wrapper.component";
import { IoCaretBack } from "react-icons/io5";

const UploadModal = () => {
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
    const timeout = setTimeout(() => {
      setIsActiveAdvancedSettings(!isActiveAdvancedSettings);
    }, 0);

    return () => clearTimeout(timeout);
  };

  // handle inactive advanced settings
  const handleInactiveAdvancedSettings = () => {
    const timeout = setTimeout(() => {
      setIsActiveAdvancedSettings(false);
    }, 0);

    return () => clearTimeout(timeout);
  };

  // upload song mutation
  const { mutate: uploadSongInfo, isPending } = useMutation({
    mutationKey: [MutationKey.UPLOAD_SONG_INFO],
    mutationFn: uploadSong,
  });

  // upload song file to aws s3 mutation
  const { mutate: uploadSongFile } = useMutation({
    mutationKey: [MutationKey.UPLOAD_SONG_FILE],
    mutationFn: uploadFileToAws,
    onSuccess: (data) => console.log(data),
  });

  // get form data
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      songTitle: "",
      songArtist: "",
      songFile: null,
      imageFile: null,
      songComposer: "",
      album: "",
      genre: "",
      language: "",
      tags: [],
      lyrics: [],
      releaseDate: new Date(),
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (value) => {
    console.log(value);

    // uploadSongFile({
    //   subfolder: "songs",
    //   extension: ".mp3",
    //   file: songFile[0],
    // });
  };

  return (
    <Modal
      title="Add a song"
      description="upload an mp3 file"
      activeState={isActiveModal}
      closeModalFn={closeUploadModal}
      className={`
        ${isActiveAdvancedSettings && "lg:min-w-[70vw]"}
        `}
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
                hover-button
              `}
            >
              <Icon name={IoCaretBack} />
            </button>
          )}
        </>

        {/* form */}
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
              onKeyDown={(e) => handleMoveToNextElement(e, "songAuthor")}
              {...register("songTitle", { required: true })}
            />

            {/* Song artist */}
            <InputBox
              id="song-artist"
              type="text"
              placeholder="Song Artist"
              onKeyDown={(e) => handleMoveToNextElement(e, "songFile")}
              {...register("songArtist", { required: true })}
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
                {...register("songFile", { required: false })}
              />
            </div>

            {/* Song image */}
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
                {...register("imageFile", { required: false })}
              />
            </div>

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
          >
            {/* Song composer */}
            <InputBox
              id="song-composer"
              type="text"
              placeholder="Song Composer"
              onKeyDown={(e) => handleMoveToNextElement(e, "songAuthor")}
              {...register("songComposer", { required: false })}
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
            disabled={!isValid}
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
