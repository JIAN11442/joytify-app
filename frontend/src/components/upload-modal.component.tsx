import { FormattedMessage } from "react-intl";
import { useCallback, useMemo, useRef, useState } from "react";
import { RegisterOptions, SubmitHandler, useForm } from "react-hook-form";
import { FaCircleInfo } from "react-icons/fa6";
import { IoCaretBack } from "react-icons/io5";

import Modal from "./modal.component";
import Loader from "./loader.component";
import Icon from "./react-icons.component";
import InputBox from "./input-box.component";
import AnimationWrapper from "./animation-wrapper.component";
import SingleSelectInputBox from "./single-select-input-box.component";
import MultiSelectInputBox from "./multi-select-input-box.component";
import CalendarInputBox from "./calendar-input-box.component";
import WarningMsgBox from "./warning-message-box.component";
import SelectInputBox from "./single-select-input-box.component";

import { useScopedIntl } from "../hooks/intl.hook";
import { useGetLabelsQuery } from "../hooks/label-query.hook";
import { useGetAlbumsQuery } from "../hooks/album-query.hook";
import { useCreateSongMutation } from "../hooks/song-mutate.hook";
import { useRemoveLabelMutation } from "../hooks/label-mutate.hook";
import { useRemoveAlbumMutation } from "../hooks/album-mutate.hook";
import { defaultSongData } from "../constants/form.constant";
import { LabelOptions } from "@joytify/types/constants";
import { QueryKey } from "../constants/query-client-key.constant";
import { DefaultSongForm, FormMethods } from "../types/form.type";
import useUploadModalState from "../states/upload-modal.state";
import usePlaylistState from "../states/playlist.state";
import { getLabelOptions } from "../utils/get-label-options.util";
import { validateDate } from "../utils/validate-date.util";
import { timeoutForDelay } from "../lib/timeout.lib";

type WarningState = {
  active: boolean;
  target: string | null;
};

const UploadModal = () => {
  const { fm, intl } = useScopedIntl();
  const modalPrefix = "song.upload.modal";
  const songUploadModalFm = fm(modalPrefix);
  const songInputTargetFm = fm("song.input.target");
  const dateFormatFm = fm("date.format");

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

  const { LANGUAGE, GENRE, TAG } = LabelOptions;
  const { GET_UPLOAD_SONG_LABELS } = QueryKey;

  const { albums } = useGetAlbumsQuery();
  const { labels, refetch: labelRefetch } = useGetLabelsQuery(GET_UPLOAD_SONG_LABELS, [
    LANGUAGE,
    GENRE,
    TAG,
  ]);

  const handleCloseUploadModal = useCallback(() => {
    timeoutForDelay(() => {
      closeUploadModal();
      reset(defaultSongData);
    });
  }, [closeUploadModal]);

  // mutations
  const { mutate: removeLabelFn } = useRemoveLabelMutation(GET_UPLOAD_SONG_LABELS);
  const { mutate: removeAlbumFn } = useRemoveAlbumMutation();
  const { mutate: createSongFn, isPending } = useCreateSongMutation(handleCloseUploadModal);

  const handleActiveAdvancedSettings = useCallback(() => {
    timeoutForDelay(() => {
      setActiveAdvancedSettings(true);
    });
  }, []);

  const handleInactiveAdvancedSettings = useCallback(() => {
    timeoutForDelay(() => {
      setActiveAdvancedSettings(false);
    });
  }, []);

  const handleActiveCreatePlaylistModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveCreatePlaylistModal({
        active: true,
        options: userPlaylists?.map((playlist) => playlist.title) || null,
      });
    });
  }, [userPlaylists]);

  const handleActiveCreateAlbumModal = useCallback(() => {
    timeoutForDelay(() => {
      // generate albums structure to string array
      const options = albums?.map((album) => album.title) || [];

      setActiveCreateAlbumModal({ active: true, options });
    });
  }, [albums]);

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
    defaultValues: defaultSongData,
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

  const warningHandler = () => ({
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

  const warningContent = () => {
    if (!visibleWarning.active) return null;

    return (
      <FormattedMessage
        id={`${modalPrefix}.warning.content`}
        values={{
          target: songInputTargetFm(`${visibleWarning.target}`),
          strong: (chunks) => <strong className={`text-orange-400`}>{chunks}</strong>,
        }}
      />
    );
  };

  const formMethods: FormMethods<DefaultSongForm> = useMemo(
    () => ({
      setFormValue: setValue,
      setFormError: setError,
      trigger,
    }),
    []
  );

  const playlistOptions = useMemo(() => {
    return (
      userPlaylists?.map((playlist) => ({
        id: playlist._id,
        title: playlist.title,
      })) || []
    );
  }, [userPlaylists]);

  const albumOptions = useMemo(() => {
    return (
      albums?.map((album) => ({
        id: album._id,
        title: album.title,
      })) || []
    );
  }, [albums]);

  const onSubmit: SubmitHandler<DefaultSongForm> = async (value) => {
    createSongFn(value);
  };

  return (
    <Modal
      title={songUploadModalFm("title")}
      description={songUploadModalFm("description")}
      activeState={activeUploadModal}
      closeModalFn={!isPending ? handleCloseUploadModal : undefined}
      autoCloseModal={
        !activeCreateLabelModal.active &&
        !activeCreatePlaylistModal.active &&
        !activeCreateAlbumModal.active &&
        !isPending
      }
      className={`
        ${activeAdvancedSettings && "md:w-[80vw] md:max-w-[750px]"}`}
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
        // noValidate
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
            gap-5
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
              title={songUploadModalFm("basic.title.label")}
              placeholder={songUploadModalFm("basic.title.placeholder")}
              disabled={isPending}
              required
              {...register("title", { required: true })}
            />

            {/* Song artist */}
            <InputBox
              type="text"
              title={songUploadModalFm("basic.artist.title")}
              placeholder={songUploadModalFm("basic.artist.placeholder")}
              disabled={isPending}
              required
              {...register("artist", { required: true })}
            />

            {/* Song file */}
            <InputBox
              type="file"
              accept=".mp3"
              title={songUploadModalFm("basic.songFile.title")}
              placeholder={songUploadModalFm("basic.songFile.placeholder")}
              disabled={isPending}
              required
              {...register("songFile", { required: true })}
            />

            {/* Song Playlist */}
            <SelectInputBox
              title={songUploadModalFm("basic.playlist.title")}
              placeholder={songUploadModalFm("basic.playlist.placeholder")}
              formMethods={formMethods}
              options={playlistOptions}
              createNewFn={handleActiveCreatePlaylistModal}
              autoCloseMenu={!activeCreatePlaylistModal.active}
              disabled={isPending}
              required
              {...register("playlistFor", {
                required: true,
                validate: (val) => userPlaylists?.some((playlist) => playlist._id === val) ?? false,
              })}
            />
          </div>

          {/* Advanced setting button */}
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
                <p>{songUploadModalFm("advanced.title")}</p>
              </button>
            </div>
          )}

          {/* Advanced setting */}
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
            {/* Song image file */}
            <InputBox
              type="file"
              accept=".png, .jpg, .jpeg"
              title={songUploadModalFm("advanced.imageFile.title")}
              placeholder={songUploadModalFm("advanced.imageFile.placeholder")}
              disabled={isPending}
              {...normalizeRegister("imageFile")}
            />

            {/* Song lyricist */}
            <InputBox
              type="text"
              title={songUploadModalFm("advanced.lyricist.title")}
              placeholder={songUploadModalFm("advanced.lyricist.placeholder")}
              formMethods={formMethods}
              disabled={isPending}
              toArray={true}
              {...normalizeRegister("lyricists", { ...warningHandler() })}
            />

            {/* Song composer */}
            <InputBox
              type="text"
              title={songUploadModalFm("advanced.composer.title")}
              placeholder={songUploadModalFm("advanced.composer.placeholder")}
              syncWithOtherInput={{
                active: !!watch("lyricists")?.length,
                syncVal: watch("lyricists"),
              }}
              formMethods={formMethods}
              disabled={isPending}
              toArray={true}
              {...normalizeRegister("composers", { ...warningHandler() })}
            />

            {/* Album */}
            <SingleSelectInputBox
              title={songUploadModalFm("advanced.album.title")}
              placeholder={songUploadModalFm("advanced.album.placeholder")}
              formMethods={formMethods}
              options={albumOptions}
              createNewFn={handleActiveCreateAlbumModal}
              deleteOptFn={removeAlbumFn}
              autoCloseMenu={!activeCreateAlbumModal.active}
              disabled={isPending}
              {...normalizeRegister("album")}
            />

            {/* Language */}
            <MultiSelectInputBox
              id="language"
              title={songUploadModalFm("advanced.language.title")}
              placeholder={songUploadModalFm("advanced.language.placeholder")}
              formMethods={formMethods}
              options={getLabelOptions(labels, LANGUAGE)}
              deleteOptFn={removeLabelFn}
              queryRefetch={labelRefetch}
              autoCloseMenu={!activeCreateLabelModal.active}
              disabled={isPending}
              {...normalizeRegister("languages")}
            />

            {/* Genres */}
            <MultiSelectInputBox
              id="genre"
              title={songUploadModalFm("advanced.genre.title")}
              placeholder={songUploadModalFm("advanced.genre.placeholder")}
              formMethods={formMethods}
              options={getLabelOptions(labels, GENRE)}
              deleteOptFn={removeLabelFn}
              queryRefetch={labelRefetch}
              autoCloseMenu={!activeCreateLabelModal.active}
              disabled={isPending}
              {...normalizeRegister("genres")}
            />

            {/* Tags */}
            <MultiSelectInputBox
              id="tag"
              title={songUploadModalFm("advanced.tag.title")}
              placeholder={songUploadModalFm("advanced.tag.placeholder")}
              formMethods={formMethods}
              options={getLabelOptions(labels, TAG)}
              deleteOptFn={removeLabelFn}
              queryRefetch={labelRefetch}
              autoCloseMenu={!activeCreateLabelModal.active}
              disabled={isPending}
              {...normalizeRegister("tags")}
            />

            {/* Release Date */}
            <CalendarInputBox
              title={songUploadModalFm("advanced.releaseDate.title")}
              datePlaceholder={{
                day: dateFormatFm("day"),
                month: dateFormatFm("month"),
                year: dateFormatFm("year"),
              }}
              intl={intl}
              disabled={isPending}
              {...normalizeRegister("releaseDate", {
                validate: (val) => {
                  if (!val) return true;
                  return validateDate(val as string);
                },
              })}
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
            {isPending ? (
              <Loader loader={{ size: 20 }} />
            ) : (
              songUploadModalFm("advanced.button.submit")
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadModal;
