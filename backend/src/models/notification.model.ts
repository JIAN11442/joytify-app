import mongoose from "mongoose";
import MusicianModel from "./musician.model";
import UserModel, { UserDocument } from "./user.model";
import { broadcastNotificationToUsers } from "../services/notification.service";
import { NotificationFilterOptions } from "@joytify/shared-types/constants";
import { NotificationFilterType } from "@joytify/shared-types/types";

export interface NotificationDocument extends mongoose.Document {
  type: NotificationFilterType;
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

const { FOLLOWING_ARTIST_UPDATE, SYSTEM_ANNOUNCEMENT } = NotificationFilterOptions;

const notificationSchema = new mongoose.Schema<NotificationDocument>(
  {
    type: { type: String, enum: Object.values(NotificationFilterOptions), required: true },
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
  const { _id, type, followingArtistUpdate } = doc;
  const { artistId, uploaderId } = followingArtistUpdate;
  const notificationId = _id?.toString() ?? "";

  switch (type) {
    case FOLLOWING_ARTIST_UPDATE:
      const musician = await MusicianModel.findById(artistId);

      if (musician) {
        // 1. get all followers of the artist (excluding the uploader)
        const users = await UserModel.find({
          _id: { $in: musician.followers, $ne: uploaderId },
          "userPreferences.notifications.followingArtistUpdate": true,
        });

        if (users.length > 0) {
          const userIds = users.map((user: UserDocument) => user._id);

          // 2. broadcast notification to target followers
          await broadcastNotificationToUsers({
            userIds,
            notificationId,
            triggerSocket: true,
          });
        }
      }
      break;

    case SYSTEM_ANNOUNCEMENT:
      const users = await UserModel.find({
        "userPreferences.notifications.systemAnnouncement": true,
      });
      const userIds = users.map((user: UserDocument) => user._id);

      await broadcastNotificationToUsers({
        userIds,
        notificationId,
        triggerSocket: true,
      });
      break;
  }
});

const NotificationModel = mongoose.model<NotificationDocument>("Notification", notificationSchema);

export default NotificationModel;
