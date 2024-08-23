import { useMutation } from "@tanstack/react-query";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import Modal from "./modal.component";
import InputBox from "./input-box.component";
import Loader from "./loader.component";

import { uploadFileToAws, uploadSong } from "../fetchs/upload.fetch";
import useUploadModalState from "../states/upload-modal.state";
import MutationKey from "../constants/mutation-key.constant";
import { reqUpload } from "../constants/data-type.constant";

const UploadModal = () => {
  const { isActive, closeUploadModal } = useUploadModalState();

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
      songAuthor: "",
      songFile: null,
      imageFile: null,
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (value) => {
    const { songTitle, songAuthor, songFile, imageFile } = value;

    // uploadSongFile({
    //   subfolder: "songs",
    //   extension: ".mp3",
    //   file: songFile[0],
    // });

    console.log(songTitle, songAuthor);
  };

  return (
    <Modal
      title="Add a song"
      description="upload an mp3 file"
      activeState={isActive}
      closeModalFn={closeUploadModal}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
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

        {/* Song author */}
        <InputBox
          id="song-author"
          type="text"
          placeholder="Song Author"
          onKeyDown={(e) => handleMoveToNextElement(e, "songFile")}
          {...register("songAuthor", { required: true })}
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

        {/* Submit button */}
        <button
          disabled={!isValid}
          className={`
            mt-2
            submit-btn
            capitalize
            text-sm
            outline-none
            rounded-full
          `}
        >
          {isPending ? <Loader loader={{ size: 20 }} /> : "Create Song"}
        </button>
      </form>
    </Modal>
  );
};

export default UploadModal;
