import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import Menu from "./menu.component";
import Icon from "./react-icons.component";
import MenuItem from "./menu-item.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { getSongTableListActionsContent } from "../contents/song-table-list-actions.content";
import { RefactorSongResponse } from "@joytify/shared-types/types";

type SongTableListActionsProps = {
  fm: ScopedFormatMessage;
  song: RefactorSongResponse;
  activeMenuSongId: string | null;
  setActiveMenuSongId: (id: string | null) => void;
};

const SongTableListActions: React.FC<SongTableListActionsProps> = ({
  fm,
  song,
  activeMenuSongId,
  setActiveMenuSongId,
}) => {
  const songTableListActions = getSongTableListActionsContent(fm);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const isActiveMenu = activeMenuSongId === song._id;

  const handleToggleMenu = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setActiveMenuSongId(isActiveMenu ? null : song._id);
    },
    [isActiveMenu]
  );

  // get menu position
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const getMenuPosition = () => {
      const rect = el.getBoundingClientRect();
      setMenuPos({ top: rect.top, left: rect.left - 210 });
    };

    getMenuPosition();

    const resizeObserver = new ResizeObserver(getMenuPosition);
    resizeObserver.observe(el);

    window.addEventListener("resize", getMenuPosition);
    window.addEventListener("scroll", getMenuPosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", getMenuPosition);
      window.removeEventListener("scroll", getMenuPosition, true);
    };
  }, [isActiveMenu]);

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleMenu}
        className={`hover:text-white outline-none transition-all`}
      >
        <Icon name={BsThreeDots} opts={{ size: 18 }} />
      </button>

      {isActiveMenu &&
        createPortal(
          <Menu
            id={`song-table-list-actions-menu-${song._id}`}
            activeState={{
              visible: isActiveMenu,
              setVisible: (state) => {
                setActiveMenuSongId(state ? song._id : null);
              },
            }}
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {songTableListActions.map((action) => {
              const { id, title, icon, onClick } = action;

              return (
                <MenuItem
                  key={id}
                  icon={{ name: icon.name, opts: { size: icon.size } }}
                  label={title}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(song);
                    setActiveMenuSongId(null);
                  }}
                />
              );
            })}
          </Menu>,
          document.body
        )}
    </div>
  );
};

export default SongTableListActions;
