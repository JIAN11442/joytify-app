import { FaPlay } from "react-icons/fa6";

import Icon from "./react-icons.component";
import SoundWave from "./sound-wave.component";
import SongTitleItem from "./song-title-item.component";
import AnimationWrapper from "./animation-wrapper.component";

import { ArrangementOptions } from "../constants/arrangement.constant";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import useSoundState from "../states/sound.state";
import useSidebarState from "../states/sidebar.state";
import usePlaylistState from "../states/playlist.state";
import { getDuration, getTimeAgo } from "../utils/get-time.util";

type SongListItemProps = {
  index: number;
  song: RefactorSongResponse;
  switchFunc?: boolean;
  onPlay: (id: string) => void;
};

const SongListItem: React.FC<SongListItemProps> = ({ index, song, switchFunc = true, onPlay }) => {
  const { title, imageUrl, artist, album, duration, createdAt } = song;

  const { songArrangementType, targetPlaylist } = usePlaylistState();
  const { paletee } = targetPlaylist ?? {};

  const { COMPACT } = ArrangementOptions;

  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;
  const { activeSongId, isPlaying, sound } = useSoundState();

  // handle play song
  const handlePlaySong = () => {
    if (!sound || song._id !== activeSongId) {
      onPlay(song._id);
    } else {
      if (isPlaying) {
        sound?.pause();
      } else {
        sound?.play();
      }
    }
  };

  return (
    <AnimationWrapper
      key={index}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      onClick={handlePlaySong}
      style={
        {
          backgroundImage:
            song._id === activeSongId && paletee
              ? `linear-gradient(
                  45deg, 
                  transparent 0%,
                  ${paletee?.vibrant}80 50%,
                  transparent 100%
                )`
              : "none",
          animationPlayState: isPlaying ? "running" : "paused",
        } as React.CSSProperties
      }
      className={`
        group
        flex
        py-2
        px-4
        gap-5
        w-full
        items-center
        ${activeSongId === song._id && isPlaying ? "" : "hover:bg-neutral-700/40"}
        text-sm
        font-light
        text-grey-custom/60
        rounded-md
        transition
        gradient-animation
      `}
    >
      {/* index */}
      <div
        className={`
          w-5
          min-w-[30px]
        `}
      >
        {isPlaying && activeSongId === song._id ? (
          <SoundWave color={paletee?.vibrant} barWidth={3} style={{ filter: "brightness(1.5)" }} />
        ) : (
          <>
            <p className={` group-hover:hidden`}>{index + 1}</p>

            <Icon
              name={FaPlay}
              className={`
                hidden
                group-hover:block
                text-white
              `}
            />
          </>
        )}
      </div>

      {/* title */}
      <SongTitleItem
        title={title}
        imageUrl={imageUrl}
        artist={artist}
        switchFunc={switchFunc}
        className={{
          wrapper: `
            flex-1
            min-w-[150px]
        `,
        }}
      />

      {/* artist */}
      <div
        className={`
          flex-1
          min-w-[100px]  
          ${switchFunc && songArrangementType === COMPACT ? "block" : "hidden"}
        `}
      >
        <p>{artist}</p>
      </div>

      {/* Album */}
      <div
        className={`
          flex-1
          min-w-[100px]
          ${switchFunc && songArrangementType === COMPACT && "max-sm:hidden"}
        `}
      >
        <p className={`line-clamp-1`}>{album && album.length ? album : "--"}</p>
      </div>

      {/* Date added */}
      <div
        className={`
          w-40
          min-w-[100px]
          ${isCollapsed ? "max-md:hidden" : "max-lg:hidden"}
        `}
      >
        <p className={`line-clamp-1`}>{getTimeAgo(createdAt.toString())}</p>
      </div>

      {/* Duration */}
      <div className={`w-20`}>
        <p className={`line-clamp-1`}>{getDuration(duration)}</p>
      </div>
    </AnimationWrapper>
  );
};

export default SongListItem;
