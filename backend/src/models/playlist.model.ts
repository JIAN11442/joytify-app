import mongoose, { UpdateQuery } from "mongoose";
import UserModel from "./user.model";
import SongModel from "./song.model";

import usePalette from "../hooks/paletee.hook";
import { PrivacyOptions } from "@joytify/shared-types/constants";
import { PrivacyType, HexPaletee } from "@joytify/shared-types/types";
import { deleteAwsFileUrlOnModel } from "../utils/aws-s3-url.util";

export interface PlaylistDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  cover_image: string;
  privacy: PrivacyType;
  default: boolean;
  paletee: HexPaletee;
  songs: mongoose.Types.ObjectId[];
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
    cover_image: {
      type: String,
      default:
        "https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/default-playlist-image.png",
    },
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
  if (this.cover_image) {
    this.paletee = await usePalette(this.cover_image);
  }

  next();
});

// after created playlist, ...
playlistSchema.post("save", async function (doc) {
  const { id, user } = doc;

  try {
    // update user tatol_playlists and push playlist id to user playlists array
    await UserModel.findByIdAndUpdate(user, {
      $inc: { "account_info.total_playlists": 1 },
      $push: { playlists: id },
    });
  } catch (error) {
    console.log(error);
  }
});

// before update playlist, ...
playlistSchema.pre("findOneAndUpdate", async function (next) {
  // get update data, it can find out which properties have new values
  let updateDoc = this.getUpdate() as UpdateQuery<PlaylistDocument>;
  // get query data from "findOneAndUpdate" operation
  const findQuery = this.getQuery();

  // if the "cover_image" property has a value, it means it will be updated
  // we need to find the original document, delete the existing cover_image before updating it
  // update paletee at the same time
  if (updateDoc.cover_image) {
    const originalDoc = await PlaylistModel.findById(findQuery);
    const paletee = await usePalette(updateDoc.cover_image);

    updateDoc.paletee = paletee;

    if (originalDoc) {
      await deleteAwsFileUrlOnModel(originalDoc.cover_image);
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
        await SongModel.updateMany({ _id: { $in: songs } }, { $pull: { playlist_for: id } });
      }
    }

    next();
  } catch (error) {
    console.log(error);
  }
});

// after delete playlist, ...
playlistSchema.post("findOneAndDelete", async function (doc) {
  const { id, user, cover_image } = doc;

  try {
    // update user tatol_playlists of account_info
    await UserModel.findByIdAndUpdate(user, {
      $inc: { "account_info.total_playlists": -1 },
      $pull: { playlists: id },
    });

    // delete AWS url
    await deleteAwsFileUrlOnModel(cover_image);
  } catch (error) {
    console.log(error);
  }
});

const PlaylistModel = mongoose.model<PlaylistDocument>("Playlist", playlistSchema);

export default PlaylistModel;
