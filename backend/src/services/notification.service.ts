import mongoose from "mongoose";
import UserModel from "../models/user.model";
import { FETCH_LIMIT_PER_PAGE } from "../constants/env-validate.constant";
import { HttpCode, NotificationTypeOptions } from "@joytify/shared-types/constants";
import { PaginationQueryResponse, NotificationType } from "@joytify/shared-types/types";
import { getSocketServer } from "../config/socket.config";
import appAssert from "../utils/app-assert.util";

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;
const { ALL, MONTHLY_STATISTIC, FOLLOWING_ARTIST_UPDATE, SYSTEM_ANNOUNCEMENT } =
  NotificationTypeOptions;

type BroadcastNotificationToUsersRequest = {
  userIds: string[];
  notificationId: string;
  triggerSocket: boolean;
};

type MarkNotificationsRequest = {
  userId: string;
  notificationIds: string[];
};

type RemoveUserNotificationRequest = {
  userId: string;
  notificationId: string;
};

export const getUserNotificationsByType = async (
  userId: string,
  page: number,
  type: NotificationType
) => {
  let docs: PaginationQueryResponse<any> = { docs: [], totalDocs: 0, page: page };

  const load = FETCH_LIMIT_PER_PAGE;
  const fetchLimit = load * page;

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // basic aggregation pipeline (get all user notifications and filter monthly stats)
  const basePipeline = [
    { $match: { _id: userObjectId } },
    {
      $lookup: {
        from: "notifications",
        let: {
          notificationIds: "$notifications.id",
          notificationViewed: "$notifications.viewed",
          notificationRead: "$notifications.read",
        },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$notificationIds"] } } },
          {
            $addFields: {
              viewed: {
                $arrayElemAt: [
                  "$$notificationViewed",
                  { $indexOfArray: ["$$notificationIds", "$_id"] },
                ],
              },
              read: {
                $arrayElemAt: [
                  "$$notificationRead",
                  { $indexOfArray: ["$$notificationIds", "$_id"] },
                ],
              },
            },
          },
        ],
        as: "notificationDetails",
      },
    },
    { $unwind: "$notificationDetails" },
    { $replaceRoot: { newRoot: "$notificationDetails" } },
    {
      $lookup: {
        from: "stats",
        let: {
          userId: userObjectId,
          notificationMonth: { $month: "$createdAt" },
          notificationYear: { $year: "$createdAt" },
        },
        pipeline: [
          { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
          { $unwind: "$stats" },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $month: "$stats.createdAt" }, "$$notificationMonth"] },
                  { $eq: [{ $year: "$stats.createdAt" }, "$$notificationYear"] },
                ],
              },
            },
          },
          { $project: { summary: "$stats.summary" } },
          { $replaceRoot: { newRoot: "$summary" } },
        ],
        as: "userMonthlyStats",
      },
    },
    {
      $addFields: {
        monthlyStatistic: {
          $cond: [
            { $eq: ["$type", MONTHLY_STATISTIC] },
            { $arrayElemAt: ["$userMonthlyStats", 0] },
            "$$REMOVE",
          ],
        },
      },
    },
    {
      $unset: "userMonthlyStats",
    },
  ];

  // filter by type
  const typeFilter = type === ALL ? {} : { type };

  // use $facet to get total count and paginated data
  const result = await UserModel.aggregate([
    ...basePipeline,
    { $match: typeFilter },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $facet: {
        totalCount: [{ $count: "total" }],
        paginatedData: [{ $limit: fetchLimit }],
      },
    },
  ]);

  const totalDocs = result[0]?.totalCount[0]?.total || 0;
  const notificationsData = result[0]?.paginatedData || [];

  docs = {
    page,
    totalDocs,
    docs: notificationsData,
  };

  return { docs };
};

export const getUserUnviewedNotificationCount = async (userId: string) => {
  const result = await UserModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $project: {
        unviewedCount: {
          $size: {
            $filter: {
              input: "$notifications",
              cond: { $eq: ["$$this.viewed", false] },
            },
          },
        },
      },
    },
  ]);

  return result[0]?.unviewedCount || 0;
};

export const getUserNotificationTypeCounts = async (userId: string) => {
  const counts = await UserModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "notifications",
        let: { notificationIds: "$notifications.id" },
        pipeline: [{ $match: { $expr: { $in: ["$_id", "$$notificationIds"] } } }],
        as: "notificationDetails",
      },
    },
    { $unwind: "$notificationDetails" },
    { $replaceRoot: { newRoot: "$notificationDetails" } },
    {
      $group: {
        _id: null,
        all: { $sum: 1 },
        monthlyStatistic: {
          $sum: { $cond: [{ $eq: ["$type", MONTHLY_STATISTIC] }, 1, 0] },
        },
        followingArtistUpdate: {
          $sum: { $cond: [{ $eq: ["$type", FOLLOWING_ARTIST_UPDATE] }, 1, 0] },
        },
        systemAnnouncement: {
          $sum: { $cond: [{ $eq: ["$type", SYSTEM_ANNOUNCEMENT] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        all: 1,
        monthlyStatistic: 1,
        followingArtistUpdate: 1,
        systemAnnouncement: 1,
      },
    },
  ]);

  return {
    counts: counts[0] || {
      all: 0,
      monthlyStatistic: 0,
      followingArtistUpdate: 0,
      systemAnnouncement: 0,
    },
  };
};

export const triggerNotificationSocket = async (userIds: string[]) => {
  const socket = getSocketServer();

  userIds.forEach((userId) => {
    socket.to(`user:${userId}`).emit("notification:update");
  });
};

export const broadcastNotificationToUsers = async (params: BroadcastNotificationToUsersRequest) => {
  const { userIds, notificationId, triggerSocket } = params;

  const updatedUser = await UserModel.updateMany(
    { _id: { $in: userIds } },
    { $addToSet: { notifications: { id: notificationId, viewed: false, read: false } } }
  );

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to push notification to users");

  if (triggerSocket) {
    triggerNotificationSocket(userIds);
  }

  return { modifiedUserCount: updatedUser.modifiedCount };
};

export const markNotificationsAsViewed = async (params: MarkNotificationsRequest) => {
  const { userId, notificationIds } = params;

  const updatedUser = await UserModel.updateOne(
    { _id: userId },
    { $set: { "notifications.$[elem].viewed": true } },
    { arrayFilters: [{ "elem.id": { $in: notificationIds } }] }
  );

  appAssert(updatedUser.matchedCount > 0, NOT_FOUND, "User not found");

  return { modifiedCount: updatedUser.modifiedCount };
};

export const markNotificationsAsRead = async (params: MarkNotificationsRequest) => {
  const { userId, notificationIds } = params;

  const updatedUser = await UserModel.updateOne(
    { _id: userId },
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
          "elem.read": false, // only update notifications that are not already read
        },
      ],
    }
  );

  appAssert(updatedUser.matchedCount > 0, NOT_FOUND, "User not found");

  return { modifiedCount: updatedUser.modifiedCount };
};

export const removeUserNotification = async (params: RemoveUserNotificationRequest) => {
  const { userId, notificationId } = params;

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { $pull: { notifications: { id: notificationId } } },
    { new: true }
  );

  appAssert(updatedUser, NOT_FOUND, "User not found");

  return { modifiedCount: updatedUser.modifiedCount };
};
