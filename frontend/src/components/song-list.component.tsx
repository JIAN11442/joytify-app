import { useCallback } from "react";
import { FaPlay } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import Icon from "./react-icons.component";
import SoundWave from "./sound-wave.component";
import SongTitleItem from "./song-title-item.component";
import { useScopedIntl } from "../hooks/intl.hook";
import usePlaybackControl from "../hooks/playback-control.hook";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { Queue, RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaybackControlState from "../states/playback-control.state";
import usePlaylistState from "../states/playlist.state";
import useSidebarState from "../states/sidebar.state";
import useLocaleState from "../states/locale.state";
import { getDuration, getTimeAgo } from "../utils/get-time.util";

type SongListProps = {
  songs: RefactorSongResponse[];
  switchFunc?: boolean;
};

const SongList: React.FC<SongListProps> = ({ songs, switchFunc = true }) => {
  const { fm } = useScopedIntl();
  const playlistSongListFm = fm("playlist.content.songList");

  const { themeLocale } = useLocaleState();
  const { collapseSideBarState } = useSidebarState();
  const { songArrangementType, targetPlaylist } = usePlaylistState();
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
    [playlistSongListFm, songs]
  );

  if (!collapseSideBarState || !targetPlaylist) return null;

  const { COMPACT } = ArrangementOptions;
  const { paletee } = targetPlaylist;
  const { isCollapsed } = collapseSideBarState;

  const showArtist = switchFunc && songArrangementType === COMPACT;

  return (
    <div className={`overflow-x-auto`}>
      <table className={`min-w-full text-sm text-left`}>
        <thead>
          <tr className={`border-b border-grey-custom/5`}>
            <th>#</th>
            <th>{playlistSongListFm("header.title")}</th>
            <th className={`${showArtist ? "block" : "hidden"}`}>
              {playlistSongListFm("header.artist")}
            </th>
            <th>{playlistSongListFm("header.album")}</th>
            <th className={`${isCollapsed ? "max-md:hidden" : "max-lg:hidden"}`}>
              {playlistSongListFm("header.date")}
            </th>
            <th>
              <Icon name={IoTimeOutline} opts={{ size: 20 }} />
            </th>
          </tr>
        </thead>
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
                <td className={`p-2 pl-5 w-5 min-w-[30px]`}>
                  {isPlayingSong ? (
                    <SoundWave
                      color={paletee?.vibrant}
                      barWidth={3}
                      style={{ filter: "brightness(1.5)" }}
                      isPlaying={isPlaying}
                    />
                  ) : (
                    <div>
                      <p className={` group-hover:hidden`}>{index + 1}</p>
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
                <td className={`p-2`}>
                  <SongTitleItem
                    title={title}
                    imageUrl={imageUrl}
                    artist={artist}
                    switchFunc={switchFunc}
                    className={{ wrapper: `flex-1 min-w-[150px]` }}
                  />
                </td>

                {/* artist */}
                {showArtist && <td>{artist}</td>}

                {/* album */}
                <td>
                  <p className={`line-clamp-1`}>{album && album.length ? album : "--"}</p>
                </td>

                {/* date */}
                <td>
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
