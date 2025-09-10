import { twMerge } from "tailwind-merge";
import ImageLabel from "./image-label.component";
import { AutoFitTitle } from "./info-title.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { UploadFolder } from "@joytify/types/constants";
import { RefactorSearchLabelResponse } from "@joytify/types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type LabelHeroSectionProps = {
  fm: ScopedFormatMessage;
  label: RefactorSearchLabelResponse;
  className?: string;
};

const LabelHeroSection: React.FC<LabelHeroSectionProps> = ({ fm, label, className }) => {
  const labelTypeFm = fm("label.type");
  const labelHeroSectionFm = fm("label.hero.section");

  const { LABELS_IMAGE } = UploadFolder;
  const { type, label: title, coverImage, songs } = label;

  const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);

  return (
    <div
      className={twMerge(
        `
          flex
          w-full
          px-6
          gap-x-5
        `,
        className
      )}
    >
      {/* cover image */}
      <ImageLabel src={coverImage} subfolder={LABELS_IMAGE} isDefault={true} />

      {/* content */}
      <div
        className={`
          flex
          flex-1
          flex-col
          items-start
          justify-evenly
        `}
      >
        {/* type */}
        <p className={`hero-section--type`}>{labelTypeFm(type)}</p>

        {/* title */}
        <AutoFitTitle>{title}</AutoFitTitle>

        {/* other - songs count */}
        <p className={`hero-section--description`}>
          {labelHeroSectionFm("description", {
            count: songs.length,
            duration: formatPlaybackDuration({
              fm,
              duration: totalDuration,
              precise: true,
              format: "text",
            }),
          })}
        </p>
      </div>
    </div>
  );
};

export default LabelHeroSection;
