import { useCallback } from "react";
import Modal from "./modal.component";
import Loader from "./loader.component";
import SongTitleItem from "./song-title-item.component";
import { useUnfollowMusicianMutation } from "../hooks/musician-mutate.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import useManagesState from "../states/manages.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const MusicianUnFollowModal = () => {
  const { fm } = useScopedIntl();
  const { activeMusicianUnFollowModal, setActiveMusicianUnFollowModal } = useManagesState();
  const { active, musician } = activeMusicianUnFollowModal;

  const handleCloseModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveMusicianUnFollowModal({ active: false, musician: null });
    });
  }, [setActiveMusicianUnFollowModal]);

  const { mutate: unfollowMusicianFn, isPending } = useUnfollowMusicianMutation(handleCloseModal);

  const handleUnfollowMusician = useCallback(() => {
    timeoutForDelay(() => {
      if (!musicianId) return;

      unfollowMusicianFn(musicianId);
    });
  }, [unfollowMusicianFn]);

  if (!active || !musician) return null;

  const manageUnfollowModalFm = fm("manage.following.unfollow.modal");
  const { _id: musicianId, name, roles, coverImage, paletee } = musician;

  return (
    <Modal
      title={manageUnfollowModalFm("title")}
      activeState={active}
      closeModalFn={handleCloseModal}
    >
      <div className={`flex flex-col gap-5`}>
        {/* preview */}
        <SongTitleItem
          title={name}
          imageUrl={coverImage}
          artist={roles.join(", ")}
          style={{
            backgroundImage: `linear-gradient(
              to top,
              ${paletee?.muted} 50%,
              ${paletee?.vibrant} 100%
            )`,
          }}
          className={{
            item: "flex p-3 gap-5 w-full rounded-md",
            image: "w-28 h-28",
            title: "text-2xl font-semibold text-neutral-300",
            artist: "text-md text-neutral-300",
          }}
        />

        {/* content */}
        <p className={`text-red-500 font-bold`}>{manageUnfollowModalFm("content")}</p>

        {/* buttons */}
        <div
          className={`
            flex
            flex-col
            w-full
            gap-3
          `}
        >
          {/* next */}
          <button
            type="button"
            onClick={handleUnfollowMusician}
            disabled={isPending}
            className={`
              submit-btn
              py-2.5
              bg-red-500
              rounded-md
              border-none
            `}
          >
            {isPending ? <Loader loader={{ size: 20 }} /> : manageUnfollowModalFm("button.submit")}
          </button>

          {/* cancel */}
          <button
            type="button"
            onClick={handleCloseModal}
            className={`
              submit-btn
              py-2.5
              bg-neutral-500/50
              rounded-md
              border-none
            `}
          >
            {manageUnfollowModalFm("button.cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MusicianUnFollowModal;
