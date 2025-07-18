import mongoose from "mongoose";
import UserModel from "../models/user.model";
import NotificationModel from "../models/notification.model";
import { FETCH_LIMIT_PER_PAGE, PROFILE_FETCH_LIMIT } from "../constants/env-validate.constant";
import { NotificationTypeOptions } from "@joytify/shared-types/constants";
import {
  CreateNotificationRequest,
  NotificationType,
  PaginationQueryResponse,
} from "@joytify/shared-types/types";

const { ALL, MONTHLY_STATISTIC, FOLLOWING_ARTIST_UPDATE, SYSTEM_ANNOUNCEMENT } =
  NotificationTypeOptions;

export const getUserNotificationCounts = async (userId: string) => {
  const counts = await UserModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "notifications",
        localField: "notifications.read",
        foreignField: "_id",
        as: "readNotifications",
      },
    },
    {
      $lookup: {
        from: "notifications",
        localField: "notifications.unread",
        foreignField: "_id",
        as: "unreadNotifications",
      },
    },
    {
      $project: {
        allNotifications: {
          $concatArrays: ["$readNotifications", "$unreadNotifications"],
        },
      },
    },
    {
      $unwind: "$allNotifications",
    },
    {
      $group: {
        _id: null,
        all: { $sum: 1 },
        monthlyStatistic: {
          $sum: { $cond: [{ $eq: ["$allNotifications.type", MONTHLY_STATISTIC] }, 1, 0] },
        },
        followingArtistUpdate: {
          $sum: { $cond: [{ $eq: ["$allNotifications.type", FOLLOWING_ARTIST_UPDATE] }, 1, 0] },
        },
        systemAnnouncement: {
          $sum: { $cond: [{ $eq: ["$allNotifications.type", SYSTEM_ANNOUNCEMENT] }, 1, 0] },
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

export const getUserNotificationsByType = async (
  userId: string,
  page: number,
  type: NotificationType
) => {
  let docs: PaginationQueryResponse<any> = { docs: [], totalDocs: 0, page: page };

  const load = 3;
  const fetchLimit = load * page;

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // basic aggregation pipeline (get all user notifications and filter monthly stats)
  const basePipeline = [
    { $match: { _id: userObjectId } },
    {
      $lookup: {
        from: "notifications",
        let: { readIds: "$notifications.read", unreadIds: "$notifications.unread" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [{ $in: ["$_id", "$$readIds"] }, { $in: ["$_id", "$$unreadIds"] }],
              },
            },
          },
          {
            $addFields: {
              isRead: { $cond: [{ $in: ["$_id", "$$readIds"] }, true, false] },
            },
          },
        ],
        as: "allNotifications",
      },
    },
    { $unwind: "$allNotifications" },
    { $replaceRoot: { newRoot: "$allNotifications" } },
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
            null,
          ],
        },
      },
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

export const createNotification = async (params: CreateNotificationRequest) => {
  const notification = await NotificationModel.create(params);

  return notification;
};
