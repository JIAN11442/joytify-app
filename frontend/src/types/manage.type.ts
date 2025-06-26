import {
  ManagePlaylistsFilter,
  ManagePlaylistsSort,
  ManagePlaylistsSortDirection,
  ManagePlaylistsArrangement,
} from "../constants/manage.constant";

export type ManagePlaylistsFilterType =
  (typeof ManagePlaylistsFilter)[keyof typeof ManagePlaylistsFilter];

export type ManagePlaylistsSortType =
  (typeof ManagePlaylistsSort)[keyof typeof ManagePlaylistsSort];

export type ManagePlaylistsSortDirectionType =
  (typeof ManagePlaylistsSortDirection)[keyof typeof ManagePlaylistsSortDirection];

export type ManagePlaylistsArrangementType =
  (typeof ManagePlaylistsArrangement)[keyof typeof ManagePlaylistsArrangement];
