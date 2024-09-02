import mongoose from "mongoose";

export interface PlaylistDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  cover_image: string;
  songs: mongoose.Types.ObjectId[];
  default: boolean;
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
  },
  { timestamps: true }
);

// pre (generate default playlist title)
playlistSchema.pre("save", async function (next) {
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

const PlaylistModel = mongoose.model<PlaylistDocument>(
  "Playlist",
  playlistSchema
);

export default PlaylistModel;
