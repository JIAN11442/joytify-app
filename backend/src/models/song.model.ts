import mongoose from "mongoose";
import UserModel from "./user.model";
import LabelModel from "./label.model";
import MusicianModel from "./musician.model";
import PlaylistModel from "./playlist.model";
import AlbumModel from "./album.model";
import { bulkUpdateReferenceArrayFields } from "../utils/mongoose.util";
import { deleteAwsFileUrlOnModel } from "../utils/aws-s3-url.util";

type SongRating = {
  id: mongoose.Types.ObjectId;
  rating: number;
};

export interface SongDocument extends mongoose.Document {
  title: string;
  creator: mongoose.Types.ObjectId;
  artist: mongoose.Types.ObjectId; // 作者
  lyricists: mongoose.Types.ObjectId[]; // 作詞者
  composers: mongoose.Types.ObjectId[]; // 作曲者
  songUrl: string; // 歌曲連結
  imageUrl: string; //封面連結
  duration: number;
  playlist_for: mongoose.Types.ObjectId[]; // 歌曲所屬歌單
  languages: mongoose.Types.ObjectId[]; // 語言
  genres: mongoose.Types.ObjectId[]; // 流派
  tags: mongoose.Types.ObjectId[]; // 標籤
  album: mongoose.Types.ObjectId; // 專輯名稱
  lyrics: string[]; // 歌詞 *
  releaseDate: Date; // 發行日期
  followers: mongoose.Types.ObjectId[];
  ratings: SongRating[];
  activity: {
    total_rating_count: number;
    average_rating: number;
    total_playback_count: number;
    total_playback_duration: number;
    weighted_average_playback_duration: number;
  };
}

const songSchema = new mongoose.Schema<SongDocument>(
  {
    title: { type: String, required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Musician",
      index: true,
      required: true,
    },
    lyricists: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Musician",
      index: true,
    },
    composers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Musician",
      index: true,
    },
    songUrl: { type: String, required: true },
    imageUrl: {
      type: String,
      default:
        "https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/default-unknown-image.png",
    },
    duration: { type: Number, required: true },
    playlist_for: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Playlist",
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
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      index: true,
    },
    lyrics: { type: [String] },
    releaseDate: { type: Date },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      index: true,
    },
    ratings: [
      new mongoose.Schema(
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
            required: true,
          },
          rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
            required: true,
          },
        },
        { _id: false, timestamps: true }
      ),
    ],
    activity: {
      average_rating: { type: Number, default: 0 },
      total_playback_count: { type: Number, default: 0 },
      total_playback_duration: { type: Number, default: 0 },
      weighted_average_playback_duration: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// after created song, ...
songSchema.post("save", async function (doc) {
  const { id, playlist_for, creator, album } = doc;
  const song = await SongModel.findById(id);

  try {
    if (song) {
      // increase count in user's account_info and push id to songs
      if (creator) {
        await UserModel.findByIdAndUpdate(creator, {
          $addToSet: { songs: id, albums: album },
          $inc: {
            "account_info.total_songs": 1,
            ...(!!album && { "account_info.total_albums": 1 }),
          },
        });
      }

      // adding song ID to target playlist's songs array
      if (playlist_for) {
        await PlaylistModel.findByIdAndUpdate(playlist_for, {
          $addToSet: { songs: id },
        });
      }

      // increate song duration to album's total_duration
      if (album) {
        await AlbumModel.findByIdAndUpdate(album, {
          $addToSet: { songs: id },
          $inc: { total_duration: song.duration },
        });
      }

      // push created song ID to each relate label's "songs" property(according to model name)
      // like language, genre, tag fields is reference to same model name, Label
      await bulkUpdateReferenceArrayFields(song, id, LabelModel, "songs", "$addToSet");

      // push created song ID to each relate musician's "songs" property(according to model name)
      // like lyricist, composer fields is reference to same model name, Musician
      await bulkUpdateReferenceArrayFields(song, id, MusicianModel, "songs", "$addToSet");
    }
  } catch (error) {
    console.log(error);
  }
});

// before delete song, ...
songSchema.pre("findOneAndDelete", async function (next) {
  try {
    const findQuery = this.getQuery();
    const songId = findQuery._id;
    const song = await SongModel.findById(songId);

    if (song) {
      const { creator, playlist_for, songUrl, imageUrl, album } = song;

      // reduce count in user's total_songs and remove id from songs
      if (creator) {
        await UserModel.findByIdAndUpdate(creator, {
          $pull: { songs: songId, albums: album },
          $inc: {
            "account_info.total_songs": -1,
            ...(!!album && { "account_info.total_albums": -1 }),
          },
        });
      }

      // remove song ID to target playlist's songs array
      if (playlist_for) {
        await PlaylistModel.findByIdAndUpdate(playlist_for, {
          $pull: { songs: songId },
        });
      }

      // decrease song duration to album's total_duration
      if (album) {
        await AlbumModel.findByIdAndUpdate(album, {
          $pull: { songs: songId },
          $inc: { total_duration: song.duration * -1 },
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

      // remove song ID from each relate label's "songs" property
      await LabelModel.updateMany({ songs: songId }, { $pull: { songs: songId } });

      // remove song ID from each relate musician's "songs" property
      await MusicianModel.updateMany({ songs: songId }, { $pull: { songs: songId } });
    }

    next();
  } catch (error) {
    console.log(error);
  }
});

const SongModel = mongoose.model<SongDocument>("Song", songSchema);

export default SongModel;
