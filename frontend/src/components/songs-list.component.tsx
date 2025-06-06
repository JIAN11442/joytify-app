import { useCallback } from "react";
import { IoTimeOutline } from "react-icons/io5";

import Icon from "./react-icons.component";
import SongListItem from "./song-list-item.component";
import { useScopedIntl } from "../hooks/intl.hook";
import usePlaybackControl from "../hooks/playback-control.hook";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { Queue, RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaylistState from "../states/playlist.state";
import useSidebarState from "../states/sidebar.state";

type SongsListProps = {
  songs: RefactorSongResponse[];
};

const SongsList: React.FC<SongsListProps> = ({ songs }) => {
  const { fm } = useScopedIntl();
  const playlistSongListHeaderFm = fm("playlist.content.songList.header");

  const { collapseSideBarState } = useSidebarState();
  const { songArrangementType } = usePlaylistState();
  const { playSong } = usePlaybackControl();

  const { COMPACT } = ArrangementOptions;
  const { isCollapsed } = collapseSideBarState;

  const handlePlaySong = useCallback(
    (index: number) => {
      return playSong({
        playlistSongs: songs,
        queue: songs as unknown as Queue,
        currentIndex: index,
        currentPlaySongId: songs[index]._id,
      });
    },
    [playSong, songs]
  );

  return (
    <div>
      {/* Header */}
      <div
        className={`
          flex
          gap-5
          px-4
          py-2
          mb-2
          border-b
          border-grey-custom/10
          text-[14px]
          font-light
          text-grey-custom/60
        `}
      >
        {/* index */}
        <div className={`w-5 min-w-[30px]`}>#</div>

        {/* title */}
        <div className={`flex-1 min-w-[150px]`}>{playlistSongListHeaderFm("title")}</div>

        {/* artist */}
        <div
          className={`
            flex-1
            min-w-[100px]
            ${songArrangementType === COMPACT ? "block" : "hidden"}
          `}
        >
          {playlistSongListHeaderFm("artist")}
        </div>

        {/* album */}
        <div
          className={`
            flex-1
            min-w-[100px]
            ${songArrangementType === COMPACT && "max-sm:hidden"}
          `}
        >
          {playlistSongListHeaderFm("album")}
        </div>

        {/* date added */}
        <div
          className={`
            w-40
            min-w-[100px]
            ${isCollapsed ? "max-md:hidden" : "max-lg:hidden"}
          `}
        >
          {playlistSongListHeaderFm("date")}
        </div>

        {/* duration */}
        <div className={`w-20`}>
          <Icon name={IoTimeOutline} opts={{ size: 20 }} />
        </div>
      </div>

      {/* Body */}
      <div>
        {songs &&
          songs.map((song, index) => (
            <SongListItem
              key={song._id}
              index={index}
              song={song}
              handlePlaySong={() => handlePlaySong(index)}
            />
          ))}
      </div>
    </div>
  );
};

export default SongsList;
