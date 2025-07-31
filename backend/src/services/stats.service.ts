import mongoose from "mongoose";
import StatsModel from "../models/stats.model";
import MusicianModel from "../models/musician.model";
import { GetMonthlyStatsRequest, UserStats } from "@joytify/shared-types/types";

type StatItem = { [key: string]: any; totalDuration: number; utilization?: number };

type UpdateOrInsertAndSortRequest<T extends StatItem> = {
  key: keyof T;
  itemStats: T[];
  itemId: string | number;
  duration: number;
  createNewItem: () => T;
  sortBy?: keyof T;
  sortOrder?: "asc" | "desc";
};

type UpdateMonthlyStatsServiceRequest = {
  userId: string;
  songId: string;
  artistId: string;
  duration: number;
  timestamp: Date;
};

// artist name cache
const artistNameCache = new Map<string, { name: string; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * get artist name (with cache)
 */
const getArtistName = async (artistId: string): Promise<string> => {
  const cached = artistNameCache.get(artistId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.name;
  }

  try {
    const musician = await MusicianModel.findById(artistId).select("name").lean();
    const artistName = musician?.name || "Unknown Artist";
    artistNameCache.set(artistId, { name: artistName, timestamp: Date.now() });
    return artistName;
  } catch (error) {
    console.error(`Failed to fetch artist name for ${artistId}:`, error);
    return "Unknown Artist";
  }
};

/**
 * calculate growth percentage
 */
const calculateGrowthPercentage = (current: number, previous?: number): number => {
  if (!previous || previous === 0) return 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

/**
 * update or insert and sort stat item
 */
const updateOrInsertAndSort = <T extends StatItem>(params: UpdateOrInsertAndSortRequest<T>) => {
  const {
    key,
    itemStats,
    itemId,
    duration,
    createNewItem,
    sortBy = "totalDuration",
    sortOrder = "desc",
  } = params;

  const itemStat = itemStats.find((item) => item[key].toString() === itemId.toString());

  if (itemStat) {
    itemStat.totalDuration += duration;
    if (itemStat.utilization !== undefined) {
      itemStat.utilization = parseFloat(((itemStat.totalDuration / 3600) * 100).toFixed(2));
    }
  } else {
    itemStats.push(createNewItem());
  }

  // 根據指定的字段和排序方向進行排序
  itemStats.sort((a, b) => (sortOrder === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]));
};

/**
 * create new month stat
 */
const createNewMonthStat = async (
  songId: string,
  artistId: string,
  duration: number,
  timestamp: Date,
  previousMonthStat?: UserStats
) => {
  const artistName = await getArtistName(artistId);

  const growthPercentage = calculateGrowthPercentage(
    duration,
    previousMonthStat?.summary?.totalDuration
  );

  return {
    songs: [{ song: songId, totalDuration: duration }],
    artists: [{ artist: artistId, totalDuration: duration }],
    peakHour: [
      {
        hour: timestamp.getUTCHours(),
        totalDuration: duration,
        utilization: parseFloat(((duration / 3600) * 100).toFixed(2)),
      },
    ],
    summary: {
      month: timestamp.getUTCMonth() + 1,
      year: timestamp.getUTCFullYear(),
      totalDuration: duration,
      growthPercentage,
      topArtist: artistName,
      topArtistTotalPlaybackTime: duration,
    },
  };
};

/**
 * update current month stat
 */
const updateCurrentMonthStat = async (
  currentMonthStat: UserStats,
  songId: string,
  artistId: string,
  duration: number,
  timestamp: Date,
  previousMonthStat?: UserStats
) => {
  // 更新 songs
  updateOrInsertAndSort({
    key: "song",
    itemStats: currentMonthStat.songs,
    itemId: songId,
    duration,
    createNewItem: () => ({ song: songId, totalDuration: duration }),
    sortBy: "totalDuration",
    sortOrder: "desc",
  });

  // 更新 artists
  updateOrInsertAndSort({
    key: "artist",
    itemStats: currentMonthStat.artists,
    itemId: artistId,
    duration,
    createNewItem: () => ({ artist: artistId, totalDuration: duration }),
    sortBy: "totalDuration",
    sortOrder: "desc",
  });

  // 更新 peak hour
  updateOrInsertAndSort({
    key: "hour",
    itemStats: currentMonthStat.peakHour,
    itemId: timestamp.getUTCHours(),
    duration,
    createNewItem: () => ({
      hour: timestamp.getUTCHours(),
      totalDuration: duration,
      utilization: parseFloat(((duration / 3600) * 100).toFixed(2)),
    }),
    sortBy: "hour",
    sortOrder: "asc",
  });

  // update summary
  const newTotalDuration = currentMonthStat.summary.totalDuration + duration;
  const topArtistId = currentMonthStat.artists[0]?.artist;
  const topArtistName = topArtistId ? await getArtistName(topArtistId) : "Unknown Artist";

  currentMonthStat.summary = {
    ...currentMonthStat.summary,
    totalDuration: newTotalDuration,
    growthPercentage: calculateGrowthPercentage(
      newTotalDuration,
      previousMonthStat?.summary?.totalDuration
    ),
    topArtist: topArtistName,
    topArtistTotalPlaybackTime: currentMonthStat.artists[0]?.totalDuration || duration,
  };
};

/**
 * find stat in date range
 */
const findStatInDateRange = (
  stats: UserStats[],
  startDate: Date,
  endDate: Date
): UserStats | undefined => {
  return stats.find((stat) => {
    const created = new Date(stat.createdAt);
    return created >= startDate && created < endDate;
  });
};

/**
 * track playback stats with retry logic for version conflicts
 */
export const trackPlaybackStats = async (params: UpdateMonthlyStatsServiceRequest) => {
  const { userId, songId, artistId, duration, timestamp } = params;

  // 1. 計算日期範圍
  const now = new Date();
  const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  // 2. 查找用戶的 stats 數據
  const userStats = await StatsModel.findOne({ user: userId });

  // 2.1. 查詢前一個月的 stats 數據
  const previousMonthStat = userStats?.stats
    ? findStatInDateRange(userStats.stats, previousMonth, startOfMonth)
    : undefined;

  // 3. 如果存在，那就查詢當月是否紀錄過
  if (userStats) {
    const currentMonthStat = findStatInDateRange(userStats.stats, startOfMonth, startOfNextMonth);

    // 3.1. 如果當月已經紀錄過，那就更新當月的 stats 數據
    if (currentMonthStat) {
      await updateCurrentMonthStat(
        currentMonthStat,
        songId,
        artistId,
        duration,
        timestamp,
        previousMonthStat
      );
    } else {
      // 3.2. 如果當月還沒紀錄過，那就為這用戶創建一個新的 stats 數據
      const newMonthStat = await createNewMonthStat(
        songId,
        artistId,
        duration,
        timestamp,
        previousMonthStat
      );
      userStats.stats.push(newMonthStat);
    }

    // 3.3. 更新 stats
    userStats.markModified("stats");
    await userStats.save();
  }
  // 4. 如果不存在，那就為這用戶創建一個新的 stats 數據
  else {
    const newMonthStat = await createNewMonthStat(
      songId,
      artistId,
      duration,
      timestamp,
      previousMonthStat
    );

    await StatsModel.create({
      user: userId,
      stats: [newMonthStat],
    });
  }
};

export const getMonthlyStats = async (params: GetMonthlyStatsRequest) => {
  const { userId, yearMonth, timezone } = params;
  const [year, month] = yearMonth.split("-").map(Number);

  const userStats = await StatsModel.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $unwind: "$stats" },
    {
      $match: {
        "stats.summary.year": year,
        "stats.summary.month": month,
        createdAt: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) },
      },
    },
    // populate songs with artist names while preserving order
    {
      $lookup: {
        from: "songs",
        let: { songItems: "$stats.songs" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$songItems.song"] } } },
          {
            $lookup: {
              from: "musicians",
              localField: "artist",
              foreignField: "_id",
              as: "artistInfo",
            },
          },
          {
            $addFields: {
              artist: { $arrayElemAt: ["$artistInfo.name", 0] },
              totalDuration: {
                $let: {
                  vars: {
                    matchedSong: {
                      $arrayElemAt: [
                        {
                          $filter: { input: "$$songItems", cond: { $eq: ["$$this.song", "$_id"] } },
                        },
                        0,
                      ],
                    },
                  },
                  in: "$$matchedSong.totalDuration",
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              artist: 1,
              imageUrl: 1,
              totalDuration: 1,
              paletee: 1,
            },
          },
        ],
        as: "populatedSongs",
      },
    },
    // populate artists while preserving order
    {
      $lookup: {
        from: "musicians",
        let: { artistItems: "$stats.artists" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$artistItems.artist"] } } },
          {
            $addFields: {
              totalDuration: {
                $let: {
                  vars: {
                    matchedArtist: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$$artistItems",
                            cond: { $eq: ["$$this.artist", "$_id"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: "$$matchedArtist.totalDuration",
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              roles: 1,
              coverImage: 1,
              totalDuration: 1,
            },
          },
        ],
        as: "populatedArtists",
      },
    },
    // reorder populated data to match original order
    {
      $addFields: {
        "stats.songs": {
          $map: {
            input: "$stats.songs",
            as: "songItem",
            in: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$populatedSongs",
                    cond: { $eq: ["$$this._id", "$$songItem.song"] },
                  },
                },
                0,
              ],
            },
          },
        },
        "stats.artists": {
          $map: {
            input: "$stats.artists",
            as: "artistItem",
            in: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$populatedArtists",
                    cond: { $eq: ["$$this._id", "$$artistItem.artist"] },
                  },
                },
                0,
              ],
            },
          },
        },
      },
    },
    {
      $replaceRoot: { newRoot: "$stats" },
    },
  ]);

  const result = userStats[0] || null;

  // 如果提供了時區，轉換 peakHour 的 UTC 小時為當地時間
  if (result && timezone) {
    result.peakHour = result.peakHour.map(
      (peakHour: { hour: number; totalDuration: number; utilization: number }) => {
        // 創建一個 UTC 時間對象，然後轉換為指定時區
        const utcDate = new Date();
        utcDate.setUTCHours(peakHour.hour, 0, 0, 0);

        // 使用 Intl.DateTimeFormat 來獲取指定時區的小時
        const localHour = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "numeric",
          hour12: false,
        })
          .formatToParts(utcDate)
          .find((part) => part.type === "hour")?.value;

        return {
          ...peakHour,
          hour: parseInt(localHour || peakHour.hour.toString(), 10),
        };
      }
    );
  }

  return result;
};

// clear artist name cache every hour
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of artistNameCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        artistNameCache.delete(key);
      }
    }
  },
  60 * 60 * 1000
);
