import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import { IconBaseProps } from "react-icons";
import { FaRegStar, FaStar } from "react-icons/fa";
import Icon, { IconName } from "./react-icons.component";
import { timeoutForDelay } from "../lib/timeout.lib";

interface StarRatingProps {
  count: number;
  rating?: number;
  icon?: { name?: IconName; opts?: IconBaseProps };
  isStarEditable?: boolean;
  onRatingChange?: (rating: number) => void;
  onRatingClick?: (rating: number) => void;
  className?: string;
  tw?: { button?: string; icon?: string };
}

const StarRating: React.FC<StarRatingProps> = ({
  count = 5,
  rating = 0,
  icon,
  isStarEditable = false,
  onRatingChange,
  onRatingClick,
  className,
  tw,
}) => {
  const [rate, setRate] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSetHoveredRating = (rate: number) => {
    timeoutForDelay(() => {
      if (!isStarEditable) return;

      setHoveredRating(rate);
    });
  };

  const handleRatingSong = (rate: number) => {
    timeoutForDelay(() => {
      if (!isStarEditable) return;

      setRate(rate);
      onRatingChange?.(rate);
      onRatingClick?.(rate);
    });
  };

  // initialize rate while change song
  useEffect(() => {
    setRate(rating);
  }, [rating]);

  return (
    <div
      className={twMerge(
        `
        flex
        gap-2
        items-center
        text-neutral-500
      `,
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => {
        const needToFill = index + 1 <= (hoveredRating || rate);
        const starIcon = needToFill ? FaStar : FaRegStar;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleRatingSong(index + 1)}
            onMouseEnter={() => handleSetHoveredRating(index + 1)}
            onMouseLeave={() => handleSetHoveredRating(0)}
            className={twMerge(
              `transition-all duration-200 ${!isStarEditable && "pointer-events-none"}`,
              tw?.button
            )}
          >
            <Icon
              name={icon?.name || starIcon}
              opts={{ ...(icon?.opts || { size: 20 }) }}
              className={twMerge(
                `${
                  needToFill
                    ? "text-yellow-300"
                    : rating || hoveredRating
                    ? "text-neutral-500/50"
                    : "text-yellow-400/50"
                }`,
                tw?.icon
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
