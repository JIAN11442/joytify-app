import { FilterQuery } from "mongoose";

import UserModel from "../models/user.model";
import SongModel from "../models/song.model";
import MusicianModel, { MusicianDocument } from "../models/musician.model";
import { collectDocumentAttributes } from "./util.service";
import { PROFILE_FETCH_LIMIT } from "../constants/env-validate.constant";
import { HttpCode } from "@joytify/shared-types/constants";
import {
  GetMusicianIdRequest,
  PopulatedMusicianResponse,
  RefactorMusicianResponse,
  UpdateMusicianRequest,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

type MusicianFollowService = {
  userId: string;
  musicianId: string;
};

interface GetMusicianIdRequestService extends GetMusicianIdRequest {
  userId: string;
}

interface UpdateMusicianRequestService extends UpdateMusicianRequest {
  userId: string;
}

// get musician ID service
export const getMusicianId = async (params: GetMusicianIdRequestService) => {
  const { userId, musician: name, type, createIfAbsent } = params;

  let findQuery: FilterQuery<MusicianDocument> = { name };

  // find target musician if exist
  let musician = await MusicianModel.findOne(findQuery);

  // if not found, create it
  if (!musician && createIfAbsent) {
    musician = await MusicianModel.create({ ...findQuery, creator: userId, roles: type });

    appAssert(musician, INTERNAL_SERVER_ERROR, "Failed to create musician");
  }

  // if musician still not found, return error
  appAssert(musician, NOT_FOUND, "Musician is not found");

  // if the musician exists and the type is provided, add the type to the musician's roles property.
  // use $addToSet to avoid adding duplicate values to the roles array.
  musician = await MusicianModel.findByIdAndUpdate(
    musician._id,
    { $addToSet: { roles: type } },
    { new: true }
  );

  appAssert(musician, NOT_FOUND, "Musician not found");

  // otherwise, return musician id
  return { id: musician._id };
};

// get musician by id
export const getMusicianById = async (id: string) => {
  const musician = await MusicianModel.findById(id)
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedMusicianResponse>({ transformNestedSongs: true })
    .lean<RefactorMusicianResponse>();

  return { musician };
};

// get user following musicians
export const getFollowingMusicians = async (userId: string) => {
  const musicians = await MusicianModel.find({ followers: userId });

  return musicians;
};

// get recommended musicians
export const getRecommendedMusicians = async (musicianId: string) => {
  const musician = await MusicianModel.findById(musicianId);

  appAssert(musician, NOT_FOUND, "Musician not found");

  const features = await collectDocumentAttributes({
    model: SongModel,
    ids: musician.songs,
    fields: ["artist", "composers", "lyricists", "genres", "tags", "languages"],
  });

  const [result] = await SongModel.aggregate([
    { $match: { _id: { $nin: musician.songs } } },
    { $match: { artist: { $ne: musician._id } } },
    {
      $match: {
        $or: [
          { artist: { $in: features.artist } },
          { composers: { $in: features.composers } },
          { lyricists: { $in: features.lyricists } },
          { genres: { $in: features.genres } },
          { tags: { $in: features.tags } },
          { languages: { $in: features.languages } },
        ],
      },
    },
    { $limit: PROFILE_FETCH_LIMIT },
    {
      $group: {
        _id: null,
        musicianIds: {
          $addToSet: {
            $concatArrays: [["$artist"], "$composers", "$lyricists"],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        musicianIds: {
          $reduce: {
            input: "$musicianIds",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
  ]);

  const recommendedMusicians = await MusicianModel.find({
    _id: { $in: result?.musicianIds || [] },
  })
    .limit(PROFILE_FETCH_LIMIT)
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedMusicianResponse>({ transformNestedSongs: true })
    .lean<RefactorMusicianResponse>();

  return recommendedMusicians;
};

// update musician
export const updateMusicianById = async (params: UpdateMusicianRequestService) => {
  const { userId, musicianId, name, coverImage } = params;

  const updatedMusician = await MusicianModel.findOneAndUpdate(
    { _id: musicianId, creator: userId },
    { $set: { name, coverImage } },
    { new: true }
  );

  appAssert(updatedMusician, NOT_FOUND, "Musician not found");

  return updatedMusician;
};

// follow target musician
export const followTargetMusician = async (params: MusicianFollowService) => {
  const { userId, musicianId } = params;

  // 1. update musician followers
  const updatedMusician = await MusicianModel.findByIdAndUpdate(musicianId, {
    $addToSet: { followers: userId },
  });

  appAssert(updatedMusician, NOT_FOUND, "Musician not found");

  // 2. update user following
  const updatedUser = await UserModel.findByIdAndUpdate(userId, {
    $addToSet: { following: musicianId },
    $inc: { "accountInfo.totalFollowing": 1 },
  });

  appAssert(updatedUser, NOT_FOUND, "User not found");

  return { musician: updatedMusician, user: updatedUser };
};

// unfollow target musician
export const unfollowTargetMusician = async (params: MusicianFollowService) => {
  const { userId, musicianId } = params;

  // 1. update musician followers
  const updatedMusician = await MusicianModel.findByIdAndUpdate(musicianId, {
    $pull: { followers: userId },
  });

  appAssert(updatedMusician, NOT_FOUND, "Musician not found");

  // 2. update user following
  const updatedUser = await UserModel.findByIdAndUpdate(userId, {
    $pull: { following: musicianId },
    $inc: { "accountInfo.totalFollowing": -1 },
  });

  appAssert(updatedUser, NOT_FOUND, "User not found");

  return { musician: updatedMusician, user: updatedUser };
};
