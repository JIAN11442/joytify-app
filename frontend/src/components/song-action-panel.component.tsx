import { useCallback, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { PiPlaylist } from "react-icons/pi";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaStar } from "react-icons/fa";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import QueuePlayButton from "./queue-play-button.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type SongActionPanelProps = {
  fm: ScopedFormatMessage;
  song: RefactorSongResponse;
  editable: boolean;
};

const SongActionPanel: React.FC<SongActionPanelProps> = ({ fm, song, editable }) => {
  const [activeEditMenu, setActiveEditMenu] = useState(false);

  const { setActiveSongEditModal, setActiveSongAssignmentModal, setActiveSongRateModal } =
    useSongState();

  const handleActiveSongOptionsMenu = useCallback(() => {
    timeoutForDelay(() => {
      setActiveEditMenu(!activeEditMenu);
    });
  }, [activeEditMenu]);

  const handleActiveSongRateModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveSongRateModal({ active: true, song });
    });
  }, [song]);

  const handleActiveSongEditModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveSongEditModal({ active: true, song });
    });
  }, [song]);

  const handleActiveSongAssignmentModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveSongAssignmentModal({ active: true, song });
    });
  }, [song]);

  const songActionPanelFm = fm("song.action.panel");

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
        <QueuePlayButton songs={[song]} />
      </div>

      {/* right side */}
      <div className={`relative`}>
        <button
          type="button"
          onClick={handleActiveSongOptionsMenu}
          className={`
            text-grey-custom/50   
            hover:text-white
            outline-none
            transition 
          `}
        >
          <Icon name={BiDotsHorizontalRounded} opts={{ size: 30 }} />
        </button>

        {/* menu */}
        <Menu
          activeState={{ visible: activeEditMenu, setVisible: setActiveEditMenu }}
          wrapper={{ transformOrigin: "top right" }}
          className={`absolute top-0 right-10 w-[210px]`}
        >
          {/* rate song */}
          <button
            type="button"
            onClick={handleActiveSongRateModal}
            className={`menu-btn normal-case`}
          >
            <Icon name={FaStar} opts={{ size: 18 }} />
            <p>{songActionPanelFm("menu.rate")}</p>
          </button>

          {/* edit details */}
          {editable && (
            <button
              type="button"
              onClick={handleActiveSongEditModal}
              className={`
                menu-btn
                normal-case 
              `}
            >
              <Icon name={AiFillEdit} opts={{ size: 18 }} />
              <p>{songActionPanelFm("menu.editDetails")}</p>
            </button>
          )}

          {/* assignment playlist */}
          <button
            type="button"
            onClick={handleActiveSongAssignmentModal}
            className={`
              menu-btn 
              normal-case
            `}
          >
            <Icon name={PiPlaylist} opts={{ size: 18 }} />
            <p>{songActionPanelFm("menu.assignmentPlaylist")}</p>
          </button>
        </Menu>
      </div>
    </div>
  );
};

export default SongActionPanel;
