import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { ManagePlaylistsControlPanelField } from "../contents/manage-playlists-control-panel.content";
import { ManagePlaylistsFilterType } from "../types/manage.type";
import { timeoutForDelay } from "../lib/timeout.lib";

type FilterPanelProps = {
  initialFilter: ManagePlaylistsFilterType;
  filterField: ManagePlaylistsControlPanelField;
  onFilterOptionChange?: (filter: ManagePlaylistsFilterType) => void;
  className?: string;
  tw?: { item?: string };
};

const ManagePlaylistsFilterPanel: React.FC<FilterPanelProps> = ({
  initialFilter,
  filterField,
  onFilterOptionChange,
  className,
  tw,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<ManagePlaylistsFilterType>(initialFilter);

  const handleSelectFilterOption = (key: ManagePlaylistsFilterType) => {
    timeoutForDelay(() => {
      setSelectedFilter(key);
      onFilterOptionChange?.(key);
    });
  };

  return (
    <div className={twMerge(`control-panel-items-wrapper`, className)}>
      {filterField.items.map((item) => {
        const { id, title } = item;
        const filterKey = item.key as ManagePlaylistsFilterType;

        return (
          <button
            key={id}
            onClick={() => handleSelectFilterOption(filterKey)}
            className={twMerge(
              `
                control-panel-btn
                min-w-[50px]
                ${
                  selectedFilter === filterKey
                    ? `control-panel-selected`
                    : `
                        text-neutral-400
                        hover:text-neutral-300
                        hover:bg-neutral-700
                      `
                }
              `,
              tw?.item
            )}
          >
            <p className={`truncate`}>{title}</p>
          </button>
        );
      })}
    </div>
  );
};

export default ManagePlaylistsFilterPanel;
