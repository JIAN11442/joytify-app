import mongoose from "mongoose";
import { CompareHashValue, HashValue } from "../utils/bcrypt.util";
import {
  profile_collections,
  profile_names,
} from "../constants/profile-img.constant";
import PlaylistModel from "./playlist.model";
import appAssert from "../utils/app-assert.util";
import { INTERNAL_SERVER_ERROR } from "../constants/http-code.constant";
import usePalette from "../hooks/paletee.hook";
import { deletePlaylistById } from "../services/playlist.service";
import SessionModel from "./session.model";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  profile_img: string;
  verified: boolean;
  auth_for_third_party: boolean;
  account_info: {
    total_playlists: number;
    total_songs: number;
  };
  playlists: mongoose.Types.ObjectId[];
  songs: mongoose.Types.ObjectId[];
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword(): Omit<this, "password">;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String },
    profile_img: {
      type: String,
      default: () =>
        `https://api.dicebear.com/6.x/${
          profile_collections[
            Math.floor(Math.random() * profile_collections.length)
          ]
        }/svg?seed=${
          profile_names[Math.floor(Math.random() * profile_names.length)]
        }`,
    },
    verified: { type: Boolean, default: false, required: true },
    auth_for_third_party: { type: Boolean, default: false },
    account_info: {
      total_playlists: { type: Number, default: 0 },
      total_songs: { type: Number, default: 0 },
    },
    playlists: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Playlist",
      index: true,
    },
    songs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Song",
      index: true,
    },
  },
  { timestamps: true }
);

// hash password before savings
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await HashValue(this.password);
  return next();
});

// after created user, ...
userSchema.post("save", async function (doc) {
  const { id } = doc;

  try {
    // check if default playlist already exists
    const existDefaultPlaylist = await PlaylistModel.findOne({
      userId: id,
      default: true,
    });

    // only create default playlist if it doesn't exist
    // cause this.save() will trigger this post middleware again -> infinite loop
    if (!existDefaultPlaylist) {
      const defaultCoverImg =
        "https://mern-joytify.s3.ap-southeast-1.amazonaws.com/defaults/liked-song.png";

      const paletee = await usePalette(defaultCoverImg);

      // create default playlist
      const defaultPlaylist = await PlaylistModel.create({
        userId: id,
        title: "Liked Songs",
        description: "All your liked songs will be here",
        cover_image: defaultCoverImg,
        paletee,
        default: true,
      });

      appAssert(
        defaultPlaylist,
        INTERNAL_SERVER_ERROR,
        "Failed to create default playlist"
      );
    }
  } catch (error) {
    console.log(error);
  }
});

// before deleted user, ...
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const findQuery = this.getQuery();
    const user = await UserModel.findById(findQuery);
    const playlists = await PlaylistModel.find({ userId: user?._id });

    // delete all user playlists and relate properties,
    // exp: songs, labels, albums, musicians
    if (playlists) {
      await Promise.all(
        playlists.map((playlist) =>
          deletePlaylistById({
            userId: user?._id as string,
            currentPlaylistId: playlist._id as string,
          })
        )
      );
    }

    // delete all relative sessions
    await SessionModel.deleteMany({ userId: user?.id });
  } catch (error) {
    console.log(error);
  }
});

// custom method (compare password with hashed password from database)
userSchema.methods.comparePassword = async function (password: string) {
  return CompareHashValue(password, this.password);
};

// custom method (omit password from user object)
userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
