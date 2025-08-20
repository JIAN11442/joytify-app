import mongoose, { FilterQuery } from "mongoose";
import LabelModel from "../models/label.model";
import AlbumModel from "../models/album.model";
import PlaybackModel from "../models/playback.model";
import MusicianModel from "../models/musician.model";
import SongModel, { SongDocument } from "../models/song.model";
import { MusicianOptions } from "@joytify/shared-types/constants";
import { FETCH_LIMIT_PER_PAGE, PROFILE_FETCH_LIMIT } from "../constants/env-validate.constant";
import {
  LabelOptionsType,
  Musician,
  PopulatedAlbumResponse,
  PopulatedMusicianResponse,
  PopulatedSearchLabelResponse,
  PopulatedSongResponse,
  RefactorAlbumResponse,
  RefactorMusicianResponse,
  RefactorSearchLabelResponse,
  RefactorSongResponse,
} from "@joytify/shared-types/types";
import { collectDocumentAttributes } from "./util.service";
import { getPaginatedDocs } from "../utils/mongoose.util";

type GetRecentlyPlayedSongsProps = {
  userId: string;
  page: number;
};

type GetRecommendedSongsProps = {
  page: number;
  songIds?: string[];
};

type GetRecommendedAlbumsProps = GetRecommendedSongsProps;

type GetRecommendedLabelsProps = {
  type: LabelOptionsType;
  page: number;
};

const { ARTIST } = MusicianOptions;
const fetchLimit = { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE };

export const getPopularMusicians = async (page: number) => {
  const musicianIds = (
    await MusicianModel.aggregate([
      { $match: { roles: { $in: [ARTIST] } } },
      {
        $lookup: {
          from: "songs",
          localField: "songs",
          foreignField: "_id",
          as: "songDocs",
        },
      },
      { $addFields: { totalPlaybackCount: { $sum: "$songDocs.activities.totalPlaybackCount" } } },
      { $sort: { totalPlaybackCount: -1, followers: -1 } },
      { $project: { _id: 1 } },
    ])
  ).map((doc) => doc._id);

  const popularMusicians = await getPaginatedDocs({
    model: MusicianModel,
    filter: { _id: { $in: musicianIds } },
    limit: fetchLimit,
    page,
  })
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedMusicianResponse>({ transformNestedSongs: true })
    .sortByIds(musicianIds)
    .lean<RefactorMusicianResponse>()
    .forPagination();

  return popularMusicians;
};

export const getRecentlyPlayedSongs = async (params: GetRecentlyPlayedSongsProps) => {
  const { userId, page } = params;

  const userObjId = new mongoose.Types.ObjectId(userId);

  const songIds = (
    await PlaybackModel.aggregate([
      { $match: { user: userObjId } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$song", lastPlayed: { $first: "$createdAt" } } },
      { $sort: { lastPlayed: -1 } },
      { $project: { _id: 1 } },
    ])
  ).map((doc) => doc._id);

  const recentlyPlayedSongs = await getPaginatedDocs({
    model: SongModel,
    filter: { _id: { $in: songIds } },
    limit: fetchLimit,
    page,
  })
    .populateSongDetails()
    .refactorSongFields()
    .sortByIds(songIds)
    .lean()
    .forPagination();

  return recentlyPlayedSongs;
};

export const getRecommendedSongs = async (params: GetRecommendedSongsProps) => {
  const { page, songIds } = params;

  let findQuery: FilterQuery<SongDocument> = {};

  if (songIds) {
    const features = await collectDocumentAttributes({
      model: SongModel,
      ids: songIds,
      fields: ["genres", "tags", "languages"],
    });

    findQuery._id = { $nin: songIds };
    findQuery.$or = [
      { genres: { $in: features.genres } },
      { tags: { $in: features.tags } },
      { languages: { $in: features.languages } },
    ];
  }

  const recommendedSongs = await getPaginatedDocs({
    model: SongModel,
    filter: findQuery,
    limit: fetchLimit,
    page,
  })
    .sort({ "activities.totalPlaybackCount": -1 })
    .populateSongDetails()
    .refactorSongFields<PopulatedSongResponse>()
    .lean<RefactorSongResponse[]>()
    .forPagination();

  return recommendedSongs;
};

export const getRecommendedAlbums = async (params: GetRecommendedAlbumsProps) => {
  const { page, songIds } = params;

  let pipeline: any[] = [];

  if (songIds) {
    const features = await collectDocumentAttributes({
      model: SongModel,
      ids: songIds || [],
      fields: ["genres", "tags", "languages"],
    });

    pipeline.push({
      $match: {
        _id: { $nin: songIds },
        album: { $ne: null },
        $or: [
          { genres: { $in: features.genres } },
          { tags: { $in: features.tags } },
          { languages: { $in: features.languages } },
        ],
      },
    });
  } else {
    pipeline.push({
      $match: { album: { $ne: null } },
    });
  }

  const albumIds =
    (
      await SongModel.aggregate([
        ...pipeline,
        {
          $lookup: {
            from: "songs",
            localField: "songs",
            foreignField: "_id",
            as: "songDocs",
          },
        },
        { $addFields: { totalPlaybackCount: { $sum: "$songDocs.activities.totalPlaybackCount" } } },
        { $sort: { totalPlaybackCount: -1 } },
        { $group: { _id: null, albumIds: { $addToSet: "$album" } } },
      ])
    )[0]?.albumIds || [];

  const recommendedAlbums = await getPaginatedDocs({
    model: AlbumModel,
    filter: { _id: { $in: albumIds } },
    limit: fetchLimit,
    page,
  })
    .populate({ path: "artists", select: "name", transform: (doc: Musician) => doc.name })
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedAlbumResponse>({ transformNestedSongs: true })
    .sortByIds(albumIds)
    .lean<RefactorAlbumResponse>()
    .forPagination();

  return recommendedAlbums;
};

export const getRecommendedLabels = async (params: GetRecommendedLabelsProps) => {
  const { type, page } = params;

  const labelIds = await LabelModel.aggregate([
    { $match: { type, songs: { $ne: [] } } },
    {
      $lookup: {
        from: "songs",
        localField: "songs",
        foreignField: "_id",
        as: "songDocs",
      },
    },
    { $addFields: { totalPlaybackCount: { $sum: "$songDocs.activities.totalPlaybackCount" } } },
    { $sort: { totalPlaybackCount: -1, follower: -1 } },
    { $project: { _id: 1 } },
  ]);

  const recommendedLabels = await getPaginatedDocs({
    model: LabelModel,
    filter: { _id: { $in: labelIds } },
    limit: fetchLimit,
    page,
  })
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedSearchLabelResponse>({ transformNestedSongs: true })
    .lean<RefactorSearchLabelResponse>()
    .forPagination();

  return recommendedLabels;
};
