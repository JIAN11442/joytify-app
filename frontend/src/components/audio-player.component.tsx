import { useNavigate } from "react-router-dom";
import PlayerVolume from "./player-volume.component";
import PlayerSlider from "./player-slider.component";
import SongTitleItem from "./song-title-item.component";
import PlayerOperation from "./player-operation.component";
import AnimationWrapper from "./animation-wrapper.component";
import { RefactorSongResponse } from "@joytify/types/types";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type AudioPlayerProps = {
  song: RefactorSongResponse;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ song }) => {
  const navigate = useNavigate();
  const { authUser } = useUserState();

  if (!song || !authUser) return null;

  const { title, imageUrl, artist } = song;
  const { name: artistName } = artist;

  const handleNavigateToSongPage = () => {
    timeoutForDelay(() => {
      navigate(`/song/${song?._id}`);
    });
  };

  return (
    <AnimationWrapper
      visible={Boolean(song)}
      initial={{ opacity: 0, transformOrigin: "bottom" }}
      animate={{ opacity: 1, transformOrigin: "bottom" }}
      className={`
        fixed
        bottom-0
        left-0
        flex
        p-4
        w-full
        h-[75px]
        bg-black
        shadow-[1px_0px_15px_5px]
        shadow-neutral-700/50
      `}
    >
      {/* slider(max-sm screen) */}
      <PlayerSlider song={song} hiddenTime={true} className={`sm:hidden absolute top-0 left-0`} />

      <div
        className={`
          flex  
          w-full
          gap-10
          items-center
          justify-between
        `}
      >
        {/* song item */}
        <SongTitleItem
          title={title}
          imageUrl={imageUrl}
          artist={artistName}
          switchFunc={false}
          onClick={handleNavigateToSongPage}
          className={{
            item: `
              text-sm
              text-grey-custom/50
              cursor-pointer
            `,
            content: `max-sm:hidden`,
          }}
        />

        {/* player operation */}
        <PlayerOperation
          song={song}
          className={`
            flex-1
            flex-shrink-0
            min-w-[200px]
            max-w-[50%]
          `}
        />

        {/* volume */}
        <PlayerVolume className={`flex justify-end`} />
      </div>
    </AnimationWrapper>
  );
};

export default AudioPlayer;
