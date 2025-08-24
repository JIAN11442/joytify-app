import { TbMusicHeart } from "react-icons/tb";
import Icon from "./react-icons.component";
import SongTitleItem from "./song-title-item.component";
import AnimationWrapper from "./animation-wrapper.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HexPaletee, PopulatedMonthlyStatsResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type StatsSongRanking = {
  fm: ScopedFormatMessage;
  monthlyStats: PopulatedMonthlyStatsResponse;
  paletee: HexPaletee;
};

const StatsSongRanking: React.FC<StatsSongRanking> = ({ fm, monthlyStats, paletee }) => {
  const { songs } = monthlyStats;

  const statsMonthlyStatsFm = fm("stats.monthlyStats");
  const songRankingFm = fm("stats.monthlyStats.leaderboard.songRanking");

  return (
    <div className={`stats-card-wrapper gap-8`}>
      {/* title */}
      <div className={`flex items-center gap-5`}>
        <Icon name={TbMusicHeart} opts={{ size: 25, color: paletee.vibrant }} />
        <p className={`text-xl font-bold`}>{`${songRankingFm("title")} (${songs.length})`}</p>
      </div>

      {/* song list */}
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
        {songs && songs.length > 0 ? (
          songs
            .filter((song) => song && song._id && song.title) // filter out invalid songs
            .map((song, index) => {
              const { _id: songId, title, imageUrl, artist, totalDuration } = song;

              // protection: ensure necessary properties exist
              if (!songId || !title || !totalDuration) {
                return null;
              }

              const songDuration = formatPlaybackDuration({ fm, duration: totalDuration });
              const songPercentage = `${(
                (totalDuration / monthlyStats.summary.totalDuration) *
                100
              ).toFixed(2)}%`;

              return (
                <AnimationWrapper
                  key={`stats-song-ranking-${songId}`}
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
                      title={title}
                      imageUrl={imageUrl}
                      artist={artist}
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
                    <p className={`text-neutral-300 font-semibold`}>{songDuration}</p>
                    <p className={`text-neutral-500`}>{songPercentage}</p>
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

export default StatsSongRanking;
