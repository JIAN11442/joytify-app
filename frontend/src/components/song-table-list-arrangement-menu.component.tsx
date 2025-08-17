import { FaCheck } from "react-icons/fa";
import { MdPlaylistPlay } from "react-icons/md";
import { BsList, BsListTask } from "react-icons/bs";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import MenuItem from "./menu-item.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { ArrangementType } from "../types/arragement.type";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ArrangementMenuProps = {
  fm: ScopedFormatMessage;
  menuActiveState: { visible: boolean; setVisible: (state: boolean) => void };
};

const SongTableListArrangementMenu: React.FC<ArrangementMenuProps> = ({ fm, menuActiveState }) => {
  const { GRID, COMPACT } = ArrangementOptions;

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

  const songTableListArrangementOptions = Object.values(ArrangementOptions).filter(
    (opt) => opt !== GRID
  );

  const arrangementMenuFm = fm("song.tableList.arrangement.menu");

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
        {songTableListArrangementOptions.map((opt) => {
          const isSelected = songListArrangementType === opt;
          return (
            <MenuItem
              key={opt}
              label={arrangementMenuFm(`layout.${opt}`)}
              icon={{ name: opt === COMPACT ? BsList : BsListTask }}
              onClick={() => handleChangeSongArrangementType(opt)}
              className={`${isSelected && `text-green-500 hover:text-green-500`}`}
            >
              {isSelected && <Icon name={FaCheck} />}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

export default SongTableListArrangementMenu;
