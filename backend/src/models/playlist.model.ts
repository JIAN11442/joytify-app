import mongoose, { UpdateQuery } from "mongoose";
import UserModel from "./user.model";
import SongModel from "./song.model";

import usePalette from "../hooks/paletee.hook";
import { PrivacyOptions, S3_DEFAULT_IMAGES } from "@joytify/shared-types/constants";
import { PrivacyType, HexPaletee } from "@joytify/shared-types/types";
import { deleteAwsFileUrlOnModel } from "../utils/aws-s3-url.util";

export interface PlaylistDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  coverImage: string;
  privacy: PrivacyType;
  default: boolean;
  paletee: HexPaletee;
  songs: mongoose.Types.ObjectId[];
  stats: {
    totalSongCount: number;
    totalSongDuration: number;
  };
}

const playlistSchema = new mongoose.Schema<PlaylistDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String },
    description: { type: String },
    coverImage: { type: String, default: S3_DEFAULT_IMAGES.DEFAULT_PLAYLIST },
    privacy: { type: String, default: PrivacyOptions.PUBLIC },
    default: { type: Boolean, default: false },
    paletee: {
      vibrant: { type: String },
      darkVibrant: { type: String },
      lightVibrant: { type: String },
      muted: { type: String },
      darkMuted: { type: String },
      lightMuted: { type: String },
    },
    songs: { type: [mongoose.Schema.Types.ObjectId], ref: "Song", index: true },
    stats: {
      totalSongCount: { type: Number, default: 0 },
      totalSongDuration: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// before create playlist, ...
playlistSchema.pre("save", async function (next) {
  // generate default playlist title
  if (this.isNew && !this.default && !this.title) {
    const baseTitle = "My Playlist";
    let index = 1;
    let title = `${baseTitle} #${index}`;

    const existingPlaylist = await PlaylistModel.findOne({
      user: this.user,
      title: new RegExp(`^${baseTitle} #\\d+$`),
    }).sort({ createdAt: -1 });

    if (existingPlaylist) {
      const existedIndex = parseInt(existingPlaylist.title.split("#")[1]);
      title = `${baseTitle} #${existedIndex + 1}`;
    }

    this.title = title;
    this.description = title;
  }

  // parser image to get relate paletee
  if (this.coverImage) {
    this.paletee = await usePalette(this.coverImage);
  }

  next();
});

// after created playlist, ...
playlistSchema.post("save", async function (doc) {
  const { id, user } = doc;

  try {
    // update user totalPlaylists and push playlist id to user playlists array
    await UserModel.findByIdAndUpdate(user, {
      $inc: { "accountInfo.totalPlaylists": 1 },
      $push: { playlists: id },
    });
  } catch (error) {
    console.log(error);
  }
});

// before update playlist, ...
playlistSchema.pre("findOneAndUpdate", async function (next) {
  const findQuery = this.getQuery();
  let updateDoc = this.getUpdate() as UpdateQuery<PlaylistDocument>;

  // Use findOne instead of findById when query is not a single ObjectId
  const originalDoc =
    findQuery._id && typeof findQuery._id === "string"
      ? await PlaylistModel.findById(findQuery._id)
      : await PlaylistModel.findOne(findQuery);

  // if the "coverImage" property has a value, it means it will be updated
  // we need to find the original document, delete the existing coverImage before updating it
  // update paletee at the same time
  if (updateDoc.$set?.coverImage) {
    const paletee = await usePalette(updateDoc.$set.coverImage);

    updateDoc.paletee = paletee;

    if (originalDoc) {
      await deleteAwsFileUrlOnModel(originalDoc.coverImage);
    }
  }

  next();
});

// before delete playlist, ...
playlistSchema.pre("findOneAndDelete", async function (next) {
  try {
    const findQuery = this.getQuery();
    const id = findQuery._id;
    const playlist = await PlaylistModel.findById(id);

    if (playlist) {
      const { songs } = playlist;

      // update all songs from playlist to be delete
      if (songs.length) {
        await SongModel.updateMany({ _id: { $in: songs } }, { $pull: { playlistFor: id } });
      }
    }

    next();
  } catch (error) {
    console.log(error);
  }
});

// after delete playlist, ...
playlistSchema.post("findOneAndDelete", async function (doc) {
  const { id, user, coverImage } = doc;

  try {
    // update user totalPlaylists of accountInfo
    await UserModel.findByIdAndUpdate(user, {
      $inc: { "accountInfo.totalPlaylists": -1 },
      $pull: { playlists: id },
    });

    // delete AWS url
    await deleteAwsFileUrlOnModel(coverImage);
  } catch (error) {
    console.log(error);
  }
});

const PlaylistModel = mongoose.model<PlaylistDocument>("Playlist", playlistSchema);

export default PlaylistModel;
