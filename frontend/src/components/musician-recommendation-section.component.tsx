import { useRef } from "react";
import { twMerge } from "tailwind-merge";
import { useInView } from "framer-motion";
import Loader from "./loader.component";
import AnimationWrapper from "./animation-wrapper.component";
import MusicianCardList from "./musician-card-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorMusicianResponse } from "@joytify/shared-types/types";

type MusicianRecommendationSectionProps = {
  fm: ScopedFormatMessage;
  musicians: RefactorMusicianResponse[];
  isLoading?: boolean;
  className?: string;
};

const MusicianRecommendationSection: React.FC<MusicianRecommendationSectionProps> = ({
  fm,
  musicians,
  isLoading,
  className,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-200px" });

  if (isLoading) {
    return <Loader loader={{ name: "BeatLoader", size: 12 }} />;
  }

  const musicianRecommendationSectionFm = fm("musician.recommendation.section");

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
        <p className={`text-xl font-bold`}>{musicianRecommendationSectionFm("title")}</p>
        <p className={`text-sm text-gray-500`}>{musicianRecommendationSectionFm("description")}</p>
      </div>

      {/* recommended musician list */}
      <MusicianCardList
        musicians={musicians}
        className={`flex overflow-x-auto hidden-scrollbar`}
        tw={{ cardWrapper: "card-size--recommendation" }}
      />
    </AnimationWrapper>
  );
};

export default MusicianRecommendationSection;
