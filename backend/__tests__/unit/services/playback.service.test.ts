import SongModel from "../../../src/models/song.model";
import PlaybackModel from "../../../src/models/playback.model";
import { createPlaybackLog } from "../../../src/services/playback.service";
import { trackPlaybackStats } from "../../../src/services/stats.service";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("../../../src/models/song.model");
jest.mock("../../../src/models/playback.model");
jest.mock("../../../src/services/stats.service");
jest.mock("../../../src/utils/app-assert.util");

// Mock type definitions
const mockSongModel = SongModel as jest.Mocked<typeof SongModel>;
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

});
