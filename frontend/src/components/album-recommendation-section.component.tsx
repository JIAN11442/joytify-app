import { useRef } from "react";
import { twMerge } from "tailwind-merge";
import { useInView } from "framer-motion";
import Loader from "./loader.component";
import AlbumCardList from "./album-card-list.component";
import AnimationWrapper from "./animation-wrapper.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorAlbumResponse } from "@joytify/shared-types/types";

type AlbumRecommendationSectionProps = {
  fm: ScopedFormatMessage;
  albums: RefactorAlbumResponse[];
  isLoading?: boolean;
  className?: string;
};

const AlbumRecommendationSection: React.FC<AlbumRecommendationSectionProps> = ({
  fm,
  albums,
  isLoading,
  className,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-200px" });

  if (isLoading) {
    return <Loader loader={{ name: "BeatLoader", size: 12 }} />;
  }

  const albumRecommendationSectionFm = fm("album.recommendation.section");

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
        <p className={`text-xl font-bold`}>{albumRecommendationSectionFm("title")}</p>
        <p className={`text-sm text-gray-500`}>{albumRecommendationSectionFm("description")}</p>
      </div>

      {/* album list */}
      <AlbumCardList
        albums={albums}
        className={`flex overflow-x-auto hidden-scrollbar`}
        tw={{ cardWrapper: "w-[160px] max-sm:w-[140px]" }}
      />
    </AnimationWrapper>
  );
};

export default AlbumRecommendationSection;
