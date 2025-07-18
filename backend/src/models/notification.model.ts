import mongoose from "mongoose";
import UserModel from "./user.model";
import MusicianModel from "./musician.model";
import { NotificationTypeOptions } from "@joytify/shared-types/constants";
import { NotificationType } from "@joytify/shared-types/types";

// type MonthlyStats = {
//   user: mongoose.Types.ObjectId;
//   stats: mongoose.Types.ObjectId;
//   month: number;
//   totalHours: number;
//   growthPercentage: number;
//   topArtist: string;
//   topArtistTotalPlaybackTime: number;
// };

export interface NotificationDocument extends mongoose.Document {
  type: NotificationType;
  artistUpdate: {
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
    artistUpdate: {
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
  const { _id: notificationId, type, artistUpdate } = doc;
  const { artistId } = artistUpdate;

  if (type === FOLLOWING_ARTIST_UPDATE) {
    const musician = await MusicianModel.findById(artistId);

    if (musician) {
      // push id to followers' notifications
      await UserModel.updateMany(
        {
          _id: { $in: musician.followers },
          "userPreferences.notifications.followingArtistUpdates": true,
        },
        { $addToSet: { "notifications.unread": notificationId } }
      );
    }
  }
});

const NotificationModel = mongoose.model<NotificationDocument>("Notification", notificationSchema);

export default NotificationModel;
