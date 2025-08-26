import mongoose from "mongoose";
import SongModel from "../../../src/models/song.model";
import PlaylistModel from "../../../src/models/playlist.model";
import {
  createNewSong,
  getAllSongs,
  getUserSongs,
  getSongById,
  getSongsByQuery,
  getRecommendedSongs,
  refreshSongPlaybackStats,
  statsUserSongs,
  updateSongInfoById,
  assignSongToPlaylists,
  deleteSongById,
} from "../../../src/services/song.service";
import { getPlaybackStatisticsBySongId } from "../../../src/services/playback.service";
import { collectDocumentAttributes } from "../../../src/services/util.service";
import { parseToFloat } from "../../../src/utils/parse-float.util";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/models/playlist.model");
jest.mock("../../../src/services/playback.service");
jest.mock("../../../src/services/util.service");
jest.mock("../../../src/utils/app-assert.util");
jest.mock("../../../src/utils/parse-float.util");

// Mock type definitions
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockPlaylistModel = PlaylistModel as jest.Mocked<typeof PlaylistModel>;
const mockGetPlaybackStatisticsBySongId = getPlaybackStatisticsBySongId as jest.MockedFunction<
  typeof getPlaybackStatisticsBySongId
>;
const mockCollectDocumentAttributes = collectDocumentAttributes as jest.MockedFunction<
  typeof collectDocumentAttributes
>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;
const mockParseToFloat = parseToFloat as jest.MockedFunction<typeof parseToFloat>;

describe("Song Service", () => {
  // Mock data constants
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockSongId = "507f1f77bcf86cd799439012";
  const mockPlaylistId = "507f1f77bcf86cd799439013";
  const mockUserObjectId = new mongoose.Types.ObjectId(mockUserId);
  const mockSongObjectId = new mongoose.Types.ObjectId(mockSongId);
  const mockPlaylistObjectId = new mongoose.Types.ObjectId(mockPlaylistId);

  const mockSong = {
    _id: mockSongObjectId,
    title: "Test Song",
    artist: "Test Artist",
    creator: mockUserObjectId,
    songUrl: "https://example.com/song.mp3",
    imageUrl: "https://example.com/image.jpg",
    duration: 180,
    genres: ["pop"],
    tags: ["happy"],
    languages: ["en"],
    playlistFor: [],
    ratings: [],
    activities: {
      totalPlaybackCount: 10,
      totalPlaybackDuration: 1800,
      weightedAveragePlaybackDuration: 180,
    },
    ownership: {
      isPlatformOwned: false,
    },
  };

  const mockPlaylist = {
    _id: mockPlaylistObjectId,
    user: mockUserObjectId,
    title: "Test Playlist",
    songs: [mockSongObjectId],
    default: false,
  };

  const mockQueryChain = {
    populateSongDetails: jest.fn().mockReturnThis(),
    refactorSongFields: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([mockSong]),
    limit: jest.fn().mockReturnThis(),
  };

  const mockSingleQueryChain = {
    populateSongDetails: jest.fn().mockReturnThis(),
    refactorSongFields: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(mockSong),
  };

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock appAssert to throw error when condition is false
    mockAppAssert.mockImplementation((condition, _statusCode, message) => {
      if (!condition) {
        throw new Error(message);
      }
    });

    // Mock parseToFloat
    mockParseToFloat.mockImplementation((value) => value);

    // Mock mongoose session
    mongoose.startSession = jest.fn().mockResolvedValue(mockSession);

    // Reset session mocks
    mockSession.startTransaction.mockClear();
    mockSession.commitTransaction.mockClear();
    mockSession.abortTransaction.mockClear();
    mockSession.endSession.mockClear();
  });

  describe("createNewSong", () => {
    it("should create new song successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songInfo: {
          title: "New Song",
          artist: "New Artist",
          songUrl: "https://example.com/new-song.mp3",
          imageUrl: "https://example.com/new-image.jpg",
          duration: 200,
          playlistFor: [],
        },
      } as any;

      mockSongModel.exists.mockResolvedValue(false);
      mockSongModel.create.mockResolvedValue(mockSong as any);

      // ==================== Act ====================
      const result = await createNewSong(params);

      // ==================== Assert Process ====================
      // 1. verify song existence check
      expect(mockSongModel.exists).toHaveBeenCalledWith({
        title: "New Song",
        artist: "New Artist",
      });

      // 2. verify song creation
      expect(mockSongModel.create).toHaveBeenCalledWith({
        title: "New Song",
        artist: "New Artist",
        creator: mockUserId,
        songUrl: "https://example.com/new-song.mp3",
        imageUrl: "https://example.com/new-image.jpg",
        duration: 200,
        playlistFor: [],
      });

      // 3. verify correct result
      expect(result).toEqual({
        song: mockSong,
      });
    });

    it("should handle song already exists error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songInfo: {
          title: "Existing Song",
          artist: "Existing Artist",
          songUrl: "https://example.com/existing-song.mp3",
        },
      } as any;

      mockSongModel.exists.mockResolvedValue(true);

      // ==================== Act & Assert ====================
      await expect(createNewSong(params)).rejects.toThrow("Song already exists");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(
        false,
        409,
        "Song already exists",
        "CreateSongError",
        null,
        ["https://example.com/existing-song.mp3"]
      );
    });

    it("should handle song creation failure", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songInfo: {
          title: "New Song",
          artist: "New Artist",
          songUrl: "https://example.com/new-song.mp3",
        },
      } as any;

      mockSongModel.exists.mockResolvedValue(false);
      mockSongModel.create.mockResolvedValue(null as any);

      // ==================== Act & Assert ====================
      await expect(createNewSong(params)).rejects.toThrow("Failed to create song");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(
        null,
        500,
        "Failed to create song",
        "CreateSongError",
        null,
        ["https://example.com/new-song.mp3"]
      );
    });
  });

  describe("getAllSongs", () => {
    it("should get all songs successfully", async () => {
      // ==================== Arrange ====================
      mockSongModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getAllSongs();

      // ==================== Assert Process ====================
      // 1. verify find was called
      expect(mockSongModel.find).toHaveBeenCalled();

      // 2. verify query chain methods were called
      expect(mockQueryChain.populateSongDetails).toHaveBeenCalled();
      expect(mockQueryChain.refactorSongFields).toHaveBeenCalled();
      expect(mockQueryChain.lean).toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        songs: [mockSong],
      });
    });
  });

  describe("getUserSongs", () => {
    it("should get user songs successfully", async () => {
      // ==================== Arrange ====================
      mockSongModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getUserSongs(mockUserId);

      // ==================== Assert Process ====================
      // 1. verify find was called with correct parameters
      expect(mockSongModel.find).toHaveBeenCalledWith({
        creator: mockUserId,
        "ownership.isPlatformOwned": false,
      });

      // 2. verify query chain methods were called
      expect(mockQueryChain.populateSongDetails).toHaveBeenCalled();
      expect(mockQueryChain.refactorSongFields).toHaveBeenCalled();
      expect(mockQueryChain.lean).toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        songs: [mockSong],
      });
    });
  });

  describe("getSongById", () => {
    it("should get song by ID successfully", async () => {
      // ==================== Arrange ====================
      mockSongModel.findOne.mockReturnValue(mockSingleQueryChain as any);

      // ==================== Act ====================
      const result = await getSongById(mockSongId);

      // ==================== Assert Process ====================
      // 1. verify findOne was called with correct parameters
      expect(mockSongModel.findOne).toHaveBeenCalledWith({
        _id: mockSongId,
      });

      // 2. verify query chain methods were called
      expect(mockSingleQueryChain.populateSongDetails).toHaveBeenCalled();
      expect(mockSingleQueryChain.refactorSongFields).toHaveBeenCalled();
      expect(mockSingleQueryChain.lean).toHaveBeenCalled();

      // 3. verify correct result
      expect(result).toEqual({
        song: mockSong,
      });
    });
  });

  describe("getSongsByQuery", () => {
    it("should get songs by query successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        query: "test",
      };

      mockSongModel.aggregate.mockResolvedValue([{ _id: mockSongObjectId }]);
      mockSongModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getSongsByQuery(params);

      // ==================== Assert Process ====================
      // 1. verify aggregate was called
      expect(mockSongModel.aggregate).toHaveBeenCalled();

      // 2. verify find was called with filtered IDs
      expect(mockSongModel.find).toHaveBeenCalledWith({
        _id: { $in: [{ _id: mockSongObjectId }] },
      });

      // 3. verify correct result
      expect(result).toEqual([mockSong]);
    });

    it("should get songs by query with playlist filter", async () => {
      // ==================== Arrange ====================
      const params = {
        query: "test",
        playlistId: mockPlaylistId,
      };

      mockSongModel.aggregate.mockResolvedValue([{ _id: mockSongObjectId }]);
      mockSongModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getSongsByQuery(params);

      // ==================== Assert Process ====================
      // 1. verify aggregate was called with playlist filter
      expect(mockSongModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              playlistFor: { $nin: [mockPlaylistObjectId] },
            }),
          }),
        ])
      );

      // 2. verify correct result
      expect(result).toEqual([mockSong]);
    });
  });

  describe("getRecommendedSongs", () => {
    it("should get recommended songs successfully", async () => {
      // ==================== Arrange ====================
      const mockFeatures = {
        genres: ["pop"],
        tags: ["happy"],
        languages: ["en"],
        artists: ["artist1"],
        albums: ["album1"],
      };

      mockPlaylistModel.findById.mockResolvedValue(mockPlaylist);
      mockCollectDocumentAttributes.mockResolvedValue(mockFeatures);
      mockSongModel.find.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      const result = await getRecommendedSongs(mockPlaylistId);

      // ==================== Assert Process ====================
      // 1. verify playlist lookup
      expect(mockPlaylistModel.findById).toHaveBeenCalledWith(mockPlaylistId);

      // 2. verify features collection
      expect(mockCollectDocumentAttributes).toHaveBeenCalledWith({
        model: mockSongModel,
        ids: [mockSongObjectId],
        fields: ["genres", "tags", "languages", "artists", "albums"],
      });

      // 3. verify song search with features
      expect(mockSongModel.find).toHaveBeenCalledWith({
        _id: { $nin: [mockSongObjectId] },
        $or: [
          { genres: { $in: mockFeatures.genres } },
          { tags: { $in: mockFeatures.tags } },
          { languages: { $in: mockFeatures.languages } },
          { artists: { $in: mockFeatures.artists } },
          { albums: { $in: mockFeatures.albums } },
        ],
      });

      // 4. verify correct result
      expect(result).toEqual([mockSong]);
    });

    it("should handle playlist not found error", async () => {
      // ==================== Arrange ====================
      mockPlaylistModel.findById.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(getRecommendedSongs(mockPlaylistId)).rejects.toThrow("playlist not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "playlist not found");
    });
  });

  describe("refreshSongPlaybackStats", () => {
    it("should refresh song playback stats successfully", async () => {
      // ==================== Arrange ====================
      const mockStats = {
        totalDuration: 1800,
        totalCount: 10,
        weightedAvgDuration: 180,
      };

      mockGetPlaybackStatisticsBySongId.mockResolvedValue(mockStats);
      mockSongModel.findByIdAndUpdate.mockResolvedValue(mockSong);

      // ==================== Act ====================
      const result = await refreshSongPlaybackStats(mockSongId);

      // ==================== Assert Process ====================
      // 1. verify playback stats retrieval
      expect(mockGetPlaybackStatisticsBySongId).toHaveBeenCalledWith(mockSongId);

      // 2. verify song update
      expect(mockSongModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSongId,
        {
          "activities.totalPlaybackCount": 10,
          "activities.totalPlaybackDuration": 1800,
          "activities.weightedAveragePlaybackDuration": 180,
        },
        { new: true }
      );

      // 3. verify parseToFloat calls
      expect(mockParseToFloat).toHaveBeenCalledWith(1800);
      expect(mockParseToFloat).toHaveBeenCalledWith(180);

      // 4. verify correct result
      expect(result).toEqual({
        updatedSong: mockSong,
      });
    });

    it("should handle song not found error", async () => {
      // ==================== Arrange ====================
      const mockStats = {
        totalDuration: 1800,
        totalCount: 10,
        weightedAvgDuration: 180,
      };

      mockGetPlaybackStatisticsBySongId.mockResolvedValue(mockStats);
      mockSongModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(refreshSongPlaybackStats(mockSongId)).rejects.toThrow("Song not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Song not found");
    });
  });

  describe("statsUserSongs", () => {
    it("should get user songs stats successfully", async () => {
      // ==================== Arrange ====================
      const mockStats = {
        totalSongs: 5,
        totalPlaybackCount: 100,
        totalWeightedPlaybackDuration: 900,
        averageRating: 4.5,
      };

      mockSongModel.aggregate.mockResolvedValue([mockStats]);

      // ==================== Act ====================
      const result = await statsUserSongs(mockUserId);

      // ==================== Assert Process ====================
      // 1. verify aggregate was called with correct pipeline
      expect(mockSongModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          { $match: { creator: mockUserObjectId, "ownership.isPlatformOwned": false } },
          expect.objectContaining({
            $project: expect.objectContaining({
              totalRating: { $sum: "$ratings.rating" },
              totalRatingCount: { $size: "$ratings" },
            }),
          }),
        ])
      );

      // 2. verify correct result
      expect(result).toEqual(mockStats);
    });

    it("should handle no songs found", async () => {
      // ==================== Arrange ====================
      mockSongModel.aggregate.mockResolvedValue([]);

      // ==================== Act ====================
      const result = await statsUserSongs(mockUserId);

      // ==================== Assert Process ====================
      expect(result).toBeUndefined();
    });
  });

  describe("updateSongInfoById", () => {
    it("should update song info successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
        title: "Updated Song",
        artist: "Updated Artist",
      };

      mockSongModel.findOneAndUpdate.mockResolvedValue(mockSong);

      // ==================== Act ====================
      const result = await updateSongInfoById(params);

      // ==================== Assert Process ====================
      // 1. verify song update
      expect(mockSongModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockSongId, creator: mockUserId },
        { $set: { title: "Updated Song", artist: "Updated Artist" } },
        { new: true }
      );

      // 2. verify correct result
      expect(result).toEqual({
        updatedSong: mockSong,
      });
    });

    it("should handle song not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
        title: "Updated Song",
      };

      mockSongModel.findOneAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(updateSongInfoById(params)).rejects.toThrow("Song not found or access denied");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Song not found or access denied");
    });
  });

  describe("assignSongToPlaylists", () => {
    it("should assign song to playlists successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
        playlistsToAdd: [mockPlaylistId],
        playlistsToRemove: [],
      };

      const mockAddedPlaylists = [{ _id: mockPlaylistObjectId, default: false }];

      mockPlaylistModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAddedPlaylists),
      });
      mockSongModel.findByIdAndUpdate.mockResolvedValue(mockSong);
      mockPlaylistModel.updateMany.mockResolvedValue({ acknowledged: true });

      // ==================== Act ====================
      const result = await assignSongToPlaylists(params);

      // ==================== Assert Process ====================
      // 1. verify playlist lookup
      expect(mockPlaylistModel.find).toHaveBeenCalledWith({
        _id: { $in: [mockPlaylistId] },
      });

      // 2. verify song update
      expect(mockSongModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSongId,
        {
          $addToSet: {
            playlistFor: { $each: [mockPlaylistId] },
          },
        },
        { session: mockSession }
      );

      // 3. verify playlist update
      expect(mockPlaylistModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [mockPlaylistId] }, user: mockUserId },
        {
          $addToSet: { songs: mockSongId },
          $inc: {
            "stats.totalSongCount": 1,
            "stats.totalSongDuration": mockSong.duration,
          },
        },
        { session: mockSession }
      );

      // 4. verify transaction commit
      expect(mockSession.commitTransaction).toHaveBeenCalled();

      // 5. verify correct result
      expect(result).toEqual({
        updatedSong: mockSong,
      });
    });
  });

  describe("deleteSongById", () => {
    it("should delete song successfully when shouldDeleteSongs is true", async () => {
      // ==================== Arrange ====================
      const params = {
        songId: mockSongId,
        userId: mockUserId,
        shouldDeleteSongs: true,
      };

      mockSongModel.findOneAndDelete.mockResolvedValue(mockSong);

      // ==================== Act ====================
      const result = await deleteSongById(params);

      // ==================== Assert Process ====================
      // 1. verify song deletion
      expect(mockSongModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockSongId,
        creator: mockUserId,
      });

      // 2. verify correct result
      expect(result).toEqual({
        deletedSong: mockSong,
      });
    });

    it("should mark song as platform owned when shouldDeleteSongs is false", async () => {
      // ==================== Arrange ====================
      const params = {
        songId: mockSongId,
        userId: mockUserId,
        shouldDeleteSongs: false,
      };

      mockSongModel.findOneAndUpdate.mockResolvedValue(mockSong);

      // ==================== Act ====================
      const result = await deleteSongById(params);

      // ==================== Assert Process ====================
      // 1. verify song update
      expect(mockSongModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: mockSongId,
          creator: mockUserId,
        },
        { $set: { "ownership.isPlatformOwned": true } },
        { new: true }
      );

      // 2. verify correct result
      expect(result).toEqual({
        updatedSong: mockSong,
      });
    });

    it("should handle song not found error when deleting", async () => {
      // ==================== Arrange ====================
      const params = {
        songId: mockSongId,
        userId: mockUserId,
        shouldDeleteSongs: true,
      };

      mockSongModel.findOneAndDelete.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(deleteSongById(params)).rejects.toThrow("Song not found or access denied");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(false, 404, "Song not found or access denied");
    });

    it("should handle song not found error when updating", async () => {
      // ==================== Arrange ====================
      const params = {
        songId: mockSongId,
        userId: mockUserId,
        shouldDeleteSongs: false,
      };

      mockSongModel.findOneAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(deleteSongById(params)).rejects.toThrow("Song not found or access denied");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Song not found or access denied");
    });
  });
});
