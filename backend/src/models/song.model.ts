import mongoose from "mongoose";
import PlaylistModel from "./playlist.model";
import UserModel from "./user.model";
import LabelModel, { LabelDocument } from "./label.model";
import { deleteAwsFileUrlOnModel } from "../utils/aws-s3-url.util";

export interface SongDocument extends mongoose.Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  artist: mongoose.Types.ObjectId[]; // 作者
  songUrl: string; // 歌曲連結
  imageUrl: string; //封面連結
  duration: number;
  releaseDate: Date; // 發行日期 *
  album: mongoose.Types.ObjectId; // 專輯名稱
  playlist_for: mongoose.Types.ObjectId[]; // 歌曲所屬歌單
  lyricists: mongoose.Types.ObjectId[]; // 作詞者
  composers: mongoose.Types.ObjectId[]; // 作曲者
  languages: mongoose.Types.ObjectId[]; // 語言
  genres: mongoose.Types.ObjectId[]; // 流派
  tags: mongoose.Types.ObjectId[]; // 標籤
  lyrics: string[]; // 歌詞 *
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
    imageUrl: {
      type: String,
      default:
        "https://mern-joytify.s3.ap-southeast-1.amazonaws.com/defaults/default_img.png",
    },
    duration: { type: Number, required: true },
    releaseDate: { type: Date },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
      index: true,
    },
    playlist_for: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Playlist",
      index: true,
    },
    lyricists: {
      type: [mongoose.Schema.Types.ObjectId],
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
const updateLabelUsagesFn = async (
  songId: mongoose.Types.ObjectId,
  labelIds: mongoose.Types.ObjectId[],
  model: mongoose.Model<LabelDocument>,
  operation: "$push" | "$pull" | "$addToSet"
) => {
  for (const id of labelIds) {
    // if the song ID is not present in labelUsages, add it
    await model.findByIdAndUpdate(id, { [operation]: { labelUsages: songId } });
  }
};

// update label usages by ref
const updateLabelUsageByRef = async (
  song: SongDocument,
  ref: string,
  songId: mongoose.Types.ObjectId,
  model: mongoose.Model<LabelDocument>,
  operation: "$push" | "$pull" | "$addToSet"
) => {
  Object.entries(song).map(async ([key, value]) => {
    const schemaPath = SongModel.schema.path(key);

    // only execute for properties that are arrays, have a length greater than 0,
    // reference the "Label" model, and contain valid ObjectId items.
    if (
      Array.isArray(value) &&
      value.length &&
      schemaPath.options.ref === ref &&
      value.every((item) => mongoose.Types.ObjectId.isValid(item))
    ) {
      await updateLabelUsagesFn(songId, value, model, operation);
    }
  });
};

// after created song, ...
songSchema.post("save", async function (doc) {
  const { id, playlist_for, userId } = doc;
  const song = await SongModel.findById(id).lean();

  try {
    // increase count in user's total_songs
    if (userId) {
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { "account_info.total_songs": 1 },
      });
    }

    // adding song ID to target playlist's songs array
    if (playlist_for) {
      await PlaylistModel.findByIdAndUpdate(playlist_for, {
        $addToSet: { songs: id },
      });
    }

    // push created song ID to each relate label's labelUsage
    if (song) {
      await updateLabelUsageByRef(song, "Label", id, LabelModel, "$addToSet");
    }
  } catch (error) {
    console.log(error);
  }
});

// before delete song, ...
songSchema.pre("findOneAndDelete", async function (next) {
  try {
    const findQuery = this.getQuery();
    const id = findQuery._id;
    const song = await SongModel.findById(findQuery).lean();

    if (song) {
      const { userId, playlist_for, songUrl, imageUrl } = song;

      // decrease count in user's total_songs
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

      // delete song url from AWS
      if (songUrl) {
        await deleteAwsFileUrlOnModel(songUrl);
      }

      // delete image url from AWS
      if (imageUrl) {
        await deleteAwsFileUrlOnModel(imageUrl);
      }

      // remove song ID from related label's labelUsages
      await updateLabelUsageByRef(song, "Label", id, LabelModel, "$pull");
    }

    next();
  } catch (error) {
    console.log(error);
  }
});

const SongModel = mongoose.model<SongDocument>("Song", songSchema);

export default SongModel;
