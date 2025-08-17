import AlbumModel from "../models/album.model";
import { HttpCode } from "@joytify/shared-types/constants";
import {
  CreateAlbumRequest,
  Musician,
  PopulatedAlbumResponse,
  RefactorAlbumResponse,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";

interface CreateAlbumServiceRequest extends CreateAlbumRequest {
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
    .refactorSongData<PopulatedAlbumResponse>({ transformNestedSongs: true })
    .lean<RefactorAlbumResponse>();

  return { album };
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
      title,
      artists,
      users: [userId],
      ...rest,
    });

    appAssert(album, INTERNAL_SERVER_ERROR, "Failed to create album");
  }

  return { album };
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
