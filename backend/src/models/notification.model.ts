import mongoose from "mongoose";
import UserModel from "./user.model";
import MusicianModel from "./musician.model";
import { NotificationTypeOptions } from "@joytify/shared-types/constants";
import { NotificationType } from "@joytify/shared-types/types";
import { getSocketServer } from "../config/socket.config";

export interface NotificationDocument extends mongoose.Document {
  type: NotificationType;
  followingArtistUpdate: {
    uploaderId?: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    artistName: string;
    songName: string;
    albumName: string;
  };
  systemAnnouncement: {
    date: Date;
    startTime: Date;
    endTime: Date;
  };
}

const { FOLLOWING_ARTIST_UPDATE } = NotificationTypeOptions;

const notificationSchema = new mongoose.Schema<NotificationDocument>(
  {
    type: { type: String, enum: Object.values(NotificationTypeOptions), required: true },
    followingArtistUpdate: {
      uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Musician", index: true },
      artistName: { type: String },
      songName: { type: String },
      albumName: { type: String },
    },
    systemAnnouncement: {
      date: { type: Date },
      startTime: { type: Date },
      endTime: { type: Date },
    },
  },
  { timestamps: true }
);

// after create notification,...
notificationSchema.post("save", async function (doc) {
  const { _id: notificationId, type, followingArtistUpdate } = doc;
  const { artistId, uploaderId } = followingArtistUpdate;

  if (type === FOLLOWING_ARTIST_UPDATE) {
    const musician = await MusicianModel.findById(artistId);

    if (musician) {
      // 1. get all followers of the artist (excluding the uploader)
      const targetUserIds = musician.followers.filter(
        (id: string) => id.toString() !== uploaderId?.toString()
      );

      if (targetUserIds.length > 0) {
        // 2. push notification to target followers
        await UserModel.updateMany(
          {
            _id: { $in: targetUserIds },
            "userPreferences.notifications.followingArtistUpdate": true,
          },
          { $addToSet: { "notifications.unread": notificationId } }
        );

        // 3. emit notification update socket event
        const socket = getSocketServer();

        targetUserIds.forEach((userId: string) => {
          socket.to(`user:${userId}`).emit("notification:update");
        });
      }
    }
  }
});

const NotificationModel = mongoose.model<NotificationDocument>("Notification", notificationSchema);

export default NotificationModel;
