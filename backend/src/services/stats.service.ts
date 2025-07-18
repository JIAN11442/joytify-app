import StatsModel from "../models/stats.model";
import MusicianModel from "../models/musician.model";
import { UserStats } from "@joytify/shared-types/types";

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

// 藝術家名稱緩存
const artistNameCache = new Map<string, { name: string; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30分鐘

/**
 * 獲取藝術家名稱（帶緩存）
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
 * 計算增長百分比
 */
const calculateGrowthPercentage = (current: number, previous?: number): number => {
  if (!previous || previous === 0) return 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

/**
 * 更新或插入並排序統計項目
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
 * 創建新的月度統計數據
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
      totalDuration: duration,
      growthPercentage,
      topArtist: artistName,
      topArtistTotalPlaybackTime: duration,
    },
  };
};

/**
 * 更新現有月份的統計數據
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

  // 更新 summary
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
 * 查找指定日期範圍內的統計數據
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
 * 追蹤播放統計數據
 */
export const trackPlaybackStats = async (params: UpdateMonthlyStatsServiceRequest) => {
  const { userId, songId, artistId, duration, timestamp } = params;

  try {
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
  } catch (error) {
    console.error("Failed to track playback stats:", error);
    throw new Error(
      `Failed to track playback stats: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// 定期清理緩存（每小時）
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
