import mongoose from "mongoose";
import SongModel from "../../../src/models/song.model";
import RatingModel from "../../../src/models/rating.model";
import PlaylistModel from "../../../src/models/playlist.model";
import PlaybackModel from "../../../src/models/playback.model";
import {
  getRatingBySongId,
  upsertSongRating,
  shouldPromptForRating,
} from "../../../src/services/rating.service";
import { getSongById } from "../../../src/services/song.service";
import { RatingTypeOptions } from "@joytify/shared-types/constants";
import { MIN_RATING_PROMPT_THRESHOLD } from "../../../src/constants/env-validate.constant";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/models/rating.model");
jest.mock("../../../src/models/playlist.model");
jest.mock("../../../src/models/playback.model");
jest.mock("../../../src/services/song.service");
jest.mock("../../../src/utils/app-assert.util");

// Mock type definitions
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockRatingModel = RatingModel as jest.Mocked<typeof RatingModel>;
const mockPlaylistModel = PlaylistModel as jest.Mocked<typeof PlaylistModel>;
const mockPlaybackModel = PlaybackModel as jest.Mocked<typeof PlaybackModel>;
const mockGetSongById = getSongById as jest.MockedFunction<typeof getSongById>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;

describe("Rating Service", () => {
  // Mock data constants
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockSongId = "507f1f77bcf86cd799439012";
  const mockRatingId = "507f1f77bcf86cd799439013";
  const mockPlaylistId = "507f1f77bcf86cd799439014";
  const mockUserObjectId = new mongoose.Types.ObjectId(mockUserId);
  const mockSongObjectId = new mongoose.Types.ObjectId(mockSongId);
  const mockRatingObjectId = new mongoose.Types.ObjectId(mockRatingId);
  const mockPlaylistObjectId = new mongoose.Types.ObjectId(mockPlaylistId);

  const mockSong = {
    _id: mockSongObjectId,
    title: "Test Song",
    artist: "Test Artist",
    ratings: [],
    favorites: [],
    playlistFor: [],
  };

  const mockRating = {
    _id: mockRatingObjectId,
    type: RatingTypeOptions.SONG,
    user: mockUserObjectId,
    song: mockSongObjectId,
    rating: 5,
    comment: "Great song!",
  };

  const mockDefaultPlaylist = {
    _id: mockPlaylistObjectId,
    user: mockUserObjectId,
    default: true,
    songs: [],
    stats: {
      totalSongCount: 0,
      totalSongDuration: 0,
    },
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

    // Setup common mock returns
    mockGetSongById.mockResolvedValue({ song: mockSong });
  });

  describe("getRatingBySongId", () => {
    it("should get rating by song ID successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
      };

      mockRatingModel.findOne.mockResolvedValue(mockRating);

      // ==================== Act ====================
      const result = await getRatingBySongId(params);

      // ==================== Assert Process ====================
      // 1. verify findOne was called with correct parameters
      expect(mockRatingModel.findOne).toHaveBeenCalledWith({
        type: RatingTypeOptions.SONG,
        user: mockUserId,
        song: mockSongId,
      });

      // 2. verify correct result
      expect(result).toEqual(mockRating);
    });

    it("should return null when rating not found", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
      };

      mockRatingModel.findOne.mockResolvedValue(null);

      // ==================== Act ====================
      const result = await getRatingBySongId(params);

      // ==================== Assert Process ====================
      // 1. verify findOne was called
      expect(mockRatingModel.findOne).toHaveBeenCalledWith({
        type: RatingTypeOptions.SONG,
        user: mockUserId,
        song: mockSongId,
      });

      // 2. verify null result
      expect(result).toBeNull();
    });
  });

  describe("upsertSongRating", () => {
    it("should create new song rating successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
        songDuration: 180,
        rating: 5,
        comment: "Amazing song!",
        liked: true,
        type: RatingTypeOptions.SONG,
      };

      // Mock no existing rating
      mockRatingModel.findOne.mockResolvedValue(null);
      mockRatingModel.create.mockResolvedValue(mockRating as any);
      mockPlaylistModel.findOneAndUpdate.mockResolvedValue(mockDefaultPlaylist);
      mockSongModel.findByIdAndUpdate.mockResolvedValue(mockSong);

      // ==================== Act ====================
      const result = await upsertSongRating(params);

      // ==================== Assert Process ====================
      // 1. verify rating creation
      expect(mockRatingModel.create).toHaveBeenCalledWith({
        type: RatingTypeOptions.SONG,
        user: mockUserId,
        song: mockSongId,
        rating: 5,
        comment: "Amazing song!",
      });

      // 2. verify playlist update for liked song
      expect(mockPlaylistModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user: mockUserId, default: true },
        {
          $addToSet: { songs: mockSongId },
          $inc: {
            "stats.totalSongCount": 1,
            "stats.totalSongDuration": 180,
          },
        },
        { new: true }
      );

      // 3. verify song update
      expect(mockSongModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSongId,
        {
          $addToSet: {
            ratings: mockRatingId,
            favorites: mockUserId,
            playlistFor: mockPlaylistId,
          },
        },
        { new: true }
      );

      // 4. verify correct result
      expect(result).toEqual({
        updatedSong: mockSong,
      });
    });

    it("should update existing song rating successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
        songDuration: 180,
        rating: 4,
        comment: "Updated comment",
        liked: false,
        type: RatingTypeOptions.SONG,
      };

      // Mock existing rating
      mockRatingModel.findOne.mockResolvedValue(mockRating);
      mockRatingModel.findByIdAndUpdate.mockResolvedValue({
        ...mockRating,
        rating: 4,
        comment: "Updated comment",
      });
      mockSongModel.findByIdAndUpdate.mockResolvedValue(mockSong);

      // ==================== Act ====================
      const result = await upsertSongRating(params);

      // ==================== Assert Process ====================
      // 1. verify rating update
      expect(mockRatingModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRatingObjectId,
        {
          rating: 4,
          comment: "Updated comment",
        },
        { new: true, runValidators: true }
      );

      // 2. verify no playlist update for non-liked song
      expect(mockPlaylistModel.findOneAndUpdate).not.toHaveBeenCalled();

      // 3. verify song update without like data
      expect(mockSongModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSongId,
        {
          $addToSet: { ratings: mockRatingId },
        },
        { new: true }
      );

      // 4. verify correct result
      expect(result).toEqual({
        updatedSong: mockSong,
      });
    });

    it("should handle song not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
        songDuration: 180,
        rating: 5,
        comment: "Great song!",
        liked: false,
        type: RatingTypeOptions.SONG,
      };

      mockRatingModel.findOne.mockResolvedValue(null);
      mockRatingModel.create.mockResolvedValue(mockRating as any);
      mockSongModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(upsertSongRating(params)).rejects.toThrow("Song not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Song not found");
    });

    it("should handle rating creation failure", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
        songDuration: 180,
        rating: 5,
        comment: "Great song!",
        liked: false,
        type: RatingTypeOptions.SONG,
      };

      mockRatingModel.findOne.mockResolvedValue(null);
      mockRatingModel.create.mockResolvedValue(null as any);

      // ==================== Act & Assert ====================
      await expect(upsertSongRating(params)).rejects.toThrow("Failed to upsert rating");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 500, "Failed to upsert rating");
    });

    it("should handle rating update failure", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
        songDuration: 180,
        rating: 4,
        comment: "Updated comment",
        liked: false,
        type: RatingTypeOptions.SONG,
      };

      mockRatingModel.findOne.mockResolvedValue(mockRating);
      mockRatingModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(upsertSongRating(params)).rejects.toThrow("Failed to upsert rating");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 500, "Failed to upsert rating");
    });
  });

  describe("shouldPromptForRating", () => {
    it("should return false when user has already rated the song", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
      };

      mockRatingModel.findOne.mockResolvedValue(mockRating);

      // ==================== Act ====================
      const result = await shouldPromptForRating(params);

      // ==================== Assert Process ====================
      // 1. verify song retrieval
      expect(mockGetSongById).toHaveBeenCalledWith(mockSongId);

      // 2. verify rating check
      expect(mockRatingModel.findOne).toHaveBeenCalledWith({
        type: RatingTypeOptions.SONG,
        user: mockUserId,
        song: mockSongId,
      });

      // 3. verify no playback count check when already rated
      expect(mockPlaybackModel.countDocuments).not.toHaveBeenCalled();

      // 4. verify correct result
      expect(result).toEqual({
        shouldPrompt: false,
        song: mockSong,
      });
    });

    it("should return true when playback count meets prompt threshold", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
      };

      mockRatingModel.findOne.mockResolvedValue(null);
      mockPlaybackModel.countDocuments.mockResolvedValue(MIN_RATING_PROMPT_THRESHOLD);

      // ==================== Act ====================
      const result = await shouldPromptForRating(params);

      // ==================== Assert Process ====================
      // 1. verify song retrieval
      expect(mockGetSongById).toHaveBeenCalledWith(mockSongId);

      // 2. verify rating check
      expect(mockRatingModel.findOne).toHaveBeenCalledWith({
        type: RatingTypeOptions.SONG,
        user: mockUserId,
        song: mockSongId,
      });

      // 3. verify playback count check
      expect(mockPlaybackModel.countDocuments).toHaveBeenCalledWith({
        user: mockUserId,
        song: mockSongId,
      });

      // 4. verify correct result
      expect(result).toEqual({
        shouldPrompt: true,
        song: mockSong,
      });
    });

    it("should return false when playback count does not meet threshold", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
      };

      mockRatingModel.findOne.mockResolvedValue(null);
      mockPlaybackModel.countDocuments.mockResolvedValue(MIN_RATING_PROMPT_THRESHOLD - 1); // Below threshold

      // ==================== Act ====================
      const result = await shouldPromptForRating(params);

      // ==================== Assert Process ====================
      // 1. verify correct result
      expect(result).toEqual({
        shouldPrompt: false,
        song: mockSong,
      });
    });

    it("should handle song not found error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
      };

      mockGetSongById.mockResolvedValue({ song: null });

      // ==================== Act & Assert ====================
      await expect(shouldPromptForRating(params)).rejects.toThrow("Song not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "Song not found");
    });

    it("should handle different prompt thresholds correctly", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        songId: mockSongId,
      };

      mockRatingModel.findOne.mockResolvedValue(null);

      // Test mid threshold (MIN_RATING_PROMPT_THRESHOLD * 2)
      mockPlaybackModel.countDocuments.mockResolvedValue(MIN_RATING_PROMPT_THRESHOLD * 2);

      // ==================== Act ====================
      const result = await shouldPromptForRating(params);

      // ==================== Assert Process ====================
      expect(result).toEqual({
        shouldPrompt: true,
        song: mockSong,
      });
    });
  });
});
