import { IoTimeOutline } from "react-icons/io5";

import Icon from "./react-icons.component";
import SongListItem from "./song-list-item.component";

import useSidebarState from "../states/sidebar.state";
import usePlaylistState from "../states/playlist.state";
import { refactorResSong } from "../constants/axios-response.constant";
import ArrangementOptions from "../constants/arrangement.constant";
import useOnPlay from "../hooks/play.hook";

type songsListProps = {
  songs: refactorResSong[];
};

const SongsList: React.FC<songsListProps> = ({ songs }) => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const { songArrangementType } = usePlaylistState();

  const compact = ArrangementOptions.COMPACT;

  const { onPlay } = useOnPlay(songs);

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
        <div className={`flex-1 min-w-[150px]`}>Title</div>

        {/* artist */}
        <div
          className={`
            flex-1
            min-w-[100px]
            ${songArrangementType === compact ? "block" : "hidden"}
          `}
        >
          Artist
        </div>

        {/* album */}
        <div
          className={`
            flex-1
            min-w-[100px]
            ${songArrangementType === compact && "max-sm:hidden"}
          `}
        >
          Album
        </div>

        {/* data added */}
        <div
          className={`
            w-40
            min-w-[100px]
            ${isCollapsed ? "max-md:hidden" : "max-lg:hidden"}
          `}
        >
          Date added
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
              onPlay={onPlay}
            />
          ))}
      </div>
    </div>
  );
};

export default SongsList;
