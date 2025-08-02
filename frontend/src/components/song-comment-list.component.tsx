import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { FaRegComment } from "react-icons/fa";
import Icon from "./react-icons.component";
import StarRating from "./star-rating.component";
import AnimationWrapper from "./animation-wrapper.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import { timeoutForDelay } from "../lib/timeout.lib";

type SongCommentListProps = {
  fm: ScopedFormatMessage;
  song: RefactorSongResponse;
  className?: string;
};

const SongCommentList: React.FC<SongCommentListProps> = ({ fm, song, className }) => {
  const songCommentListFm = fm("song.comment.list");
  const { ratings } = song;

  const [expandComments, setExpandComments] = useState(false);

  const handleExpandComments = useCallback(() => {
    timeoutForDelay(() => {
      if (!ratings || ratings.length === 0) return;

      setExpandComments((prev) => !prev);
    });
  }, [ratings]);

  return (
    <div className={twMerge(`flex flex-col gap-5`, className)}>
      {/* divider */}
      {expandComments && <hr className={`divider my-0`} />}

      <div
        className={`
          flex
          flex-col
          gap-5
          ${expandComments ? "p-5 bg-neutral-900/50" : "p-0"}
          rounded-md
        `}
      >
        {/* title */}
        <button
          type="button"
          onClick={handleExpandComments}
          className={`
            flex
            gap-2
            items-center
            ${
              ratings && ratings?.length > 0
                ? expandComments
                  ? `justify-start text-neutral-400`
                  : `
                      justify-center
                      text-neutral-400/50
                      hover:text-neutral-400
                    `
                : "justify-center text-neutral-400/50"
            }
            text-sm
            outline-none
            transition-all
            duration-300
          `}
        >
          <Icon name={FaRegComment} opts={{ size: 18 }} />
          <p>{songCommentListFm("title", { count: ratings?.length || 0 })}</p>
        </button>

        {/* ratings & comments */}
        {ratings && ratings.length > 0 && expandComments && (
          <div className={`flex flex-col gap-3`}>
            {ratings.map((rt) => {
              const { id, username, profileImage, rating, comment } = rt;

              return (
                <AnimationWrapper
                  key={`song-comment-${id}`}
                  style={
                    {
                      backgroundImage: `linear-gradient(
                        45deg, 
                        transparent 0%,
                        ${song.paletee?.vibrant}20 50%,
                        transparent 100%
                      )`,
                    } as React.CSSProperties
                  }
                  className={`
                    flex
                    gap-5
                    p-3
                    items-center
                    rounded-md
                  `}
                >
                  {/* avatar */}
                  <div
                    style={{ boxShadow: `0 0 5px 0 ${song.paletee?.vibrant}` }}
                    className={`p-1 rounded-full shrink-0`}
                  >
                    <img
                      src={profileImage}
                      className={`
                        w-12
                        h-12
                        object-cover
                        bg-neutral-400
                        rounded-full
                      `}
                    />
                  </div>

                  {/* content */}
                  <div
                    className={`
                      flex 
                      flex-col 
                      w-full 
                      gap-1 
                    `}
                  >
                    {/* username & rate */}
                    <div
                      className={`
                        flex 
                        w-full 
                        gap-2 
                        items-center 
                        justify-between
                      `}
                    >
                      <span style={{ color: song.paletee.vibrant }} className={`font-bold`}>
                        {username?.split("?nanoid")[0]}
                      </span>
                      <StarRating count={5} rating={rating} icon={{ opts: { size: 16 } }} />
                    </div>

                    {/* comment */}
                    <p className={`text-sm font-light`}>{comment}</p>
                  </div>
                </AnimationWrapper>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongCommentList;
