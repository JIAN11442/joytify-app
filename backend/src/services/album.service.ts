import AlbumModel from "../models/album.model";
import { HttpCode } from "@joytify/shared-types/constants";
import {
  Album,
  CreateAlbumRequest,
  Label,
  Musician,
  PopulatedAlbumResponse,
  RefactorAlbumResponse,
  SongResponse,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";
import { joinLabels } from "../utils/join-labels.util";

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
    .lean<PopulatedAlbumResponse>();

  appAssert(album, NOT_FOUND, "Failed to get album by id");

  const refactorAlbum: RefactorAlbumResponse = {
    ...album,
    songs: album.songs.map((song: SongResponse) => ({
      ...song,
      lyricists: joinLabels(song.lyricists),
      composers: joinLabels(song.composers),
      languages: joinLabels(song.languages),
      album: song.album || "",
    })),
  };

  return { album: refactorAlbum };
};

// create album service
export const createAlbum = async (params: CreateAlbumServiceRequest) => {
  const { userId, title, artist, ...rest } = params;

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

  appAssert(
    updatedAlbum,
    INTERNAL_SERVER_ERROR,
    "Failed to remove user ID from album's users property"
  );

  return { updatedAlbum };
};

// delete user album service(*)
export const deleteAlbum = async (data: DeleteAlbumServiceRequest) => {
  const { userId, albumId } = data;

  const deletedAlbum = await AlbumModel.findOneAndDelete({
    _id: albumId,
    users: userId,
  });

  appAssert(deletedAlbum !== null, INTERNAL_SERVER_ERROR, "Failed to delete album");

  return { deletedAlbum };
};
