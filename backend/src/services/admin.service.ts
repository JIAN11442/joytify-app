import UserModel from "../models/user.model";
import SongModel from "../models/song.model";
import PlaylistModel from "../models/playlist.model";
import NotificationModel from "../models/notification.model";
import { HttpCode, NotificationTypeOptions } from "@joytify/shared-types/constants";
import { CreateSystemAnnouncementRequest } from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";
import usePalette from "../hooks/paletee.hook";

const { SYSTEM_ANNOUNCEMENT } = NotificationTypeOptions;
const { INTERNAL_SERVER_ERROR } = HttpCode;

// Notifications
export const deleteTargetNotification = async (notificationId: string) => {
  const updatedUser = await UserModel.updateMany(
    { "notifications.id": notificationId },
    { $pull: { notifications: { id: notificationId } } }
  );

  await NotificationModel.findByIdAndDelete(notificationId);

  return { modifiedCount: updatedUser.modifiedCount };
};

export const initializeUserNotifications = async () => {
  const updatedUser = await UserModel.updateMany(
    { "notifications.0": { $exists: true } }, // only update users with notifications
    {
      $set: {
        "notifications.$[].viewed": false,
        "notifications.$[].read": false,
      },
    }
  );

  return { modifiedCount: updatedUser.modifiedCount };
};

export const createSystemAnnouncement = async (params: CreateSystemAnnouncementRequest) => {
  const notification = await NotificationModel.create({
    type: SYSTEM_ANNOUNCEMENT,
    systemAnnouncement: params,
  });

  appAssert(
    notification,
    INTERNAL_SERVER_ERROR,
    "Failed to create system announcement notification"
  );

  return notification;
};

// Songs
export const updateSongsPaletee = async () => {
  const songs = await SongModel.find({
    imageUrl: { $exists: true },
  });

  for (const song of songs) {
    const paletee = await usePalette(song.imageUrl);
    await SongModel.findByIdAndUpdate(song._id, { paletee });
  }

  return { modifiedCount: songs.length };
};

// Playlists
export const recalculatePlaylistStats = async () => {
  const playlists = await PlaylistModel.find({}).populate({
    path: "songs",
    select: "duration",
  });

  // To prevent `updatedAt` from being modified, we must execute individual
  // update operations with the `{ timestamps: false }` option.
  // `bulkWrite` does not support this option.
  const updatePromises = playlists.map((playlist: any) => {
    const stats = {
      totalSongCount: playlist.songs.length,
      totalSongDuration: playlist.songs.reduce(
        (sum: number, song: any) => sum + (song.duration || 0),
        0
      ),
    };

    return PlaylistModel.updateOne(
      { _id: playlist._id },
      { $set: { stats: stats } },
      { timestamps: false } // This option prevents updating `updatedAt`
    );
  });

  if (updatePromises.length > 0) {
    await Promise.all(updatePromises);
  }

  return { modifiedCount: playlists.length };
};

export const removePlaylistStats = async () => {
  const updatedPlaylists = await PlaylistModel.updateMany(
    {}, // 匹配所有文檔
    { $unset: { stats: "" } } // 移除 stats 字段
  );

  return { modifiedCount: updatedPlaylists.modifiedCount };
};
