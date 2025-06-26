import { useMemo, useState } from "react";

import Icon from "./react-icons.component";
import { ManagePlaylistsControlPanelField } from "../contents/manage-playlists-control-panel.content";
import { ManagePlaylistsSortDirection } from "../constants/manage.constant";
import { ManagePlaylistsSortDirectionType } from "../types/manage.type";
import { timeoutForDelay } from "../lib/timeout.lib";

type SortDirectionPanelProps = {
  sortDirectionField: ManagePlaylistsControlPanelField;
  initialSortDirection: ManagePlaylistsSortDirectionType;
  onSortDirectionChange?: (direction: ManagePlaylistsSortDirectionType) => void;
};

const ManagePlaylistsSortDirectionPanel: React.FC<SortDirectionPanelProps> = ({
  sortDirectionField,
  initialSortDirection,
  onSortDirectionChange,
}) => {
  const { ASCENDING, DESCENDING } = ManagePlaylistsSortDirection;

  const [selectedSortDirection, setSelectedSortDirection] =
    useState<ManagePlaylistsSortDirectionType>(initialSortDirection);

  const handleToggleSortDirection = () => {
    timeoutForDelay(() => {
      const nextSortDirection = selectedSortDirection === ASCENDING ? DESCENDING : ASCENDING;

      setSelectedSortDirection(nextSortDirection);
      onSortDirectionChange?.(nextSortDirection);
    });
  };

  const selectedSortDirectionOption = useMemo(() => {
    return sortDirectionField.items.filter((item) => item.key === selectedSortDirection)[0];
  }, [sortDirectionField, selectedSortDirection]);

  const { icon } = selectedSortDirectionOption;

  return (
    <div className={`control-panel-items-wrapper`}>
      <button
        onClick={handleToggleSortDirection}
        className={`control-panel-btn control-panel-selected`}
      >
        {icon && <Icon name={icon.name} opts={{ size: icon.size }} />}
      </button>
    </div>
  );
};

export default ManagePlaylistsSortDirectionPanel;
