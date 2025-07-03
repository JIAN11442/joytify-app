import { MdPlaylistPlay } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { BsList, BsListTask } from "react-icons/bs";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { ArrangementType } from "../types/arragement.type";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ArrangementMenuProps = {
  menuActiveState: { visible: boolean; setVisible: (state: boolean) => void };
};

const SongListArrangementMenu: React.FC<ArrangementMenuProps> = ({ menuActiveState }) => {
  const { fm } = useScopedIntl();
  const arrangementMenuFm = fm("song.list.arrangement.menu");

  const { songListArrangementType, setSongListArrangementType } = useSongState();

  const handleActiveOptionsMenu = () => {
    timeoutForDelay(() => {
      menuActiveState.setVisible(true);
    });
  };

  const handleChangeSongArrangementType = (type: ArrangementType) => {
    timeoutForDelay(() => {
      setSongListArrangementType(type);
    });
  };

  const { GRID, COMPACT } = ArrangementOptions;
  const songListArrangementOptions = Object.values(ArrangementOptions).filter(
    (opt) => opt !== GRID
  );

  return (
    <div className={`relative`}>
      {/* options button */}
      <button
        type="button"
        onClick={handleActiveOptionsMenu}
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
        activeState={menuActiveState}
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
          {arrangementMenuFm("layout.title")}
        </p>

        {/* Arrange option button */}
        <>
          {songListArrangementOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => handleChangeSongArrangementType(opt)}
              className={`
                menu-btn
                ${songListArrangementType === opt && `text-green-500 hover:text-green-500`}
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
                <p>{arrangementMenuFm(`layout.${opt}`)}</p>
              </div>

              {songListArrangementType === opt && <Icon name={FaCheck} />}
            </button>
          ))}
        </>
      </Menu>
    </div>
  );
};

export default SongListArrangementMenu;
