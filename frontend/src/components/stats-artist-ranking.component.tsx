import { TbMoodHeart } from "react-icons/tb";
import Icon from "./react-icons.component";
import SongTitleItem from "./song-title-item.component";
import AnimationWrapper from "./animation-wrapper.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HexPaletee, PopulatedMonthlyStatsResponse } from "@joytify/types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type StatsArtistRankingProps = {
  fm: ScopedFormatMessage;
  monthlyStats: PopulatedMonthlyStatsResponse;
  paletee: HexPaletee;
};

const StatsArtistRanking: React.FC<StatsArtistRankingProps> = ({ fm, monthlyStats, paletee }) => {
  const { artists } = monthlyStats;

  const statsMonthlyStatsFm = fm("stats.monthlyStats");
  const artistRankingFm = fm("stats.monthlyStats.leaderboard.artistRanking");

  return (
    <div className={`stats-card-wrapper gap-8`}>
      {/* title */}
      <div className={`flex items-center gap-5`}>
        <Icon name={TbMoodHeart} opts={{ size: 25, color: paletee.vibrant }} />
        <p className={`text-xl font-bold`}>{`${artistRankingFm("title")} (${artists.length})`}</p>
      </div>

      {/* artist list */}
      <div
        className={`
          flex
          flex-col
          gap-6
          max-h-[30rem]
          overflow-y-auto
          hidden-scrollbar
        `}
      >
        {artists && artists.length > 0 ? (
          artists
            .filter((artist) => artist && artist._id && artist.name) // 過濾掉無效的藝術家
            .map((artist, index) => {
              const { _id: artistId, name, coverImage, roles, totalDuration } = artist;

              // 防護措施：確保必要屬性存在
              if (!artistId || !name || !totalDuration) {
                return null;
              }

              const artistRole = roles?.join(", ") || "";
              const artistDuration = formatPlaybackDuration({ fm, duration: totalDuration });
              const artistPercentage = `${(
                (totalDuration / monthlyStats.summary.totalDuration) *
                100
              ).toFixed(2)}%`;

              return (
                <AnimationWrapper
                  key={`stats-artist-ranking-${artistId}`}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    flex
                    gap-5
                    items-center  
                    justify-between
                  `}
                >
                  {/* index & title */}
                  <div className={`flex items-center gap-5`}>
                    <p className={`text-sm`}>{index + 1}</p>

                    <SongTitleItem
                      title={name}
                      imageUrl={coverImage}
                      artist={artistRole}
                      className={{
                        title: "text-sm text-neutral-300 font-semibold",
                        artist: "text-sm text-neutral-500",
                      }}
                    />
                  </div>

                  {/* song duration */}
                  <div
                    className={`
                      flex
                      flex-col
                      gap-2
                      text-sm
                    `}
                  >
                    <p className={`text-neutral-300 font-semibold`}>{artistDuration}</p>
                    <p className={`text-neutral-500`}>{artistPercentage}</p>
                  </div>
                </AnimationWrapper>
              );
            })
            .filter(Boolean) // 過濾掉 null 值
        ) : (
          <div className={`flex h-full items-center justify-center`}>
            <p className="text-neutral-500">{statsMonthlyStatsFm("noData")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsArtistRanking;
