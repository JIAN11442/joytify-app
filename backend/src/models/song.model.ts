import mongoose, { UpdateQuery } from "mongoose";
import UserModel from "./user.model";
import LabelModel from "./label.model";
import AlbumModel from "./album.model";
import MusicianModel from "./musician.model";
import PlaylistModel from "./playlist.model";
import NotificationModel from "./notification.model";
import usePalette from "../hooks/paletee.hook";
import { NotificationTypeOptions, SongAssociationAction } from "@joytify/shared-types/constants";
import { HexPaletee, SongAssociationActionType } from "@joytify/shared-types/types";
import { bulkUpdateReferenceArrayFields } from "../utils/mongoose.util";
import { deleteAwsFileUrlOnModel } from "../utils/aws-s3-url.util";

type SongRating = {
  id: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
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
  playlistFor: mongoose.Types.ObjectId[]; // 歌曲所屬歌單
  languages: mongoose.Types.ObjectId[]; // 語言
  genres: mongoose.Types.ObjectId[]; // 流派
  tags: mongoose.Types.ObjectId[]; // 標籤
  album: mongoose.Types.ObjectId; // 專輯名稱
  lyrics: string[]; // 歌詞 *
  releaseDate: Date; // 發行日期
  paletee: HexPaletee; // 主題色
  favorites: mongoose.Types.ObjectId[]; // 收藏者
  ratings: SongRating[];
  activities: {
    totalRatingCount: number;
    averageRating: number;
    totalPlaybackCount: number;
    totalPlaybackDuration: number;
    weightedAveragePlaybackDuration: number;
  };
  ownership: {
    isPlatformOwned: boolean; // 是否由平台擁有
    transferredAt: Date; // 轉移給平台的時間
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
    playlistFor: {
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
    paletee: {
      vibrant: { type: String },
      darkVibrant: { type: String },
      lightVibrant: { type: String },
      muted: { type: String },
      darkMuted: { type: String },
      lightMuted: { type: String },
    },
    favorites: {
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
          comment: { type: String, default: "" },
        },
        { _id: false, timestamps: true }
      ),
    ],
    activities: {
      totalRatingCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalPlaybackCount: { type: Number, default: 0 },
      totalPlaybackDuration: { type: Number, default: 0 },
      weightedAveragePlaybackDuration: { type: Number, default: 0 },
    },
    ownership: {
      isPlatformOwned: { type: Boolean, default: false },
      transferredAt: { type: Date },
    },
  },
  { timestamps: true }
);

const { DELETE_PERMANENTLY, DELETE_WITH_DONATE } = SongAssociationAction;

const removeSongAssociations = async (song: SongDocument, action: SongAssociationActionType) => {
  const { _id: songId, creator, playlistFor, songUrl, imageUrl, album } = song;

  // reduce count in user's totalSongs and remove id from songs
  if (creator) {
    await UserModel.findByIdAndUpdate(creator, {
      $pull: { songs: songId, albums: album },
      $inc: {
        "accountInfo.totalSongs": -1,
        ...(!!album && { "accountInfo.totalAlbums": -1 }),
      },
    });
  }

  // remove song ID to target playlist's songs array
  if (playlistFor) {
    await PlaylistModel.updateMany(
      { _id: { $in: playlistFor } },
      {
        $pull: { songs: songId },
        $inc: { "stats.totalSongCount": -1, "stats.totalSongDuration": song.duration * -1 },
      }
    );
  }

  // remove song ID from all user's user preferences
  await UserModel.updateMany(
    {
      $or: [
        { "userPreferences.player.playlistSongs": songId },
        { "userPreferences.player.playbackQueue.queue": songId },
      ],
    },
    {
      $pull: {
        "userPreferences.player.playlistSongs": songId,
        "userPreferences.player.playbackQueue.queue": songId,
        "userPreferences.player.playbackQueue.currentIndex": 0,
      },
    }
  );

  if (action === DELETE_PERMANENTLY) {
    // decrease song duration to album's totalDuration
    if (album) {
      await AlbumModel.findByIdAndUpdate(album, {
        $pull: { songs: songId },
        $inc: { totalDuration: song.duration * -1 },
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
    await MusicianModel.updateMany({ songs: songId }, { $pull: { songs: songId, albums: album } });
  }
};

// before created song,...
songSchema.pre("save", async function (next) {
  // update paletee
  if (this.imageUrl) {
    const paletee = await usePalette(this.imageUrl);
    this.paletee = paletee;
  }

  next();
});

// before update song,...
songSchema.pre("findOneAndUpdate", async function (next) {
  const findQuery = this.getQuery();
  let updateDoc = this.getUpdate() as UpdateQuery<SongDocument>;

  const originalDoc =
    findQuery._id && typeof findQuery._id === "string"
      ? await SongModel.findById(findQuery._id)
      : await SongModel.findOne(findQuery);

  if (updateDoc.$set?.imageUrl) {
    const paletee = await usePalette(updateDoc.$set.imageUrl);
    updateDoc.paletee = paletee;

    if (originalDoc) {
      await deleteAwsFileUrlOnModel(originalDoc.imageUrl);
    }
  }

  next();
});

// before delete song,...
songSchema.pre("findOneAndDelete", async function (next) {
  try {
    const findQuery = this.getQuery();
    const songId = findQuery._id;
    const song = await SongModel.findById(songId);

    if (song) {
      await removeSongAssociations(song, DELETE_PERMANENTLY);
    }

    next();
  } catch (error) {
    console.log(error);
  }
});

// after created song,...
songSchema.post("save", async function (doc) {
  const { id, artist, playlistFor, creator, album } = doc;
  const song = await SongModel.findById(id).populate("artist").populate("album");

  try {
    if (song) {
      // increase count in user's accountInfo and push id to songs
      if (creator) {
        await UserModel.findByIdAndUpdate(creator, {
          $addToSet: { songs: id, albums: album, following: artist },
          $inc: {
            "accountInfo.totalSongs": 1,
            "accountInfo.totalFollowing": 1,
            ...(!!album && { "accountInfo.totalAlbums": 1 }),
          },
        });
      }

      // adding song ID to target playlist's songs array
      if (playlistFor) {
        const playlist = await PlaylistModel.findByIdAndUpdate(
          playlistFor,
          {
            $addToSet: { songs: id },
            $inc: { "stats.totalSongCount": 1, "stats.totalSongDuration": song.duration },
          },
          { new: true }
        );

        // if playlistFor is default playlist, add user ID to song's favorites
        if (playlist?.default) {
          await SongModel.updateOne({ _id: id }, { $addToSet: { favorites: creator } });
        }
      }

      // increate song duration to album's totalDuration
      if (album) {
        await AlbumModel.findByIdAndUpdate(album, {
          $addToSet: { songs: id },
          $inc: { totalDuration: song.duration },
        });
      }

      // push created song ID to each relate label's "songs" property(according to model name)
      // like language, genre, tag fields is reference to same model name, Label
      await bulkUpdateReferenceArrayFields(song, id, LabelModel, "songs", "$addToSet");

      // push created song ID to each relate musician's "songs" property(according to model name)
      // like lyricist, composer fields is reference to same model name, Musician
      await bulkUpdateReferenceArrayFields(song, id, MusicianModel, "songs", "$addToSet");

      // push created song ID to each relate musician's "albums" property(according to model name)
      // like artist, lyricist, composer fields is reference to same model name, Musician
      await bulkUpdateReferenceArrayFields(song, album, MusicianModel, "albums", "$addToSet");

      // create notification template
      if (song.artist.followers.length > 0) {
        await NotificationModel.create({
          type: NotificationTypeOptions.FOLLOWING_ARTIST_UPDATE,
          followingArtistUpdate: {
            uploaderId: creator,
            artistId: song.artist._id,
            artistName: song.artist.name,
            songName: song.title,
            albumName: song?.album?.title,
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// after update song,...
songSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;

  // 1. get update content
  const update = this.getUpdate();

  // 2. check if ratings is updated
  const ratingsUpdated =
    update.ratings ||
    (update.$push && update.$push.ratings) ||
    (update.$pull && update.$pull.ratings) ||
    (update.$set && Object.keys(update.$set).some((key) => key.startsWith("ratings")));

  const ownershipUpdated =
    update.$set && Object.keys(update.$set).some((key) => key.startsWith("ownership"));

  // 3. if ratings is updated, update activities
  if (ratingsUpdated) {
    const song = await mongoose.model("Song").findById(doc._id).lean();

    if (song && Array.isArray(song.ratings)) {
      const totalRatingCount = song.ratings.length;
      const averageRating =
        totalRatingCount > 0
          ? song.ratings.reduce((sum: number, r: { rating: number }) => sum + (r.rating || 0), 0) /
            totalRatingCount
          : 0;

      await mongoose.model("Song").findByIdAndUpdate(doc._id, {
        "activities.totalRatingCount": totalRatingCount,
        "activities.averageRating": averageRating,
      });
    }
  }

  // 4. if ownership is updated, remove song associations
  if (ownershipUpdated) {
    const song = await mongoose.model("Song").findById(doc._id).lean();

    if (song) {
      await removeSongAssociations(song, DELETE_WITH_DONATE);
    }
  }
});

const SongModel = mongoose.model<SongDocument>("Song", songSchema);

export default SongModel;
