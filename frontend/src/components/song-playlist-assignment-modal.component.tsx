import { useCallback, useEffect, useMemo, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { FaCheck } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { isEqual } from "lodash";

import Modal from "./modal.component";
import SongTitleItem from "./song-title-item.component";
import SearchBarInput from "./searchbar-input.component";
import PlaylistAssignmentList from "./playlist-assignment-list.component";
import { PlaylistCheckboxListSkeleton } from "./skeleton-loading.component";
import { useAssignSongToPlaylistsMutation } from "../hooks/song-mutate.hook";
import { useGetPlaylistsQuery } from "../hooks/playlist-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { PlaylistResponse, PlaylistsResponse } from "@joytify/shared-types/types";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import useUserState from "../states/user.state";

const SongPlaylistAssignmentModal = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaylists, setSelectedPlaylists] = useState<PlaylistsResponse | null>(null);
  const [initialAddedPlaylists, setInitialAddedPlaylists] = useState<PlaylistsResponse | null>(
    null
  );

  const { fm } = useScopedIntl();
  const { authUser } = useUserState();
  const { playlists, isPending } = useGetPlaylistsQuery();
  const { activeSongAssignmentModal, setActiveSongAssignmentModal } = useSongState();
  const { active, song } = activeSongAssignmentModal;

  const filteredPlaylists = useMemo(() => {
    if (!playlists) return [];

    return playlists.filter((playlist) =>
      playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [playlists, searchQuery]);

  const addedPlaylists = useMemo(() => {
    return filteredPlaylists.filter((playlist) =>
      selectedPlaylists?.some((selected) => selected._id === playlist._id)
    );
  }, [filteredPlaylists, selectedPlaylists]);

  const notAddedPlaylists = useMemo(() => {
    return filteredPlaylists.filter(
      (playlist) => !selectedPlaylists?.some((selected) => selected._id === playlist._id)
    );
  }, [filteredPlaylists, selectedPlaylists]);

  const handleCloseModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveSongAssignmentModal({ active: false, song: null });
    });
  }, [setActiveSongAssignmentModal]);

  const handleOnChangeSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    timeoutForDelay(() => {
      setSearchQuery(e.target.value);
    });
  };

  const handlePlaylistToggle = (targetPlaylist: PlaylistResponse) => {
    timeoutForDelay(() => {
      setSelectedPlaylists((prev) => {
        if (!prev) return [targetPlaylist];
        const exists = prev.some((p) => p._id === targetPlaylist._id);
        return exists
          ? prev.filter((p) => p._id !== targetPlaylist._id)
          : [...prev, targetPlaylist];
      });
    });
  };

  const { mutate: assignSongToPlaylistsFn } = useAssignSongToPlaylistsMutation(handleCloseModal);

  const handleOnSave = useCallback(() => {
    if (!song || !playlists) return;

    // find original playlists
    const originalPlaylists = playlists.filter((p) => p.songs.includes(song._id));

    // find playlists to add
    const playlistsToAdd =
      selectedPlaylists
        ?.filter((selected) => !originalPlaylists.some((orig) => orig._id === selected._id))
        .map((p) => p._id) || [];

    // find playlists to remove
    const playlistsToRemove = originalPlaylists
      .filter((orig) => !selectedPlaylists?.some((selected) => selected._id === orig._id))
      .map((p) => p._id);

    assignSongToPlaylistsFn({
      songId: song._id,
      playlistsToAdd,
      playlistsToRemove,
    });
  }, [selectedPlaylists, playlists, song]);

  // initialize selected playlists
  useEffect(() => {
    const initialSelectedPlaylists =
      playlists?.filter((playlist) => playlist.songs.includes(song?._id || "")) || [];

    setSelectedPlaylists(initialSelectedPlaylists);
    setInitialAddedPlaylists(initialSelectedPlaylists);
  }, [playlists, song]);

  if (!song) return null;

  const { title, artist, imageUrl, paletee } = song;
  const { name: artistName } = artist;
  const showPlaylistList = addedPlaylists.length > 0 || notAddedPlaylists.length > 0;

  const isUserSong = authUser?._id === song.creator;
  const isSelectedChanged = !isEqual(selectedPlaylists, initialAddedPlaylists);
  const isDirty = isUserSong ? addedPlaylists.length > 0 && isSelectedChanged : isSelectedChanged;

  const songAssignmentModalFm = fm("song.playlist.assignment.modal");

  return (
    <Modal
      title={songAssignmentModalFm("title")}
      description={songAssignmentModalFm("description")}
      activeState={active}
      closeModalFn={handleCloseModal}
      className={`overflow-y-hidden md:max-h-[80vh]`}
    >
      <div
        className={`
          flex
          flex-col
          gap-5
          max-h-[450px]
        `}
      >
        {/* preview */}
        <SongTitleItem
          title={title}
          artist={artistName}
          imageUrl={imageUrl}
          style={{
            backgroundImage: `linear-gradient(
              to bottom,
              ${paletee?.muted} 50%,
              ${paletee?.vibrant} 100%
            )`,
          }}
          className={{
            item: "flex p-3 w-full rounded-md",
            image: "w-16 h-16 shadow-md",
            title: "text-neutral-200",
            artist: "text-neutral-300",
          }}
        />

        {/* input box */}
        <SearchBarInput
          id="song-assignment-search-bar"
          placeholder={songAssignmentModalFm("searchbar.placeholder")}
          icon={{ name: BiSearch, opts: { size: 22 } }}
          visible={true}
          autoComplete="off"
          onChange={handleOnChangeSearchBar}
          className={`py-4`}
        />

        {/* playlists */}
        {isPending ? (
          <PlaylistCheckboxListSkeleton count={5} />
        ) : showPlaylistList ? (
          <div
            className={`
              flex
              flex-col
              pr-5
              gap-5
              overflow-y-auto
            `}
          >
            {/* added playlists */}
            {addedPlaylists.length > 0 && (
              <PlaylistAssignmentList
                fm={fm}
                title={songAssignmentModalFm("added.title")}
                playlists={addedPlaylists}
                icon={{ name: FaCheck }}
                checked={true}
                selectFn={handlePlaylistToggle}
              />
            )}

            <hr className={`divider mb-0`} />

            {/* unadded playlists */}
            {notAddedPlaylists.length > 0 && (
              <PlaylistAssignmentList
                fm={fm}
                title={songAssignmentModalFm("unadded.title")}
                playlists={notAddedPlaylists}
                icon={{ name: MdAdd, opts: { size: 25 } }}
                selectFn={handlePlaylistToggle}
              />
            )}
          </div>
        ) : (
          <p className={`py-10 text-center text-neutral-500`}>
            {`${songAssignmentModalFm("nofound")}: `}
            <span className={`text-neutral-300`}>{` "${searchQuery}"`}</span>
          </p>
        )}

        {/* button */}
        <div className={`grid grid-cols-2 gap-5 text-sm`}>
          {/* cancel */}
          <button
            onClick={handleCloseModal}
            className={`
              submit-btn 
              bg-neutral-500 
              border-neutral-500 
              rounded-md
            `}
          >
            {songAssignmentModalFm("button.cancel")}
          </button>

          {/* save */}
          <button
            onClick={handleOnSave}
            disabled={!isDirty}
            className={`submit-btn rounded-md ${!isDirty ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {songAssignmentModalFm("button.submit")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SongPlaylistAssignmentModal;
