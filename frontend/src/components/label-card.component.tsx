import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { LuLanguages } from "react-icons/lu";
import { FaMusic, FaTags } from "react-icons/fa";
import { FaHeadphonesSimple } from "react-icons/fa6";
import Icon, { IconName } from "./react-icons.component";
import QueuePlayButton from "./queue-play-button.component";
import AuthGuardLink from "./auth-guard-link.component";
import { LabelOptions } from "@joytify/types/constants";
import { RefactorSearchLabelResponse } from "@joytify/types/types";
import { useScopedIntl } from "../hooks/intl.hook";

type LabelCardProps = {
  label: RefactorSearchLabelResponse;
  className?: string;
  tw?: { img?: string };
};

const LabelCard: React.FC<LabelCardProps> = ({ label, className, tw }) => {
  const { GENRE, TAG, LANGUAGE } = LabelOptions;
  const { _id: labelId, type, label: title, coverImage, songs } = label;

  const { fm } = useScopedIntl();
  const [imageLoaded, setImageLoaded] = useState(false);

  const iconName: IconName = useMemo(() => {
    switch (type) {
      case GENRE:
        return FaHeadphonesSimple;
      case TAG:
        return FaTags;
      case LANGUAGE:
        return LuLanguages;
      default:
        return FaMusic;
    }
  }, [type]);

  const labelTypeFm = fm("label.type");

  const hasSongs = songs.length > 0;
  const isEmpty = songs.length === 0;

  return (
    <AuthGuardLink
      to={`/${type}/${labelId}`}
      className={twMerge(
        `
          group
          grid-card-wrapper
          hover:bg-neutral-200/5
          p-3
          gap-3
          ${isEmpty && "no-hover"}
        `,
        className
      )}
    >
      <div className={`relative`}>
        <img
          alt={title}
          src={coverImage}
          onLoad={() => setImageLoaded(true)}
          className={twMerge(
            `
              aspect-square
              object-cover
              rounded-md
              transition-all
              ${isEmpty && "brightness-50"}
            `,
            tw?.img
          )}
        />

        {imageLoaded && (
          <Icon
            name={iconName}
            opts={{ size: 50 }}
            className={`
              absolute
              top-1/2
              left-1/2
              -translate-x-1/2
              -translate-y-1/2
              ${isEmpty ? "text-neutral-300/50" : "text-neutral-300"}
            `}
          />
        )}

        {hasSongs && <QueuePlayButton songs={songs} showOnHover={true} className={`p-3`} />}
      </div>

      {/* details */}
      {imageLoaded && (
        <div className={`flex flex-col w-full pl-2 gap-2 items-start`}>
          <p className={`text-neutral-300 font-medium truncate`}>{title}</p>
          <p className={`text-sm text-neutral-500 truncate capitalize`}>{labelTypeFm(`${type}`)}</p>
        </div>
      )}
    </AuthGuardLink>
  );
};

export default LabelCard;
