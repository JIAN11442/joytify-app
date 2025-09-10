import { useRef } from "react";
import { twMerge } from "tailwind-merge";
import { useInView } from "framer-motion";
import Loader from "./loader.component";
import AnimationWrapper from "./animation-wrapper.component";
import SongRecommendationTableList from "./song-recommendation-table-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorPlaylistResponse, RefactorSongResponse } from "@joytify/types/types";

type PlaylistRecommendedSectionProps = {
  fm: ScopedFormatMessage;
  songs: RefactorSongResponse[];
  playlist: RefactorPlaylistResponse;
  isLoading?: boolean;
  className?: string;
};

const PlaylistRecommendedSection: React.FC<PlaylistRecommendedSectionProps> = ({
  fm,
  songs,
  playlist,
  isLoading,
  className,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-200px" });

  if (isLoading) {
    return <Loader loader={{ name: "BeatLoader", size: 12 }} />;
  }

  const prefix = "playlist.recommendation.section";
  const playlistRecommendationSectionFm = fm(prefix);

  return (
    <AnimationWrapper
      ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={twMerge("flex flex-col gap-5", className)}
    >
      {/* divider */}
      <hr className={`divider`} />

      {/* title & description */}
      <div className={`flex flex-col gap-2`}>
        <p className={`text-xl font-bold`}>{playlistRecommendationSectionFm("title")}</p>
        <p className={`text-sm text-gray-500`}>{playlistRecommendationSectionFm("description")}</p>
      </div>

      {/* recommended song table list */}
      <SongRecommendationTableList songs={songs} playlist={playlist} />
    </AnimationWrapper>
  );
};

export default PlaylistRecommendedSection;
