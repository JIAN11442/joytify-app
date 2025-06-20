import { useCallback, useState } from "react";
import { FaRegComment } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import Modal from "./modal.component";
import Icon from "./react-icons.component";
import StarRating from "./star-rating.component";
import AnimationWrapper from "./animation-wrapper.component";
import ManageSongCardImage from "./manage-songs-card-image.component";
import ManageSongsCardDetail from "./manage-songs-card-detail.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { timeoutForDelay } from "../lib/timeout.lib";
import useSongState from "../states/song.state";

const SongCardDetailModal = () => {
  const { fm } = useScopedIntl();
  const songDetailsModalFm = fm("song.details.modal");

  const [expandComments, setExpandComments] = useState(false);
  const { activeSongDetailCardModal, setActiveSongDetailCardModal } = useSongState();
  const { active, songs, currentIndex } = activeSongDetailCardModal;

  const song = songs?.[currentIndex];
  const ratings = song?.ratings;

  const handleCloseModal = () => {
    timeoutForDelay(() => {
      setActiveSongDetailCardModal({
        active: false,
        songs: null,
        currentIndex: 0,
      });
    });
  };

  const handleSwitchSong = useCallback(
    (direction: "prev" | "next") => {
      timeoutForDelay(() => {
        const songs = activeSongDetailCardModal.songs;

        if (!songs || songs.length === 0) return;

        setActiveSongDetailCardModal({
          ...activeSongDetailCardModal,
          currentIndex:
            direction === "prev"
              ? (currentIndex - 1 + songs.length) % songs.length
              : (currentIndex + 1) % songs.length,
        });
      });
    },
    [activeSongDetailCardModal, currentIndex]
  );

  const handleExpandComments = useCallback(() => {
    timeoutForDelay(() => {
      if (!ratings || ratings.length === 0) return;

      setExpandComments((prev) => !prev);
    });
  }, [ratings]);

  if (!song) return null;

  return (
    <Modal
      title={songDetailsModalFm("title")}
      activeState={active}
      closeModalFn={handleCloseModal}
      className={`w-[800px]`}
      tw={{ title: "text-left" }}
    >
      <div className={`flex flex-col w-full gap-5`}>
        {/* image & detail */}
        <div
          className={`
            grid
            sm:grid-cols-2
            max-sm:grid-cols-1
            w-full
            gap-5
          `}
        >
          <div className={`flex flex-col gap-2 items-center`}>
            {/* image */}
            <ManageSongCardImage
              songs={songs}
              currentIndex={currentIndex}
              hasPlayButton={false}
              hasSoundWave={false}
              className={`h-[300px] rounded-md`}
              tw={{ img: "h-full object-cover" }}
            >
              {/* navigation */}
              {songs.length > 1 && (
                <div
                  className={`
                    absolute
                    -translate-x-1/2
                    -translate-y-1/2
                    top-1/2
                    left-1/2
                    hidden
                    group-hover:flex
                    w-full
                    items-center
                    justify-between
                    duration-300
                  `}
                >
                  <button
                    onClick={() => handleSwitchSong("prev")}
                    className={`navigation-arrow-btn`}
                  >
                    <Icon name={IoIosArrowBack} opts={{ size: 20 }} />
                  </button>

                  <button
                    onClick={() => handleSwitchSong("next")}
                    className={`navigation-arrow-btn`}
                  >
                    <Icon name={IoIosArrowForward} />
                  </button>
                </div>
              )}
            </ManageSongCardImage>

            {/* pagination */}
            {songs.length > 1 && (
              <div className={`flex gap-1`}>
                {Array.from({ length: songs.length }).map((_, index) => (
                  <div
                    key={index}
                    className={`
                      p-1
                      rounded-full
                      ${index === currentIndex ? "bg-purple-500" : "bg-neutral-700"}
                    `}
                  />
                ))}
              </div>
            )}
          </div>

          {/* details */}
          <ManageSongsCardDetail song={song} />
        </div>

        <hr className={`divider my-0`} />

        {/* ratings &comments */}
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
            <p>
              {songDetailsModalFm("comment.title")} ({ratings?.length || 0})
            </p>
          </button>

          {/* ratings */}
          {ratings && ratings.length > 0 && expandComments && (
            <div className={`flex flex-col gap-3`}>
              {ratings.map((rt) => {
                const { id, username, profileImage, rating, comment } = rt;
                return (
                  <AnimationWrapper
                    key={`comment-${id}`}
                    style={
                      {
                        backgroundImage: `linear-gradient(
                          45deg, 
                          transparent 0%,
                          ${song.paletee?.vibrant}80 50%,
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
                    <div className={`flex flex-col w-full gap-1 font-ubuntu`}>
                      {/* username & rate */}
                      <div className={`flex w-full gap-2 items-center justify-between`}>
                        <span className={`font-bold`}>{username.split("?nanoid")[0]}</span>
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
    </Modal>
  );
};

export default SongCardDetailModal;
