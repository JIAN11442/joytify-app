import { FaPlay } from "react-icons/fa6";

import Icon from "./react-icons.component";
import SoundWave from "./sound-wave.component";
import SongTitleItem from "./song-title-item.component";
import AnimationWrapper from "./animation-wrapper.component";
import usePlaybackControl from "../hooks/playback-control.hook";

import { ArrangementOptions } from "../constants/arrangement.constant";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaybackControlState from "../states/playback-control.state";
import usePlaylistState from "../states/playlist.state";
import useSidebarState from "../states/sidebar.state";
import useLocaleState from "../states/locale.state";
import { getDuration, getTimeAgo } from "../utils/get-time.util";

type SongListItemProps = {
  index: number;
  song: RefactorSongResponse;
  switchFunc?: boolean;
  handlePlaySong: () => void;
};

const SongListItem: React.FC<SongListItemProps> = ({
  index,
  song,
  switchFunc = true,
  handlePlaySong,
}) => {
  const { title, imageUrl, artist, album, duration, createdAt } = song;

  const { themeLocale } = useLocaleState();
  const { collapseSideBarState } = useSidebarState();
  const { songArrangementType, targetPlaylist } = usePlaylistState();
  const { audioSong } = usePlaybackControl();
  const { isPlaying } = usePlaybackControlState();

  const { COMPACT } = ArrangementOptions;
  const { isCollapsed } = collapseSideBarState;
  const { paletee } = targetPlaylist ?? {};

  const isPlayedSong = song._id === audioSong?._id;
  const isPlayingSong = isPlaying && isPlayedSong;

  return (
    <AnimationWrapper
      key={index}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      onClick={handlePlaySong}
      style={
        {
          backgroundImage:
            isPlayedSong && paletee
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
        ${isPlayingSong ? "" : "hover:bg-neutral-700/40"}
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
        {isPlayingSong ? (
          <SoundWave
            color={paletee?.vibrant}
            barWidth={3}
            style={{ filter: "brightness(1.5)" }}
            isPlaying={isPlaying}
          />
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
        <p className={`line-clamp-1`}>{getTimeAgo(createdAt.toString(), themeLocale)}</p>
      </div>

      {/* Duration */}
      <div className={`w-20`}>
        <p className={`line-clamp-1`}>{getDuration(duration)}</p>
      </div>
    </AnimationWrapper>
  );
};

export default SongListItem;
