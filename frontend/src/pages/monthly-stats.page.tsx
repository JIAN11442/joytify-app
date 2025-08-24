import { useParams } from "react-router-dom";
import StatsDashboard from "../components/stats-dashboard.component";
import StatsOverviewSection from "../components/stats-overview.component";
import StatsLeaderboard from "../components/stats-leaderboard.component";
import { useGetMonthlyStats } from "../hooks/stats-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";

type MonthlyStatsUrlParams = {
  userId: string;
  yearMonth: string;
};

const MonthlyStatsPage = () => {
  const { fm } = useScopedIntl();

  const params = useParams<MonthlyStatsUrlParams>();
  const userId = params.userId || "";
  const yearMonth = params.yearMonth || "";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { monthlyStats } = useGetMonthlyStats({ userId, yearMonth, timezone });

  if (!monthlyStats) return null;

  // get paletee from first valid song
  const validSongs = monthlyStats.songs?.filter((song) => song && song.paletee) || [];
  const paletee = validSongs[0]?.paletee;

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(
          to bottom,
          ${paletee?.vibrant} 0%,
          ${paletee?.darkMuted} 30%,
          #171717 90%
        )`,
      }}
      className={`flex flex-col gap-5 h-full p-10 overflow-x-hidden`}
    >
      <StatsOverviewSection
        fm={fm}
        yearMonth={yearMonth}
        monthlyStats={monthlyStats}
        paletee={paletee}
      />
      <StatsDashboard fm={fm} monthlyStats={monthlyStats} paletee={paletee} />
      <StatsLeaderboard fm={fm} monthlyStats={monthlyStats} paletee={paletee} />
    </div>
  );
};

export default MonthlyStatsPage;
