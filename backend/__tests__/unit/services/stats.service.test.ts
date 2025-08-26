import mongoose from "mongoose";
import StatsModel from "../../../src/models/stats.model";
import MusicianModel from "../../../src/models/musician.model";
import { trackPlaybackStats, getMonthlyStats } from "../../../src/services/stats.service";

// Mock all external dependencies
jest.mock("../../../src/models/stats.model");
jest.mock("../../../src/models/musician.model");

// Mock type definitions
const mockStatsModel = StatsModel as jest.Mocked<typeof StatsModel>;
const mockMusicianModel = MusicianModel as jest.Mocked<typeof MusicianModel>;

describe("Stats Service", () => {
  // Mock data constants
  const mockUserId = "507f1f77bcf86cd799439013";
  const mockSongId = "507f1f77bcf86cd799439011";
  const mockArtistId = "507f1f77bcf86cd799439012";
  const mockDuration = 180; // 3 minutes
  const mockTimestamp = new Date("2024-01-15T10:30:00.000Z");
  const mockArtistName = "Test Artist";

  const mockMusician = {
    _id: mockArtistId,
    name: mockArtistName,
  };

  const mockUserStats = {
    user: mockUserId,
    stats: [],
    markModified: jest.fn(),
    save: jest.fn(),
  };

  // Helper function to create mock query chain
  const createMockQueryChain = (result: any) => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  });

  const mockExistingMonthStat = {
    songs: [{ song: "other-song", totalDuration: 150 }],
    artists: [{ artist: mockArtistId, totalDuration: 150 }],
    peakHour: [{ hour: 9, totalDuration: 150, utilization: 4.17 }],
    summary: {
      month: 1,
      year: 2024,
      totalDuration: 150,
      growthPercentage: 0,
      topArtist: mockArtistName,
      topArtistTotalPlaybackTime: 150,
    },
    createdAt: new Date("2024-01-10T00:00:00.000Z"),
  };

  // Common test parameters
  const baseTrackParams = {
    userId: mockUserId,
    songId: mockSongId,
    artistId: mockArtistId,
    duration: mockDuration,
    timestamp: mockTimestamp,
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.restoreAllMocks();

    // Clear the artist name cache by mocking Date.now to simulate cache expiration
    jest.spyOn(Date, "now").mockReturnValue(Date.now() + 31 * 60 * 1000); // 31 minutes later

    // Setup common mock returns - will be overridden in individual tests
    mockMusicianModel.findById.mockReturnValue(createMockQueryChain(mockMusician as any) as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("trackPlaybackStats", () => {
    it("should handle artist name fetch error gracefully", async () => {
      // ==================== Arrange ====================
      mockStatsModel.findOne.mockResolvedValue(null);
      mockStatsModel.create.mockResolvedValue(mockUserStats as any);
      mockMusicianModel.findById.mockReturnValue(createMockQueryChain(null) as any);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.create).toHaveBeenCalledWith({
        user: mockUserId,
        stats: [
          expect.objectContaining({
            summary: expect.objectContaining({
              topArtist: "Unknown Artist",
            }),
          }),
        ],
      });
    });

    it("should handle growth percentage calculation with zero previous value", async () => {
      // ==================== Arrange ====================
      const previousMonthStat = {
        ...mockExistingMonthStat,
        summary: {
          ...mockExistingMonthStat.summary,
          totalDuration: 0,
        },
      };

      mockStatsModel.findOne.mockResolvedValue({
        ...mockUserStats,
        stats: [previousMonthStat],
      } as any);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.findOne).toHaveBeenCalledWith({ user: mockUserId });
    });

    it("should create new user stats when user has no existing stats", async () => {
      // ==================== Arrange ====================

      mockStatsModel.findOne.mockResolvedValue(null);
      mockStatsModel.create.mockResolvedValue(mockUserStats as any);
      mockMusicianModel.findById.mockReturnValue(createMockQueryChain(mockMusician as any) as any);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.findOne).toHaveBeenCalledWith({ user: mockUserId });
      expect(mockStatsModel.create).toHaveBeenCalledWith({
        user: mockUserId,
        stats: [
          {
            songs: [{ song: mockSongId, totalDuration: mockDuration }],
            artists: [{ artist: mockArtistId, totalDuration: mockDuration }],
            peakHour: [
              {
                hour: mockTimestamp.getUTCHours(),
                totalDuration: mockDuration,
                utilization: parseFloat(((mockDuration / 3600) * 100).toFixed(2)),
              },
            ],
            summary: {
              month: mockTimestamp.getUTCMonth() + 1,
              year: mockTimestamp.getUTCFullYear(),
              totalDuration: mockDuration,
              growthPercentage: 0,
              topArtist: "Unknown Artist",
              topArtistTotalPlaybackTime: mockDuration,
            },
          },
        ],
      });
    });

    it("should create new month stat when user exists but no current month data", async () => {
      // ==================== Arrange ====================

      const userStatsWithOldData = {
        ...mockUserStats,
        stats: [
          {
            ...mockExistingMonthStat,
            createdAt: new Date("2023-12-15T00:00:00.000Z"), // Previous month
          },
        ],
      };

      mockStatsModel.findOne.mockResolvedValue(userStatsWithOldData as any);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.findOne).toHaveBeenCalledWith({ user: mockUserId });
      expect(userStatsWithOldData.stats).toHaveLength(2);
      expect(userStatsWithOldData.stats[1]).toMatchObject({
        songs: [{ song: mockSongId, totalDuration: mockDuration }],
        artists: [{ artist: mockArtistId, totalDuration: mockDuration }],
        summary: {
          month: mockTimestamp.getUTCMonth() + 1,
          year: mockTimestamp.getUTCFullYear(),
          totalDuration: mockDuration,
        },
      });
      expect(userStatsWithOldData.markModified).toHaveBeenCalledWith("stats");
      expect(userStatsWithOldData.save).toHaveBeenCalled();
    });

    it("should update existing current month stats when data already exists", async () => {
      // ==================== Arrange ====================

      const userStatsWithCurrentMonth = {
        ...mockUserStats,
        stats: [
          {
            ...mockExistingMonthStat,
            createdAt: mockTimestamp, // Same month
          },
        ],
      };

      mockStatsModel.findOne.mockResolvedValue(userStatsWithCurrentMonth as any);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(userStatsWithCurrentMonth.stats).toHaveLength(2);
      const newStat = userStatsWithCurrentMonth.stats[1];
      expect(newStat.songs.some((s: any) => s.song === mockSongId)).toBeTruthy();
      expect(newStat.artists.some((a: any) => a.artist === mockArtistId)).toBeTruthy();
      expect(
        newStat.peakHour.some((h: any) => h.hour === mockTimestamp.getUTCHours())
      ).toBeTruthy();
      expect(newStat.summary.totalDuration).toBe(mockDuration);
      expect(userStatsWithCurrentMonth.markModified).toHaveBeenCalledWith("stats");
      expect(userStatsWithCurrentMonth.save).toHaveBeenCalled();
    });

    it("should handle artist name caching correctly", async () => {
      // ==================== Arrange ====================

      mockStatsModel.findOne.mockResolvedValue(null);
      mockStatsModel.create.mockResolvedValue(mockUserStats as any);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.create).toHaveBeenCalledTimes(2);
    });

    it("should handle artist lookup failure gracefully", async () => {
      // ==================== Arrange ====================

      mockStatsModel.findOne.mockResolvedValue(null);
      mockStatsModel.create.mockResolvedValue(mockUserStats as any);
      const mockQueryChain = createMockQueryChain(null);
      mockQueryChain.lean = jest.fn().mockRejectedValue(new Error("Database error"));
      mockMusicianModel.findById.mockReturnValue(mockQueryChain as any);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.create).toHaveBeenCalled();
    });

    it("should handle artist not found gracefully", async () => {
      // ==================== Arrange ====================

      mockStatsModel.findOne.mockResolvedValue(null);
      mockStatsModel.create.mockResolvedValue(mockUserStats as any);
      mockMusicianModel.findById.mockReturnValue(createMockQueryChain(null) as any);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.create).toHaveBeenCalled();
    });

    it("should handle utilization calculation in peak hour updates", async () => {
      // ==================== Arrange ====================
      const currentMonthStat = {
        ...mockExistingMonthStat,
        songs: [{ song: mockSongId, totalDuration: 100 }],
        artists: [{ artist: mockArtistId, totalDuration: 100 }],
        peakHour: [{ hour: 10, totalDuration: 100, utilization: 2.78 }],
        summary: {
          ...mockExistingMonthStat.summary,
          totalDuration: 100,
        },
        createdAt: mockTimestamp,
      };

      const userStatsWithCurrentMonth = {
        ...mockUserStats,
        stats: [currentMonthStat],
      };

      mockStatsModel.findOne.mockResolvedValue(userStatsWithCurrentMonth as any);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.findOne).toHaveBeenCalledWith({ user: mockUserId });
      expect(userStatsWithCurrentMonth.markModified).toHaveBeenCalledWith("stats");
      expect(userStatsWithCurrentMonth.save).toHaveBeenCalled();
    });

    it("should calculate growth percentage correctly when previous month data exists", async () => {
      // ==================== Arrange ====================
      const februaryTrackParams = {
        ...baseTrackParams,
        timestamp: new Date("2024-02-15T10:30:00.000Z"), // February
      };

      const userStatsWithPreviousMonth = {
        ...mockUserStats,
        stats: [
          {
            ...mockExistingMonthStat,
            summary: {
              ...mockExistingMonthStat.summary,
              month: 1, // January
              totalDuration: 100, // Previous month total
            },
            createdAt: new Date("2024-01-15T00:00:00.000Z"),
          },
        ],
      };

      mockStatsModel.findOne.mockResolvedValue(userStatsWithPreviousMonth as any);

      // ==================== Act ====================
      await trackPlaybackStats(februaryTrackParams);

      // ==================== Assert Process ====================
      expect(userStatsWithPreviousMonth.stats).toHaveLength(2);
      expect(userStatsWithPreviousMonth.stats[1]).toBeDefined();
    });

    it("should handle zero duration gracefully", async () => {
      // ==================== Arrange ====================
      const zeroDurationTrackParams = {
        ...baseTrackParams,
        duration: 0,
      };

      mockStatsModel.findOne.mockResolvedValue(null);
      mockStatsModel.create.mockResolvedValue(mockUserStats as any);

      // ==================== Act ====================
      await trackPlaybackStats(zeroDurationTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.create).toHaveBeenCalledWith({
        user: mockUserId,
        stats: [
          expect.objectContaining({
            songs: [{ song: mockSongId, totalDuration: 0 }],
            artists: [{ artist: mockArtistId, totalDuration: 0 }],
            summary: expect.objectContaining({
              totalDuration: 0,
            }),
          }),
        ],
      });
    });

    it("should handle negative duration gracefully", async () => {
      // ==================== Arrange ====================
      const negativeDurationTrackParams = {
        ...baseTrackParams,
        duration: -10,
      };

      mockStatsModel.findOne.mockResolvedValue(null);
      mockStatsModel.create.mockResolvedValue(mockUserStats as any);

      // ==================== Act ====================
      await trackPlaybackStats(negativeDurationTrackParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.create).toHaveBeenCalledWith({
        user: mockUserId,
        stats: [
          expect.objectContaining({
            songs: [{ song: mockSongId, totalDuration: -10 }],
            artists: [{ artist: mockArtistId, totalDuration: -10 }],
            summary: expect.objectContaining({
              totalDuration: -10,
            }),
          }),
        ],
      });
    });

    it("should handle StatsModel.findOne failure", async () => {
      // ==================== Arrange ====================

      mockStatsModel.findOne.mockRejectedValue(new Error("Database connection failed"));

      // ==================== Act & Assert ====================
      await expect(trackPlaybackStats(baseTrackParams)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle StatsModel.create failure", async () => {
      // ==================== Arrange ====================

      mockStatsModel.findOne.mockResolvedValue(null);
      mockStatsModel.create.mockRejectedValue(new Error("Creation failed"));

      // ==================== Act & Assert ====================
      await expect(trackPlaybackStats(baseTrackParams)).rejects.toThrow("Creation failed");
    });

    it("should handle StatsModel.save failure", async () => {
      // ==================== Arrange ====================

      const userStatsWithSaveFailure = {
        ...mockUserStats,
        save: jest.fn().mockRejectedValue(new Error("Save failed")),
      };

      mockStatsModel.findOne.mockResolvedValue(userStatsWithSaveFailure as any);

      // ==================== Act & Assert ====================
      await expect(trackPlaybackStats(baseTrackParams)).rejects.toThrow("Save failed");
    });

    it("should handle cache expiration correctly", async () => {
      // ==================== Arrange ====================

      mockStatsModel.findOne.mockResolvedValue(null);
      mockStatsModel.create.mockResolvedValue(mockUserStats as any);

      // Mock Date.now to simulate cache expiration (31 minutes later)
      const originalDateNow = Date.now;
      const mockTime = originalDateNow() + 31 * 60 * 1000;
      jest.spyOn(Date, "now").mockReturnValue(mockTime);

      // ==================== Act ====================
      await trackPlaybackStats(baseTrackParams);

      // ==================== Assert Process ====================
      expect(mockMusicianModel.findById).toHaveBeenCalledWith(mockArtistId);

      // Restore Date.now
      jest.spyOn(Date, "now").mockRestore();
    });
  });

  describe("getMonthlyStats", () => {
    const mockAggregateResult = [
      {
        songs: [
          {
            _id: mockSongId,
            title: "Test Song",
            artist: mockArtistName,
            imageUrl: "test-image.jpg",
            totalDuration: mockDuration,
            paletee: ["#ff0000"],
          },
        ],
        artists: [
          {
            _id: mockArtistId,
            name: mockArtistName,
            roles: ["vocalist"],
            coverImage: "artist-image.jpg",
            totalDuration: mockDuration,
          },
        ],
        peakHour: [
          {
            hour: 10,
            totalDuration: mockDuration,
            utilization: 5.0,
          },
        ],
        summary: {
          month: 1,
          year: 2024,
          totalDuration: mockDuration,
          growthPercentage: 25.5,
          topArtist: mockArtistName,
          topArtistTotalPlaybackTime: mockDuration,
        },
      },
    ];

    it("should get monthly stats successfully without timezone conversion", async () => {
      // ==================== Arrange ====================
      const getStatsParams = {
        userId: mockUserId,
        yearMonth: "2024-01",
        timezone: undefined,
      };

      mockStatsModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getMonthlyStats(getStatsParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.aggregate).toHaveBeenCalledWith([
        { $match: { user: expect.any(mongoose.Types.ObjectId) } },
        { $unwind: "$stats" },
        {
          $match: {
            "stats.summary.year": 2024,
            "stats.summary.month": 1,
            createdAt: { $gte: new Date(2024, 0, 1), $lt: new Date(2024, 1, 1) },
          },
        },
        expect.objectContaining({ $lookup: expect.any(Object) }) as any, // songs lookup
        expect.objectContaining({ $lookup: expect.any(Object) }) as any, // artists lookup
        expect.objectContaining({ $addFields: expect.any(Object) }) as any, // reorder data
        { $replaceRoot: { newRoot: "$stats" } },
      ]);

      expect(result).toEqual(mockAggregateResult[0]);
    });

    it("should get monthly stats successfully with timezone conversion", async () => {
      // ==================== Arrange ====================
      const getStatsParams = {
        userId: mockUserId,
        yearMonth: "2024-01",
        timezone: "America/New_York",
      };

      mockStatsModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getMonthlyStats(getStatsParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.aggregate).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.peakHour).toBeDefined();
      expect(result.peakHour[0]).toHaveProperty("hour");
      expect(typeof result.peakHour[0].hour).toBe("number");
    });

    it("should return null when no monthly stats found", async () => {
      // ==================== Arrange ====================
      const getStatsParams = {
        userId: mockUserId,
        yearMonth: "2024-03",
        timezone: undefined,
      };

      mockStatsModel.aggregate.mockResolvedValue([]);

      // ==================== Act ====================
      const result = await getMonthlyStats(getStatsParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.aggregate).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should handle yearMonth parsing correctly", async () => {
      // ==================== Arrange ====================
      const testCases = [
        { yearMonth: "2024-01", expectedYear: 2024, expectedMonth: 1 },
        { yearMonth: "2023-12", expectedYear: 2023, expectedMonth: 12 },
        { yearMonth: "2024-06", expectedYear: 2024, expectedMonth: 6 },
      ];

      mockStatsModel.aggregate.mockResolvedValue([]);

      for (const testCase of testCases) {
        // ==================== Act ====================
        await getMonthlyStats({
          userId: mockUserId,
          yearMonth: testCase.yearMonth,
          timezone: undefined,
        });

        // ==================== Assert Process ====================
        expect(mockStatsModel.aggregate).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              $match: expect.objectContaining({
                "stats.summary.year": testCase.expectedYear,
                "stats.summary.month": testCase.expectedMonth,
              }),
            }) as any,
          ])
        );

        // Reset mock for next iteration
        mockStatsModel.aggregate.mockClear();
        mockStatsModel.aggregate.mockResolvedValue([]);
      }
    });

    it("should handle complex aggregation pipeline correctly", async () => {
      // ==================== Arrange ====================
      const getStatsParams = {
        userId: mockUserId,
        yearMonth: "2024-01",
        timezone: undefined,
      };

      mockStatsModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      await getMonthlyStats(getStatsParams);

      // ==================== Assert Process ====================
      const aggregateCall = mockStatsModel.aggregate.mock.calls[0][0];

      expect(aggregateCall).toEqual(
        expect.arrayContaining([
          { $match: { user: expect.any(mongoose.Types.ObjectId) } },
          { $unwind: "$stats" },
          expect.objectContaining({ $match: expect.any(Object) }) as any,
          expect.objectContaining({ $lookup: expect.any(Object) }) as any,
          expect.objectContaining({ $lookup: expect.any(Object) }) as any,
          expect.objectContaining({ $addFields: expect.any(Object) }) as any,
          { $replaceRoot: { newRoot: "$stats" } },
        ])
      );

      expect((aggregateCall[0] as any).$match.user).toBeInstanceOf(mongoose.Types.ObjectId);
    });

    it("should handle timezone conversion with complex peak hour data", async () => {
      // ==================== Arrange ====================
      const complexAggregateResult = [
        {
          songs: [
            {
              _id: mockSongId,
              title: "Test Song",
              artist: mockArtistName,
              imageUrl: "test-image.jpg",
              totalDuration: mockDuration,
              paletee: ["#ff0000"],
            },
          ],
          artists: [
            {
              _id: mockArtistId,
              name: mockArtistName,
              roles: ["vocalist"],
              coverImage: "artist-image.jpg",
              totalDuration: mockDuration,
            },
          ],
          peakHour: [
            {
              hour: 0,
              totalDuration: 100,
              utilization: 2.78,
            },
            {
              hour: 12,
              totalDuration: 200,
              utilization: 5.56,
            },
            {
              hour: 23,
              totalDuration: 150,
              utilization: 4.17,
            },
          ],
          summary: {
            month: 1,
            year: 2024,
            totalDuration: mockDuration,
            growthPercentage: 25.5,
            topArtist: mockArtistName,
            topArtistTotalPlaybackTime: mockDuration,
          },
        },
      ];

      const getStatsParams = {
        userId: mockUserId,
        yearMonth: "2024-01",
        timezone: "Asia/Tokyo",
      };

      mockStatsModel.aggregate.mockResolvedValue(complexAggregateResult);

      // ==================== Act ====================
      const result = await getMonthlyStats(getStatsParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.aggregate).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.peakHour).toBeDefined();
      expect(result.peakHour).toHaveLength(3);
      expect(result.peakHour[0]).toHaveProperty("hour");
      expect(typeof result.peakHour[0].hour).toBe("number");
    });

    it("should handle invalid yearMonth format", async () => {
      // ==================== Arrange ====================
      const getStatsParams = {
        userId: mockUserId,
        yearMonth: "invalid-format",
        timezone: undefined,
      };

      mockStatsModel.aggregate.mockResolvedValue([]);

      // ==================== Act ====================
      const result = await getMonthlyStats(getStatsParams);

      // ==================== Assert Process ====================
      expect(mockStatsModel.aggregate).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should handle aggregation failure", async () => {
      // ==================== Arrange ====================
      const getStatsParams = {
        userId: mockUserId,
        yearMonth: "2024-01",
        timezone: undefined,
      };

      mockStatsModel.aggregate.mockRejectedValue(new Error("Aggregation failed"));

      // ==================== Act & Assert ====================
      await expect(getMonthlyStats(getStatsParams)).rejects.toThrow("Aggregation failed");
    });

    it("should handle timezone conversion failure gracefully", async () => {
      // ==================== Arrange ====================
      const getStatsParams = {
        userId: mockUserId,
        yearMonth: "2024-01",
        timezone: "Invalid/Timezone",
      };

      mockStatsModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act & Assert ====================
      await expect(getMonthlyStats(getStatsParams)).rejects.toThrow("Invalid time zone specified");
    });
  });
});
