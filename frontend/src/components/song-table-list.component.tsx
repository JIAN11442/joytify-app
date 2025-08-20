import { useCallback, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { twMerge } from "tailwind-merge";
import { FaPlay } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import Icon from "./react-icons.component";
import SoundWave from "./sound-wave.component";
import SongTitleItem from "./song-title-item.component";
import AuthGuardLink from "./auth-guard-link.component";
import SongTableListActions from "./song-table-list-actions.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import usePlaybackControl from "../hooks/playback-control.hook";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { HexPaletee, Queue, RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaybackControlState from "../states/playback-control.state";
import useSidebarState from "../states/sidebar.state";
import useLocaleState from "../states/locale.state";
import useSongState from "../states/song.state";
import { getDuration, getTimeAgo } from "../utils/get-time.util";
import createColorStyle from "../utils/create-color-style.util";

type SongTableListProps = {
  fm: ScopedFormatMessage;
  songs: RefactorSongResponse[];
  paletee?: HexPaletee;
  switchFunc?: boolean;
  noFoundMessage?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

const SongTableList: React.FC<SongTableListProps> = ({
  fm,
  songs,
  paletee,
  switchFunc = true,
  noFoundMessage,
  children,
  className,
}) => {
  const songTablePrefix = "song.tableList";
  const songTableListFm = fm(songTablePrefix);

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);

  const { themeLocale } = useLocaleState();
  const { isPlaying } = usePlaybackControlState();
  const { collapseSideBarState } = useSidebarState();
  const { songListArrangementType } = useSongState();
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

  const getColorStyle = useCallback(
    (cssVar: string, opacity?: number) => {
      return createColorStyle(cssVar, paletee?.vibrant, opacity);
    },
    [paletee]
  );

  const { LIST, COMPACT } = ArrangementOptions;
  const { isCollapsed } = collapseSideBarState;

  const arrangementType = switchFunc ? songListArrangementType : LIST;
  const isCompact = arrangementType === COMPACT;

  const indexClassName = `px-0 pl-5 max-w-[30px] rounded-l-md`;
  const artistClassName = `${isCompact ? "block" : "hidden"}`;
  const albumClassName = `max-w-[180px] ${isCollapsed ? "max-sm:hidden" : "max-lg:hidden"}`;
  const dateClassName = `${isCollapsed ? "max-lg:hidden" : "max-xl:hidden"}`;
  const durationClassName = `px-3`;
  const actionsClassName = `rounded-r-md`;

  return (
    <div ref={containerRef} className={twMerge(`overflow-x-auto hidden-scrollbar`, className)}>
      <table className={`min-w-full text-sm text-left`}>
        {/* header */}
        <thead>
          <tr className={`border-b border-grey-custom/5`}>
            {/* index */}
            <th className={indexClassName}>#</th>

            {/* title */}
            <th>{songTableListFm("header.title")}</th>

            {/* artist */}
            <th className={artistClassName}>{songTableListFm("header.artist")}</th>

            {/* album */}
            <th className={albumClassName}>{songTableListFm("header.album")}</th>

            {/* date */}
            <th className={dateClassName}>{songTableListFm("header.date")}</th>

            {/* duration */}
            <th className={durationClassName}>
              <Icon name={IoTimeOutline} opts={{ size: 20 }} />
            </th>
          </tr>
        </thead>

        {/* body */}
        {songs.length > 0 ? (
          <tbody>
            {songs.map((song, index) => {
              const { title, artist, imageUrl, album, createdAt, duration } = song;
              const artistId = artist?._id;
              const artistName = artist?.name;
              const albumId = album?._id;
              const albumTitle = album?.title;
              const isPlayedSong = song._id === audioSong?._id;
              const isPlayingSong = isPlaying && isPlayedSong;

              return (
                <tr
                  key={index}
                  style={
                    {
                      ...getColorStyle("--bg-hover-color", 0.2),
                      ...getColorStyle("--hover-color"),
                      backgroundImage: isPlayedSong
                        ? `linear-gradient(
                            45deg, 
                            transparent 0%,
                            ${paletee?.vibrant || "#818cf8"} 50%,
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
                    font-light
                    text-grey-custom/60
                    ${!isPlayedSong && "hover:bg-[var(--bg-hover-color)]"}
                    whitespace-nowrap
                    gradient-animation
                    transition
                  `}
                >
                  {/* index */}
                  <td style={{ filter: "brightness(1.5)" }} className={indexClassName}>
                    {isPlayingSong ? (
                      <SoundWave
                        color={paletee?.vibrant || "#818cf8"}
                        barWidth={3}
                        isPlaying={isPlaying}
                      />
                    ) : (
                      <div>
                        <p className={`group-hover:hidden`}>{index + 1}</p>
                        <Icon
                          name={FaPlay}
                          className={`hidden group-hover:block text-[var(--hover-color)]`}
                        />
                      </div>
                    )}
                  </td>

                  {/* title */}
                  <td>
                    <SongTitleItem
                      title={title}
                      imageUrl={imageUrl}
                      artist={artistName || ""}
                      switchFunc={switchFunc}
                      className={{ item: `flex-1 min-w-[150px] max-lg:min-w-[100px]` }}
                    />
                  </td>

                  {/* artist */}
                  <td style={{ filter: "brightness(1.5)" }} className={artistClassName}>
                    {artistId && artistName ? (
                      <AuthGuardLink
                        to={`/musician/${artistId}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`underline hover:text-[var(--hover-color)] transition-all`}
                      >
                        {artistName}
                      </AuthGuardLink>
                    ) : (
                      "--"
                    )}
                  </td>

                  {/* album */}
                  <td style={{ filter: "brightness(1.5)" }} className={albumClassName}>
                    {albumTitle && albumId ? (
                      <AuthGuardLink
                        to={`/album/${albumId}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`underline hover:text-[var(--hover-color)] transition-all`}
                      >
                        {albumTitle}
                      </AuthGuardLink>
                    ) : (
                      "--"
                    )}
                  </td>

                  {/* date */}
                  <td className={dateClassName}>
                    <p className={`line-clamp-1`}>
                      {getTimeAgo(createdAt.toString(), themeLocale)}
                    </p>
                  </td>

                  {/* duration */}
                  <td className={durationClassName}>
                    <p className={`line-clamp-1`}>{getDuration(duration)}</p>
                  </td>

                  {/* actions */}
                  <td className={actionsClassName}>
                    <SongTableListActions
                      fm={fm}
                      song={song}
                      activeMenuSongId={activeMenuSongId}
                      setActiveMenuSongId={setActiveMenuSongId}
                    />
                  </td>
                </tr>
              );
            })}

            {children}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={6}>
                {noFoundMessage ? (
                  noFoundMessage
                ) : (
                  <div
                    className={`
                      flex
                      flex-col
                      mt-10
                      py-10
                      gap-4
                      text-[14px]
                      text-center
                      text-neutral-500
                      tracking-widest
                    `}
                  >
                    <p>{songTableListFm("noSongs.1")}</p>
                    <p>
                      <FormattedMessage
                        id={`${songTablePrefix}.noSongs.2`}
                        values={{
                          strong: (chunks) => (
                            <strong className={`text-neutral-300`}>{chunks}</strong>
                          ),
                        }}
                      />
                    </p>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default SongTableList;
