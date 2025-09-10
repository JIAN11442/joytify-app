import { useCallback, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { IoMdAdd } from "react-icons/io";
import { IoClose } from "react-icons/io5";

import Modal from "./modal.component";
import Loader from "./loader.component";
import Icon from "./react-icons.component";
import InputBox from "./input-box.component";
import ImageLabel from "./image-label.component";
import SearchBarInput from "./searchbar-input.component";
import AnimationWrapper from "./animation-wrapper.component";
import { useGetUserSongsQuery } from "../hooks/song-query.hook";
import { useCreatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { deleteFileFromAws } from "../fetchs/aws.fetch";
import { DefaultPlaylistAdvancedCreateForm, FormMethods } from "../types/form.type";
import { defaultPlaylistAdvancedCreatData } from "../constants/form.constant";
import { UploadFolder } from "@joytify/types/constants";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const PlaylistAdvancedCreateModal = () => {
  const { fm } = useScopedIntl();
  const advancedCreatePrefix = "playlist.advanced.create.modal";
  const playlistAdvancedCreateModalFm = fm(advancedCreatePrefix);

  const [playlistImage, setPlaylistImage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [closeModalPending, setCloseModalPending] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addedSongs, setAddedSongs] = useState<string[]>([]);

  const { activePlaylistAdvancedCreateModal, setActivePlaylistAdvancedCreateModal } =
    usePlaylistState();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    trigger,
    formState: { isValid },
  } = useForm<DefaultPlaylistAdvancedCreateForm>({
    defaultValues: defaultPlaylistAdvancedCreatData,
    mode: "onChange",
  });

  const handleCloseModal = useCallback(() => {
    timeoutForDelay(async () => {
      setCloseModalPending(true);

      if (!isSubmitted && playlistImage) {
        await deleteFileFromAws(playlistImage);
      }

      setActivePlaylistAdvancedCreateModal(false);
      setCloseModalPending(false);
    });
  }, [isSubmitted, playlistImage]);

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    timeoutForDelay(() => {
      setSearchQuery(e.target.value);
    });
  };

  const handleToggleAddedSongs = (songId: string) => {
    setAddedSongs((prev) => {
      if (prev.includes(songId)) {
        return prev.filter((id) => id !== songId);
      }

      return [...prev, songId];
    });
  };

  const { songs } = useGetUserSongsQuery();
  const { mutate: createPlaylistFn, isPending } = useCreatePlaylistMutation(handleCloseModal);

  const formMethods: FormMethods<DefaultPlaylistAdvancedCreateForm> = {
    setFormValue: setValue,
    setFormError: setError,
    trigger,
  };
  const defaultPlaylistImage = defaultPlaylistAdvancedCreatData.coverImage;
  const filteredSongs = useMemo(() => {
    if (!songs) return [];

    const lowerSearchQuery = searchQuery.toLowerCase();

    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(lowerSearchQuery) ||
        song.artist.name.toLowerCase().includes(lowerSearchQuery)
    );
  }, [songs, searchQuery]);

  const onSubmit: SubmitHandler<DefaultPlaylistAdvancedCreateForm> = async (value) => {
    createPlaylistFn(value);

    setIsSubmitted(true);
  };

  // set added songs to form value
  useEffect(() => {
    setValue("addedSongs", addedSongs);
  }, [addedSongs]);

  return (
    <Modal
      title={playlistAdvancedCreateModalFm("title")}
      activeState={activePlaylistAdvancedCreateModal}
      closeModalFn={handleCloseModal}
      loading={closeModalPending}
      className={`w-[600px]`}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`
          flex
          flex-col
          gap-2
        `}
      >
        <div className={`flex max-sm:flex-col gap-5 w-full h-fit`}>
          {/* image */}
          <ImageLabel
            src={playlistImage ?? defaultPlaylistImage}
            subfolder={UploadFolder.PLAYLISTS_IMAGE}
            formMethods={formMethods}
            setImgSrc={setPlaylistImage}
            className={`
              flex
              items-center
              justify-center
              max-sm:w-full
              max-sm:rounded-md
              bg-grey-dark
            `}
            tw={{ label: "w-[15rem] h-[15rem]", img: "rounded-md" }}
            {...register("coverImage")}
          />

          {/* content */}
          <div className={`flex flex-col gap-3 w-full`}>
            {/* Title */}
            <InputBox
              type="text"
              placeholder={playlistAdvancedCreateModalFm("input.title.placeholder")}
              formMethods={formMethods}
              disabled={isPending}
              autoFocus
              {...register("title", { required: true })}
            />

            {/* Description */}
            <textarea
              id="description"
              placeholder={playlistAdvancedCreateModalFm("input.description.placeholder")}
              disabled={isPending}
              className={`
                input-box
                h-full
                resize-none
              `}
              {...register("description")}
            />
          </div>
        </div>

        {/* songs */}
        {songs && songs?.length > 0 && (
          <>
            <hr className={`divider`} />

            <SearchBarInput
              placeholder={playlistAdvancedCreateModalFm("searchbar.placeholder")}
              disabled={isPending}
              onChange={handleSearchQueryChange}
              className={`py-4`}
            />

            <div className={`mt-5`}>
              {filteredSongs && filteredSongs.length > 0 ? (
                <div
                  className={`flex flex-col w-full sm:grid sm:grid-cols-2 gap-2`}
                  {...register("addedSongs")}
                >
                  {filteredSongs.map((song, index) => {
                    const { _id: songId, title, artist, imageUrl } = song;
                    const isAdded = addedSongs.includes(songId);

                    return (
                      <AnimationWrapper
                        key={`playlist-advanced-create-modal-song-${song._id}`}
                        onClick={() => handleToggleAddedSongs(songId)}
                        transition={{ delay: 0.1 * index }}
                        className={`
                          flex
                          p-2
                          gap-3
                          border
                          ${
                            isAdded
                              ? "bg-teal-400/30 border-teal-400"
                              : "bg-neutral-700/50 hover:bg-teal-400/20 border-transparent"
                          }
                          ${isPending ? "pointer-events-none" : "cursor-pointer"}
                          rounded-md
                          transition-all  
                        `}
                      >
                        <img src={imageUrl} className={`w-16 h-16 object-cover rounded-md`} />
                        <div className={`flex gap-3 w-full items-center justify-between`}>
                          <p
                            className={`
                              flex 
                              flex-col 
                              gap-1 
                              items-start 
                              justify-center 
                              text-sm 
                              font-ubuntu
                            `}
                          >
                            <span className={`text-neutral-300 font-semibold line-clamp-1`}>
                              {title}
                            </span>
                            <span className={`text-neutral-400 line-clamp-1`}>{artist.name}</span>
                          </p>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAddedSongs(songId);
                            }}
                            className={`
                              p-1
                              mr-2
                              ${isAdded ? "bg-teal-500" : "bg-teal-500/50 hover:bg-teal-500"}
                              rounded-full
                              duration-200
                              transition-all
                          `}
                          >
                            <Icon name={isAdded ? IoClose : IoMdAdd} opts={{ size: 14 }} />
                          </button>
                        </div>
                      </AnimationWrapper>
                    );
                  })}
                </div>
              ) : (
                <p
                  className={`
                    py-10
                    text-center
                    text-neutral-500
                  `}
                >
                  <FormattedMessage
                    id={`${advancedCreatePrefix}.no.songs.foundFor`}
                    values={{
                      searchQuery: searchQuery,
                      strong: (chunks) => <strong className={`text-neutral-300`}>{chunks}</strong>,
                    }}
                  />
                </p>
              )}
            </div>
          </>
        )}

        {/* Submit button */}
        <button
          disabled={!isValid || isPending}
          className={`
            mt-5
            py-2.5
            submit-btn
            capitalize
            text-sm
            rounded-md
            outline-none
          `}
        >
          {isPending ? (
            <Loader loader={{ size: 20 }} />
          ) : (
            playlistAdvancedCreateModalFm("input.button.submit")
          )}
        </button>
      </form>
    </Modal>
  );
};

export default PlaylistAdvancedCreateModal;
