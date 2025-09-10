import { useRef } from "react";
import { useInView } from "framer-motion";
import AnimationWrapper from "./animation-wrapper.component";
import StatsSongRanking from "./stats-song-ranking.component";
import StatsArtistRanking from "./stats-artist-ranking.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HexPaletee, PopulatedMonthlyStatsResponse } from "@joytify/types/types";

type StatsLeaderboardProps = {
  fm: ScopedFormatMessage;
  monthlyStats: PopulatedMonthlyStatsResponse;
  paletee: HexPaletee;
};

const StatsLeaderboard: React.FC<StatsLeaderboardProps> = ({ fm, monthlyStats, paletee }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  return (
    <AnimationWrapper
      ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={`
        grid
        grid-cols-1
        md:grid-cols-2
        gap-5
      `}
    >
      <StatsSongRanking fm={fm} monthlyStats={monthlyStats} paletee={paletee} />
      <StatsArtistRanking fm={fm} monthlyStats={monthlyStats} paletee={paletee} />
    </AnimationWrapper>
  );
};

export default StatsLeaderboard;
