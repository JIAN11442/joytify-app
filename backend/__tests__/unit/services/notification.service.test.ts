import mongoose from "mongoose";
import UserModel from "../../../src/models/user.model";
import {
  getUserNotificationsByType,
  getUserUnviewedNotificationCount,
  getUserNotificationTypeCounts,
  triggerNotificationSocket,
  broadcastNotificationToUsers,
  markNotificationsAsViewed,
  markNotificationsAsRead,
  removeUserNotification,
} from "../../../src/services/notification.service";
import { NotificationFilterOptions } from "@joytify/shared-types/constants";
import { getSocketServer } from "../../../src/config/socket.config";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("../../../src/models/user.model");
jest.mock("../../../src/config/socket.config");
jest.mock("../../../src/utils/app-assert.util");

// Mock type definitions
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockGetSocketServer = getSocketServer as jest.MockedFunction<typeof getSocketServer>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;

describe("Notification Service", () => {
  // Mock data constants
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockNotificationId = "507f1f77bcf86cd799439012";
  const mockUserObjectId = new mongoose.Types.ObjectId(mockUserId);
  const mockNotificationObjectId = new mongoose.Types.ObjectId(mockNotificationId);

  const mockNotification = {
    _id: mockNotificationObjectId,
    type: "monthly_statistic",
    title: "Monthly Report",
    content: "Your monthly listening report is ready",
    createdAt: new Date("2024-01-01"),
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

    // Mock socket server
    const mockSocket = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    mockGetSocketServer.mockReturnValue(mockSocket as any);
  });

  describe("getUserNotificationsByType", () => {
    it("should get user notifications by type successfully", async () => {
      // ==================== Arrange ====================
      const page = 1;
      const type = NotificationFilterOptions.ALL;

      const mockAggregateResult: any[] = [
        {
          totalCount: [{ total: 1 }],
          paginatedData: [mockNotification],
        },
      ];

      mockUserModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getUserNotificationsByType(mockUserId, page, type);

      // ==================== Assert Process ====================
      // 1. verify aggregate was called with correct pipeline
      expect(mockUserModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ $match: { _id: mockUserObjectId } }),
          expect.objectContaining({ $lookup: expect.any(Object) }),
        ])
      );

      // 2. verify correct result structure
      expect(result).toEqual({
        docs: {
          page,
          totalDocs: 1,
          docs: [mockNotification],
        },
      });
    });

    it("should handle empty notifications", async () => {
      // ==================== Arrange ====================
      const page = 1;
      const type = NotificationFilterOptions.MONTHLY_STATISTIC;

      const mockAggregateResult: any[] = [
        {
          totalCount: [],
          paginatedData: [],
        },
      ];

      mockUserModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getUserNotificationsByType(mockUserId, page, type);

      // ==================== Assert Process ====================
      // 1. verify correct result for empty notifications
      expect(result).toEqual({
        docs: {
          page,
          totalDocs: 0,
          docs: [],
        },
      });
    });

    it("should handle specific notification type filter", async () => {
      // ==================== Arrange ====================
      const page = 1;
      const type = NotificationFilterOptions.FOLLOWING_ARTIST_UPDATE;

      const mockAggregateResult: any[] = [
        {
          totalCount: [{ total: 2 }],
          paginatedData: [
            mockNotification,
            { ...mockNotification, _id: new mongoose.Types.ObjectId() },
          ],
        },
      ];

      mockUserModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getUserNotificationsByType(mockUserId, page, type);

      // ==================== Assert Process ====================
      // 1. verify aggregate was called with type filter
      expect(mockUserModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ $match: { type } })])
      );

      // 2. verify correct result
      expect(result.docs.totalDocs).toBe(2);
      expect(result.docs.docs).toHaveLength(2);
    });

    it("should handle aggregation error", async () => {
      // ==================== Arrange ====================
      const page = 1;
      const type = NotificationFilterOptions.ALL;

      const aggregationError = new Error("Database aggregation failed");
      mockUserModel.aggregate.mockRejectedValue(aggregationError);

      // ==================== Act & Assert ====================
      await expect(getUserNotificationsByType(mockUserId, page, type)).rejects.toThrow(
        "Database aggregation failed"
      );
    });
  });

  describe("getUserUnviewedNotificationCount", () => {
    it("should get unviewed notification count successfully", async () => {
      // ==================== Arrange ====================
      const mockAggregateResult: any[] = [{ unviewedCount: 3 }];

      mockUserModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getUserUnviewedNotificationCount(mockUserId);

      // ==================== Assert Process ====================
      // 1. verify aggregate was called with correct pipeline
      expect(mockUserModel.aggregate).toHaveBeenCalledWith([
        { $match: { _id: mockUserObjectId } },
        expect.objectContaining({
          $project: expect.objectContaining({
            unviewedCount: expect.any(Object),
          }),
        }),
      ]);

      // 2. verify correct result
      expect(result).toBe(3);
    });

    it("should return 0 when no unviewed notifications", async () => {
      // ==================== Arrange ====================
      const mockAggregateResult: any[] = [{ unviewedCount: 0 }];

      mockUserModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getUserUnviewedNotificationCount(mockUserId);

      // ==================== Assert Process ====================
      expect(result).toBe(0);
    });

    it("should return 0 when user not found", async () => {
      // ==================== Arrange ====================
      const mockAggregateResult: any[] = [];

      mockUserModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getUserUnviewedNotificationCount(mockUserId);

      // ==================== Assert Process ====================
      expect(result).toBe(0);
    });
  });

  describe("getUserNotificationTypeCounts", () => {
    it("should get notification type counts successfully", async () => {
      // ==================== Arrange ====================
      const mockAggregateResult: any[] = [
        {
          all: 5,
          monthlyStatistic: 2,
          followingArtistUpdate: 1,
          systemAnnouncement: 2,
        },
      ];

      mockUserModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getUserNotificationTypeCounts(mockUserId);

      // ==================== Assert Process ====================
      // 1. verify aggregate was called with correct pipeline
      expect(mockUserModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          { $match: { _id: mockUserObjectId } },
          expect.objectContaining({ $lookup: expect.any(Object) }),
        ])
      );

      // 2. verify correct result
      expect(result).toEqual({
        counts: {
          all: 5,
          monthlyStatistic: 2,
          followingArtistUpdate: 1,
          systemAnnouncement: 2,
        },
      });
    });

    it("should return zero counts when no notifications", async () => {
      // ==================== Arrange ====================
      const mockAggregateResult: any[] = [];

      mockUserModel.aggregate.mockResolvedValue(mockAggregateResult);

      // ==================== Act ====================
      const result = await getUserNotificationTypeCounts(mockUserId);

      // ==================== Assert Process ====================
      expect(result).toEqual({
        counts: {
          all: 0,
          monthlyStatistic: 0,
          followingArtistUpdate: 0,
          systemAnnouncement: 0,
        },
      });
    });
  });

  describe("triggerNotificationSocket", () => {
    it("should trigger socket notifications for multiple users", async () => {
      // ==================== Arrange ====================
      const userIds = [mockUserId, "507f1f77bcf86cd799439013"];
      const mockSocket = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
      mockGetSocketServer.mockReturnValue(mockSocket as any);

      // ==================== Act ====================
      await triggerNotificationSocket(userIds);

      // ==================== Assert Process ====================
      // 1. verify socket server was retrieved
      expect(mockGetSocketServer).toHaveBeenCalled();

      // 2. verify socket emit was called for each user
      expect(mockSocket.to).toHaveBeenCalledWith(`user:${mockUserId}`);
      expect(mockSocket.to).toHaveBeenCalledWith(`user:507f1f77bcf86cd799439013`);
      expect(mockSocket.emit).toHaveBeenCalledWith("notification:update");
    });

    it("should handle empty user IDs array", async () => {
      // ==================== Arrange ====================
      const userIds: string[] = [];
      const mockSocket = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
      mockGetSocketServer.mockReturnValue(mockSocket as any);

      // ==================== Act ====================
      await triggerNotificationSocket(userIds);

      // ==================== Assert Process ====================
      // 1. verify socket server was retrieved
      expect(mockGetSocketServer).toHaveBeenCalled();

      // 2. verify no socket operations for empty array
      expect(mockSocket.to).not.toHaveBeenCalled();
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe("broadcastNotificationToUsers", () => {
    it("should broadcast notification to users successfully", async () => {
      // ==================== Arrange ====================
      const userIds = [mockUserId, "507f1f77bcf86cd799439013"];
      const params = {
        userIds,
        notificationId: mockNotificationId,
        triggerSocket: true,
      };

      const mockUpdateResult = {
        modifiedCount: 2,
        matchedCount: 2,
      };

      mockUserModel.updateMany.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      const result = await broadcastNotificationToUsers(params);

      // ==================== Assert Process ====================
      // 1. verify updateMany was called with correct parameters
      expect(mockUserModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: userIds } },
        {
          $addToSet: {
            notifications: {
              id: mockNotificationId,
              viewed: false,
              read: false,
            },
          },
        }
      );

      // 2. verify appAssert was called
      expect(mockAppAssert).toHaveBeenCalledWith(
        mockUpdateResult,
        500,
        "Failed to push notification to users"
      );

      // 3. verify socket was triggered
      expect(mockGetSocketServer).toHaveBeenCalled();

      // 4. verify correct result
      expect(result).toEqual({
        modifiedUserCount: 2,
      });
    });

    it("should not trigger socket when triggerSocket is false", async () => {
      // ==================== Arrange ====================
      const userIds = [mockUserId];
      const params = {
        userIds,
        notificationId: mockNotificationId,
        triggerSocket: false,
      };

      const mockUpdateResult = {
        modifiedCount: 1,
        matchedCount: 1,
      };

      mockUserModel.updateMany.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      const result = await broadcastNotificationToUsers(params);

      // ==================== Assert Process ====================
      // 1. verify socket was not triggered
      expect(mockGetSocketServer).not.toHaveBeenCalled();

      // 2. verify correct result
      expect(result).toEqual({
        modifiedUserCount: 1,
      });
    });

    it("should throw error when updateMany fails", async () => {
      // ==================== Arrange ====================
      const userIds = [mockUserId];
      const params = {
        userIds,
        notificationId: mockNotificationId,
        triggerSocket: false,
      };

      // Mock updateMany to return null (simulating failure)
      mockUserModel.updateMany.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(broadcastNotificationToUsers(params)).rejects.toThrow(
        "Failed to push notification to users"
      );

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 500, "Failed to push notification to users");
    });
  });

  describe("markNotificationsAsViewed", () => {
    it("should mark notifications as viewed successfully", async () => {
      // ==================== Arrange ====================
      const notificationIds = [mockNotificationId, "507f1f77bcf86cd799439013"];
      const params = {
        userId: mockUserId,
        notificationIds,
      };

      const mockUpdateResult = {
        modifiedCount: 2,
        matchedCount: 1,
      };

      mockUserModel.updateOne.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      const result = await markNotificationsAsViewed(params);

      // ==================== Assert Process ====================
      // 1. verify updateOne was called with correct parameters
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId },
        { $set: { "notifications.$[elem].viewed": true } },
        {
          arrayFilters: [{ "elem.id": { $in: notificationIds } }],
        }
      );

      // 2. verify appAssert was called
      expect(mockAppAssert).toHaveBeenCalledWith(
        mockUpdateResult.matchedCount > 0,
        404,
        "User not found"
      );

      // 3. verify correct result
      expect(result).toEqual({
        modifiedCount: 2,
      });
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      const notificationIds = [mockNotificationId];
      const params = {
        userId: mockUserId,
        notificationIds,
      };

      const mockUpdateResult = {
        modifiedCount: 0,
        matchedCount: 0,
      };

      mockUserModel.updateOne.mockResolvedValue(mockUpdateResult);

      // ==================== Act & Assert ====================
      await expect(markNotificationsAsViewed(params)).rejects.toThrow("User not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(false, 404, "User not found");
    });
  });

  describe("markNotificationsAsRead", () => {
    it("should mark notifications as read successfully", async () => {
      // ==================== Arrange ====================
      const notificationIds = [mockNotificationId, "507f1f77bcf86cd799439013"];
      const params = {
        userId: mockUserId,
        notificationIds,
      };

      const mockUpdateResult = {
        modifiedCount: 2,
        matchedCount: 1,
      };

      mockUserModel.updateOne.mockResolvedValue(mockUpdateResult);

      // ==================== Act ====================
      const result = await markNotificationsAsRead(params);

      // ==================== Assert Process ====================
      // 1. verify updateOne was called with correct parameters
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId },
        {
          $set: {
            "notifications.$[elem].read": true,
            "notifications.$[elem].viewed": true,
          },
        },
        {
          arrayFilters: [
            {
              "elem.id": { $in: notificationIds },
              "elem.read": false,
            },
          ],
        }
      );

      // 2. verify appAssert was called
      expect(mockAppAssert).toHaveBeenCalledWith(
        mockUpdateResult.matchedCount > 0,
        404,
        "User not found"
      );

      // 3. verify correct result
      expect(result).toEqual({
        modifiedCount: 2,
      });
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      const notificationIds = [mockNotificationId];
      const params = {
        userId: mockUserId,
        notificationIds,
      };

      const mockUpdateResult = {
        modifiedCount: 0,
        matchedCount: 0,
      };

      mockUserModel.updateOne.mockResolvedValue(mockUpdateResult);

      // ==================== Act & Assert ====================
      await expect(markNotificationsAsRead(params)).rejects.toThrow("User not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(false, 404, "User not found");
    });
  });

  describe("removeUserNotification", () => {
    it("should remove user notification successfully", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        notificationId: mockNotificationId,
      };

      const mockUpdateResult = {
        _id: mockUserObjectId,
        modifiedCount: 1,
      };

      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUpdateResult as any);

      // ==================== Act ====================
      const result = await removeUserNotification(params);

      // ==================== Assert Process ====================
      // 1. verify findByIdAndUpdate was called with correct parameters
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        { $pull: { notifications: { id: mockNotificationId } } },
        { new: true }
      );

      // 2. verify appAssert was called
      expect(mockAppAssert).toHaveBeenCalledWith(mockUpdateResult, 404, "User not found");

      // 3. verify correct result
      expect(result).toEqual({
        modifiedCount: 1,
      });
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        notificationId: mockNotificationId,
      };

      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      await expect(removeUserNotification(params)).rejects.toThrow("User not found");

      // ==================== Assert Process ====================
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "User not found");
    });

    it("should handle database error", async () => {
      // ==================== Arrange ====================
      const params = {
        userId: mockUserId,
        notificationId: mockNotificationId,
      };

      const databaseError = new Error("Database connection failed");
      mockUserModel.findByIdAndUpdate.mockRejectedValue(databaseError);

      // ==================== Act & Assert ====================
      await expect(removeUserNotification(params)).rejects.toThrow("Database connection failed");
    });
  });
});
