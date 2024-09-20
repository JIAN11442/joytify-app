import toast from "react-hot-toast";
import { AiFillEdit } from "react-icons/ai";
import { BsList, BsListTask } from "react-icons/bs";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { MdDeleteSweep, MdPlaylistPlay } from "react-icons/md";
import { FaUserPlus, FaUserXmark } from "react-icons/fa6";
import { InvalidateQueryFilters, useMutation } from "@tanstack/react-query";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import PlayButton from "./play-button.component";

import { changePlaylistHiddenState } from "../fetchs/playlist.fetch";
import { resPlaylist } from "../constants/data-type.constant";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import ArrangementOptions, {
  ArrangementType,
} from "../constants/arrangement-type.constant";
import SongLoopOptions from "../constants/song-loop-type.constant";
import useSoundState from "../states/sound.state";
import usePlayerState from "../states/player.state";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import queryClient from "../config/query-client.config";
import useOnPlay from "../hooks/play.hook";

type PlaylistBodyHeaderProps = {
  playlist: resPlaylist;
};

const PlaylistBodyHeader: React.FC<PlaylistBodyHeaderProps> = ({
  playlist,
}) => {
  const { songs, default: isDefault, hidden } = playlist;

  const {
    activePlaylistEditOptionsMenu,
    activePlaylistListOptionsMenu,
    setActivePlaylistEditModal,
    setActivePlaylistEditOptionsMenu,
    setActivePlaylistListOptionsMenu,
    setActiveDeletePlaylistModal,
    setActiveRemovePlaylistModal,
    setSongArrangementType,
  } = usePlaylistState();

  const { sound, isPlaying, activeSongId } = useSoundState();
  const { setLoopType } = usePlayerState();

  const { onPlay } = useOnPlay(songs);

  // add playlist to profile mutation
  const { mutate: addUserPlaylistToProfile } = useMutation({
    mutationKey: [MutationKey.ADD_PLAYLIST_TO_PROFILE],
    mutationFn: changePlaylistHiddenState,
    onSuccess: () => {
      // close edit options menu
      setActivePlaylistEditOptionsMenu(false);

      // refetch user playlists
      queryClient.invalidateQueries([
        QueryKey.GET_TARGET_PLAYLIST,
      ] as InvalidateQueryFilters);

      toast.success(`"${playlist?.title}" playlist added to profile`);
    },
    onError: () => {
      toast.error(`Failed to add "${playlist?.title}" playlist to profile`);
    },
  });

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
      setActiveDeletePlaylistModal({ active: true, playlist });
    });
  };

  // handle active remove warning modal
  const handleActiveRemoveWarningModal = () => {
    timeoutForDelay(() => {
      setActiveRemovePlaylistModal({ active: true, playlist });
    });
  };

  // handle add playlist to profile
  const handleAddPlaylistToProfile = () => {
    addUserPlaylistToProfile({ playlistId: playlist._id, hiddenState: false });
  };

  // handle change song arrangement type
  const handleChangeSongArrangementType = (type: ArrangementType) => {
    timeoutForDelay(() => {
      setSongArrangementType(type);
    });
  };

  const playedSongExistInPlaylist =
    songs && songs.some((song) => song._id === activeSongId);

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
        {songs && songs.length ? (
          <PlayButton
            onClick={handleLoopPlaylist}
            isPlaying={playedSongExistInPlaylist ? isPlaying : false}
          />
        ) : (
          ""
        )}

        {/* options */}
        <>
          {!isDefault && (
            <div className={`relative`}>
              {/* options button */}
              <button
                onClick={handleActivePlaylistEditOptionsMenu}
                className={`
                  text-grey-custom/50   
                  hover:text-white
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
                <button
                  onClick={handleActivePlaylistEditModal}
                  className={`
                    menu-btn
                    flex
                    gap-3
                    items-center
                    normal-case
                  `}
                >
                  <Icon name={AiFillEdit} opts={{ size: 18 }} />
                  <p>Edit details</p>
                </button>

                {/* Delete playlist */}
                <button
                  onClick={handleActiveDeleteWarningModal}
                  className={`
                    menu-btn
                    flex
                    gap-3
                    items-center
                    normal-case
                  `}
                >
                  <Icon name={MdDeleteSweep} opts={{ size: 18 }} />
                  <p>Delete playlist</p>
                </button>

                {/* Remove from profile */}
                <button
                  onClick={
                    hidden
                      ? handleAddPlaylistToProfile
                      : handleActiveRemoveWarningModal
                  }
                  className={`
                    menu-btn
                    flex
                    gap-3
                    items-center
                    normal-case
                  `}
                >
                  <Icon
                    name={hidden ? FaUserPlus : FaUserXmark}
                    opts={{ size: 18 }}
                  />
                  <p>{hidden ? "Add to profile" : "Remove from profile"}</p>
                </button>
              </Menu>
            </div>
          )}
        </>
      </div>

      {/* right side */}
      <div
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

        <Menu
          activeState={{
            visible: activePlaylistListOptionsMenu,
            setVisible: setActivePlaylistListOptionsMenu,
          }}
          wrapper={{ transformOrigin: "top right" }}
          className={`
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

          {/* Compact */}
          <button
            onClick={() =>
              handleChangeSongArrangementType(ArrangementOptions.COMPACT)
            }
            className={`
              menu-btn
              flex
              gap-3
              items-center
              normal-case
            `}
          >
            <Icon name={BsList} />
            <p>Compact</p>
          </button>

          {/* List */}
          <button
            onClick={() =>
              handleChangeSongArrangementType(ArrangementOptions.LIST)
            }
            className={`
              menu-btn
              flex
              gap-3
              items-center
              normal-case
            `}
          >
            <Icon name={BsListTask} />
            <p>List</p>
          </button>
        </Menu>
      </div>
    </div>
  );
};

export default PlaylistBodyHeader;
