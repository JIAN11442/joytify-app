import { RequestHandler } from "express";

import {
  createNewPlaylist,
  deletePlaylistById,
  getUserPlaylists,
  getUserPlaylistById,
  updatePlaylistById,
} from "../services/playlist.service";
import { createPlaylistZodSchema, playlistZodSchema } from "../schemas/playlist.zod";
import { objectIdZodSchema, stringZodSchema } from "../schemas/util.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import PlaylistModel from "../models/playlist.model";

const { OK, CREATED } = HttpCode;

// get user all playlist handler
export const getPlaylistsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const query = stringZodSchema.optional().parse(req.query.search) ?? "";

    const { playlists } = await getUserPlaylists(userId, query);

    return res.status(OK).json(playlists);
  } catch (error) {
    next(error);
  }
};

// get target playlist handler
export const getTargetPlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const playlistId = objectIdZodSchema.parse(req.params.id);

    // get target playlist
    const { playlist } = await getUserPlaylistById(playlistId, userId);

    return res.status(OK).json(playlist);
  } catch (error) {
    next(error);
  }
};

// create playlist handler
export const createPlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params = createPlaylistZodSchema.parse(req.body);

    // create playlist
    const { playlist } = await createNewPlaylist({ userId, ...params });

    res.status(CREATED).json(playlist);
  } catch (error) {
    next(error);
  }
};

// update playlist cover image handler
export const updatePlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const playlistId = objectIdZodSchema.parse(req.params.id);
    const userId = objectIdZodSchema.parse(req.userId);
    const params = playlistZodSchema.parse(req.body);

    // update playlist cover image
    const { playlist } = await updatePlaylistById({ playlistId, userId, ...params });

    return res.status(OK).json(playlist);
  } catch (error) {
    next(error);
  }
};

// delete playlist handler
export const deletePlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const currentPlaylistId = objectIdZodSchema.parse(req.params.id);
    const { targetPlaylistId } = req.body;

    const deletedPlaylist = await deletePlaylistById({
      userId,
      currentPlaylistId,
      targetPlaylistId,
    });

    return res.status(OK).json(deletedPlaylist);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// update playlist stats handler (*)
export const updatePlaylistStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    const playlists = await PlaylistModel.find({}).populate({
      path: "songs",
      select: "duration",
    });

    // To prevent `updatedAt` from being modified, we must execute individual
    // update operations with the `{ timestamps: false }` option.
    // `bulkWrite` does not support this option.
    const updatePromises = playlists.map((playlist: any) => {
      const stats = {
        totalSongCount: playlist.songs.length,
        totalSongDuration: playlist.songs.reduce(
          (sum: number, song: any) => sum + (song.duration || 0),
          0
        ),
      };

      return PlaylistModel.updateOne(
        { _id: playlist._id },
        { $set: { stats: stats } },
        { timestamps: false } // This option prevents updating `updatedAt`
      );
    });

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    return res.status(OK).json({
      message: `Successfully updated stats for ${playlists.length} playlists without updating timestamps.`,
      updatedCount: playlists.length,
    });
  } catch (error) {
    console.error("更新 playlist stats 失敗:", error);
    next(error);
  }
};

// remove playlists stats handler (*)
export const removePlaylistStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    // 使用 updateMany 移除所有 playlists 的 stats 屬性
    const result = await PlaylistModel.updateMany(
      {}, // 匹配所有文檔
      { $unset: { stats: "" } } // 移除 stats 字段
    );

    return res.status(OK).json({
      message: `Successfully removed stats from ${result.modifiedCount} playlists`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
