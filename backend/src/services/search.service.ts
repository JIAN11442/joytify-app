import { FilterQuery } from "mongoose";
import SongModel from "../models/song.model";
import AlbumModel from "../models/album.model";
import LabelModel from "../models/label.model";
import MusicianModel from "../models/musician.model";
import { FETCH_LIMIT_PER_PAGE, PROFILE_FETCH_LIMIT } from "../constants/env-validate.constant";
import { LabelOptions, SearchFilterOptions } from "@joytify/types/constants";
import {
  LabelOptionsType,
  Musician,
  PopulatedAlbumResponse,
  PopulatedMusicianResponse,
  PopulatedSearchLabelResponse,
  RefactorAlbumResponse,
  RefactorMusicianResponse,
  RefactorSearchLabelResponse,
  RefactorSongResponse,
} from "@joytify/types/types";
import { getPaginatedDocs } from "../utils/mongoose.util";

const { ALL, SONGS, MUSICIANS, ALBUMS, GENRES_AND_TAGS, LANGUAGES } = SearchFilterOptions;
const { GENRE, LANGUAGE, TAG } = LabelOptions;

type SearchContentByType = {
  type: SearchFilterOptions;
  query: string;
  page: number;
};

type FindItemsByQuery = {
  query: string;
  page: number;
  pagination: boolean;
  fetchLimit?: { initial: number; load: number };
};

interface FindItemsByTypeAndQuery extends FindItemsByQuery {
  types: LabelOptionsType[];
}

const defaultFetchLimit = {
  initial: FETCH_LIMIT_PER_PAGE,
  load: FETCH_LIMIT_PER_PAGE,
};

const profileFetchLimit = {
  initial: PROFILE_FETCH_LIMIT,
  load: FETCH_LIMIT_PER_PAGE,
};

const createMatchQuery = <T>(query: string): FilterQuery<T> => ({
  // $regex: `^${query}`,
  $regex: query,
  $options: "i",
});

// find songs by query
const findSongsByQuery = async (params: FindItemsByQuery) => {
  const { query, page, pagination, fetchLimit } = params;

  const matchQuery = createMatchQuery(query);

  const filteredIds = await SongModel.aggregate([
    {
      $lookup: {
        from: "musicians",
        localField: "artist",
        foreignField: "_id",
        as: "artistDoc",
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    {
      $lookup: {
        from: "albums",
        localField: "album",
        foreignField: "_id",
        as: "albumDoc",
        pipeline: [{ $project: { title: 1 } }],
      },
    },
    {
      $lookup: {
        from: "labels",
        let: { labelIds: { $setUnion: ["$genres", "$tags", "$languages"] } },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$labelIds"] } } },
          { $project: { label: 1 } },
        ],
        as: "labelDocs",
      },
    },
    {
      $match: {
        $or: [
          { title: matchQuery },
          { "artistDoc.name": matchQuery },
          { "albumDoc.title": matchQuery },
          { "labelDocs.label": matchQuery },
        ],
      },
    },
    { $project: { _id: 1 } },
  ]);

  const queryBuilder = getPaginatedDocs({
    model: SongModel,
    filter: { _id: { $in: filteredIds } },
    limit: fetchLimit ?? defaultFetchLimit,
    page,
  })
    .populateSongDetails()
    .refactorSongFields()
    .lean<RefactorSongResponse[]>();

  const songs = pagination ? await queryBuilder.forPagination(page) : await queryBuilder;

  return songs;
};

// find musicians by query
const findMusiciansByQuery = async (params: FindItemsByQuery) => {
  const { query, page, pagination, fetchLimit } = params;
  const matchQuery = createMatchQuery(query);

  const filteredIds = await MusicianModel.aggregate([
    {
      $lookup: {
        from: "songs",
        localField: "songs",
        foreignField: "_id",
        as: "songDocs",
        pipeline: [
          {
            $lookup: {
              from: "labels",
              let: { labelIds: { $setUnion: ["$genres", "$tags", "$languages"] } },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$labelIds"] } } },
                { $project: { label: 1 } },
              ],
              as: "labelDocs",
            },
          },
          { $project: { title: 1, labelDocs: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: "albums",
        localField: "albums",
        foreignField: "_id",
        as: "albumDocs",
        pipeline: [{ $project: { title: 1 } }],
      },
    },
    {
      $match: {
        $or: [
          { name: matchQuery },
          { "songDocs.title": matchQuery },
          { "songDocs.labelDocs.label": matchQuery },
          { "albumDocs.title": matchQuery },
        ],
      },
    },
    { $project: { _id: 1 } },
  ]);

  const queryBuilder = getPaginatedDocs({
    model: MusicianModel,
    filter: { _id: { $in: filteredIds } },
    limit: fetchLimit ?? defaultFetchLimit,
    page,
  })
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedMusicianResponse>({ transformNestedSongs: true })
    .lean<RefactorMusicianResponse>();

  const artists = pagination ? await queryBuilder.forPagination(page) : await queryBuilder;

  return artists;
};

// find albums by query
const findAlbumsByQuery = async (params: FindItemsByQuery) => {
  const { query, page, pagination, fetchLimit } = params;
  const matchQuery = createMatchQuery(query);

  const filteredIds = await AlbumModel.aggregate([
    {
      $lookup: {
        from: "musicians",
        localField: "artists",
        foreignField: "_id",
        as: "artistDocs",
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    {
      $lookup: {
        from: "songs",
        localField: "songs",
        foreignField: "_id",
        as: "songDocs",
        pipeline: [
          {
            $lookup: {
              from: "labels",
              let: { labelIds: { $setUnion: ["$genres", "$tags", "$languages"] } },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$labelIds"] } } },
                { $project: { label: 1 } },
              ],
              as: "labelDocs",
            },
          },
          { $project: { title: 1, labelDocs: 1 } },
        ],
      },
    },
    {
      $match: {
        $or: [
          { title: matchQuery },
          { "artistDocs.name": matchQuery },
          { "songDocs.title": matchQuery },
          { "songDocs.labelDocs.label": matchQuery },
        ],
      },
    },
    { $project: { _id: 1 } },
  ]);

  const queryBuilder = getPaginatedDocs({
    model: AlbumModel,
    filter: { _id: { $in: filteredIds } },
    limit: fetchLimit ?? defaultFetchLimit,
    page,
  })
    .populate({ path: "artists", select: "name", transform: (doc: Musician) => doc.name })
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedAlbumResponse>({ transformNestedSongs: true })
    .lean<RefactorAlbumResponse>();

  const albums = pagination ? await queryBuilder.forPagination(page) : await queryBuilder;

  return albums;
};

// find labels by query
const findLabelsByTypeAndQuery = async (params: FindItemsByTypeAndQuery) => {
  const { types, query, page, pagination, fetchLimit } = params;
  const matchQuery = createMatchQuery(query);

  const filterLabelIds = await LabelModel.aggregate([
    { $match: { type: { $in: [...types] } } },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "authorDoc",
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    {
      $lookup: {
        from: "songs",
        localField: "songs",
        foreignField: "_id",
        as: "songDocs",
        pipeline: [
          {
            $lookup: {
              from: "musicians",
              localField: "artist",
              foreignField: "_id",
              as: "artistDoc",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          {
            $lookup: {
              from: "albums",
              localField: "album",
              foreignField: "_id",
              as: "albumDoc",
              pipeline: [{ $project: { title: 1 } }],
            },
          },
          { $project: { title: 1, artistDoc: 1, albumDoc: 1 } },
        ],
      },
    },
    {
      $match: {
        $or: [
          { label: matchQuery },
          { "authorDoc.name": matchQuery },
          { "songDocs.title": matchQuery },
          { "songDocs.artistDoc.name": matchQuery },
          { "songDocs.albumDoc.title": matchQuery },
        ],
      },
    },
    { $project: { _id: 1 } },
  ]);

  const queryBuilder = getPaginatedDocs({
    model: LabelModel,
    filter: { _id: { $in: filterLabelIds } },
    limit: fetchLimit ?? defaultFetchLimit,
    page,
  })
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedSearchLabelResponse>({ transformNestedSongs: true })
    .sort({ label: 1, createdAt: -1 })
    .lean<RefactorSearchLabelResponse>();

  const labels = pagination ? await queryBuilder.forPagination(page) : await queryBuilder;

  return labels;
};

// find all by query
const findAllByQuery = async (params: FindItemsByQuery) => {
  const { query, page, pagination } = params;

  const queryParams: FindItemsByQuery = {
    query,
    page,
    pagination,
    fetchLimit: profileFetchLimit,
  };

  const [songs, musicians, albums, genresAndTags, languages] = await Promise.all([
    findSongsByQuery(queryParams),
    findMusiciansByQuery(queryParams),
    findAlbumsByQuery(queryParams),
    findLabelsByTypeAndQuery({ types: [GENRE, TAG], ...queryParams }),
    findLabelsByTypeAndQuery({ types: [LANGUAGE], ...queryParams }),
  ]);

  return {
    songs,
    musicians,
    albums,
    genresAndTags,
    languages,
  };
};

export const searchContentByType = (params: SearchContentByType) => {
  const { type, query, page } = params;

  const queryParams = { query, page, pagination: true };

  switch (type) {
    case ALL:
      return findAllByQuery({ ...queryParams, pagination: false });

    case SONGS:
      return findSongsByQuery(queryParams);

    case MUSICIANS:
      return findMusiciansByQuery(queryParams);

    case ALBUMS:
      return findAlbumsByQuery(queryParams);

    case GENRES_AND_TAGS:
      return findLabelsByTypeAndQuery({ types: [GENRE, TAG], ...queryParams });

    case LANGUAGES:
      return findLabelsByTypeAndQuery({ types: [LANGUAGE], ...queryParams });
  }
};
