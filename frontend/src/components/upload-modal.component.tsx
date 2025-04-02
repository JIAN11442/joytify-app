import { useMemo, useRef, useState } from "react";
import { RegisterOptions, SubmitHandler, useForm } from "react-hook-form";
import { FaCircleInfo } from "react-icons/fa6";
import { IoCaretBack } from "react-icons/io5";

import Modal from "./modal.component";
import Loader from "./loader.component";
import Icon from "./react-icons.component";
import InputBox from "./input-box.component";
import AnimationWrapper from "./animation-wrapper.component";
import SingleSelectInputBox from "./single-select-input-box.component";
import MultiSelectInputBox, { OptionType } from "./multi-select-input-box.component";
import CalendarInputBox from "./calendar-input-box.component";
import WarningMsgBox from "./warning-message-box.component";

import { useGetLabelsQuery } from "../hooks/label-query.hook";
import { useGetAlbumsQuery } from "../hooks/album-query.hook";
import { useCreateSongMutation } from "../hooks/song-mutate.hook";
import { useRemoveLabelMutation } from "../hooks/label-mutate.hook";
import { useRemoveAlbumMutation } from "../hooks/album-mutate.hook";
import { defaultSongData } from "../constants/form.constant";
import { LabelOptions } from "@joytify/shared-types/constants";
import { DefaultSongForm, FormMethods } from "../types/form.type";
import useUploadModalState from "../states/upload-modal.state";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type WarningState = {
  active: boolean;
  target: string | null;
};

const UploadModal = () => {
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const [visibleWarning, setVisibleWarning] = useState<WarningState>({
    active: false,
    target: "",
  });

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

  const { userPlaylists } = usePlaylistState();

  const { albums } = useGetAlbumsQuery();
  const { labels, refetch: labelRefetch } = useGetLabelsQuery();

  // handle close upload modal
  const handleCloseUploadModal = () => {
    timeoutForDelay(() => {
      closeUploadModal();
      reset(defaultSongData);
    });
  };

  // mutations
  const { mutate: removeLabelFn } = useRemoveLabelMutation();
  const { mutate: removeAlbumFn } = useRemoveAlbumMutation();
  const { mutate: createSongFn, isPending } = useCreateSongMutation(handleCloseUploadModal);

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
        options: userPlaylists?.map((playlist) => playlist.title) || null,
      });
    });
  };

  // handle active create album modal
  const handleActiveCreateAlbumModal = () => {
    timeoutForDelay(() => {
      // generate albums structure to string array
      const options = albums?.map((album) => album.title) || [];

      setActiveCreateAlbumModal({ active: true, options });
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
  } = useForm<DefaultSongForm>({
    mode: "onChange",
  });

  const normalizeRegister = (
    name: keyof DefaultSongForm,
    options?: RegisterOptions<DefaultSongForm>
  ) => {
    return register(name, {
      ...options,
      setValueAs: (val) => (val.length === 0 ? undefined : val),
    });
  };

  const warningContent = () => {
    return (
      <span>
        If there is more than one {visibleWarning.target}, please separate them with a comma.{" "}
        <span className={`font-extrabold text-orange-400`}>[e.g., John, Jason]</span>
      </span>
    );
  };

  const warning = () => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setVisibleWarning({
        active: Boolean(e.target.value.length),
        target: e.target.name,
      });
    },

    onBlur: () => {
      setVisibleWarning({ active: false, target: null });
    },
  });

  const formMethods: FormMethods<DefaultSongForm> = useMemo(
    () => ({
      setFormValue: setValue,
      setFormError: setError,
      trigger,
    }),
    []
  );

  const onSubmit: SubmitHandler<DefaultSongForm> = async (value) => {
    createSongFn(value);
  };

  return (
    <Modal
      title="Add a song"
      description="upload an mp3 file"
      activeState={activeUploadModal}
      closeModalFn={handleCloseUploadModal}
      closeBtnDisabled={isPending}
      autoCloseModalFn={
        !activeCreateLabelModal.active &&
        !activeCreatePlaylistModal.active &&
        !activeCreateAlbumModal.active &&
        !isPending
      }
      className={`
        ${activeAdvancedSettings && "md:w-[80vw] md:max-w-[700px]"}`}
    >
      {/* warning message box */}
      <WarningMsgBox
        warningMsg={warningContent()}
        visible={visibleWarning.active}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        tw={{ msg: "tracking-wider", clsBtn: "hidden" }}
      />

      {/* upload song form */}
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
              grid
              grid-cols-1
              gap-5
              ${activeAdvancedSettings && "md:grid-cols-2"}
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
              disabled={isPending}
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
                userPlaylists?.map((playlist) => ({
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
                  userPlaylists?.map((playlist) => playlist._id).includes(val ?? ""),
              })}
            />
          </div>

          {/* Advance setting button */}
          {!activeAdvancedSettings && (
            <div
              className={`
                flex
                items-center
                justify-end
                text-sm
                ${isValid && !isPending ? "text-green-custom" : "text-neutral-700"}
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
              {...normalizeRegister("imageFile")}
            />

            {/* Song lyricist */}
            <InputBox
              type="text"
              title="Enter song lyricist"
              placeholder="Song lyricist"
              formMethods={formMethods}
              disabled={isPending}
              toArray={true}
              {...normalizeRegister("lyricists", { ...warning() })}
            />

            {/* Song composer */}
            <InputBox
              type="text"
              title="Enter song composer"
              placeholder="Song composer"
              syncWithOtherInput={{
                active: !!watch("lyricists")?.length,
                syncVal: watch("lyricists"),
              }}
              formMethods={formMethods}
              disabled={isPending}
              toArray={true}
              {...normalizeRegister("composers", { ...warning() })}
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
              deleteOptFn={removeAlbumFn}
              autoCloseMenuFn={!activeCreateAlbumModal.active}
              disabled={isPending}
              {...normalizeRegister("album")}
            />

            {/* Language */}
            <MultiSelectInputBox
              id="language"
              title="Select language(s) for the song"
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
              deleteOptFn={removeLabelFn}
              queryRefetch={labelRefetch}
              autoCloseMenuFn={!activeCreateLabelModal.active}
              disabled={isPending}
              {...normalizeRegister("languages")}
            />

            {/* Genres */}
            <MultiSelectInputBox
              id="genre"
              title="Select genre(s) for the song"
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
              deleteOptFn={removeLabelFn}
              queryRefetch={labelRefetch}
              autoCloseMenuFn={!activeCreateLabelModal.active}
              disabled={isPending}
              {...normalizeRegister("genres")}
            />

            {/* Tags */}
            <MultiSelectInputBox
              id="tag"
              title="Select tag(s) for the song"
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
              deleteOptFn={removeLabelFn}
              queryRefetch={labelRefetch}
              autoCloseMenuFn={!activeCreateLabelModal.active}
              disabled={isPending}
              {...normalizeRegister("tags")}
            />

            {/* Release Date */}
            <CalendarInputBox
              id="releaseDate"
              title="Select the release date of song"
              disabled={isPending}
              {...normalizeRegister("releaseDate")}
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
