import { useState, useMemo, useEffect } from "react";
import ManagePlaylistsSortPanel from "./manage-playlists-sort-panel.component";
import ManagePlaylistsFilterPanel from "./manage-playlists-filter-panel.component";
import ManagePlaylistsSortDirectionPanel from "./manage-playlists-direction-panel.component";
import ManagePlaylistsArrangementPanel from "./manage-playlists-arrangement-panel.component";
import { getManagePlaylistsControlPanelContent } from "../contents/manage-playlists-control-panel.content";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import {
  ManagePlaylistsFilter,
  ManagePlaylistsSort,
  ManagePlaylistsSortDirection,
} from "../constants/manage.constant";
import {
  ManagePlaylistsArrangementType,
  ManagePlaylistsFilterType,
  ManagePlaylistsSortDirectionType,
  ManagePlaylistsSortType,
} from "../types/manage.type";
import { PlaylistResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";

export type OnChangeProps = {
  playlists: PlaylistResponse[];
  arrangement: ManagePlaylistsArrangementType;
};

type ManagePlaylistsControlPanelProps = {
  fm: ScopedFormatMessage;
  playlists: PlaylistResponse[] | undefined;
  initialArrangement: ManagePlaylistsArrangementType;
  onControlPanelChange?: (props: OnChangeProps) => void;
};

const ManagePlaylistsControlPanel: React.FC<ManagePlaylistsControlPanelProps> = ({
  fm,
  playlists,
  initialArrangement,
  onControlPanelChange,
}) => {
  const controlPanelFields = getManagePlaylistsControlPanelContent(fm);
  const { filterField, sortField, directionField, arrangementField } = controlPanelFields;

  const { ALL, RECENT, LIKED } = ManagePlaylistsFilter;
  const { DATE_CREATED, LAST_MODIFIED, SIZE, DURATION } = ManagePlaylistsSort;
  const { ASCENDING } = ManagePlaylistsSortDirection;

  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const [filter, setFilter] = useState(ALL);
  const [sort, setSort] = useState(DATE_CREATED);
  const [sortDirection, setSortDirection] = useState(ASCENDING);
  const [arrangement, setArrangement] = useState(initialArrangement);

  const handleFilterOnChange = (key: ManagePlaylistsFilterType) => {
    timeoutForDelay(() => {
      setFilter(key);
    });
  };

  const handleSortOnChange = (key: ManagePlaylistsSortType) => {
    timeoutForDelay(() => {
      setSort(key);
    });
  };

  const handleSortDirectionOnChange = (key: ManagePlaylistsSortDirectionType) => {
    timeoutForDelay(() => {
      setSortDirection(key);
    });
  };

  const handleArrangementOnChange = (key: ManagePlaylistsArrangementType) => {
    timeoutForDelay(() => {
      setArrangement(key);
    });
  };

  const filteredAndSortedPlaylists = useMemo(() => {
    if (!playlists) return [];

    let filtered = [...playlists];

    switch (filter) {
      // show playlists created in the last 30 days
      case RECENT: {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(
          (playlist) =>
            new Date(playlist.createdAt) > thirtyDaysAgo ||
            new Date(playlist.updatedAt) > thirtyDaysAgo
        );
        break;
      }
      // show playlists that are default(liked playlists)
      case LIKED:
        filtered = filtered.filter((playlist) => playlist.default);
        break;

      // show all playlists
      case ALL:
      default:
        break;
    }

    // apply sorting with direction
    const sortMultiplier = sortDirection === ASCENDING ? 1 : -1;

    switch (sort) {
      // sort by date created
      case DATE_CREATED:
        filtered.sort(
          (a, b) =>
            (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * sortMultiplier
        );
        break;
      // sort by date modified
      case LAST_MODIFIED:
        filtered.sort(
          (a, b) =>
            (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) * sortMultiplier
        );
        break;
      // sort by size
      case SIZE:
        filtered.sort((a, b) => (b.songs.length - a.songs.length) * sortMultiplier);
        break;
      // sort by duration
      case DURATION:
        filtered.sort(
          (a, b) => (b.stats.totalSongDuration - a.stats.totalSongDuration) * sortMultiplier
        );
        break;
    }

    return filtered;
  }, [playlists, filter, sort, sortDirection]);

  useEffect(() => {
    onControlPanelChange?.({ playlists: filteredAndSortedPlaylists, arrangement });
  }, [filteredAndSortedPlaylists, arrangement, onControlPanelChange]);

  return (
    <div
      className={`
        flex
        w-full
        gap-5
        ${
          isCollapsed
            ? `
                max-md:flex-col
                max-md:items-start
                md:items-center
              `
            : `
                max-lg:flex-col
                max-lg:items-start
                lg:items-center
              `
        }
        justify-between
        rounded-lg
      `}
    >
      <div
        className={`
          flex
          gap-3
          ${isCollapsed ? `max-md:w-full md:max-w-[250px]` : `max-lg:w-full lg:max-w-[250px]`} 
          items-center 
        `}
      >
        {/* filter */}
        <ManagePlaylistsFilterPanel
          initialFilter={filter}
          filterField={filterField}
          onFilterOptionChange={(filterOpt) => handleFilterOnChange(filterOpt)}
          className={`
            w-full
            ${isCollapsed ? `max-md:grid max-md:grid-cols-3` : `max-lg:grid max-lg:grid-cols-3`}`}
        />

        {/* arrangement (only show in below sm screen) */}
        <ManagePlaylistsArrangementPanel
          arrangementField={arrangementField}
          arrangement={arrangement}
          onArrangementChange={(arrangementOpt) => handleArrangementOnChange(arrangementOpt)}
          className={`flex ${isCollapsed ? `md:hidden` : `lg:hidden`}`}
        />
      </div>

      {/* sort & direction */}
      <div className={`flex w-full gap-3 items-center`}>
        {/* sort */}
        <ManagePlaylistsSortPanel
          sortField={sortField}
          initialSort={DATE_CREATED}
          onSortOptionChange={(sortOpt) => handleSortOnChange(sortOpt)}
          className={`${isCollapsed ? `max-md:w-full` : `max-lg:w-full`}`}
        />

        {/* direction */}
        <ManagePlaylistsSortDirectionPanel
          sortDirectionField={directionField}
          initialSortDirection={ASCENDING}
          onSortDirectionChange={(sortDirectionOpt) =>
            handleSortDirectionOnChange(sortDirectionOpt)
          }
        />
      </div>

      {/* arrangement (only show at sm screen and above) */}
      <ManagePlaylistsArrangementPanel
        arrangementField={arrangementField}
        arrangement={arrangement}
        onArrangementChange={(arrangementOpt) => handleArrangementOnChange(arrangementOpt)}
        className={`hidden ${isCollapsed ? `md:flex` : `lg:flex`}`}
      />
    </div>
  );
};

export default ManagePlaylistsControlPanel;
