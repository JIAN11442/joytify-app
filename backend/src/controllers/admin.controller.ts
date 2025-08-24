import { RequestHandler } from "express";
import { objectIdZodSchema } from "../schemas/util.zod";
import { collectionPaleteeZodSchema } from "../schemas/admin.zod";
import { createSystemAnnouncementZodSchema } from "../schemas/notification.zod";

import {
  createSystemAnnouncement,
  deleteSongById,
  deleteTargetNotification,
  initializeUserNotifications,
  recalculatePlaylistStats,
  removePlaylistStats,
  updateCollectionPaletee,
} from "../services/admin.service";
import { HttpCode } from "@joytify/shared-types/constants";

const { OK } = HttpCode;

// Notifications
export const deleteNotificationHandler: RequestHandler = async (req, res, next) => {
  try {
    const notificationId = objectIdZodSchema.parse(req.params.notificationId);

    const { modifiedCount } = await deleteTargetNotification(notificationId);

    return res
      .status(OK)
      .json({ message: `${modifiedCount} users updated and notification deleted` });
  } catch (error) {
    next(error);
  }
};

export const resetUserNotificationsStatusHandler: RequestHandler = async (req, res, next) => {
  try {
    const { modifiedCount } = await initializeUserNotifications();

    return res
      .status(OK)
      .json({ message: `${modifiedCount} users updated and notification initialized` });
  } catch (error) {
    next(error);
  }
};

export const createSystemAnnouncementHandler: RequestHandler = async (req, res, next) => {
  try {
    const params = createSystemAnnouncementZodSchema.parse(req.body);
    const notification = await createSystemAnnouncement(params);

    return res.status(OK).json({ notification });
  } catch (error) {
    next(error);
  }
};

// Playlists
export const recalculatePlaylistStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { modifiedCount } = await recalculatePlaylistStats();

    return res.status(OK).json({ message: `${modifiedCount} playlists updated and stats updated` });
  } catch (error) {
    console.error("更新 playlist stats 失敗:", error);
    next(error);
  }
};

export const initializePlaylistStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { modifiedCount } = await removePlaylistStats();

    return res.status(OK).json({ message: `${modifiedCount} playlists updated and stats removed` });
  } catch (error) {
    next(error);
  }
};

// Songs
export const deleteTargetSongHandler: RequestHandler = async (req, res, next) => {
  try {
    const songId = objectIdZodSchema.parse(req.params.songId);

    const { deletedSong } = await deleteSongById(songId);

    return res.status(OK).json({ deletedSong });
  } catch (error) {
    next(error);
  }
};

// Utils
export const updateCollectionPaleteeHandler: RequestHandler = async (req, res, next) => {
  try {
    const model = collectionPaleteeZodSchema.parse(req.params.model);

    const { modifiedCount } = await updateCollectionPaletee(model);

    return res
      .status(OK)
      .json({ message: `${model} collection paletee updated: ${modifiedCount}` });
  } catch (error) {
    next(error);
  }
};
