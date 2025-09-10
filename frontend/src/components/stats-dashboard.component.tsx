import AnimationWrapper from "./animation-wrapper.component";
import StatsTracksBreakdown from "./stats-tracks-breakdown.component";
import StatsListeningPattern from "./stats-listening-pattern.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HexPaletee, PopulatedMonthlyStatsResponse } from "@joytify/types/types";

type StatsDashboardProps = {
  fm: ScopedFormatMessage;
  monthlyStats: PopulatedMonthlyStatsResponse;
  paletee: HexPaletee;
};

const StatsDashboard: React.FC<StatsDashboardProps> = ({ fm, monthlyStats, paletee }) => {
  return (
    <AnimationWrapper
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        grid
        grid-cols-1
        md:grid-cols-2
        gap-5
      `}
    >
      <StatsListeningPattern fm={fm} monthlyStats={monthlyStats} paletee={paletee} />
      <StatsTracksBreakdown fm={fm} monthlyStats={monthlyStats} />
    </AnimationWrapper>
  );
};

export default StatsDashboard;
