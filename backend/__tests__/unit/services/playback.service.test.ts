import mongoose from "mongoose";
import SongModel from "../../../src/models/song.model";
import HistoryModel from "../../../src/models/history.model";
import PlaybackModel from "../../../src/models/playback.model";
import {
  createPlaybackLog,
  getPlaybackStatisticsBySongId,
} from "../../../src/services/playback.service";
import { trackPlaybackStats } from "../../../src/services/stats.service";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/models/history.model");
jest.mock("../../../src/models/playback.model");
jest.mock("../../../src/services/stats.service");
jest.mock("../../../src/utils/app-assert.util");

// Mock type definitions
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
const mockHistoryModel = HistoryModel as jest.Mocked<typeof HistoryModel>;
const mockPlaybackModel = PlaybackModel as jest.Mocked<typeof PlaybackModel>;
const mockTrackPlaybackStats = trackPlaybackStats as jest.MockedFunction<typeof trackPlaybackStats>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;

describe("Playback Service", () => {
  // Mock data constants
  const mockUserId = "user-id-123";
  const mockSongId = "507f1f77bcf86cd799439011";
  const mockArtistId = "507f1f77bcf86cd799439012";
  const mockDuration = 180; // 3 minutes
  const mockState = { volume: 80, currentTime: 0 } as any;
  const mockCreatedAt = new Date("2024-01-01T00:00:00.000Z");

  const mockSong = {
    _id: mockSongId,
    title: "Test Song",
    artist: mockArtistId,
    duration: 200,
  };

  const mockPlaybackLog = {
    _id: "playback-log-id",
    user: mockUserId,
    artist: mockArtistId,
    song: mockSongId,
    state: mockState,
    duration: mockDuration,
    createdAt: mockCreatedAt,
  };

  beforeEach(() => {
    // reset all mocks
    jest.clearAllMocks();

    // Mock appAssert to throw error when condition is false
    mockAppAssert.mockImplementation((condition, _statusCode, message) => {
      if (!condition) {
        throw new Error(message);
      }
    });

    // Setup common mock returns
    mockTrackPlaybackStats.mockResolvedValue(undefined);
  });

  describe("createPlaybackLog", () => {
    it("should create playback log successfully and track stats", async () => {
      // ==================== Arrange ====================
      // 1. setup successful playback log creation
      const createLogParams = {
        userId: mockUserId,
        songId: mockSongId,
        duration: mockDuration,
        state: mockState,
      };

      mockSongModel.findById.mockResolvedValue(mockSong as any);
      mockPlaybackModel.create.mockResolvedValue(mockPlaybackLog as any);

      // ==================== Act ====================
      // 1. create playback log
      const result = await createPlaybackLog(createLogParams);

      // ==================== Assert Process ====================
      // 1. verify song existence check
      expect(mockSongModel.findById).toHaveBeenCalledWith(mockSongId);

      // 2. verify playback log creation
      expect(mockPlaybackModel.create).toHaveBeenCalledWith({
        user: mockUserId,
        artist: mockArtistId,
        song: mockSongId,
        state: mockState,
        duration: mockDuration,
      });

      // 3. verify stats tracking
      expect(mockTrackPlaybackStats).toHaveBeenCalledWith({
        userId: mockUserId,
        songId: mockSongId,
        artistId: mockArtistId,
        duration: mockDuration,
        timestamp: mockCreatedAt,
      });

      // 4. verify correct result
      expect(result).toEqual({
        playbackLog: mockPlaybackLog,
      });
    });

    it("should return null when duration is less than or equal to 0", async () => {
      // ==================== Arrange ====================
      // 1. setup zero duration scenario
      const createLogParams = {
        userId: mockUserId,
        songId: mockSongId,
        duration: 0,
        state: mockState,
      };

      // ==================== Act ====================
      // 1. attempt to create playback log with zero duration
      const result = await createPlaybackLog(createLogParams);

      // ==================== Assert Process ====================
      // 1. verify no database operations were performed
      expect(mockSongModel.findById).not.toHaveBeenCalled();
      expect(mockPlaybackModel.create).not.toHaveBeenCalled();
      expect(mockTrackPlaybackStats).not.toHaveBeenCalled();

      // 2. verify null result
      expect(result).toEqual({
        playbackLog: null,
      });
    });

    it("should return null when duration is negative", async () => {
      // ==================== Arrange ====================
      // 1. setup negative duration scenario
      const createLogParams = {
        userId: mockUserId,
        songId: mockSongId,
        duration: -10,
        state: mockState,
      };

      // ==================== Act ====================
      // 1. attempt to create playback log with negative duration
      const result = await createPlaybackLog(createLogParams);

      // ==================== Assert Process ====================
      // 1. verify no database operations were performed
      expect(mockSongModel.findById).not.toHaveBeenCalled();
      expect(mockPlaybackModel.create).not.toHaveBeenCalled();
      expect(mockTrackPlaybackStats).not.toHaveBeenCalled();

      // 2. verify null result
      expect(result).toEqual({
        playbackLog: null,
      });
    });

    it("should throw error when song not found", async () => {
      // ==================== Arrange ====================
      // 1. setup song not found scenario
      const createLogParams = {
        userId: mockUserId,
        songId: mockSongId,
        duration: mockDuration,
        state: mockState,
      };

      mockSongModel.findById.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for non-existent song
      await expect(createPlaybackLog(createLogParams)).rejects.toThrow("Song not found");

      // ==================== Assert Process ====================
      // 1. verify song lookup was attempted
      expect(mockSongModel.findById).toHaveBeenCalledWith(mockSongId);

      // 2. verify no further operations were performed
      expect(mockPlaybackModel.create).not.toHaveBeenCalled();
      expect(mockTrackPlaybackStats).not.toHaveBeenCalled();
    });

    it("should throw error when playback log creation fails", async () => {
      // ==================== Arrange ====================
      // 1. setup playback log creation failure
      const createLogParams = {
        userId: mockUserId,
        songId: mockSongId,
        duration: mockDuration,
        state: mockState,
      };

      mockSongModel.findById.mockResolvedValue(mockSong as any);
      mockPlaybackModel.create.mockResolvedValue(null as any);

      // ==================== Act & Assert ====================
      // 1. expect error for failed playback log creation
      await expect(createPlaybackLog(createLogParams)).rejects.toThrow(
        "Failed to create playback log"
      );

      // ==================== Assert Process ====================
      // 1. verify creation was attempted
      expect(mockPlaybackModel.create).toHaveBeenCalled();

      // 2. verify stats tracking was not called
      expect(mockTrackPlaybackStats).not.toHaveBeenCalled();
    });

    it("should throw error when trackPlaybackStats fails", async () => {
      // ==================== Arrange ====================
      // 1. setup trackPlaybackStats failure scenario
      const createLogParams = {
        userId: mockUserId,
        songId: mockSongId,
        duration: mockDuration,
        state: mockState,
      };

      mockSongModel.findById.mockResolvedValue(mockSong as any);
      mockPlaybackModel.create.mockResolvedValue(mockPlaybackLog as any);
      mockTrackPlaybackStats.mockRejectedValue(new Error("Stats tracking failed"));

      // ==================== Act & Assert ====================
      // 1. expect error for failed stats tracking
      await expect(createPlaybackLog(createLogParams)).rejects.toThrow("Stats tracking failed");

      // ==================== Assert Process ====================
      // 1. verify playback log was created successfully
      expect(mockPlaybackModel.create).toHaveBeenCalledWith({
        user: mockUserId,
        artist: mockArtistId,
        song: mockSongId,
        state: mockState,
        duration: mockDuration,
      });

      // 2. verify stats tracking was attempted
      expect(mockTrackPlaybackStats).toHaveBeenCalledWith({
        userId: mockUserId,
        songId: mockSongId,
        artistId: mockArtistId,
        duration: mockDuration,
        timestamp: mockCreatedAt,
      });
    });
  });

  describe("getPlaybackStatisticsBySongId", () => {
    it("should get statistics successfully with both playback and history data", async () => {
      // ==================== Arrange ====================
      // 1. setup aggregation results with both data sources
      const mockPlaybackResults = [
        {
          _id: null,
          count: 5,
          totalDuration: 900, // 15 minutes total
          durations: [180, 200, 150, 220, 150],
        },
      ];

      const mockHistoryResults = [
        {
          _id: null,
          count: 3,
          totalDuration: 600, // 10 minutes total
          durations: [200, 180, 220],
        },
      ];

      mockPlaybackModel.aggregate.mockResolvedValue(mockPlaybackResults);
      mockHistoryModel.aggregate.mockResolvedValue(mockHistoryResults);

      // ==================== Act ====================
      // 1. get playback statistics
      const result = await getPlaybackStatisticsBySongId(mockSongId);

      // ==================== Assert Process ====================
      // 1. verify ObjectId conversion and aggregation calls
      expect(mockPlaybackModel.aggregate).toHaveBeenCalledWith([
        { $match: { song: expect.any(mongoose.Types.ObjectId) } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalDuration: { $sum: "$duration" },
            durations: { $push: "$duration" },
          },
        },
      ]);

      expect(mockHistoryModel.aggregate).toHaveBeenCalledWith([
        { $match: { song: expect.any(mongoose.Types.ObjectId) } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalDuration: { $sum: "$duration" },
            durations: { $push: "$duration" },
          },
        },
      ]);

      // 2. verify calculated statistics
      const expectedTotalCount = 8; // 5 + 3
      const expectedTotalDuration = 1500; // 900 + 600
      const allDurations = [180, 200, 150, 220, 150, 200, 180, 220];
      const expectedWeightedAvg =
        allDurations.reduce((acc, duration) => acc + duration * duration, 0) /
        expectedTotalDuration;

      expect(result).toEqual({
        totalCount: expectedTotalCount,
        totalDuration: expectedTotalDuration,
        weightedAvgDuration: expectedWeightedAvg,
      });
    });

    it("should get statistics successfully with only playback data", async () => {
      // ==================== Arrange ====================
      // 1. setup aggregation with only playback results
      const mockPlaybackResults = [
        {
          _id: null,
          count: 3,
          totalDuration: 540, // 9 minutes total
          durations: [180, 180, 180],
        },
      ];

      mockPlaybackModel.aggregate.mockResolvedValue(mockPlaybackResults);
      mockHistoryModel.aggregate.mockResolvedValue([]); // No history data

      // ==================== Act ====================
      // 1. get playback statistics
      const result = await getPlaybackStatisticsBySongId(mockSongId);

      // ==================== Assert Process ====================
      // 1. verify correct calculations with only playback data
      expect(result).toEqual({
        totalCount: 3,
        totalDuration: 540,
        weightedAvgDuration: 180, // All durations are the same
      });
    });

    it("should get statistics successfully with only history data", async () => {
      // ==================== Arrange ====================
      // 1. setup aggregation with only history results
      const mockHistoryResults = [
        {
          _id: null,
          count: 2,
          totalDuration: 400,
          durations: [200, 200],
        },
      ];

      mockPlaybackModel.aggregate.mockResolvedValue([]); // No playback data
      mockHistoryModel.aggregate.mockResolvedValue(mockHistoryResults);

      // ==================== Act ====================
      // 1. get playback statistics
      const result = await getPlaybackStatisticsBySongId(mockSongId);

      // ==================== Assert Process ====================
      // 1. verify correct calculations with only history data
      expect(result).toEqual({
        totalCount: 2,
        totalDuration: 400,
        weightedAvgDuration: 200, // All durations are the same
      });
    });

    it("should return default values when no data exists", async () => {
      // ==================== Arrange ====================
      // 1. setup aggregation with no results
      mockPlaybackModel.aggregate.mockResolvedValue([]);
      mockHistoryModel.aggregate.mockResolvedValue([]);

      // ==================== Act ====================
      // 1. get playback statistics for song with no plays
      const result = await getPlaybackStatisticsBySongId(mockSongId);

      // ==================== Assert Process ====================
      // 1. verify default values returned
      expect(result).toEqual({
        totalCount: 0,
        totalDuration: 0,
        weightedAvgDuration: 0,
      });
    });

    it("should handle zero total duration correctly", async () => {
      // ==================== Arrange ====================
      // 1. setup aggregation with zero duration data
      const mockPlaybackResults = [
        {
          _id: null,
          count: 2,
          totalDuration: 0, // Zero total duration
          durations: [0, 0],
        },
      ];

      mockPlaybackModel.aggregate.mockResolvedValue(mockPlaybackResults);
      mockHistoryModel.aggregate.mockResolvedValue([]);

      // ==================== Act ====================
      // 1. get playback statistics
      const result = await getPlaybackStatisticsBySongId(mockSongId);

      // ==================== Assert Process ====================
      // 1. verify weighted average is 0 when total duration is 0
      expect(result).toEqual({
        totalCount: 2,
        totalDuration: 0,
        weightedAvgDuration: 0,
      });
    });

    it("should calculate weighted average duration correctly", async () => {
      // ==================== Arrange ====================
      // 1. setup specific data for weighted average calculation
      const mockPlaybackResults = [
        {
          _id: null,
          count: 2,
          totalDuration: 300, // 5 minutes total
          durations: [100, 200], // Different durations for weighted calculation
        },
      ];

      mockPlaybackModel.aggregate.mockResolvedValue(mockPlaybackResults);
      mockHistoryModel.aggregate.mockResolvedValue([]);

      // ==================== Act ====================
      // 1. get playback statistics
      const result = await getPlaybackStatisticsBySongId(mockSongId);

      // ==================== Assert Process ====================
      // 1. verify weighted average calculation
      // Weighted avg = (100*100 + 200*200) / 300 = (10000 + 40000) / 300 = 166.67
      const expectedWeightedAvg = (100 * 100 + 200 * 200) / 300;

      expect(result).toEqual({
        totalCount: 2,
        totalDuration: 300,
        weightedAvgDuration: expectedWeightedAvg,
      });
    });

    it("should handle invalid songId format", async () => {
      // ==================== Arrange ====================
      // 1. setup invalid songId format
      const invalidSongId = "invalid-song-id";

      // ==================== Act & Assert ====================
      // 1. expect error for invalid songId format
      await expect(getPlaybackStatisticsBySongId(invalidSongId)).rejects.toThrow(
        "input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
      );
    });

    it("should handle aggregation errors gracefully", async () => {
      // ==================== Arrange ====================
      // 1. setup aggregation error scenario
      mockPlaybackModel.aggregate.mockRejectedValue(new Error("Database connection failed"));
      mockHistoryModel.aggregate.mockResolvedValue([]);

      // ==================== Act & Assert ====================
      // 1. expect error for aggregation failure
      await expect(getPlaybackStatisticsBySongId(mockSongId)).rejects.toThrow(
        "Database connection failed"
      );

      // ==================== Assert Process ====================
      // 1. verify aggregation was attempted
      expect(mockPlaybackModel.aggregate).toHaveBeenCalled();
    });

    it("should handle mixed data with different duration patterns", async () => {
      // ==================== Arrange ====================
      // 1. setup mixed data with varying durations
      const mockPlaybackResults = [
        {
          _id: null,
          count: 2,
          totalDuration: 300,
          durations: [100, 200],
        },
      ];

      const mockHistoryResults = [
        {
          _id: null,
          count: 1,
          totalDuration: 150,
          durations: [150],
        },
      ];

      mockPlaybackModel.aggregate.mockResolvedValue(mockPlaybackResults);
      mockHistoryModel.aggregate.mockResolvedValue(mockHistoryResults);

      // ==================== Act ====================
      // 1. get playback statistics
      const result = await getPlaybackStatisticsBySongId(mockSongId);

      // ==================== Assert Process ====================
      // 1. verify correct calculations with mixed data
      const expectedTotalCount = 3; // 2 + 1
      const expectedTotalDuration = 450; // 300 + 150
      const allDurations = [100, 200, 150];
      const expectedWeightedAvg =
        allDurations.reduce((acc, duration) => acc + duration * duration, 0) /
        expectedTotalDuration;

      expect(result).toEqual({
        totalCount: expectedTotalCount,
        totalDuration: expectedTotalDuration,
        weightedAvgDuration: expectedWeightedAvg,
      });
    });
  });
});
