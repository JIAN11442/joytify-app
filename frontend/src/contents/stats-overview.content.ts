import { GiLoveSong } from "react-icons/gi";
import { TbClockPlay } from "react-icons/tb";
import { BsPersonHeart } from "react-icons/bs";
import { MdTrendingFlat } from "react-icons/md";
import { HiTrendingDown, HiTrendingUp } from "react-icons/hi";
import { IconName } from "../components/react-icons.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { PopulatedMonthlyStatsResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type MonthlyStatsOverviewRequest = {
  fm: ScopedFormatMessage;
  monthlyStats: PopulatedMonthlyStatsResponse;
};

type MonthlyStatsOverviewField = {
  id: string;
  icon: { name: IconName; color: string; size: number };
  description: string;
  value: string | React.ReactNode;
};

export const getMonthlyStatsOverviewContent = (
  params: MonthlyStatsOverviewRequest
): MonthlyStatsOverviewField[] => {
  const { fm, monthlyStats } = params;
  const { summary } = monthlyStats;
  const { totalDuration, growthPercentage, topArtist } = summary;
  const { title: topSong } = monthlyStats.songs[0];

  const paletee = monthlyStats.songs[0].paletee;
  const monthlyStatsOverviewFm = fm("stats.monthlyStats.overview");
  const growthRateIcon =
    growthPercentage === 0 ? MdTrendingFlat : growthPercentage > 0 ? HiTrendingUp : HiTrendingDown;
  const growthRateIconColor =
    growthPercentage === 0 ? paletee.vibrant : growthPercentage > 0 ? "#22c55e" : "#f87171";

  const fields = [
    {
      id: "overview-total-listening-time",
      icon: { name: TbClockPlay, color: paletee.vibrant, size: 25 },
      description: monthlyStatsOverviewFm("totalListeningTime.description"),
      value: formatPlaybackDuration({ fm, duration: totalDuration, format: "text" }),
    },
    {
      id: "overview-total-growth-rate",
      icon: { name: growthRateIcon, color: growthRateIconColor, size: 25 },
      description: monthlyStatsOverviewFm("growthRate.description"),
      value: growthPercentage,
    },
    {
      id: "overview-top-artist",
      icon: { name: BsPersonHeart, color: paletee.vibrant, size: 25 },
      description: monthlyStatsOverviewFm("topArtist.description"),
      value: topArtist,
    },
    {
      id: "overview-top-song",
      icon: { name: GiLoveSong, color: paletee.vibrant, size: 25 },
      description: monthlyStatsOverviewFm("topSong.description"),
      value: topSong,
    },
  ] as MonthlyStatsOverviewField[];

  return fields;
};
