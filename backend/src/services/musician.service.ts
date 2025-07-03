import { FilterQuery } from "mongoose";

import MusicianModel, { MusicianDocument } from "../models/musician.model";
import { HttpCode } from "@joytify/shared-types/constants";
import {
  Album,
  Label,
  Musician,
  GetMusicianIdRequest,
  PopulatedMusicianResponse,
  RefactorMusicianResponse,
  SongResponse,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";
import { joinLabels } from "../utils/join-labels.util";
import UserModel from "../models/user.model";

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

  appAssert(musician, INTERNAL_SERVER_ERROR, "Failed to push type to roles prop");

  // otherwise, return musician id
  return { id: musician._id };
};

// get musician by id
export const getMusicianById = async (id: string) => {
  const musician = await MusicianModel.findById(id)
    .populate({
      path: "songs",
      populate: [
        { path: "artist", select: "name", transform: (doc: Musician) => doc.name },
        { path: "composers", select: "name", transform: (doc: Musician) => doc.name },
        { path: "lyricists", select: "name", transform: (doc: Musician) => doc.name },
        { path: "languages", select: "label", transform: (doc: Label) => doc.label },
        { path: "album", select: "title", transform: (doc: Album) => doc.title },
      ],
    })
    .lean<PopulatedMusicianResponse>();

  appAssert(musician, NOT_FOUND, "Failed to get musician by id");

  const refactorMusician: RefactorMusicianResponse = {
    ...musician,
    songs: musician.songs.map((song: SongResponse) => ({
      ...song,
      lyricists: joinLabels(song.lyricists),
      composers: joinLabels(song.composers),
      languages: joinLabels(song.languages),
      album: song.album || "",
    })),
  };

  return { musician: refactorMusician };
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

  appAssert(updatedMusician, NOT_FOUND, "Failed to updated followers of musician");

  // 2. update user following
  const updatedUser = await UserModel.findByIdAndUpdate(userId, {
    $addToSet: { following: musicianId },
    $inc: { "accountInfo.totalFollowing": 1 },
  });

  appAssert(updatedUser, NOT_FOUND, "Failed to updated following of user");

  return { musician: updatedMusician, user: updatedUser };
};

// unfollow target musician
export const unfollowTargetMusician = async (params: MusicianFollowService) => {
  const { userId, musicianId } = params;

  // 1. update musician followers
  const updatedMusician = await MusicianModel.findByIdAndUpdate(musicianId, {
    $pull: { followers: userId },
  });

  appAssert(updatedMusician, NOT_FOUND, "Failed to updated followers of musician");

  // 2. update user following
  const updatedUser = await UserModel.findByIdAndUpdate(userId, {
    $pull: { following: musicianId },
    $inc: { "accountInfo.totalFollowing": -1 },
  });

  appAssert(updatedUser, NOT_FOUND, "Failed to updated following of user");

  return { musician: updatedMusician, user: updatedUser };
};
