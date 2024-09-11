import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
} from "../constants/http-code.constant";
import usePalette from "../hooks/paletee.hook";
import PlaylistModel from "../models/playlist.model";
import SongModel from "../models/song.model";
import { songSchemaType } from "../schemas/song.schema";
import appAssert from "../utils/app-assert.util";

interface createParams {
  userId: string;
  songInfo: songSchemaType;
}

// create new song
export const createNewSong = async ({ userId, songInfo }: createParams) => {
  // check if song already exists
  const songIsExist = await SongModel.exists({
    userId: userId,
    title: songInfo.title,
    artist: songInfo.artist,
  });

  appAssert(!songIsExist, CONFLICT, "Song already exists");

  // create new song
  const song = await SongModel.create({ ...songInfo, userId });

  appAssert(song, INTERNAL_SERVER_ERROR, "Failed to create song");

  // update playlist songs list
  const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(
    song.playlist_for,
    { $push: { songs: song._id } }
  );

  appAssert(
    updatedPlaylist,
    INTERNAL_SERVER_ERROR,
    "Failed to update playlist"
  );

  return { song };
};

// get song by id
export const getSongById = async (id: string) => {
  const song = await SongModel.findOne({ _id: id });

  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  // const paletee = await usePalette(song.imageUrl);

  // const generateSong = { ...song.toObject(), paletee };

  return { song };
};
