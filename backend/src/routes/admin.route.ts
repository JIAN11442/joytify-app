import { Router } from "express";
import {
  updateSongsPaleteeHandler,
  deleteNotificationHandler,
  createSystemAnnouncementHandler,
  initializePlaylistStatsHandler,
  recalculatePlaylistStatsHandler,
  resetUserNotificationsStatusHandler,
} from "../controllers/admin.controller";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";

const { NOTIFICATIONS, SONGS, PLAYLISTS } = API_ENDPOINTS;

const adminRoute = Router();

// prefix: /admin

// songs
adminRoute.patch(`${SONGS}/paletee`, updateSongsPaleteeHandler);

// playlists
adminRoute.patch(`${PLAYLISTS}/recalculate-stats`, recalculatePlaylistStatsHandler);
adminRoute.patch(`${PLAYLISTS}/initialize-stats`, initializePlaylistStatsHandler);

// notifications
adminRoute.post(`${NOTIFICATIONS}/system-announcement`, createSystemAnnouncementHandler);
adminRoute.patch(`${NOTIFICATIONS}/reset-status`, resetUserNotificationsStatusHandler);
adminRoute.delete(`${NOTIFICATIONS}/:id`, deleteNotificationHandler);

export default adminRoute;
