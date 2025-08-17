import { useRef } from "react";
import { twMerge } from "tailwind-merge";
import { useInView } from "framer-motion";
import Loader from "./loader.component";
import LabelCardList from "./label-card-list.component";
import AnimationWrapper from "./animation-wrapper.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorSearchLabelResponse } from "@joytify/shared-types/types";

type LabelRecommendationSectionProps = {
  fm: ScopedFormatMessage;
  labels: RefactorSearchLabelResponse[];
  isLoading?: boolean;
  className?: string;
};

const LabelRecommendationSection: React.FC<LabelRecommendationSectionProps> = ({
  fm,
  labels,
  isLoading,
  className,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-200px" });

  if (isLoading) {
    return <Loader loader={{ name: "BeatLoader", size: 12 }} />;
  }

  const labelRecommendationSectionFm = fm("label.recommendation.section");

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
        <p className={`text-xl font-bold`}>{labelRecommendationSectionFm("title")}</p>
        <p className={`text-sm text-gray-500`}>{labelRecommendationSectionFm("description")}</p>
      </div>

      {/* label card list */}
      <LabelCardList
        labels={labels}
        className={`flex overflow-x-auto hidden-scrollbar`}
        tw={{ cardWrapper: "w-[160px] max-sm:w-[140px]" }}
      />
    </AnimationWrapper>
  );
};

export default LabelRecommendationSection;
