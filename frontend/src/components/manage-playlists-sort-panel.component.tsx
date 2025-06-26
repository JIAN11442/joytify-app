import { twMerge } from "tailwind-merge";
import { useMemo, useRef, useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import MenuItem from "./menu-item.component";
import { ManagePlaylistsControlPanelField } from "../contents/manage-playlists-control-panel.content";
import { ManagePlaylistsSortType } from "../types/manage.type";
import { timeoutForDelay } from "../lib/timeout.lib";

type SortPanelProps = {
  sortField: ManagePlaylistsControlPanelField;
  initialSort: ManagePlaylistsSortType;
  onSortOptionChange?: (sort: ManagePlaylistsSortType) => void;
  className?: string;
};

const ManagePlaylistsSortPanel: React.FC<SortPanelProps> = ({
  sortField,
  initialSort,
  onSortOptionChange,
  className,
}) => {
  const sortOptionsMenuRef = useRef<HTMLDivElement>(null);
  const [selectedSort, setSelectedSort] = useState<ManagePlaylistsSortType>(initialSort);
  const [openSortOptionsMenu, setOpenSortOptionsMenu] = useState<boolean>(false);

  const handleToggleSortOptionsMenu = () => {
    timeoutForDelay(() => {
      setOpenSortOptionsMenu(!openSortOptionsMenu);
    });
  };

  const handleSelectSortOption = (sortKey: ManagePlaylistsSortType) => {
    timeoutForDelay(() => {
      setSelectedSort(sortKey);
      onSortOptionChange?.(sortKey);
    });
  };

  const selectedSortOption = useMemo(() => {
    return sortField.items.filter((item) => item.key === selectedSort)[0];
  }, [sortField, selectedSort]);

  const { icon, title } = selectedSortOption;

  return (
    <div className={twMerge(`relative min-w-[200px]`, className)}>
      {/* view as  */}
      <div
        onClick={handleToggleSortOptionsMenu}
        className={`
          control-panel-btn
          w-full
          py-3.5
          bg-neutral-800
          hover:bg-neutral-700/60
          border-[0.1px]
          border-neutral-700
          justify-between
          cursor-pointer
        `}
      >
        <div className={`flex items-center gap-2`}>
          {icon && <Icon name={icon?.name} opts={{ size: icon?.size }} />}
          <span className={`line-clamp-1`}>{title}</span>
        </div>

        <Icon
          name={openSortOptionsMenu ? IoMdArrowDropup : IoMdArrowDropdown}
          opts={{ size: 18 }}
        />
      </div>

      {/* options */}
      {openSortOptionsMenu && (
        <Menu
          ref={sortOptionsMenuRef}
          activeState={{ visible: openSortOptionsMenu, setVisible: setOpenSortOptionsMenu }}
          wrapper={{
            initial: { opacity: 0, y: -10 },
            animate: { opacity: 1, y: 0 },
            duration: 0.2,
            transformOrigin: "top",
          }}
          className={`
            flex
            flex-col
            mt-1
            gap-1
            w-full
            bg-neutral-900
          `}
        >
          {sortField.items.map((sortedOption) => {
            const { id, key, title, icon } = sortedOption;
            const sortKey = key as ManagePlaylistsSortType;

            return (
              <MenuItem
                key={id}
                label={title}
                {...(icon && { icon: { name: icon.name, opts: { size: icon.size } } })}
                onClick={() => handleSelectSortOption(sortKey)}
                className={`
                  p-3.5
                  ${sortKey === selectedSort ? `control-panel-selected` : "hover:bg-neutral-700/60"}
                `}
                tw={{ label: `text-neutral-200` }}
              />
            );
          })}
        </Menu>
      )}
    </div>
  );
};

export default ManagePlaylistsSortPanel;
