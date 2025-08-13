import { nanoid } from "nanoid";
import mongoose, { UpdateQuery } from "mongoose";

import AlbumModel from "./album.model";
import LabelModel from "./label.model";
import SessionModel from "./session.model";
import PlaylistModel, { PlaylistDocument } from "./playlist.model";
import VerificationModel from "./verification.model";
import MusicianModel from "./musician.model";
import PlaybackModel from "./playback.model";
import HistoryModel from "./history.model";
import StatsModel from "./stats.model";

import usePalette from "../hooks/paletee.hook";
import { profile_collections, profile_names } from "../constants/profile-img.constant";
import {
  HttpCode,
  PrivacyOptions,
  SupportedLocale,
  AudioVolume,
  LoopMode,
  S3_DEFAULT_IMAGES,
} from "@joytify/shared-types/constants";
import {
  HexPaletee,
  AudioVolumeType,
  LoopModeType,
  SupportedLocaleType,
  PlaybackQueueWithIds,
} from "@joytify/shared-types/types";
import { compareHashValue, hashValue } from "../utils/bcrypt.util";
import { deleteAwsFileUrlOnModel } from "../utils/aws-s3-url.util";
import appAssert from "../utils/app-assert.util";

type UserNotification = {
  id: mongoose.Types.ObjectId;
  viewed: boolean;
  read: boolean;
};

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  username: string;
  profileImage: string;
  verified: boolean;
  authForThirdParty: boolean;
  paletee: HexPaletee;
  playlists: mongoose.Types.ObjectId[];
  songs: mongoose.Types.ObjectId[];
  albums: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  notifications: UserNotification[];
  accountInfo: {
    totalPlaylists: number;
    totalSongs: number;
    totalAlbums: number;
    totalFollowing: number;
  };
  personalInfo: {
    gender: string;
    country: string;
    dateOfBirth: Date;
  };
  userPreferences: {
    sidebarCollapsed: boolean;
    locale: SupportedLocaleType;
    notifications: {
      monthlyStatistic: boolean;
      followingArtistUpdate: boolean;
      systemAnnouncement: boolean;
    };
    player: {
      shuffle: boolean;
      loop: LoopModeType;
      volume: AudioVolumeType;
      playlistSongs: string[];
      playbackQueue: PlaybackQueueWithIds;
    };
  };

  comparePassword: (password: string) => Promise<boolean>;
  omitPassword(): Omit<this, "password">;
}

const { INTERNAL_SERVER_ERROR } = HttpCode;
const profileImgBaseUrl = "https://api.dicebear.com/6.x";

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String },
    username: { type: String, unique: true, required: true },
    profileImage: {
      type: String,
      default: () =>
        `${profileImgBaseUrl}/${profile_collections[Math.floor(Math.random() * profile_collections.length)]}/svg?seed=${profile_names[Math.floor(Math.random() * profile_names.length)]}`,
    },
    verified: { type: Boolean, default: false, required: true },
    authForThirdParty: { type: Boolean, default: false },
    paletee: {
      vibrant: { type: String },
      darkVibrant: { type: String },
      lightVibrant: { type: String },
      muted: { type: String },
      darkMuted: { type: String },
      lightMuted: { type: String },
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
    albums: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Album",
      index: true,
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Musician",
      index: true,
    },
    notifications: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Notification", index: true },
        viewed: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        _id: false,
      },
    ],
    accountInfo: {
      totalPlaylists: { type: Number, default: 0 },
      totalSongs: { type: Number, default: 0 },
      totalAlbums: { type: Number, default: 0 },
      totalFollowing: { type: Number, default: 0 },
    },
    personalInfo: {
      gender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
        index: true,
        default: null,
      },
      country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
        index: true,
        default: null,
      },
      dateOfBirth: { type: Date, default: null },
    },
    userPreferences: {
      sidebarCollapsed: { type: Boolean, default: false },
      locale: {
        type: String,
        enum: Object.values(SupportedLocale),
        default: SupportedLocale.EN_US,
      },
      notifications: {
        monthlyStatistic: { type: Boolean, default: true },
        followingArtistUpdate: { type: Boolean, default: true },
        systemAnnouncement: { type: Boolean, default: true },
      },
      player: {
        volume: {
          type: Number,
          enum: Object.values(AudioVolume),
          default: AudioVolume[5],
        },
        shuffle: { type: Boolean, default: false },
        loop: { type: String, enum: Object.values(LoopMode), default: LoopMode.NONE },
        playlistSongs: { type: [mongoose.Schema.Types.ObjectId], ref: "Song", index: true },
        playbackQueue: {
          queue: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Song",
            index: true,
          },
          currentIndex: { type: Number, default: 0 },
        },
      },
    },
  },
  { timestamps: true }
);

// before create user, ...
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await hashValue(this.password);
  this.username = `${this.username}?nanoid=${nanoid(5)}`;

  if (this.profileImage) {
    this.paletee = await usePalette(this.profileImage);
  }

  return next();
});

// after created user, ...
userSchema.post("save", async function (doc) {
  const { id } = doc;

  try {
    // check if default playlist already exists
    const existDefaultPlaylist = await PlaylistModel.findOne({
      user: id,
      default: true,
    });

    // only create default playlist if it doesn't exist
    // cause this.save() will trigger this post middleware again -> infinite loop
    if (!existDefaultPlaylist) {
      const defaultLikedPlaylistImg = S3_DEFAULT_IMAGES.LIKED_PLAYLIST;

      const paletee = await usePalette(defaultLikedPlaylistImg);

      // create default playlist
      const defaultPlaylist = await PlaylistModel.create({
        user: id,
        title: "Liked Songs",
        description: "All your liked songs will be here",
        coverImage: defaultLikedPlaylistImg,
        paletee: paletee,
        default: true,
        privacy: PrivacyOptions.PRIVATE,
      });

      appAssert(defaultPlaylist, INTERNAL_SERVER_ERROR, "Failed to create default playlist");
    }
  } catch (error) {
    console.log(error);
  }
});

// before updated user, ...
userSchema.pre("findOneAndUpdate", async function (next) {
  const findQuery = this.getQuery();
  let updateDoc = this.getUpdate() as UpdateQuery<UserDocument>;

  // if the profile image is modified, update the paletee
  if (updateDoc.profileImage) {
    const originalDoc = await UserModel.findById(findQuery);
    const paletee = await usePalette(updateDoc.profileImage);

    updateDoc.paletee = paletee;

    // if the original document is not default image, delete it AWS
    if (originalDoc && !originalDoc?.profileImage.includes(profileImgBaseUrl)) {
      await deleteAwsFileUrlOnModel(originalDoc.profileImage);
    }
  }

  // if the username is modified, generate a new nanoid
  if (updateDoc.username) {
    updateDoc.username = `${updateDoc.username}?nanoid=${nanoid(5)}`;
  }

  if (updateDoc.$set) {
    const originalDoc = await this.model.findById(findQuery._id);

    if (updateDoc.$set["personalInfo.gender"]) {
      await Promise.all([
        LabelModel.findByIdAndUpdate(originalDoc?.personalInfo.gender, {
          $pull: { users: findQuery._id },
        }),
        LabelModel.findByIdAndUpdate(updateDoc.$set["personalInfo.gender"], {
          $addToSet: { users: findQuery._id },
        }),
      ]);
    }

    if (updateDoc.$set["personalInfo.country"]) {
      await Promise.all([
        LabelModel.findByIdAndUpdate(originalDoc?.personalInfo.country, {
          $pull: { users: findQuery._id },
        }),
        LabelModel.findByIdAndUpdate(updateDoc.$set["personalInfo.country"], {
          $addToSet: { users: findQuery._id },
        }),
      ]);
    }
  }

  next();
});

// before deleted user, ...
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const findQuery = this.getQuery();
    const userId = findQuery._id;
    const user = await UserModel.findById(userId);
    const playlists = await PlaylistModel.find({ user: user?._id });

    //  * delete all user playlists and their associated properties
    //  * using individual deletions instead of deleteMany() to trigger middleware hooks
    //  * this ensures proper cleanup of related properties (e.g., songs) through schema lifecycle methods
    if (playlists) {
      await Promise.all(
        playlists.map((playlist: PlaylistDocument) => PlaylistModel.findByIdAndDelete(playlist._id))
      );
    }

    if (user) {
      // remove user ID from each relate album's "users" property
      await AlbumModel.updateMany({ users: userId }, { $pull: { users: userId } });

      // remove user ID from each relate label's "users" property
      await LabelModel.updateMany({ users: userId }, { $pull: { users: userId } });

      // remove user ID from each relate musician's "followers" property
      await MusicianModel.updateMany({ followers: userId }, { $pull: { followers: userId } });

      // delete all relative sessions
      await SessionModel.deleteMany({ user: user.id });

      // delete all relative verification codes
      await VerificationModel.deleteMany({ email: user.email });

      // delete user playback
      await PlaybackModel.findOneAndDelete({ user: user.id });

      // delete user history
      await HistoryModel.findOneAndDelete({ user: user.id });

      // delete user stats
      await StatsModel.findOneAndDelete({ user: user.id });

      // if the original document is not default image, delete it from AWS
      if (!user.profileImage.includes(profileImgBaseUrl)) {
        await deleteAwsFileUrlOnModel(user.profileImage);
      }
    }

    next();
  } catch (error) {
    console.log(error);
  }
});

// custom method (compare password with hashed password from database)
userSchema.methods.comparePassword = async function (password: string) {
  return compareHashValue(password, this.password);
};

// custom method (omit password from user object)
userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
