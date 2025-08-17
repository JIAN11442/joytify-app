import { FilterQuery } from "mongoose";

import UserModel from "../models/user.model";
import MusicianModel, { MusicianDocument } from "../models/musician.model";
import { HttpCode } from "@joytify/shared-types/constants";
import {
  GetMusicianIdRequest,
  PopulatedMusicianResponse,
  RefactorMusicianResponse,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

type MusicianFollowService = {
  userId: string;
  musicianId: string;
};

// get musician ID service
export const getMusicianId = async (params: GetMusicianIdRequest) => {
  const { musician: name, type, createIfAbsent } = params;

  let findQuery: FilterQuery<MusicianDocument> = { name };

  // find target musician if exist
  let musician = await MusicianModel.findOne(findQuery);

  // if not found, create it
  if (!musician && createIfAbsent) {
    musician = await MusicianModel.create({ ...findQuery, roles: type });

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
    .refactorSongData<PopulatedMusicianResponse>({ transformNestedSongs: true })
    .lean<RefactorMusicianResponse>();

  return { musician };
};

// get user following musicians
export const getFollowingMusicians = async (userId: string) => {
  const musicians = await MusicianModel.find({ followers: userId });

  return musicians;
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
