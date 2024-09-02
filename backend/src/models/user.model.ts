import mongoose from "mongoose";
import { CompareHashValue, HashValue } from "../utils/bcrypt.util";
import {
  profile_collections,
  profile_names,
} from "../constants/profile-img.constant";
import PlaylistModel from "./playlist.model";
import appAssert from "../utils/app-assert.util";
import { INTERNAL_SERVER_ERROR } from "../constants/http-code.constant";

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
  },
  { timestamps: true }
);

// pre (hash password before savings)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await HashValue(this.password);
  return next();
});

// pro (create default playlist for new user)
userSchema.post("save", async function () {
  try {
    // check if default playlist already exists
    const existDefaultPlaylist = await PlaylistModel.findOne({
      userId: this._id,
      default: true,
    });

    // only create default playlist if it doesn't exist
    // cause this.save() will trigger this post middleware again -> infinite loop
    if (!existDefaultPlaylist) {
      // create default playlist
      const defaultPlaylist = await PlaylistModel.create({
        userId: this._id,
        title: "Liked Songs",
        description: "All your liked songs will be here",
        cover_image:
          "https://mern-joytify.s3.ap-southeast-1.amazonaws.com/defaults/liked-song.png",
        default: true,
      });

      appAssert(
        defaultPlaylist,
        INTERNAL_SERVER_ERROR,
        "Failed to create default playlist"
      );

      // update user account_info
      this.account_info.total_playlists += 1;
      await this.save();
    }
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
