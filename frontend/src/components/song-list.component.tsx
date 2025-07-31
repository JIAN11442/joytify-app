import { useCallback } from "react";
import { FaPlay } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import Icon from "./react-icons.component";
import SoundWave from "./sound-wave.component";
import SongTitleItem from "./song-title-item.component";
import { useScopedIntl } from "../hooks/intl.hook";
import usePlaybackControl from "../hooks/playback-control.hook";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { HexPaletee, Queue, RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaybackControlState from "../states/playback-control.state";
import useSidebarState from "../states/sidebar.state";
import useLocaleState from "../states/locale.state";
import useSongState from "../states/song.state";
import { getDuration, getTimeAgo } from "../utils/get-time.util";

type SongListProps = {
  songs: RefactorSongResponse[];
  paletee: HexPaletee;
  switchFunc?: boolean;
};

const SongList: React.FC<SongListProps> = ({ songs, paletee, switchFunc = true }) => {
  const { fm } = useScopedIntl();
  const songListHeaderFm = fm("song.list.header");

  const { themeLocale } = useLocaleState();
  const { collapseSideBarState } = useSidebarState();
  const { songListArrangementType } = useSongState();
  const { isPlaying } = usePlaybackControlState();
  const { audioSong, playSong } = usePlaybackControl();

  const handlePlaySong = useCallback(
    (index: number) => {
      return playSong({
        playlistSongs: songs,
        queue: songs as unknown as Queue,
        currentIndex: index,
        currentPlaySongId: songs[index]._id,
      });
    },
    [songs]
  );

  if (!collapseSideBarState) return null;

  const { COMPACT } = ArrangementOptions;
  const { isCollapsed } = collapseSideBarState;

  const showArtist = switchFunc && songListArrangementType === COMPACT;

  return (
    <div className={`overflow-x-auto hidden-scrollbar`}>
      <table className={`min-w-full text-sm text-left`}>
        {/* header */}
        <thead>
          <tr className={`border-b border-grey-custom/5`}>
            {/* index */}
            <th className={`px-0 pl-5 w-5 max-w-[30px]`}>#</th>

            {/* title */}
            <th>{songListHeaderFm("title")}</th>

            {/* artist */}
            <th className={`${showArtist ? "block" : "hidden"}`}>{songListHeaderFm("artist")}</th>

            {/* album */}
            <th className={`${isCollapsed ? "max-sm:hidden" : "max-md:hidden"}`}>
              {songListHeaderFm("album")}
            </th>

            {/* date */}
            <th className={`${isCollapsed ? "max-md:hidden" : "max-lg:hidden"}`}>
              {songListHeaderFm("date")}
            </th>

            {/* duration */}
            <th>
              <Icon name={IoTimeOutline} opts={{ size: 20 }} />
            </th>
          </tr>
        </thead>

        {/* body */}
        <tbody>
          {songs.map((song, index) => {
            const { title, artist, imageUrl, album, createdAt, duration } = song;
            const isPlayedSong = song._id === audioSong?._id;
            const isPlayingSong = isPlaying && isPlayedSong;

            return (
              <tr
                key={index}
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
                onClick={() => handlePlaySong(index)}
                className={`
                  group
                  w-full
                  ${isPlayingSong ? "" : "hover:bg-neutral-700/40"}
                  font-light
                  text-grey-custom/60
                  whitespace-nowrap
                  gradient-animation
                  transition
                `}
              >
                {/* index */}
                <td className={`px-0 pl-5 w-5 max-w-[30px]`}>
                  {isPlayingSong ? (
                    <SoundWave
                      color={paletee?.vibrant}
                      barWidth={3}
                      style={{ filter: "brightness(1.5)" }}
                      isPlaying={isPlaying}
                    />
                  ) : (
                    <div>
                      <p className={`group-hover:hidden`}>{index + 1}</p>
                      <Icon
                        name={FaPlay}
                        className={`
                          hidden
                          group-hover:block
                          text-white
                        `}
                      />
                    </div>
                  )}
                </td>

                {/* title */}
                <td>
                  <SongTitleItem
                    title={title}
                    imageUrl={imageUrl}
                    artist={artist}
                    switchFunc={switchFunc}
                    className={{ item: `flex-1 min-w-[150px]` }}
                  />
                </td>

                {/* artist */}
                {showArtist && <td>{artist}</td>}

                {/* album */}
                <td className={`${isCollapsed ? "max-sm:hidden" : "max-md:hidden"}`}>
                  <p className={`line-clamp-1`}>{album && album.length ? album : "--"}</p>
                </td>

                {/* date */}
                <td className={`${isCollapsed ? "max-md:hidden" : "max-lg:hidden"}`}>
                  <p className={`line-clamp-1`}>{getTimeAgo(createdAt.toString(), themeLocale)}</p>
                </td>

                {/* duration */}
                <td>
                  <p className={`line-clamp-1`}>{getDuration(duration)}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SongList;
