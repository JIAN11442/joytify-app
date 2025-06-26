import { BiSort, BiStats } from "react-icons/bi";
import { PiClockCountdown } from "react-icons/pi";
import { CiBoxList, CiFilter } from "react-icons/ci";
import { IoCalendarOutline, IoGridOutline } from "react-icons/io5";
import { TbSortAscending2, TbSortDescending2 } from "react-icons/tb";
import { IconName } from "../components/react-icons.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import {
  ManagePlaylistsArrangement,
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

type ManagePlaylistsControlPanelItem = {
  id: string;
  key:
    | ManagePlaylistsFilterType
    | ManagePlaylistsSortType
    | ManagePlaylistsSortDirectionType
    | ManagePlaylistsArrangementType;
  title: string;
  icon?: { name: IconName; size: number };
};

export type ManagePlaylistsControlPanelField = {
  title?: string;
  icon?: { name: IconName; size: number };
  items: ManagePlaylistsControlPanelItem[];
};

type ManagePlaylistsControlPanelContent = {
  filterField: ManagePlaylistsControlPanelField;
  sortField: ManagePlaylistsControlPanelField;
  directionField: ManagePlaylistsControlPanelField;
  arrangementField: ManagePlaylistsControlPanelField;
};

export const getManagePlaylistsControlPanelContent = (
  fm: ScopedFormatMessage
): ManagePlaylistsControlPanelContent => {
  const managePlaylistsControlPanelFm = fm("manage.playlists.controlPanel");
  const { ALL, RECENT, LIKED } = ManagePlaylistsFilter;
  const { DATE_CREATED, LAST_MODIFIED, SIZE, DURATION } = ManagePlaylistsSort;
  const { ASCENDING, DESCENDING } = ManagePlaylistsSortDirection;
  const { GRID, LIST } = ManagePlaylistsArrangement;

  return {
    filterField: {
      title: managePlaylistsControlPanelFm("filter.title"),
      icon: { name: CiFilter, size: 20 },
      items: [
        {
          id: "manage-playlists-control-panel-filter-all",
          key: ALL,
          title: managePlaylistsControlPanelFm("filter.all"),
        },
        {
          id: "manage-playlists-control-panel-filter-recent",
          key: RECENT,
          title: managePlaylistsControlPanelFm("filter.recent"),
        },
        {
          id: "manage-playlists-control-panel-filter-liked",
          key: LIKED,
          title: managePlaylistsControlPanelFm("filter.liked"),
        },
      ],
    },
    sortField: {
      title: managePlaylistsControlPanelFm("sortBy.title"),
      icon: { name: BiSort, size: 18 },
      items: [
        {
          id: "manage-playlists-control-panel-sort-dateCreated",
          key: DATE_CREATED,
          icon: { name: IoCalendarOutline, size: 18 },
          title: managePlaylistsControlPanelFm("sortBy.dateCreated"),
        },
        {
          id: "manage-playlists-control-panel-sort-lastModified",
          key: LAST_MODIFIED,
          icon: { name: PiClockCountdown, size: 18 },
          title: managePlaylistsControlPanelFm("sortBy.lastModified"),
        },
        {
          id: "manage-playlists-control-panel-sort-size",
          key: SIZE,
          icon: { name: BiStats, size: 18 },
          title: managePlaylistsControlPanelFm("sortBy.size"),
        },
        {
          id: "manage-playlists-control-panel-sort-duration",
          key: DURATION,
          icon: { name: PiClockCountdown, size: 18 },
          title: managePlaylistsControlPanelFm("sortBy.duration"),
        },
      ],
    },
    directionField: {
      items: [
        {
          id: "manage-playlists-control-panel-direction-ascending",
          key: ASCENDING,
          title: managePlaylistsControlPanelFm("direction.ascending"),
          icon: { name: TbSortAscending2, size: 18 },
        },
        {
          id: "manage-playlists-control-panel-direction-descending",
          key: DESCENDING,
          title: managePlaylistsControlPanelFm("direction.descending"),
          icon: { name: TbSortDescending2, size: 18 },
        },
      ],
    },
    arrangementField: {
      items: [
        {
          id: "manage-playlists-control-panel-arrangement-grid",
          key: GRID,
          title: managePlaylistsControlPanelFm("arrangement.grid"),
          icon: { name: IoGridOutline, size: 18 },
        },
        {
          id: "manage-playlists-control-panel-arrangement-list",
          key: LIST,
          title: managePlaylistsControlPanelFm("arrangement.list"),
          icon: { name: CiBoxList, size: 18 },
        },
      ],
    },
  };
};
