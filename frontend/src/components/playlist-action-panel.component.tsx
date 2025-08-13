import { useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { MdDeleteSweep, MdLock, MdPublic } from "react-icons/md";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import MenuItem from "./menu-item.component";
import QueuePlayButton from "./queue-play-button.component";
import SongTableListArrangementMenu from "./song-table-list-arrangement-menu.component";
import { useUpdatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { PrivacyOptions } from "@joytify/shared-types/constants";
import { RefactorPlaylistResponse } from "@joytify/shared-types/types";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type PlaylistActionPanelProps = {
  fm: ScopedFormatMessage;
  playlist: RefactorPlaylistResponse;
};

const PlaylistActionPanel: React.FC<PlaylistActionPanelProps> = ({ fm, playlist }) => {
  const playlistMenuFm = fm("playlist.menu");

  const { _id: playlistId, songs, default: isDefault, privacy } = playlist;

  const [activeArrangementMenu, setActiveArrangementMenu] = useState(false);

  const {
    activePlaylistEditOptionsMenu,
    setActivePlaylistEditModal,
    setActivePlaylistEditOptionsMenu,
    setActivePlaylistDeleteModal,
    setActivePlaylistPrivacyModal,
  } = usePlaylistState();

  const { mutate: updatePlaylistFn } = useUpdatePlaylistMutation(playlistId);

  const handleActivePlaylistEditOptionsMenu = () => {
    timeoutForDelay(() => {
      setActivePlaylistEditOptionsMenu(!activePlaylistEditOptionsMenu);
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

  const { PUBLIC, PRIVATE } = PrivacyOptions;
  const isPublic = privacy === PUBLIC;

  // close playlist edit options menu in first render
  useEffect(() => {
    setActivePlaylistEditOptionsMenu(false);
    setActiveArrangementMenu(false);
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
        {songs && songs.length > 0 && <QueuePlayButton songs={songs} />}

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
      <SongTableListArrangementMenu
        fm={fm}
        menuActiveState={{
          visible: activeArrangementMenu,
          setVisible: setActiveArrangementMenu,
        }}
      />
    </div>
  );
};

export default PlaylistActionPanel;
