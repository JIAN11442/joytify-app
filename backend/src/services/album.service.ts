import SongModel from "../models/song.model";
import AlbumModel from "../models/album.model";
import { collectDocumentAttributes } from "./util.service";
import { PROFILE_FETCH_LIMIT } from "../constants/env-validate.constant";
import { HttpCode } from "@joytify/shared-types/constants";
import {
  CreateAlbumRequest,
  Musician,
  PopulatedAlbumResponse,
  RefactorAlbumResponse,
  UpdateAlbumRequest,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";

interface CreateAlbumServiceRequest extends CreateAlbumRequest {
  userId: string;
}

interface UpdateAlbumServiceRequest extends UpdateAlbumRequest {
  userId: string;
}

type DeleteAlbumServiceRequest = {
  userId: string;
  albumId: string;
};

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

// get user albums service
export const getUserAlbums = async (userId: string) => {
  const albums = await AlbumModel.find({ users: userId });

  return { albums };
};

// get album by id service
export const getAlbumById = async (id: string) => {
  const album = await AlbumModel.findById(id)
    .populate({ path: "artists", select: "name", transform: (doc: Musician) => doc.name })
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedAlbumResponse>({ transformNestedSongs: true })
    .lean<RefactorAlbumResponse>();

  return { album };
};

// get recommended albums service
export const getRecommendedAlbums = async (albumId: string) => {
  const album = await AlbumModel.findById(albumId);

  appAssert(album, NOT_FOUND, "Album not found");

  const features = await collectDocumentAttributes({
    model: SongModel,
    ids: album.songs,
    fields: ["genres", "tags", "languages"],
  });

  const [result] = await SongModel.aggregate([
    { $match: { _id: { $nin: album.songs } } },
    { $match: { album: { $ne: album._id } } },
    {
      $match: {
        $or: [
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
        albumIds: { $addToSet: "$album" },
      },
    },
  ]);

  const recommendedAlbums = await AlbumModel.find({
    _id: { $in: result?.albumIds || [] },
  })
    .populate({ path: "artists", select: "name", transform: (doc: Musician) => doc.name })
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedAlbumResponse>({ transformNestedSongs: true })
    .lean<RefactorAlbumResponse>();

  return recommendedAlbums;
};

// create album service
export const createAlbum = async (params: CreateAlbumServiceRequest) => {
  const { userId, title, artists, ...rest } = params;

  let album = await AlbumModel.findOneAndUpdate(
    { title, artists },
    { $addToSet: { users: userId } },
    { new: true }
  );

  // if target album is not exist, create it
  if (!album) {
    album = await AlbumModel.create({
      creator: userId,
      title,
      artists,
      users: [userId],
      ...rest,
    });

    appAssert(album, INTERNAL_SERVER_ERROR, "Failed to create album");
  }

  return { album };
};

// update album service
export const updateAlbumById = async (params: UpdateAlbumServiceRequest) => {
  const { userId, albumId, title, coverImage } = params;

  const updatedAlbum = await AlbumModel.findOneAndUpdate(
    { _id: albumId, creator: userId },
    { $set: { title, coverImage } },
    { new: true }
  );

  appAssert(updatedAlbum, NOT_FOUND, "Album not found");

  return updatedAlbum;
};

// remove user ID from album service
export const removeAlbum = async (data: DeleteAlbumServiceRequest) => {
  const { userId, albumId } = data;

  const updatedAlbum = await AlbumModel.findByIdAndUpdate(
    albumId,
    { $pull: { users: userId } },
    { new: true }
  );

  appAssert(updatedAlbum, NOT_FOUND, "Album not found");

  return { updatedAlbum };
};
