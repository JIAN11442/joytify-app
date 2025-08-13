import { useCallback, useState } from "react";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import Menu from "./menu.component";
import Icon from "./react-icons.component";
import MenuItem from "./menu-item.component";
import QueuePlayButton from "./queue-play-button.component";
import SongTableListArrangementMenu from "./song-table-list-arrangement-menu.component";
import {
  useFollowMusicianMutation,
  useUnfollowMusicianMutation,
} from "../hooks/musician-mutate.hook";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorMusicianResponse } from "@joytify/shared-types/types";
import { timeoutForDelay } from "../lib/timeout.lib";

type MusicianActionPanelProps = {
  fm: ScopedFormatMessage;
  followed: boolean;
  musician: RefactorMusicianResponse;
};

const MusicianActionPanel: React.FC<MusicianActionPanelProps> = ({ fm, followed, musician }) => {
  const { songs } = musician;

  const [activeArrangementMenu, setActiveArrangementMenu] = useState(false);
  const [activeMusicianOptionsMenu, setActiveMusicianOptionsMenu] = useState(false);

  const { mutate: followMusicianFn } = useFollowMusicianMutation();
  const { mutate: unfollowMusicianFn } = useUnfollowMusicianMutation();

  const handleActiveMusicianOptionsMenu = useCallback(() => {
    timeoutForDelay(() => {
      setActiveMusicianOptionsMenu(!activeMusicianOptionsMenu);
    });
  }, [activeMusicianOptionsMenu]);

  const handleToggleFollowMusician = useCallback(() => {
    timeoutForDelay(() => {
      const musicianId = musician._id;

      if (followed) {
        unfollowMusicianFn(musicianId);
      } else {
        followMusicianFn(musicianId);
      }
    });
  }, [followed, musician, followMusicianFn, unfollowMusicianFn]);

  const musicianActionPanelMenuFm = fm("musician.actionPanel.menu");

  return (
    <div
      className={`
        flex
        items-center
        justify-between
    `}
    >
      {/* left side */}
      <div className={`flex gap-5 items-center`}>
        {songs && songs.length > 0 && <QueuePlayButton songs={songs} />}

        {/* options menu */}
        <div className={`relative`}>
          <button
            type="button"
            onClick={handleActiveMusicianOptionsMenu}
            className={`
              text-grey-custom/50   
              hover:text-white
              outline-none
              transition 
            `}
          >
            <Icon name={BiDotsHorizontalRounded} opts={{ size: 30 }} />
          </button>

          <Menu
            activeState={{
              visible: activeMusicianOptionsMenu,
              setVisible: setActiveMusicianOptionsMenu,
            }}
            wrapper={{ transformOrigin: "top left" }}
            className={`absolute top-2 left-10 w-[210px]`}
          >
            <MenuItem
              onClick={handleToggleFollowMusician}
              icon={{ name: followed ? CiCircleMinus : CiCirclePlus }}
              label={musicianActionPanelMenuFm(followed ? "unfollow" : "follow")}
            />
          </Menu>
        </div>
      </div>

      {/* right side */}
      <SongTableListArrangementMenu
        fm={fm}
        menuActiveState={{ visible: activeArrangementMenu, setVisible: setActiveArrangementMenu }}
      />
    </div>
  );
};

export default MusicianActionPanel;
