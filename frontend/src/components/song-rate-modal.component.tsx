import { useCallback, useState } from "react";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import Modal from "./modal.component";
import Icon from "./react-icons.component";
import StarRating from "./star-rating.component";
import SongTitleItem from "./song-title-item.component";
import AnimationWrapper from "./animation-wrapper.component";
import { useRateSongMutation } from "../hooks/song-mutate.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import useUserState from "../states/user.state";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const SongRateModal = () => {
  const [rating, setRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { fm } = useScopedIntl();
  const songRateModalFm = fm("song.rate.modal");

  const { authUser } = useUserState();
  const { activeSongRateModal, setActiveSongRateModal } = useSongState();

  const handleCloseModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveSongRateModal({ active: false, song: null });
    });
  }, [setActiveSongRateModal]);

  const handleRatingSong = (rating: number) => {
    timeoutForDelay(() => {
      setRating(rating);
    });
  };

  const handleLikeSong = () => {
    timeoutForDelay(() => {
      setIsLiked(!isLiked);
    });
  };

  const { mutate: rateSongFn } = useRateSongMutation(handleCloseModal);

  const handleSubmit = useCallback(() => {
    const { song } = activeSongRateModal;

    if (!song) return;

    timeoutForDelay(() => {
      setIsSubmitting(true);

      rateSongFn({
        songId: song._id,
        rating,
        isLiked,
        comment,
      });

      setIsSubmitting(false);
    });
  }, [rating, isLiked, comment, activeSongRateModal]);

  const { active, song } = activeSongRateModal;

  if (!song) return null;

  const { title, artist, imageUrl, paletee, favorites } = song;

  const isLikedByUser = authUser && favorites.includes(authUser._id);
  const isDirty = rating > 0;

  return (
    <Modal title={songRateModalFm("title")} activeState={active} closeModalFn={handleCloseModal}>
      <div
        className={`
          flex
          flex-col
          gap-8
          items-center
          justify-center
        `}
      >
        {/* song item */}
        <SongTitleItem
          title={title}
          artist={artist}
          imageUrl={imageUrl}
          style={{
            backgroundImage: `linear-gradient(
              to bottom,
              ${paletee?.muted} 50%,
              ${paletee?.vibrant} 100%
            )`,
          }}
          className={{
            item: "flex p-3 w-full rounded-md",
            image: "w-20 h-20 shadow-md",
            title: "text-neutral-200",
            artist: "text-neutral-300",
          }}
        />

        {/* rate stars */}
        <div className={`flex flex-col gap-5 items-center`}>
          <AnimationWrapper
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              text-center
              ${rating > 0 ? `font-bold text-lg text-yellow-400` : `text-neutral-400`}
            `}
          >
            {songRateModalFm(rating > 0 ? `rating.${rating}` : "description")}
          </AnimationWrapper>

          <StarRating
            count={5}
            icon={{ opts: { size: 32 } }}
            isStarEditable={true}
            onRatingClick={handleRatingSong}
            className={`gap-8`}
          />
        </div>

        {/* favorite */}
        {!isLikedByUser && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleLikeSong}
            className={`
              group
              flex
              p-3
              gap-3
              w-[70%]
              border
              ${
                isLiked
                  ? "bg-pink-500/10 text-pink-500 border-pink-500/50"
                  : "text-pink-400 border-pink-400 opacity-50 hover:opacity-100"
              }
              items-center
              justify-center
              rounded-xl
              transition-all
              duration-300
            `}
          >
            <Icon name={isLiked ? FaHeart : FaRegHeart} opts={{ size: 20 }} />
            <p>{songRateModalFm("addToFavorite")}</p>
          </button>
        )}

        {/* comment */}
        <div
          className={`
            flex
            flex-col
            w-full
            gap-3
            items-start
            text-neutral-400
          `}
        >
          <p className={`flex gap-2 items-center text-[14px]`}>
            <Icon name={FaRegComment} opts={{ size: 16 }} />
            <span>{songRateModalFm("commentLabel")}</span>
          </p>

          <textarea
            id="description"
            placeholder={songRateModalFm("commentPlaceholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
            className={`
              input-box
              h-[100px]
              text-neutral-300
              placeholder:text-[14px]
              resize-none
             `}
          />
        </div>

        {/* button */}
        <div
          className={`
            flex
            w-full
            items-center
            gap-5
          `}
        >
          {/* cancel */}
          <button type="button" onClick={handleCloseModal} className={`song-rate-btn `}>
            {songRateModalFm("cancel")}
          </button>

          {/* submit */}
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            onClick={handleSubmit}
            className={`song-rate-btn bg-green-500 border-green-500`}
          >
            {songRateModalFm("submit")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SongRateModal;
