import UserModel from "../models/user.model";
import SongModel from "../models/song.model";
import AlbumModel from "../models/album.model";
import LabelModel from "../models/label.model";
import MusicianModel from "../models/musician.model";
import PlaylistModel from "../models/playlist.model";
import NotificationModel from "../models/notification.model";
import { HttpCode, NotificationFilterOptions } from "@joytify/types/constants";
import { CreateSystemAnnouncementRequest } from "@joytify/types/types";
import appAssert from "../utils/app-assert.util";
import usePalette from "../hooks/paletee.hook";

const { SYSTEM_ANNOUNCEMENT } = NotificationFilterOptions;
const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

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

// Playlists
export const recalculatePlaylistStats = async () => {
  const playlists = await PlaylistModel.find().populate({
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

// Songs
export const deleteSongById = async (songId: string) => {
  const deletedSong = await SongModel.findByIdAndDelete(songId);

  appAssert(deletedSong, NOT_FOUND, "Song not found or access denied");

  return { deletedSong };
};

// Utils
export const updateCollectionPaletee = async (
  modelName: "user" | "song" | "musician" | "playlist" | "album" | "label"
) => {
  // Map model names to actual models
  const modelMap = {
    user: UserModel,
    song: SongModel,
    musician: MusicianModel,
    playlist: PlaylistModel,
    album: AlbumModel,
    label: LabelModel,
  } as const;

  // Map model names to their corresponding image field names
  const imageFieldMap = {
    song: "imageUrl",
    user: "profileImage",
    musician: "coverImage",
    playlist: "coverImage",
    album: "coverImage",
    label: "coverImage",
  } as const;

  const Model: any = modelMap[modelName];
  const imageFieldName = imageFieldMap[modelName];

  if (!Model) {
    throw new Error(`Unsupported model: ${modelName}`);
  }

  // Find documents that have the specified image field
  const documents = await Model.find({
    [imageFieldName]: { $exists: true },
  });

  let modifiedCount = 0;

  for (const doc of documents) {
    const imageUrl = doc[imageFieldName];
    if (imageUrl) {
      const paletee = await usePalette(imageUrl);
      await Model.findByIdAndUpdate(doc._id, { paletee });
      modifiedCount++;
    }
  }

  return { modifiedCount };
};
