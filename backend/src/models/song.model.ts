import mongoose from "mongoose";
import UserModel from "./user.model";
import LabelModel from "./label.model";
import MusicianModel from "./musician.model";
import PlaylistModel from "./playlist.model";
import AlbumModel from "./album.model";
import { updateArrRefToProp } from "../services/util.service";
import { deleteAwsFileUrlOnModel } from "../utils/aws-s3-url.util";

export interface SongDocument extends mongoose.Document {
  title: string;
  creator: mongoose.Types.ObjectId;
  artist: mongoose.Types.ObjectId[]; // 作者
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
  activity: {
    total_likes: number;
    total_plays: number;
    total_ratings: number;
    average_rating: number;
    average_listening_duration: number;
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
      type: [mongoose.Schema.Types.ObjectId],
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
        "https://mern-joytify.s3.ap-southeast-1.amazonaws.com/defaults/default_song-image.png",
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
    activity: {
      total_likes: { type: Number, default: 0 },
      total_plays: { type: Number, default: 0 },
      total_ratings: { type: Number, default: 0 },
      average_rating: { type: Number, default: 0 },
      average_listening_duration: { type: Number, default: 0 },
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
      // increase count in user's total_songs and push id to songs
      if (creator) {
        await UserModel.findByIdAndUpdate(creator, {
          $inc: { "account_info.total_songs": 1 },
        });

        await UserModel.findByIdAndUpdate(creator, {
          $addToSet: { songs: id },
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
          $inc: { total_duration: song.duration },
        });
      }

      // push created song ID to each relate label's "songs" property
      await updateArrRefToProp(song, id, LabelModel, "songs", "$addToSet");

      // push created song ID to each relate musician's "songs" property
      await updateArrRefToProp(song, id, MusicianModel, "songs", "$addToSet");

      // push created song ID to relate album's "songs" property
      await updateArrRefToProp(song, id, AlbumModel, "songs", "$addToSet");
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
    const song = await SongModel.findById(id);

    if (song) {
      const { creator, playlist_for, songUrl, imageUrl, album } = song;

      // reduce count in user's total_songs and remove id from songs
      if (creator) {
        await UserModel.findByIdAndUpdate(creator, {
          $inc: { "account_info.total_songs": -1 },
        });

        await UserModel.findByIdAndUpdate(creator, {
          $pull: { songs: id },
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

      // decrease song duration to album's total_duration
      if (album) {
        await AlbumModel.findByIdAndUpdate(album, {
          $inc: { total_duration: song.duration * -1 },
        });
      }

      // // remove song ID from each relate label's "songs" property
      await updateArrRefToProp(song, id, LabelModel, "songs", "$pull");

      // // push created song ID from each relate musician's "songs" property
      await updateArrRefToProp(song, id, MusicianModel, "songs", "$pull");

      // remove created song ID from relate album's "songs" property
      await updateArrRefToProp(song, id, AlbumModel, "songs", "$pull");
    }

    next();
  } catch (error) {
    console.log(error);
  }
});

const SongModel = mongoose.model<SongDocument>("Song", songSchema);

export default SongModel;
