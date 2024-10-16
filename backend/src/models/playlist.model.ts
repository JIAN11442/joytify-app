import mongoose from "mongoose";
import UserModel from "./user.model";

export interface PlaylistDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  cover_image: string;
  songs: mongoose.Types.ObjectId[];
  default: boolean;
  hidden: boolean;
}

const playlistSchema = new mongoose.Schema<PlaylistDocument>(
  {
    userId: {
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
        "https://mern-joytify.s3.ap-southeast-1.amazonaws.com/defaults/default_img.png",
    },
    songs: { type: [mongoose.Schema.Types.ObjectId], ref: "Song", index: true },
    default: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// before create playlist, ...
playlistSchema.pre("save", async function (next) {
  // generate default playlist title
  if (this.isNew && !this.default) {
    const baseTitle = "My Playlist";
    let index = 1;
    let title = `${baseTitle} #${index}`;

    const existingPlaylist = await PlaylistModel.findOne({
      title: new RegExp(`^${baseTitle} #\\d+$`),
    }).sort({ createdAt: -1 });

    if (existingPlaylist) {
      const existedIndex = parseInt(existingPlaylist.title.split("#")[1]);
      title = `${baseTitle} #${existedIndex + 1}`;
    }

    this.title = title;
    this.description = title;
  }

  next();
});

// after created playlist, ...
playlistSchema.post("save", async function (doc) {
  const { id, userId } = doc;

  try {
    // update user tatol_playlists and push playlist id to user playlists array
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { "account_info.total_playlists": 1 },
      $push: { playlists: id },
    });
  } catch (error) {
    console.log(error);
  }
});

// after delete playlist, ...
playlistSchema.post("findOneAndDelete", async function (doc) {
  const { id, userId } = doc;

  try {
    // update user tatol_playlists of accouont_info
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { "account_info.total_playlists": -1 },
      $pull: {
        playlists: id,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

const PlaylistModel = mongoose.model<PlaylistDocument>(
  "Playlist",
  playlistSchema
);

export default PlaylistModel;
