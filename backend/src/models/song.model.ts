import mongoose from "mongoose";
import PlaylistModel from "./playlist.model";
import UserModel from "./user.model";
import LabelModel, { LabelDocument } from "./label.model";

export interface SongDocument extends mongoose.Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  artist: mongoose.Types.ObjectId[]; // 作者
  songUrl: string; // 歌曲連結
  imageUrl: string; //封面連結
  duration: number;
  releaseDate: Date; // 發行日期
  playlist_for: mongoose.Types.ObjectId[]; // 歌曲所屬歌單
  album: mongoose.Types.ObjectId; // 專輯名稱
  composers: mongoose.Types.ObjectId[]; // 作曲者
  languages: mongoose.Types.ObjectId[]; // 語言
  genres: mongoose.Types.ObjectId[]; // 流派
  tags: mongoose.Types.ObjectId[]; // 標籤
  lyrics: string[]; // 歌詞
  activity: {
    total_likes: number;
    total_plays: number;
    average_rating: number;
    average_listening_duration: number;
  };
}

const songSchema = new mongoose.Schema<SongDocument>(
  {
    title: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    artist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Label",
      index: true,
      required: true,
    },
    songUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    releaseDate: { type: Date },
    playlist_for: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Playlist",
      index: true,
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
      index: true,
    },
    composers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Label",
      index: true,
    },
    languages: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Label",
      index: true,
    },
    genres: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Label",
      index: true,
    },
    tags: { type: [mongoose.Schema.Types.ObjectId], ref: "Label", index: true },
    lyrics: { type: [String] },
    activity: {
      total_likes: { type: Number, default: 0 },
      total_plays: { type: Number, default: 0 },
      average_rating: { type: Number, default: 0 },
      average_listening_duration: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// update label usages function
const updateLabelUsages = async (
  songId: mongoose.Types.ObjectId,
  labelIds: mongoose.Types.ObjectId[],
  model: mongoose.Model<LabelDocument>,
  operation: "$push" | "$pull"
) => {
  for (const id of labelIds) {
    // if the song ID is not present in labelUsages, add it
    await model.findByIdAndUpdate(id, { [operation]: { labelUsages: songId } });
  }
};

// while created song, ...
songSchema.post("save", async function (doc) {
  const { id, playlist_for, userId, composers, languages } = doc;

  try {
    // increase count in user's total_songs
    if (userId) {
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { "account_info.total_songs": 1 },
      });
    }

    // adding song ID to target playlist's songs array
    if (playlist_for) {
      // $addToSet: similar to $push, but ensures no duplicate entries in the array
      await PlaylistModel.findByIdAndUpdate(playlist_for, {
        $addToSet: { songs: id },
      });
    }

    // update composer labels
    if (composers) {
      // update composer label
      await updateLabelUsages(id, composers, LabelModel, "$push");
    }

    // update language labels
    if (languages) {
      await updateLabelUsages(id, languages, LabelModel, "$push");
    }
  } catch (error) {
    console.log(error);
  }
});

// while delete song, ...
songSchema.post("findOneAndDelete", async function (doc) {
  const { id, userId, playlist_for, composers, languages } = doc;

  try {
    // descrease count in user's total_songs
    if (userId) {
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { "account_info.total_songs": -1 },
      });
    }

    // remove song ID to target playlist's songs array
    if (playlist_for) {
      await PlaylistModel.findByIdAndUpdate(playlist_for, {
        $pull: { songs: id },
      });
    }

    // update composer labels
    if (composers) {
      await updateLabelUsages(id, composers, LabelModel, "$pull");
    }

    // update language labels
    if (languages) {
      await updateLabelUsages(id, languages, LabelModel, "$pull");
    }
  } catch (error) {
    console.log(error);
  }
});

const SongModel = mongoose.model<SongDocument>("Song", songSchema);

export default SongModel;
