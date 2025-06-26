import { useCallback, useEffect } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BsList, BsListTask } from "react-icons/bs";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { MdDeleteSweep, MdLock, MdPlaylistPlay, MdPublic } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import MenuItem from "./menu-item.component";
import PlayButton from "./play-button.component";

import { useScopedIntl } from "../hooks/intl.hook";
import usePlaybackControl from "../hooks/playback-control.hook";
import { useUpdatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { PrivacyOptions } from "@joytify/shared-types/constants";
import { Queue, RefactorPlaylistResponse } from "@joytify/shared-types/types";
import { ArrangementType } from "../types/arragement.type";
import usePlaybackControlState from "../states/playback-control.state";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type PlaylistBodyHeaderProps = {
  playlist: RefactorPlaylistResponse;
};

const PlaylistBodyHeader: React.FC<PlaylistBodyHeaderProps> = ({ playlist }) => {
  const { fm } = useScopedIntl();
  const playlistMenuFm = fm("playlist.menu");

  const { _id: playlistId, songs, default: isDefault, privacy } = playlist;

  const {
    activePlaylistEditOptionsMenu,
    activePlaylistListOptionsMenu,
    songArrangementType,
    setActivePlaylistEditModal,
    setActivePlaylistEditOptionsMenu,
    setActivePlaylistListOptionsMenu,
    setActivePlaylistDeleteModal,
    setActivePlaylistPrivacyModal,
    setSongArrangementType,
  } = usePlaylistState();

  const { isPlaying } = usePlaybackControlState();
  const { playSong, audioSong } = usePlaybackControl();
  const { mutate: updatePlaylistFn } = useUpdatePlaylistMutation(playlistId);

  const handleActivePlaylistEditOptionsMenu = () => {
    timeoutForDelay(() => {
      setActivePlaylistEditOptionsMenu(!activePlaylistEditOptionsMenu);
    });
  };

  const handleActivePlaylistListOptionsMenu = () => {
    timeoutForDelay(() => {
      setActivePlaylistListOptionsMenu(!activePlaylistListOptionsMenu);
    });
  };

  const handleActivePlaylistEditModal = () => {
    timeoutForDelay(() => {
      setActivePlaylistEditModal({ active: true, playlist });
    });
  };

  const handleActiveDeleteWarningModal = () => {
    timeoutForDelay(() => {
      setActivePlaylistDeleteModal({ active: true, playlist });
    });
  };

  const handleActivePlaylistPrivacyModal = () => {
    timeoutForDelay(() => {
      setActivePlaylistPrivacyModal({ active: true, playlist });
    });
  };

  const handleSwitchPlaylistPrivacy = () => {
    timeoutForDelay(() => {
      updatePlaylistFn({ privacy: isPublic ? PRIVATE : PUBLIC });
    });
  };

  const handleChangeSongArrangementType = (type: ArrangementType) => {
    timeoutForDelay(() => {
      setSongArrangementType(type);
    });
  };

  const handlePlayPlaylist = useCallback(() => {
    const idx = songs.findIndex((s) => s._id === audioSong?._id);
    const currentIndex = idx !== -1 ? idx : 0;

    playSong({
      playlistSongs: songs,
      queue: songs as unknown as Queue,
      currentIndex,
      currentPlaySongId: songs[currentIndex]._id,
    });
  }, [audioSong, songs, playSong]);

  const { PUBLIC, PRIVATE } = PrivacyOptions;
  const { GRID, COMPACT } = ArrangementOptions;
  const isPublic = privacy === PUBLIC;

  // check if played song exist in playlist
  const playedSongExistInPlaylist =
    songs && songs.findIndex((s) => s._id === audioSong?._id) !== -1;

  // get needed arrangement types
  const arrangementTypes = Object.values(ArrangementOptions).filter((type) => type !== GRID);

  // close playlist edit options menu in first render
  useEffect(() => {
    setActivePlaylistEditOptionsMenu(false);
    setActivePlaylistListOptionsMenu(false);
  }, []);

  return (
    <div
      className={`
        flex
        items-center
        justify-between
      `}
    >
      {/* left side */}
      <div
        className={`
          flex
          gap-5
          items-center
        `}
      >
        {/* play button */}
        {songs && songs.length > 0 && (
          <PlayButton
            onClick={handlePlayPlaylist}
            isPlaying={playedSongExistInPlaylist ? isPlaying : false}
          />
        )}

        {/* options */}
        {!isDefault && (
          <div className={`relative`}>
            {/* options button */}
            <button
              type="button"
              onClick={handleActivePlaylistEditOptionsMenu}
              className={`
                text-grey-custom/50   
                hover:text-white
                outline-none
                transition 
              `}
            >
              <Icon name={BiDotsHorizontalRounded} opts={{ size: 30 }} />
            </button>

            {/* options menu */}
            <Menu
              activeState={{
                visible: activePlaylistEditOptionsMenu,
                setVisible: setActivePlaylistEditOptionsMenu,
              }}
              wrapper={{ transformOrigin: "top left" }}
              className={`w-[210px]`}
            >
              {/* Edit details */}
              <MenuItem
                onClick={handleActivePlaylistEditModal}
                icon={{ name: AiFillEdit }}
                label={playlistMenuFm("action.editDetails")}
              />

              {/* Delete playlist */}
              <MenuItem
                onClick={handleActiveDeleteWarningModal}
                icon={{ name: MdDeleteSweep }}
                label={playlistMenuFm("action.deletePlaylist")}
              />

              {/* Remove from profile */}
              <MenuItem
                onClick={isPublic ? handleActivePlaylistPrivacyModal : handleSwitchPlaylistPrivacy}
                icon={{ name: isPublic ? MdLock : MdPublic }}
                label={playlistMenuFm(`action.${isPublic ? "makePrivate" : "makePublic"}`)}
              />
            </Menu>
          </div>
        )}
      </div>

      {/* right side */}
      <div className={`relative`}>
        {/* options button */}
        <button
          type="button"
          onClick={handleActivePlaylistListOptionsMenu}
          className={`
            relative
            text-grey-custom/50   
            hover:text-white
            cursor-pointer
            transition
          `}
        >
          <Icon name={MdPlaylistPlay} opts={{ size: 28 }} />
        </button>

        {/* options menu */}
        <Menu
          activeState={{
            visible: activePlaylistListOptionsMenu,
            setVisible: setActivePlaylistListOptionsMenu,
          }}
          wrapper={{ transformOrigin: "top right" }}
          className={`
            absolute
            top-8
            right-0
            w-[210px]  
          `}
        >
          <p
            className={`
              text-left
              menu-btn
              hover:bg-transparent
              text-neutral-500
              hover:text-neutral-500
              cursor-default
            `}
          >
            {playlistMenuFm("layout.title")}
          </p>

          {/* Arrange option button */}
          <>
            {arrangementTypes.map((opt) => (
              <button
                key={opt}
                onClick={() => handleChangeSongArrangementType(opt)}
                className={`
                  menu-btn
                  ${songArrangementType === opt && `text-green-500 hover:text-green-500`}
                  `}
              >
                <div
                  className={`
                    flex
                    gap-3
                    items-center
                    justify-center
                  `}
                >
                  <Icon name={opt === COMPACT ? BsList : BsListTask} />
                  <p>{playlistMenuFm(`layout.${opt}`)}</p>
                </div>

                {songArrangementType === opt && <Icon name={FaCheck} />}
              </button>
            ))}
          </>
        </Menu>
      </div>
    </div>
  );
};

export default PlaylistBodyHeader;
