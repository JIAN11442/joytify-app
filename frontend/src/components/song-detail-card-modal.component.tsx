import { useCallback } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import Modal from "./modal.component";
import Icon from "./react-icons.component";
import SongCommentList from "./song-comment-list.component";
import ManageSongCardImage from "./manage-song-card-image.component";
import ManageSongCardDetails from "./manage-song-card-details.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { timeoutForDelay } from "../lib/timeout.lib";
import useSongState from "../states/song.state";

const SongCardDetailModal = () => {
  const { fm } = useScopedIntl();
  const songDetailsModalFm = fm("song.details.modal");

  const { activeSongDetailCardModal, setActiveSongDetailCardModal } = useSongState();
  const { active, songs, currentIndex } = activeSongDetailCardModal;

  const song = songs?.[currentIndex];

  const handleCloseModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveSongDetailCardModal({
        active: false,
        songs: null,
        currentIndex: 0,
      });
    });
  }, [setActiveSongDetailCardModal]);

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
          <ManageSongCardDetails song={song} />
        </div>

        {/* ratings & comments */}
        <SongCommentList fm={fm} song={song} className={`mt-3`} />
      </div>
    </Modal>
  );
};

export default SongCardDetailModal;
