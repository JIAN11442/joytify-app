import SessionModel from "../../../src/models/session.model";
import { sessionOnlineStatusCheckSchedule } from "../../../src/schedules/session-online.schedule";
import { SESSION_THRESHOLD } from "../../../src/constants/env-validate.constant";

// Mock all external dependencies
jest.mock("../../../src/models/session.model");
jest.mock("../../../src/constants/env-validate.constant", () => ({
  SESSION_THRESHOLD: 5, // 5 minutes for testing
}));

// Mock type definitions
const mockSessionModel = SessionModel as jest.Mocked<typeof SessionModel>;

// Mock timers and console
jest.useFakeTimers();
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe("Session Online Schedule", () => {
  // Mock data constants
  const ONLINE_CHECK_THRESHOLD = SESSION_THRESHOLD * 60 * 1000; // 5 minutes in milliseconds

  const mockUpdateResult = {
    acknowledged: true,
    matchedCount: 3,
    modifiedCount: 2,
    upsertedCount: 0,
    upsertedId: null,
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    // Clean up timers after each test
    jest.clearAllTimers();
  });

  afterAll(() => {
    // Restore real timers and console
    jest.useRealTimers();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe("sessionOnlineStatusCheckSchedule", () => {
    it("should set up interval with correct timing", () => {
      // ==================== Arrange ====================
      const setIntervalSpy = jest.spyOn(global, "setInterval");

      // ==================== Act ====================
      sessionOnlineStatusCheckSchedule();

      // ==================== Assert Process ====================
      // 1. verify setInterval was called with correct interval
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), ONLINE_CHECK_THRESHOLD);
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);

      setIntervalSpy.mockRestore();
    });

    it("should update offline sessions successfully", async () => {
      // ==================== Arrange ====================
      mockSessionModel.updateMany.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      sessionOnlineStatusCheckSchedule();

      // Fast-forward time to trigger the interval
      await jest.advanceTimersByTimeAsync(ONLINE_CHECK_THRESHOLD);

      // ==================== Assert Process ====================
      // 1. verify updateMany was called with correct query structure
      expect(mockSessionModel.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          "status.lastActive": expect.objectContaining({ $lt: expect.any(Date) }),
          "status.online": true,
        }),
        { $set: { "status.online": false } }
      );

      // 2. verify success console log
      expect(mockConsoleLog).toHaveBeenCalledWith("⏳ Checking session online status...");
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `🟢 ${mockUpdateResult.modifiedCount} sessions updated`
      );
    });

    it("should handle database update errors gracefully", async () => {
      // ==================== Arrange ====================
      const mockError = new Error("Database connection failed");
      mockSessionModel.updateMany.mockRejectedValue(mockError);

      // ==================== Act ====================
      sessionOnlineStatusCheckSchedule();

      // Fast-forward time to trigger the interval
      await jest.advanceTimersByTimeAsync(ONLINE_CHECK_THRESHOLD);

      // ==================== Assert Process ====================
      // 1. verify error handling
      expect(mockConsoleLog).toHaveBeenCalledWith("⏳ Checking session online status...");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "🔴 Session online status check error:",
        mockError
      );

      // 2. verify updateMany was still called
      expect(mockSessionModel.updateMany).toHaveBeenCalledTimes(1);
    });

    it("should run multiple intervals correctly", async () => {
      // ==================== Arrange ====================
      const firstUpdateResult = { ...mockUpdateResult, modifiedCount: 1 };
      const secondUpdateResult = { ...mockUpdateResult, modifiedCount: 3 };

      mockSessionModel.updateMany
        .mockResolvedValueOnce(firstUpdateResult)
        .mockResolvedValueOnce(secondUpdateResult);

      // ==================== Act ====================
      sessionOnlineStatusCheckSchedule();

      // Fast-forward time to trigger first interval
      await jest.advanceTimersByTimeAsync(ONLINE_CHECK_THRESHOLD);

      // Fast-forward time to trigger second interval
      await jest.advanceTimersByTimeAsync(ONLINE_CHECK_THRESHOLD);

      // ==================== Assert Process ====================
      // 1. verify updateMany was called twice
      expect(mockSessionModel.updateMany).toHaveBeenCalledTimes(2);

      // 2. verify console logs for both runs
      expect(mockConsoleLog).toHaveBeenCalledWith("🟢 1 sessions updated");
      expect(mockConsoleLog).toHaveBeenCalledWith("🟢 3 sessions updated");
    });

    it("should use correct threshold calculation", () => {
      // ==================== Arrange ====================
      // The mocked SESSION_THRESHOLD is 5 minutes
      const expectedThreshold = 5 * 60 * 1000; // 300000 milliseconds

      const setIntervalSpy = jest.spyOn(global, "setInterval");

      // ==================== Act ====================
      sessionOnlineStatusCheckSchedule();

      // ==================== Assert Process ====================
      // 1. verify setInterval uses correct calculated threshold
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), expectedThreshold);

      setIntervalSpy.mockRestore();
    });

    it("should handle zero modified sessions", async () => {
      // ==================== Arrange ====================
      const noUpdateResult = { ...mockUpdateResult, modifiedCount: 0 };
      mockSessionModel.updateMany.mockResolvedValue(noUpdateResult);

      // ==================== Act ====================
      sessionOnlineStatusCheckSchedule();

      // Fast-forward time to trigger the interval
      await jest.advanceTimersByTimeAsync(ONLINE_CHECK_THRESHOLD);

      // ==================== Assert Process ====================
      // 1. verify update was attempted
      expect(mockSessionModel.updateMany).toHaveBeenCalledTimes(1);

      // 2. verify correct console log for zero updates
      expect(mockConsoleLog).toHaveBeenCalledWith("🟢 0 sessions updated");
    });

    it("should call updateMany with correct query structure", async () => {
      // ==================== Arrange ====================
      mockSessionModel.updateMany.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      sessionOnlineStatusCheckSchedule();
      await jest.advanceTimersByTimeAsync(ONLINE_CHECK_THRESHOLD);

      // ==================== Assert Process ====================
      // 1. verify updateMany was called once
      expect(mockSessionModel.updateMany).toHaveBeenCalledTimes(1);

      // 2. verify the structure of the query
      const [query, update] = mockSessionModel.updateMany.mock.calls[0];

      expect(query["status.lastActive"]).toBeDefined();
      expect(query["status.lastActive"]["$lt"]).toBeInstanceOf(Date);
      expect(query["status.online"]).toBe(true);

      expect(update).toEqual({ $set: { "status.online": false } });
    });
  });
});
