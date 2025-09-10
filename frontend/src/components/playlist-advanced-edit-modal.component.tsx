import { useCallback, useEffect, useMemo, useState } from "react";
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
import { PlaylistEditModalSkeleton } from "./skeleton-loading.component";
import { useGetPlaylistByIdQuery } from "../hooks/playlist-query.hook";
import { useUpdatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { useScopedIntl } from "../hooks/intl.hook";

import { deleteFileFromAws } from "../fetchs/aws.fetch";
import { UploadFolder } from "@joytify/types/constants";
import { RefactorSongResponse } from "@joytify/types/types";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const PlaylistAdvancedEditModal = () => {
  const { fm } = useScopedIntl();
  const advancedEditPrefit = "playlist.advanced.edit.modal";
  const playlistEditModalFm = fm("playlist.edit.modal");
  const playlistAdvancedEditModalFm = fm(advancedEditPrefit);

  const [playlistImage, setPlaylistImage] = useState<string | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState<string | null>(null);
  const [playlistDescription, setPlaylistDescription] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredSongs, setFilteredSongs] = useState<RefactorSongResponse[] | null>(null);
  const [removedSongs, setRemovedSongs] = useState<string[] | null>(null);
  const [closeModalPending, setCloseModalPending] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { activePlaylistAdvancedEditModal, setActivePlaylistAdvancedEditModal } =
    usePlaylistState();
  const { active, playlistId } = activePlaylistAdvancedEditModal;
  const { playlist } = useGetPlaylistByIdQuery(playlistId ?? "");

  const dirtyFields = useMemo(() => {
    if (!playlist) {
      return {
        isDirty: false,
        fields: {} as Record<string, string | string[] | null>,
      };
    }

    const { title, description, coverImage, songs } = playlist;
    const fields: Record<string, string | string[] | null> = {};
    let isDirty = false;

    // check image change
    if (playlistImage && playlistImage !== coverImage) {
      fields.coverImage = playlistImage;
      isDirty = true;
    }

    // check title change
    if (playlistTitle && playlistTitle !== title) {
      fields.title = playlistTitle;
      isDirty = true;
    }

    // check description change
    if (description) {
      if (playlistDescription !== description) {
        fields.description = playlistDescription;
        isDirty = true;
      }
    } else if (playlistDescription && playlistDescription.length > 0) {
      fields.description = playlistDescription;
      isDirty = true;
    }

    // check song removal change
    if (songs && songs.length > 0 && removedSongs && removedSongs.length > 0) {
      fields.removedSongs = removedSongs;
      isDirty = true;
    }

    return { isDirty, fields };
  }, [playlistImage, playlistTitle, playlistDescription, removedSongs, playlist]);

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    timeoutForDelay(() => {
      setSearchQuery(e.target.value);
    });
  };

  const handlePlaylistTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    timeoutForDelay(() => {
      setPlaylistTitle(e.target.value);
    });
  };

  const handlePlaylistDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    timeoutForDelay(() => {
      setPlaylistDescription(e.target.value);
    });
  };

  const handleCloseModal = useCallback(() => {
    timeoutForDelay(async () => {
      setCloseModalPending(true);

      if (!isSubmitted && playlistImage && playlistImage !== playlist?.coverImage) {
        try {
          await deleteFileFromAws(playlistImage);

          setCloseModalPending(false);
        } catch (error) {
          console.log("Failed to deleting file from AWS", error);
        }
      }

      setActivePlaylistAdvancedEditModal({ active: false, playlistId: null });
    });
  }, [playlistImage, playlist?.coverImage, isSubmitted]);

  const handleToggleSongRemoval = useCallback(
    (songId: string, action: "add" | "remove") => {
      timeoutForDelay(() => {
        setRemovedSongs((prev) => {
          if (action === "add") {
            if (prev?.includes(songId)) return prev;
            return [...(prev || []), songId];
          } else {
            return prev?.filter((id) => id !== songId) || [];
          }
        });
      });
    },
    [filteredSongs]
  );

  const { mutate: updatePlaylistFn, isPending } = useUpdatePlaylistMutation(
    playlistId ?? "",
    handleCloseModal
  );

  const handleSubmit = useCallback(() => {
    const updateFields = dirtyFields.fields;

    updatePlaylistFn(updateFields);

    setIsSubmitted(true);
  }, [dirtyFields.fields]);

  // initialize filtered songs
  useEffect(() => {
    if (!playlist || playlist.songs.length === 0) return;

    const songs = playlist.songs;
    const lowerSearchQuery = searchQuery.toLowerCase();

    const filteredSongs =
      songs.filter(
        (song) =>
          song.title.toLowerCase().includes(lowerSearchQuery) ||
          song.artist.name.toLowerCase().includes(lowerSearchQuery)
      ) || songs;

    setFilteredSongs(filteredSongs);
  }, [playlist, searchQuery]);

  // reset state when playlist changes
  useEffect(() => {
    if (playlist) {
      setPlaylistImage(playlist.coverImage ?? null);
      setPlaylistTitle(playlist.title ?? null);
      setPlaylistDescription(playlist.description ?? null);
      setRemovedSongs(null);
      setSearchQuery("");
    }
  }, [playlist?._id]);

  return (
    <Modal
      title={playlistEditModalFm("title")}
      activeState={active}
      closeModalFn={handleCloseModal}
      loading={closeModalPending}
      className={`w-[600px]`}
    >
      {/* playlist edit section (basic)*/}
      {playlist ? (
        <div
          className={`
            flex
            max-sm:flex-col
            gap-5
            w-full
            h-fit
          `}
        >
          <ImageLabel
            src={playlistImage ?? playlist?.coverImage}
            subfolder={UploadFolder.PLAYLISTS_IMAGE}
            setImgSrc={setPlaylistImage}
            isDefault={playlist.default}
            className={`
              flex
              items-center
              justify-center
              max-sm:w-full
              max-sm:rounded-md
              bg-grey-dark
            `}
            tw={{ label: "w-[15rem] h-[15rem]" }}
          />

          <div className={`flex flex-col gap-3 w-full`}>
            {/* Title */}
            <InputBox
              type="text"
              placeholder={playlistEditModalFm("input.title.placeholder")}
              defaultValue={playlist?.title}
              onChange={handlePlaylistTitleChange}
              disabled={isPending}
              autoFocus
            />

            {/* Description */}
            <textarea
              id="description"
              placeholder={playlistEditModalFm("input.description.placeholder")}
              defaultValue={playlist?.description}
              onChange={handlePlaylistDescriptionChange}
              disabled={isPending}
              className={`
                input-box
                h-full
                resize-none
              `}
            />
          </div>
        </div>
      ) : (
        <PlaylistEditModalSkeleton />
      )}

      {/* playlist assign songs edit section (advanced) */}
      {playlist?.songs && playlist.songs.length > 0 && (
        <>
          {/* divider */}
          <hr className={`divider`} />

          {/* search bar */}
          <SearchBarInput
            placeholder={playlistAdvancedEditModalFm("searchbar.placeholder")}
            disabled={isPending}
            className={`py-4`}
            onChange={handleSearchQueryChange}
          />

          {/* songs */}
          <div className={`mt-5`}>
            {filteredSongs && filteredSongs.length > 0 ? (
              <div
                className={`
                  flex
                  flex-col
                  w-full
                  sm:grid
                  sm:grid-cols-2 
                  gap-2
                `}
              >
                {filteredSongs.map((song, index) => {
                  const { _id: songId, title, artist, imageUrl } = song;
                  const { name: artistName } = artist;
                  const isRemoved = removedSongs?.includes(songId) ?? false;

                  return (
                    <AnimationWrapper
                      key={`playlist-advanced-edit-modal-song-${songId}`}
                      onClick={() => handleToggleSongRemoval(songId, isRemoved ? "remove" : "add")}
                      transition={{ delay: 0.1 * index }}
                      className={`
                        group
                        flex
                        p-2
                        gap-3
                        border
                        ${
                          isRemoved
                            ? "bg-red-500/30 border-red-500"
                            : "bg-neutral-700/50 hover:bg-red-400/20 border-transparent"
                        }
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
                          <span
                            className={`
                               line-clamp-1
                              ${isRemoved ? "text-neutral-400" : "text-neutral-500"}
                            `}
                          >
                            {artistName}
                          </span>
                        </p>

                        {/* remove song button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSongRemoval(songId, isRemoved ? "remove" : "add");
                          }}
                          className={`
                            p-1
                            mr-2
                            ${isRemoved ? "bg-red-500" : "bg-red-500/50 hover:bg-red-500"}
                            rounded-full
                            duration-200
                            transition-all
                          `}
                        >
                          <Icon name={isRemoved ? IoMdAdd : IoClose} opts={{ size: 14 }} />
                        </button>
                      </div>
                    </AnimationWrapper>
                  );
                })}
              </div>
            ) : (
              <p
                className={`
                  text-sm
                  text-center
                  text-neutral-500
                `}
              >
                <FormattedMessage
                  id={`${advancedEditPrefit}.no.songs.foundFor`}
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

      {/* buttons */}
      <div
        className={`
          flex
          flex-col
          gap-3
          mt-8
          text-sm
        `}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!dirtyFields.isDirty || isPending}
          className={`
            submit-btn
            py-2.5
            rounded-md
            border-none
          `}
        >
          {isPending ? (
            <Loader loader={{ size: 20 }} />
          ) : (
            playlistAdvancedEditModalFm("button.submit")
          )}
        </button>

        <button
          type="button"
          onClick={handleCloseModal}
          disabled={isPending}
          className={`
            submit-btn
            py-2.5
            bg-neutral-500/50
            rounded-md
            border-none
          `}
        >
          {playlistAdvancedEditModalFm("button.cancel")}
        </button>
      </div>
    </Modal>
  );
};

export default PlaylistAdvancedEditModal;
