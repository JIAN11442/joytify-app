import PlaylistModel from "../models/playlist.model";
import appAssert from "../utils/app-assert.util";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import getImgPaletee from "../utils/get-palette.util";

// get user all playlist service
export const getUserPlaylist = async (userId: string) => {
  const defaultPlaylist = await PlaylistModel.findOne({
    userId,
    default: true,
  });

  const userPlaylists = await PlaylistModel.find({
    userId,
    default: false,
  }).sort({
    createdAt: -1,
  });

  const playlists = [defaultPlaylist, ...userPlaylists];

  return { playlists };
};

// get playlist by id service
export const getUserPlaylistById = async (
  playlistId: string,
  userId: string
) => {
  const playlist = await PlaylistModel.findOne({
    _id: playlistId,
    userId,
  }).populate("songs");

  appAssert(playlist, NOT_FOUND, "Playlist not found");

  // get paletee from cover image
  const paletee = await getImgPaletee(playlist.cover_image);

  const generatePaletee = {
    vibrant: paletee?.Vibrant?.hex,
    darkVibrant: paletee?.DarkVibrant?.hex,
    lightVibrant: paletee?.LightVibrant?.hex,
    muted: paletee?.Muted?.hex,
    darkMuted: paletee?.DarkMuted?.hex,
    lightMuted: paletee?.LightMuted?.hex,
  };

  const newPlaylist = { ...playlist.toObject(), paletee: generatePaletee };

  return { playlist: newPlaylist };
};

// create new playlist service
export const createNewPlaylist = async (userId: string) => {
  const playlist = await PlaylistModel.create({ userId });

  appAssert(playlist, INTERNAL_SERVER_ERROR, "Failed to create playlist");

  return { playlist };
};

// update playlist cover image service
type updatePlaylistType = {
  playlistId: string;
  userId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
};

export const updatePlaylistById = async ({
  playlistId,
  userId,
  title,
  description,
  imageUrl,
}: updatePlaylistType) => {
  const updatedPlaylist = await PlaylistModel.findOneAndUpdate(
    {
      _id: playlistId,
      userId,
    },
    { title, description, cover_image: imageUrl },
    { new: true }
  );

  appAssert(
    updatedPlaylist,
    INTERNAL_SERVER_ERROR,
    "Failed to update playlist"
  );

  return { playlist: updatedPlaylist };
};
