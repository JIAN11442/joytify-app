import AlbumModel from "../models/album.model";
import appAssert from "../utils/app-assert.util";
import { INTERNAL_SERVER_ERROR } from "../constants/http-code.constant";

type CreateAlbumType = {
  userId: string;
  title: string;
  description?: string;
  cover_image?: string;
  artist?: string;
};

type DeleteAlbumType = {
  userId: string;
  albumId: string;
};

// get user albums service
export const getUserAlbums = async (userId: string) => {
  const albums = await AlbumModel.find({ users: userId });

  return { albums };
};

// create album service
export const createAlbum = async (data: CreateAlbumType) => {
  const { userId, title, artist, ...params } = data;

  let album = await AlbumModel.findOneAndUpdate(
    { title, artist },
    { $addToSet: { users: userId } },
    { new: true }
  );

  // if target album is not exist, create it
  if (!album) {
    album = await AlbumModel.create({
      title,
      artist,
      users: [userId],
      ...params,
    });

    appAssert(album, INTERNAL_SERVER_ERROR, "Failed to create album");
  }

  return { album };
};

// remove user ID from album service
export const removeAlbum = async (data: DeleteAlbumType) => {
  const { userId, albumId } = data;

  const updatedAlbum = await AlbumModel.findByIdAndUpdate(
    albumId,
    { $pull: { users: userId } },
    { new: true }
  );

  appAssert(
    updatedAlbum,
    INTERNAL_SERVER_ERROR,
    "Failed to remove user ID from album's users property"
  );

  return { updatedAlbum };
};
