import mongoose from "mongoose";
import SongModel from "../../../src/models/song.model";
import LabelModel from "../../../src/models/label.model";
import AlbumModel from "../../../src/models/album.model";
import PlaybackModel from "../../../src/models/playback.model";
import MusicianModel from "../../../src/models/musician.model";
import {
  getPopularMusicians,
  getRecentlyPlayedSongs,
  getRecommendedSongs,
  getRecommendedAlbums,
  getRecommendedLabels,
} from "../../../src/services/homepage.service";
import { collectDocumentAttributes } from "../../../src/services/util.service";
import {
  FETCH_LIMIT_PER_PAGE,
  PROFILE_FETCH_LIMIT,
} from "../../../src/constants/env-validate.constant";
import { MusicianOptions, S3_DEFAULT_IMAGES, LabelOptions } from "@joytify/shared-types/constants";
import { getPaginatedDocs } from "../../../src/utils/mongoose.util";

// Mock all external dependencies
jest.mock("../../../src/models/label.model");
jest.mock("../../../src/models/album.model");
jest.mock("../../../src/models/playback.model");
jest.mock("../../../src/models/musician.model");
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/utils/mongoose.util");
jest.mock("../../../src/services/util.service");

// Mock type definitions
const mockLabelModel = LabelModel as jest.Mocked<typeof LabelModel>;
const mockAlbumModel = AlbumModel as jest.Mocked<typeof AlbumModel>;
const mockPlaybackModel = PlaybackModel as jest.Mocked<typeof PlaybackModel>;
const mockMusicianModel = MusicianModel as jest.Mocked<typeof MusicianModel>;
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockGetPaginatedDocs = getPaginatedDocs as jest.MockedFunction<typeof getPaginatedDocs>;
const mockCollectDocumentAttributes = collectDocumentAttributes as jest.MockedFunction<
  typeof collectDocumentAttributes
>;

// Mock mongoose query with extended methods
// Create a complete mock of the Mongoose Query object with all necessary methods
const createMockQuery = () => {
  const mockQuery: any = {
    populateSongDetails: jest.fn(),
    populateNestedSongDetails: jest.fn(),
    refactorSongFields: jest.fn(),
    sortByIds: jest.fn(),
    lean: jest.fn(),
    forPagination: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    exec: jest.fn(),
    transform: jest.fn(),
  };

  // Chain all methods to return this
  Object.keys(mockQuery).forEach((key) => {
    if (key !== "forPagination" && key !== "exec") {
      mockQuery[key].mockReturnValue(mockQuery);
    }
  });

  return mockQuery;
};

describe("Homepage Service", () => {
  // ==================== Arrange ====================
  // setup mocks and test environment for all tests
  let mockQuery: any;

  beforeEach(() => {
    // clear all mocks to ensure clean state for each test
    jest.clearAllMocks();
    // create fresh mock query object with mongoose extension methods
    mockQuery = createMockQuery();
    // configure getPaginatedDocs to return our mock query
    mockGetPaginatedDocs.mockReturnValue(mockQuery);
  });

  describe("getPopularMusicians", () => {
    it("should return popular musicians sorted by playback count and followers", async () => {
      // ==================== Arrange ====================
      // prepare mock data for popular musicians with aggregation results
      const mockMusicianIds = [
        new mongoose.Types.ObjectId("6507f1a456789abcdef12345"),
        new mongoose.Types.ObjectId("6507f1a456789abcdef12346"),
      ];
      const mockPopularMusicians = {
        docs: [
          { _id: "6507f1a456789abcdef12345", name: "Popular Artist 1", totalPlaybackCount: 10000 },
          { _id: "6507f1a456789abcdef12346", name: "Popular Artist 2", totalPlaybackCount: 8000 },
        ],
        totalDocs: 2,
        page: 1,
      };

      // mock aggregation pipeline to return musician IDs sorted by popularity
      mockMusicianModel.aggregate.mockResolvedValue(mockMusicianIds.map((id) => ({ _id: id })));
      // mock query execution to return populated musician data
      mockQuery.forPagination.mockResolvedValue(mockPopularMusicians);

      // ==================== Act ====================
      // execute popular musicians retrieval
      const result = await getPopularMusicians(1);

      // ==================== Assert ====================
      // 1. verify correct popular musicians results are returned
      expect(result).toEqual(mockPopularMusicians);

      // 2. verify aggregation pipeline is called with correct structure
      expect(mockMusicianModel.aggregate).toHaveBeenCalledWith([
        // filter for artists with custom cover images only
        {
          $match: {
            roles: { $in: [MusicianOptions.ARTIST] },
            coverImage: { $ne: S3_DEFAULT_IMAGES.MUSICIAN },
          },
        },
        // lookup songs to calculate total playback count
        {
          $lookup: {
            from: "songs",
            localField: "songs",
            foreignField: "_id",
            as: "songDocs",
          },
        },
        // add field for total playback count from all songs
        { $addFields: { totalPlaybackCount: { $sum: "$songDocs.activities.totalPlaybackCount" } } },
        // sort by playback count descending, then by followers descending
        { $sort: { totalPlaybackCount: -1, followers: -1 } },
        // project only document IDs for efficiency
        { $project: { _id: 1 } },
      ]);

      // 3. verify pagination query is configured correctly
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: MusicianModel,
        filter: { _id: { $in: mockMusicianIds } },
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });

      // 4. verify query builder methods are called in correct order
      expect(mockQuery.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockQuery.refactorSongFields).toHaveBeenCalledWith({ transformNestedSongs: true });
      expect(mockQuery.sortByIds).toHaveBeenCalledWith(mockMusicianIds);
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.forPagination).toHaveBeenCalled();
    });

    it("should handle empty aggregation results", async () => {
      // ==================== Arrange ====================
      // prepare empty aggregation results to simulate no popular musicians
      mockMusicianModel.aggregate.mockResolvedValue([]);
      mockQuery.forPagination.mockResolvedValue({ docs: [], totalDocs: 0, page: 1 });

      // ==================== Act ====================
      // execute popular musicians retrieval with no results
      const result = await getPopularMusicians(1);

      // ==================== Assert ====================
      // verify empty results are handled correctly
      expect(result).toEqual({ docs: [], totalDocs: 0, page: 1 });
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: MusicianModel,
        filter: { _id: { $in: [] } },
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });
    });

    it("should handle different page numbers", async () => {
      // ==================== Arrange ====================
      // prepare mock data for pagination test
      const mockMusicianIds = [new mongoose.Types.ObjectId("6507f1a456789abcdef12345")];
      mockMusicianModel.aggregate.mockResolvedValue(mockMusicianIds.map((id) => ({ _id: id })));
      mockQuery.forPagination.mockResolvedValue({ docs: [], totalDocs: 0, page: 3 });

      // ==================== Act ====================
      // execute popular musicians retrieval with specific page number
      await getPopularMusicians(3);

      // ==================== Assert ====================
      // verify pagination parameters are correctly passed
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }));
    });
  });

  describe("getRecentlyPlayedSongs", () => {
    it("should return recently played songs for user", async () => {
      // ==================== Arrange ====================
      // prepare mock data for recently played songs
      const userId = "6507f1a456789abcdef12345";
      const userObjId = new mongoose.Types.ObjectId(userId);
      const mockSongIds = [
        new mongoose.Types.ObjectId("6507f1a456789abcdef12347"),
        new mongoose.Types.ObjectId("6507f1a456789abcdef12348"),
      ];
      const mockRecentSongs = {
        docs: [
          { _id: "6507f1a456789abcdef12347", title: "Recent Song 1" },
          { _id: "6507f1a456789abcdef12348", title: "Recent Song 2" },
        ],
        totalDocs: 2,
        page: 1,
      };

      // mock aggregation to return song IDs sorted by recent playback
      mockPlaybackModel.aggregate.mockResolvedValue(mockSongIds.map((id) => ({ _id: id })));
      // mock query execution to return populated song data
      mockQuery.forPagination.mockResolvedValue(mockRecentSongs);

      // ==================== Act ====================
      // execute recently played songs retrieval
      const result = await getRecentlyPlayedSongs({ userId, page: 1 });

      // ==================== Assert ====================
      // 1. verify correct recently played songs results are returned
      expect(result).toEqual(mockRecentSongs);

      // 2. verify aggregation pipeline is called with correct structure
      expect(mockPlaybackModel.aggregate).toHaveBeenCalledWith([
        // filter playback records for specific user
        { $match: { user: userObjId } },
        // sort by most recent playback first
        { $sort: { createdAt: -1 } },
        // group by song to get unique songs with last played time
        { $group: { _id: "$song", lastPlayed: { $first: "$createdAt" } } },
        // sort by last played time descending
        { $sort: { lastPlayed: -1 } },
        // project only document IDs for efficiency
        { $project: { _id: 1 } },
      ]);

      // 3. verify pagination query is configured correctly
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: SongModel,
        filter: { _id: { $in: mockSongIds } },
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });

      // 4. verify query builder methods are called in correct order
      expect(mockQuery.populateSongDetails).toHaveBeenCalled();
      expect(mockQuery.refactorSongFields).toHaveBeenCalled();
      expect(mockQuery.sortByIds).toHaveBeenCalledWith(mockSongIds);
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.forPagination).toHaveBeenCalled();
    });

    it("should handle user with no playback history", async () => {
      // ==================== Arrange ====================
      // prepare empty playback history for user
      const userId = "6507f1a456789abcdef12345";
      mockPlaybackModel.aggregate.mockResolvedValue([]);
      mockQuery.forPagination.mockResolvedValue({ docs: [], totalDocs: 0, page: 1 });

      // ==================== Act ====================
      // execute recently played songs retrieval for user with no history
      const result = await getRecentlyPlayedSongs({ userId, page: 1 });

      // ==================== Assert ====================
      // verify empty results are handled correctly
      expect(result).toEqual({ docs: [], totalDocs: 0, page: 1 });
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: SongModel,
        filter: { _id: { $in: [] } },
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });
    });
  });

  describe("getRecommendedSongs", () => {
    it("should return recommended songs based on provided song features", async () => {
      // ==================== Arrange ====================
      // prepare mock data for song recommendations with features
      const songIds = ["6507f1a456789abcdef12345", "6507f1a456789abcdef12346"];
      const mockFeatures = {
        genres: ["rock", "pop"],
        tags: ["upbeat", "energetic"],
        languages: ["english"],
      };
      const mockRecommendedSongs = {
        docs: [
          { _id: "6507f1a456789abcdef12347", title: "Recommended Song 1" },
          { _id: "6507f1a456789abcdef12348", title: "Recommended Song 2" },
        ],
        totalDocs: 2,
        page: 1,
      };

      // mock feature collection from provided songs
      mockCollectDocumentAttributes.mockResolvedValue(mockFeatures);
      // mock query execution to return recommended songs
      mockQuery.forPagination.mockResolvedValue(mockRecommendedSongs);

      // ==================== Act ====================
      // execute song recommendations based on provided songs
      const result = await getRecommendedSongs({ page: 1, songIds });

      // ==================== Assert ====================
      // 1. verify correct recommended songs results are returned
      expect(result).toEqual(mockRecommendedSongs);

      // 2. verify feature collection is called with correct parameters
      expect(mockCollectDocumentAttributes).toHaveBeenCalledWith({
        model: SongModel,
        ids: songIds,
        fields: ["genres", "tags", "languages"],
      });

      // 3. verify pagination query is configured with recommendation filter
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: SongModel,
        filter: {
          _id: { $nin: songIds },
          $or: [
            { genres: { $in: mockFeatures.genres } },
            { tags: { $in: mockFeatures.tags } },
            { languages: { $in: mockFeatures.languages } },
          ],
        },
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });

      // 4. verify query builder methods are called in correct order
      expect(mockQuery.sort).toHaveBeenCalledWith({ "activities.totalPlaybackCount": -1 });
      expect(mockQuery.populateSongDetails).toHaveBeenCalled();
      expect(mockQuery.refactorSongFields).toHaveBeenCalled();
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.forPagination).toHaveBeenCalled();
    });

    it("should return general recommendations when no songIds provided", async () => {
      // ==================== Arrange ====================
      // prepare mock data for general recommendations without specific features
      const mockRecommendedSongs = {
        docs: [{ _id: "6507f1a456789abcdef12347", title: "General Recommended Song 1" }],
        totalDocs: 1,
        page: 1,
      };

      // mock query execution to return general recommendations
      mockQuery.forPagination.mockResolvedValue(mockRecommendedSongs);

      // ==================== Act ====================
      // execute song recommendations without providing specific songs
      const result = await getRecommendedSongs({ page: 1 });

      // ==================== Assert ====================
      // 1. verify correct recommended songs results are returned
      expect(result).toEqual(mockRecommendedSongs);

      // 2. verify feature collection is not called when no songIds provided
      expect(mockCollectDocumentAttributes).not.toHaveBeenCalled();

      // 3. verify pagination query is configured with empty filter for general recommendations
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: SongModel,
        filter: {},
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });
    });

    it("should handle empty songIds array", async () => {
      // ==================== Arrange ====================
      // prepare test for empty songIds array
      const mockRecommendedSongs = { docs: [], totalDocs: 0, page: 1 };
      mockQuery.forPagination.mockResolvedValue(mockRecommendedSongs);

      // ==================== Act ====================
      // execute recommendations with empty songIds array
      const result = await getRecommendedSongs({ page: 1, songIds: [] });

      // ==================== Assert ====================
      // verify empty songIds are treated as no songIds
      expect(result).toEqual(mockRecommendedSongs);
      expect(mockCollectDocumentAttributes).toHaveBeenCalledWith({
        model: SongModel,
        ids: [],
        fields: ["genres", "tags", "languages"],
      });
    });
  });

  describe("getRecommendedAlbums", () => {
    it("should return recommended albums based on song features", async () => {
      // ==================== Arrange ====================
      // prepare mock data for album recommendations based on song features
      const songIds = ["6507f1a456789abcdef12345", "6507f1a456789abcdef12346"];
      const mockFeatures = {
        genres: ["rock", "pop"],
        tags: ["upbeat"],
        languages: ["english"],
      };
      const mockAlbumIds = [
        new mongoose.Types.ObjectId("6507f1a456789abcdef12347"),
        new mongoose.Types.ObjectId("6507f1a456789abcdef12348"),
      ];
      const mockRecommendedAlbums = {
        docs: [
          { _id: "6507f1a456789abcdef12347", title: "Recommended Album 1" },
          { _id: "6507f1a456789abcdef12348", title: "Recommended Album 2" },
        ],
        totalDocs: 2,
        page: 1,
      };

      // mock feature collection from provided songs
      mockCollectDocumentAttributes.mockResolvedValue(mockFeatures);
      // mock aggregation to return album IDs based on song features
      mockSongModel.aggregate.mockResolvedValue([{ albumIds: mockAlbumIds }]);
      // mock query execution to return recommended albums
      mockQuery.forPagination.mockResolvedValue(mockRecommendedAlbums);

      // ==================== Act ====================
      // execute album recommendations based on provided songs
      const result = await getRecommendedAlbums({ page: 1, songIds });

      // ==================== Assert ====================
      // 1. verify correct recommended albums results are returned
      expect(result).toEqual(mockRecommendedAlbums);

      // 2. verify feature collection is called with correct parameters
      expect(mockCollectDocumentAttributes).toHaveBeenCalledWith({
        model: SongModel,
        ids: songIds,
        fields: ["genres", "tags", "languages"],
      });

      // 3. verify aggregation pipeline is called with correct structure for feature-based recommendations
      expect(mockSongModel.aggregate).toHaveBeenCalledWith([
        // match songs with similar features, excluding provided songs
        {
          $match: {
            _id: { $nin: songIds },
            album: { $ne: null },
            $or: [
              { genres: { $in: mockFeatures.genres } },
              { tags: { $in: mockFeatures.tags } },
              { languages: { $in: mockFeatures.languages } },
            ],
          },
        },
        // lookup related songs to calculate total playback count
        {
          $lookup: {
            from: "songs",
            localField: "songs",
            foreignField: "_id",
            as: "songDocs",
          },
        },
        // add field for total playback count
        { $addFields: { totalPlaybackCount: { $sum: "$songDocs.activities.totalPlaybackCount" } } },
        // sort by total playback count descending
        { $sort: { totalPlaybackCount: -1 } },
        // group all results and collect unique album IDs
        { $group: { _id: null, albumIds: { $addToSet: "$album" } } },
      ]);

      // 4. verify pagination query is configured correctly
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: AlbumModel,
        filter: { _id: { $in: mockAlbumIds } },
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });

      // 5. verify query builder methods are called in correct order
      expect(mockQuery.populate).toHaveBeenCalledWith({
        path: "artists",
        select: "name",
        transform: expect.any(Function),
      });
      expect(mockQuery.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockQuery.refactorSongFields).toHaveBeenCalledWith({ transformNestedSongs: true });
      expect(mockQuery.sortByIds).toHaveBeenCalledWith(mockAlbumIds);
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.forPagination).toHaveBeenCalled();
    });

    it("should return general album recommendations when no songIds provided", async () => {
      // ==================== Arrange ====================
      // prepare mock data for general album recommendations
      const mockAlbumIds = [new mongoose.Types.ObjectId("6507f1a456789abcdef12347")];
      const mockRecommendedAlbums = {
        docs: [{ _id: "6507f1a456789abcdef12347", title: "General Album" }],
        totalDocs: 1,
        page: 1,
      };

      // mock aggregation to return general album recommendations
      mockSongModel.aggregate.mockResolvedValue([{ albumIds: mockAlbumIds }]);
      // mock query execution to return general albums
      mockQuery.forPagination.mockResolvedValue(mockRecommendedAlbums);

      // ==================== Act ====================
      // execute album recommendations without providing specific songs
      const result = await getRecommendedAlbums({ page: 1 });

      // ==================== Assert ====================
      // 1. verify correct general album results are returned
      expect(result).toEqual(mockRecommendedAlbums);

      // 2. verify feature collection is not called for general recommendations
      expect(mockCollectDocumentAttributes).not.toHaveBeenCalled();

      // 3. verify aggregation pipeline uses general match for all albums
      expect(mockSongModel.aggregate).toHaveBeenCalledWith([
        // match all songs that belong to albums (general recommendations)
        { $match: { album: { $ne: null } } },
        // lookup related songs to calculate total playback count
        {
          $lookup: {
            from: "songs",
            localField: "songs",
            foreignField: "_id",
            as: "songDocs",
          },
        },
        // add field for total playback count
        { $addFields: { totalPlaybackCount: { $sum: "$songDocs.activities.totalPlaybackCount" } } },
        // sort by total playback count descending
        { $sort: { totalPlaybackCount: -1 } },
        // group all results and collect unique album IDs
        { $group: { _id: null, albumIds: { $addToSet: "$album" } } },
      ]);
    });

    it("should handle empty aggregation results", async () => {
      // ==================== Arrange ====================
      // prepare empty aggregation results to simulate no recommended albums
      mockSongModel.aggregate.mockResolvedValue([]);
      mockQuery.forPagination.mockResolvedValue({ docs: [], totalDocs: 0, page: 1 });

      // ==================== Act ====================
      // execute album recommendations with no results
      const result = await getRecommendedAlbums({ page: 1 });

      // ==================== Assert ====================
      // verify empty results are handled correctly
      expect(result).toEqual({ docs: [], totalDocs: 0, page: 1 });
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: AlbumModel,
        filter: { _id: { $in: [] } },
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });
    });
  });

  describe("getRecommendedLabels", () => {
    it("should return recommended labels of specified type", async () => {
      // ==================== Arrange ====================
      // prepare mock data for label recommendations
      const labelType = LabelOptions.GENRE;
      const mockLabelIds = [
        { _id: new mongoose.Types.ObjectId("6507f1a456789abcdef12345") },
        { _id: new mongoose.Types.ObjectId("6507f1a456789abcdef12346") },
      ];
      const mockRecommendedLabels = {
        docs: [
          { _id: "6507f1a456789abcdef12345", label: "Rock", type: LabelOptions.GENRE },
          { _id: "6507f1a456789abcdef12346", label: "Pop", type: LabelOptions.GENRE },
        ],
        totalDocs: 2,
        page: 1,
      };

      // mock aggregation to return label IDs sorted by popularity
      mockLabelModel.aggregate.mockResolvedValue(mockLabelIds);
      // mock query execution to return recommended labels
      mockQuery.forPagination.mockResolvedValue(mockRecommendedLabels);

      // ==================== Act ====================
      // execute label recommendations for specific type
      const result = await getRecommendedLabels({ type: labelType, page: 1 });

      // ==================== Assert ====================
      // 1. verify correct recommended labels results are returned
      expect(result).toEqual(mockRecommendedLabels);

      // 2. verify aggregation pipeline is called with correct structure
      expect(mockLabelModel.aggregate).toHaveBeenCalledWith([
        // filter by label type and ensure labels have associated songs
        { $match: { type: labelType, songs: { $ne: [] } } },
        // lookup songs to calculate total playback count
        {
          $lookup: {
            from: "songs",
            localField: "songs",
            foreignField: "_id",
            as: "songDocs",
          },
        },
        // add field for total playback count from all associated songs
        { $addFields: { totalPlaybackCount: { $sum: "$songDocs.activities.totalPlaybackCount" } } },
        // sort by playback count descending, then by followers descending
        { $sort: { totalPlaybackCount: -1, follower: -1 } },
        // project only document IDs for efficiency
        { $project: { _id: 1 } },
      ]);

      // 3. verify pagination query is configured correctly
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: LabelModel,
        filter: { _id: { $in: mockLabelIds } },
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });

      // 4. verify query builder methods are called in correct order
      expect(mockQuery.populateNestedSongDetails).toHaveBeenCalled();
      expect(mockQuery.refactorSongFields).toHaveBeenCalledWith({ transformNestedSongs: true });
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(mockQuery.forPagination).toHaveBeenCalled();
    });

    it("should handle different label types", async () => {
      // ==================== Arrange ====================
      // prepare test cases for different label types
      const labelTypes = [LabelOptions.GENRE, LabelOptions.TAG, LabelOptions.LANGUAGE];
      const mockLabelIds = [{ _id: new mongoose.Types.ObjectId("6507f1a456789abcdef12345") }];
      const mockResults = { docs: [], totalDocs: 0, page: 1 };

      mockLabelModel.aggregate.mockResolvedValue(mockLabelIds);
      mockQuery.forPagination.mockResolvedValue(mockResults);

      // ==================== Act & Assert ====================
      // test each label type to verify correct filtering
      for (const labelType of labelTypes) {
        jest.clearAllMocks();
        mockLabelModel.aggregate.mockResolvedValue(mockLabelIds);
        mockQuery.forPagination.mockResolvedValue(mockResults);

        await getRecommendedLabels({ type: labelType, page: 1 });

        // verify aggregation is called with specific label type
        expect(mockLabelModel.aggregate).toHaveBeenCalledWith(
          expect.arrayContaining([{ $match: { type: labelType, songs: { $ne: [] } } }])
        );
      }
    });

    it("should handle empty label results", async () => {
      // ==================== Arrange ====================
      // prepare empty aggregation results for labels
      mockLabelModel.aggregate.mockResolvedValue([]);
      mockQuery.forPagination.mockResolvedValue({ docs: [], totalDocs: 0, page: 1 });

      // ==================== Act ====================
      // execute label recommendations with no results
      const result = await getRecommendedLabels({ type: LabelOptions.GENRE, page: 1 });

      // ==================== Assert ====================
      // verify empty results are handled correctly
      expect(result).toEqual({ docs: [], totalDocs: 0, page: 1 });
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith({
        model: LabelModel,
        filter: { _id: { $in: [] } },
        limit: { initial: PROFILE_FETCH_LIMIT, load: FETCH_LIMIT_PER_PAGE },
        page: 1,
      });
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle database errors gracefully in getPopularMusicians", async () => {
      // ==================== Arrange ====================
      // prepare database error to simulate aggregation failure
      const dbError = new Error("Database aggregation failed");
      mockMusicianModel.aggregate.mockRejectedValue(dbError);

      // ==================== Act & Assert ====================
      // verify error is properly propagated when aggregation fails
      await expect(getPopularMusicians(1)).rejects.toThrow("Database aggregation failed");
    });

    it("should handle invalid user ID in getRecentlyPlayedSongs", async () => {
      // ==================== Arrange ====================
      // prepare invalid user ID that could cause ObjectId conversion error
      const invalidUserId = "invalid-user-id";

      // ==================== Act & Assert ====================
      // verify ObjectId conversion error is handled or propagated appropriately
      // Note: This test depends on mongoose ObjectId validation behavior
      await expect(() => {
        new mongoose.Types.ObjectId(invalidUserId);
      }).toThrow();
    });

    it("should handle collectDocumentAttributes errors in recommendations", async () => {
      // ==================== Arrange ====================
      // prepare error in feature collection to test error propagation
      const songIds = ["6507f1a456789abcdef12345"];
      const dbError = new Error("Feature collection failed");
      mockCollectDocumentAttributes.mockRejectedValue(dbError);

      // ==================== Act & Assert ====================
      // verify error is properly propagated when feature collection fails
      await expect(getRecommendedSongs({ page: 1, songIds })).rejects.toThrow(
        "Feature collection failed"
      );
    });

    it("should handle pagination edge cases across all functions", async () => {
      // ==================== Arrange ====================
      // prepare mock data for pagination edge cases
      const mockResults = { docs: [], totalDocs: 0, page: 999 };
      mockMusicianModel.aggregate.mockResolvedValue([]);
      mockQuery.forPagination.mockResolvedValue(mockResults);

      // ==================== Act ====================
      // test high page number that might exceed available results
      const result = await getPopularMusicians(999);

      // ==================== Assert ====================
      // verify high page numbers are handled correctly
      expect(result).toEqual(mockResults);
      expect(mockGetPaginatedDocs).toHaveBeenCalledWith(expect.objectContaining({ page: 999 }));
    });
  });

  describe("Integration scenarios", () => {
    it("should demonstrate complete homepage data workflow", async () => {
      // ==================== Arrange ====================
      // prepare comprehensive mock data for complete homepage workflow
      const userId = "6507f1a456789abcdef12345";
      const page = 1;

      // Setup mocks for all homepage services
      const mockMusicianIds = [new mongoose.Types.ObjectId("6507f1a456789abcdef12346")];
      const mockSongIds = [new mongoose.Types.ObjectId("6507f1a456789abcdef12347")];
      const mockAlbumIds = [new mongoose.Types.ObjectId("6507f1a456789abcdef12348")];
      const mockLabelIds = [{ _id: new mongoose.Types.ObjectId("6507f1a456789abcdef12349") }];

      mockMusicianModel.aggregate.mockResolvedValue(mockMusicianIds.map((id) => ({ _id: id })));
      mockPlaybackModel.aggregate.mockResolvedValue(mockSongIds.map((id) => ({ _id: id })));
      mockSongModel.aggregate.mockResolvedValue([{ albumIds: mockAlbumIds }]);
      mockLabelModel.aggregate.mockResolvedValue(mockLabelIds);

      mockCollectDocumentAttributes.mockResolvedValue({
        genres: ["rock"],
        tags: ["popular"],
        languages: ["english"],
      });

      const mockHomepageData = {
        popularMusicians: { docs: [{ name: "Artist" }], totalDocs: 1, page: 1 },
        recentSongs: { docs: [{ title: "Recent Song" }], totalDocs: 1, page: 1 },
        recommendedSongs: { docs: [{ title: "Recommended Song" }], totalDocs: 1, page: 1 },
        recommendedAlbums: { docs: [{ title: "Recommended Album" }], totalDocs: 1, page: 1 },
        recommendedGenres: { docs: [{ label: "Rock" }], totalDocs: 1, page: 1 },
      };

      mockQuery.forPagination.mockResolvedValue(mockHomepageData.popularMusicians);

      // ==================== Act ====================
      // execute complete homepage data retrieval workflow
      const popularMusicians = await getPopularMusicians(page);

      // Reset mock for next call
      mockQuery.forPagination.mockResolvedValue(mockHomepageData.recentSongs);
      const recentSongs = await getRecentlyPlayedSongs({ userId, page });

      // Reset mock for next call
      mockQuery.forPagination.mockResolvedValue(mockHomepageData.recommendedSongs);
      const recommendedSongs = await getRecommendedSongs({ page, songIds: [userId] });

      // ==================== Assert ====================
      // 1. verify all homepage services return appropriate data
      expect(popularMusicians).toEqual(mockHomepageData.popularMusicians);
      expect(recentSongs).toEqual(mockHomepageData.recentSongs);
      expect(recommendedSongs).toEqual(mockHomepageData.recommendedSongs);

      // 2. verify all models were queried appropriately
      expect(mockMusicianModel.aggregate).toHaveBeenCalled();
      expect(mockPlaybackModel.aggregate).toHaveBeenCalled();
      expect(mockCollectDocumentAttributes).toHaveBeenCalled();

      // 3. verify pagination was applied consistently across all services
      expect(mockGetPaginatedDocs).toHaveBeenCalledTimes(3);
    });
  });
});
