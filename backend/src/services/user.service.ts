import SongModel from "../models/song.model";
import AlbumModel from "../models/album.model";
import StatsModel from "../models/stats.model";
import HistoryModel from "../models/history.model";
import PlaybackModel from "../models/playback.model";
import PlaylistModel from "../models/playlist.model";
import MusicianModel from "../models/musician.model";
import VerificationModel from "../models/verification.model";
import UserModel, { UserDocument } from "../models/user.model";

import { sendEmail } from "./verification.service";

import { JoytifyPasswordChangedEmail } from "../templates/password-changed.template";
import { FETCH_LIMIT_PER_PAGE, PROFILE_FETCH_LIMIT } from "../constants/env-validate.constant";
import {
  HttpCode,
  VerificationForOptions,
  PrivacyOptions,
  ProfileCollections,
} from "@joytify/shared-types/constants";
import {
  UpdateUserInfoRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  DeregisterUserAccountRequest,
  ProfileUserResponse,
  RefactorProfileUserResponse,
  ProfileCollectionsType,
  Musician,
  Playlist,
  Song,
  Album,
} from "@joytify/shared-types/types";
import { getPaginatedDocs, remapFields } from "../utils/mongoose.util";
import { compareHashValue } from "../utils/bcrypt.util";
import appAssert from "../utils/app-assert.util";
import {
  VerificationTokenPayload,
  VerificationTokenSignOptions,
  verifyToken,
} from "../utils/jwt.util";

interface UpdateUserServiceRequest extends UpdateUserInfoRequest {
  userId: string;
}

interface ChangePasswordServiceRequest extends ChangePasswordRequest {
  userId: string;
}

interface DeregisterAccountServiceRequest extends DeregisterUserAccountRequest {
  userId: string;
}

interface UpdatePasswordServiceRequest extends ChangePasswordRequest {
  user: UserDocument;
}

type PaginationOpts = {
  limit: { initial: number; load: number };
  page: number;
};

type PaginationQueryResponse<T> = {
  docs: T[];
  totalDocs: number;
};

const { PASSWORD_RESET } = VerificationForOptions;
const { INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } = HttpCode;
const { PLAYLISTS, SONGS, ALBUMS, FOLLOWING } = ProfileCollections;
const { PUBLIC } = PrivacyOptions;

// get profile user info service
export const getProfileUserInfo = async (userId: string, page: number) => {
  const { PUBLIC } = PrivacyOptions;

  const opts = {
    skip: (page - 1) * PROFILE_FETCH_LIMIT,
    limit: PROFILE_FETCH_LIMIT,
    sort: { createdAt: -1 },
  };

  // get user info
  const user = await UserModel.findById(userId)
    .populate({
      path: "playlists",
      match: { default: false, privacy: PUBLIC },
      select: "title coverImage",
      transform: (doc: Playlist) => remapFields(doc, { coverImage: "imageUrl" }),
      options: opts,
    })
    .populate({
      path: "songs",
      populate: [
        { path: "artist", select: "name", transform: (doc: Musician) => doc.name, options: opts },
      ],
      select: "title artist imageUrl",
      transform: (doc: Song) => remapFields(doc, { artist: "description" }),
      options: opts,
    })
    .populate({
      path: "albums",
      select: "title coverImage",
      options: opts,
      transform: (doc: Album) => remapFields(doc, { coverImage: "imageUrl" }),
    })
    .populate({
      path: "following",
      select: "name coverImage roles",
      transform: (doc: Musician) =>
        remapFields(doc, { name: "title", coverImage: "imageUrl", roles: "description" }),
      options: opts,
    })
    .populate({
      path: "personalInfo",
      populate: [
        { path: "gender", select: "label" },
        { path: "country", select: "label" },
      ],
    })
    .select("-password")
    .lean<ProfileUserResponse>();

  appAssert(user, NOT_FOUND, "User not found");

  // get fields total count
  const counts = await Promise.all([
    PlaylistModel.countDocuments({
      user: userId,
      default: false,
      privacy: PUBLIC,
    }),
    SongModel.countDocuments({ creator: userId, "ownership.isPlatformOwned": false }),
    AlbumModel.countDocuments({ _id: { $in: user.albums } }),
    MusicianModel.countDocuments({ followers: userId }),
  ]).then(([playlists, songs, albums, following]) => ({
    playlists,
    songs,
    albums,
    following,
  }));

  // refactor user info
  const refactorUser: RefactorProfileUserResponse = {
    ...user,
    playlists: { docs: (user.playlists ?? []).filter(Boolean), totalDocs: counts.playlists },
    songs: { docs: user.songs, totalDocs: counts.songs },
    albums: { docs: user.albums, totalDocs: counts.albums },
    following: { docs: user.following, totalDocs: counts.following },
  };

  return refactorUser;
};

// get profile collections info service
export const getProfileCollectionsInfo = async (
  userId: string,
  page: number,
  collection: ProfileCollectionsType
) => {
  let docs: PaginationQueryResponse<any> = { docs: [], totalDocs: 0 };

  const opts: PaginationOpts = {
    limit: { initial: PROFILE_FETCH_LIMIT * 2, load: FETCH_LIMIT_PER_PAGE },
    page: page,
  };

  switch (collection) {
    case PLAYLISTS:
      docs = await getPaginatedDocs({
        model: PlaylistModel,
        filter: { user: userId, default: false, privacy: PUBLIC },
        ...opts,
      })
        .select("title coverImage")
        .remapFields({ coverImage: "imageUrl" })
        .forPagination(page);

      break;
    case SONGS:
      docs = await getPaginatedDocs({
        model: SongModel,
        filter: { creator: userId, "ownership.isPlatformOwned": false },
        ...opts,
      })
        .populate({ path: "artist", select: "name", transform: (doc: Musician) => doc.name })
        .select("title artist imageUrl")
        .remapFields({ artist: "description" })
        .forPagination(page);

      break;
    case ALBUMS:
      const user = await UserModel.findById(userId);

      docs = await getPaginatedDocs({
        model: AlbumModel,
        filter: { _id: { $in: user.albums } },
        ...opts,
      })
        .select("title coverImage")
        .remapFields({ coverImage: "imageUrl" })
        .forPagination(page);

      break;
    case FOLLOWING:
      docs = await getPaginatedDocs({
        model: MusicianModel,
        filter: { followers: { $in: [userId] } },
        ...opts,
      })
        .select("name coverImage roles")
        .remapFields({ name: "title", roles: "description", coverImage: "imageUrl" })
        .forPagination(page);

      break;
  }

  return { docs };
};

// update user service
export const updateUserInfoById = async (params: UpdateUserServiceRequest) => {
  const {
    userId,
    gender,
    country,
    dateOfBirth,
    monthlyStatistics,
    followingArtistUpdates,
    systemAnnouncements,
    ...rest
  } = params;

  const updatedUserInfo = await UserModel.findByIdAndUpdate(
    userId,
    {
      ...rest,
      // only update personal info if it's provided
      // so use $set to update
      $set: {
        "personalInfo.gender": gender,
        "personalInfo.country": country,
        "personalInfo.dateOfBirth": dateOfBirth,
        "userPreferences.notifications.monthlyStatistics": monthlyStatistics,
        "userPreferences.notifications.followingArtistUpdates": followingArtistUpdates,
        "userPreferences.notifications.systemAnnouncements": systemAnnouncements,
      },
    },
    { new: true }
  );

  appAssert(updatedUserInfo, INTERNAL_SERVER_ERROR, "Failed to update user info");

  return { user: updatedUserInfo.omitPassword() };
};

// update user password service
export const updateUserPassword = async (params: UpdatePasswordServiceRequest) => {
  const { user, currentPassword, newPassword } = params;

  // check current password is match
  const passwordIsMatch = await compareHashValue(currentPassword, user.password);

  appAssert(passwordIsMatch, UNAUTHORIZED, "Invalid current password");

  // update user password
  user.password = newPassword;
  await user.save();

  // send email
  const username = user.email.split("@")[0];
  const content = JoytifyPasswordChangedEmail({ username });
  const subject = "Your Joytify password has been changed";

  // await sendEmail({ to: user.email, subject, content });

  return { updatedUser: user.omitPassword() };
};

// reset password service
export const resetUserPassword = async (params: ResetPasswordRequest) => {
  const { token, ...rest } = params;

  // 1. verify token to get session ID
  const { payload } = await verifyToken<VerificationTokenPayload>(token, {
    secret: VerificationTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "Invalid or expired token");

  // 2. get target verification doc
  const verificationDoc = await VerificationModel.findOne({
    session: payload.sessionId,
    type: PASSWORD_RESET,
  });

  appAssert(verificationDoc, UNAUTHORIZED, "Invalid or expired token");

  // 3. check user if exist
  const user = await UserModel.findOne({ email: verificationDoc.email });

  appAssert(user, UNAUTHORIZED, "Invalid or expired token");

  // 4. update user password
  const { updatedUser } = await updateUserPassword({ user, ...rest });

  // 5. delete relative verification
  await verificationDoc.deleteOne();

  return { user: updatedUser };
};

// change password service
export const changeUserPassword = async (params: ChangePasswordServiceRequest) => {
  const { userId, ...rest } = params;

  const user = await UserModel.findById(userId);

  appAssert(user, NOT_FOUND, "User not found");

  const { updatedUser } = await updateUserPassword({ user, ...rest });

  return { user: updatedUser };
};

// deregister user service
export const deregisterUserAccount = async (params: DeregisterAccountServiceRequest) => {
  const { userId, shouldDeleteSongs } = params;

  const user = await UserModel.findById(userId);

  appAssert(user, NOT_FOUND, "User not found");

  const { songs } = user;

  if (songs.length > 0) {
    try {
      if (shouldDeleteSongs) {
        // delete all user songs
        for (const songId of songs) {
          const deletedSong = await SongModel.findByIdAndDelete(songId);

          appAssert(
            deletedSong,
            INTERNAL_SERVER_ERROR,
            `Failed to delete song ${songId} in deregistration process`
          );
        }

        // delete all user playback records
        const deletedPlaybacks = await PlaybackModel.deleteMany({ user: userId });

        appAssert(
          deletedPlaybacks.acknowledged === true,
          INTERNAL_SERVER_ERROR,
          "Failed to delete user playback records in deregistration process"
        );

        // delete all user history records
        const deletedHistories = await HistoryModel.deleteMany({ user: userId });

        appAssert(
          deletedHistories.acknowledged === true,
          INTERNAL_SERVER_ERROR,
          "Failed to delete user history records in deregistration process"
        );

        // delete all user stat records
        const deletedStats = await StatsModel.deleteMany({ user: userId });

        appAssert(
          deletedStats.acknowledged === true,
          INTERNAL_SERVER_ERROR,
          "Failed to delete user stat records in deregistration process"
        );
      } else {
        // change songs ownership to platform owned
        const updatedSongs = await SongModel.updateMany(
          { creator: userId },
          { $set: { "ownership.isPlatformOwned": true } }
        );

        appAssert(
          updatedSongs.acknowledged === true,
          INTERNAL_SERVER_ERROR,
          "Failed to update user songs ownership in deregistration process"
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  // finally, delete user account
  const deletedUserAccount = await UserModel.findByIdAndDelete(userId);

  appAssert(
    deletedUserAccount !== null,
    INTERNAL_SERVER_ERROR,
    `Failed to delete user ${userId} in deregistration process`
  );

  return { deletedUser: deletedUserAccount.omitPassword() };
};
