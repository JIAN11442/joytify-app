import UserModel from "../models/user.model";
import SongModel from "../models/song.model";
import AlbumModel from "../models/album.model";
import PlaylistModel from "../models/playlist.model";
import MusicianModel from "../models/musician.model";
import VerificationModel from "../models/verification.model";
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
      select: "title cover_image",
      transform: (doc: Playlist) => remapFields(doc, { cover_image: "imageUrl" }),
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
      select: "title cover_image",
      options: opts,
      transform: (doc: Album) => remapFields(doc, { cover_image: "imageUrl" }),
    })
    .populate({
      path: "following",
      select: "name cover_image roles",
      transform: (doc: Musician) =>
        remapFields(doc, { name: "title", cover_image: "imageUrl", roles: "description" }),
      options: opts,
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
    SongModel.countDocuments({ creator: userId }),
    AlbumModel.countDocuments({ users: userId }),
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
    playlists: { docs: user.playlists, totalDocs: counts.playlists },
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
        .select("title cover_image")
        .remapFields({ cover_image: "imageUrl" })
        .forPagination(page);

      break;
    case SONGS:
      docs = await getPaginatedDocs({
        model: SongModel,
        filter: { creator: userId },
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
        filter: { _id: { $in: user?.albums } },
        ...opts,
      })
        .select("title cover_image")
        .remapFields({ cover_image: "imageUrl" })
        .forPagination(page);

      break;
    case FOLLOWING:
      docs = await getPaginatedDocs({
        model: MusicianModel,
        filter: { followers: { $in: [userId] } },
        ...opts,
      })
        .select("name cover_image roles")
        .remapFields({ name: "title", roles: "description", cover_image: "imageUrl" })
        .forPagination(page);

      break;
  }

  return { docs };
};

// update user service
export const updateUserInfoById = async (params: UpdateUserServiceRequest) => {
  const { userId, ...rest } = params;

  const updatedUserInfo = await UserModel.findByIdAndUpdate(userId, { ...rest }, { new: true });

  appAssert(updatedUserInfo, INTERNAL_SERVER_ERROR, "Failed to update user info");

  return { user: updatedUserInfo.omitPassword() };
};

// reset password service
export const resetUserPassword = async (data: ResetPasswordRequest) => {
  const { token, currentPassword, newPassword } = data;

  // verify token to get session ID
  const { payload } = await verifyToken<VerificationTokenPayload>(token, {
    secret: VerificationTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "Invalid or expired token");

  // get target verification doc
  const verificationDoc = await VerificationModel.findOne({
    session: payload.sessionId,
    type: PASSWORD_RESET,
  });

  appAssert(verificationDoc, UNAUTHORIZED, "Invalid or expired token");

  // check user if exist
  const user = await UserModel.findOne({ email: verificationDoc.email });

  appAssert(user, UNAUTHORIZED, "Invalid or expired token");

  // check current password is match
  const passwordIsMatch = await compareHashValue(currentPassword, user.password);

  appAssert(passwordIsMatch, UNAUTHORIZED, "Invalid current password");

  // update user password
  user.password = newPassword;
  await user.save();

  // delete relative verification
  await verificationDoc.deleteOne();

  // send email
  const username = user.email.split("@")[0];
  const content = JoytifyPasswordChangedEmail({ username });
  const subject = "Your Joytify password has been changed";

  await sendEmail({ to: user.email, subject, content });

  return { user: user.omitPassword() };
};
