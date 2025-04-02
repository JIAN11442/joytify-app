import { useEffect } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BsList, BsListTask } from "react-icons/bs";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { MdDeleteSweep, MdLock, MdPlaylistPlay, MdPublic } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import MenuItem from "./menu-item.component";
import PlayButton from "./play-button.component";

import useOnPlay from "../hooks/play.hook";
import { useUpdatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { SongLoopOptions } from "../constants/loop-mode.constant";
import { PrivacyOptions } from "@joytify/shared-types/constants";
import { RefactorPlaylistResponse } from "@joytify/shared-types/types";
import { ArrangementType } from "../types/arragement.type";
import usePlaylistState from "../states/playlist.state";
import usePlayerState from "../states/player.state";
import useSoundState from "../states/sound.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type PlaylistBodyHeaderProps = {
  playlist: RefactorPlaylistResponse;
};

const PlaylistBodyHeader: React.FC<PlaylistBodyHeaderProps> = ({ playlist }) => {
  const { _id: playlistId, songs, default: isDefault, privacy } = playlist;
  const { PUBLIC, PRIVATE } = PrivacyOptions;
  const isPublic = privacy === PUBLIC;

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

  const { setLoopType } = usePlayerState();
  const { sound, isPlaying, activeSongId } = useSoundState();

  const { onPlay } = useOnPlay(songs);

  const { mutate: updatePlaylistFn } = useUpdatePlaylistMutation(playlistId);

  // handle active playlist edit options modal
  const handleActivePlaylistEditOptionsMenu = () => {
    timeoutForDelay(() => {
      setActivePlaylistEditOptionsMenu(!activePlaylistEditOptionsMenu);
    });
  };

  // handle active playlist list options modal
  const handleActivePlaylistListOptionsMenu = () => {
    timeoutForDelay(() => {
      setActivePlaylistListOptionsMenu(!activePlaylistListOptionsMenu);
    });
  };

  // handle active playlist edit modal
  const handleActivePlaylistEditModal = () => {
    timeoutForDelay(() => {
      setActivePlaylistEditModal({ active: true, playlist });
    });
  };

  // handle active delete warning modal
  const handleActiveDeleteWarningModal = () => {
    timeoutForDelay(() => {
      setActivePlaylistDeleteModal({ active: true, playlist });
    });
  };

  // handle active playlist privacy warning modal
  const handleActivePlaylistPrivacyModal = () => {
    timeoutForDelay(() => {
      setActivePlaylistPrivacyModal({ active: true, playlist });
    });
  };

  // handle switch playlist privacy
  const handleSwitchPlaylistPrivacy = () => {
    timeoutForDelay(() => {
      updatePlaylistFn({ privacy: isPublic ? PRIVATE : PUBLIC });
    });
  };

  // handle change song arrangement type
  const handleChangeSongArrangementType = (type: ArrangementType) => {
    timeoutForDelay(() => {
      setSongArrangementType(type);
    });
  };

  // handle play button
  const handleLoopPlaylist = () => {
    if (!sound || !playedSongExistInPlaylist) {
      onPlay(playlist.songs[0]._id);
    } else {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.play();
      }
    }
    if (playlist.songs.length > 1) {
      setLoopType(SongLoopOptions.PLAYLIST);
    } else {
      setLoopType(SongLoopOptions.OFF);
    }
  };

  // check if played song exist in playlist
  const playedSongExistInPlaylist = songs && songs.some((song) => song._id === activeSongId);

  // get needed arrangement types
  const arrangementTypes = Object.values(ArrangementOptions).filter(
    (type) => type !== ArrangementOptions.GRID
  );

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
            onClick={handleLoopPlaylist}
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
                label="Edit details"
              />

              {/* Delete playlist */}
              <MenuItem
                onClick={handleActiveDeleteWarningModal}
                icon={{ name: MdDeleteSweep }}
                label="Delete playlist"
              />

              {/* Remove from profile */}
              <MenuItem
                onClick={isPublic ? handleActivePlaylistPrivacyModal : handleSwitchPlaylistPrivacy}
                icon={{ name: isPublic ? MdLock : MdPublic }}
                label={isPublic ? "Make private" : "Make public"}
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
            View as
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
                  <Icon name={opt === ArrangementOptions.COMPACT ? BsList : BsListTask} />
                  <p>{opt}</p>
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
