import { Router } from "express";
import {
  deleteNotificationHandler,
  createSystemAnnouncementHandler,
  initializePlaylistStatsHandler,
  recalculatePlaylistStatsHandler,
  resetUserNotificationsStatusHandler,
  updateCollectionPaleteeHandler,
  deleteTargetSongHandler,
} from "../controllers/admin.controller";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";

const { NOTIFICATIONS, PLAYLISTS, SONGS } = API_ENDPOINTS;

const adminRoute = Router();

// prefix: /admin

// playlists
adminRoute.patch(`${PLAYLISTS}/recalculate-stats`, recalculatePlaylistStatsHandler);
adminRoute.patch(`${PLAYLISTS}/initialize-stats`, initializePlaylistStatsHandler);

// notifications
adminRoute.post(`${NOTIFICATIONS}/system-announcement`, createSystemAnnouncementHandler);
adminRoute.patch(`${NOTIFICATIONS}/reset-status`, resetUserNotificationsStatusHandler);
adminRoute.delete(`${NOTIFICATIONS}/:notificationId`, deleteNotificationHandler);

// songs
adminRoute.delete(`${SONGS}/:songId`, deleteTargetSongHandler);

// utils
adminRoute.patch(`/paletee/:model`, updateCollectionPaleteeHandler);

export default adminRoute;
