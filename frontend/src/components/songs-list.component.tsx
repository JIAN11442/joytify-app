import { IoTimeOutline } from "react-icons/io5";

import Icon from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";

import { resSong } from "../constants/data-type.constant";
import { getDuration, getTimeAgo } from "../utils/get-time.util";
import useSidebarState from "../states/sidebar.state";
import { FaPlay } from "react-icons/fa6";
import ArrangementOptions from "../constants/arrangement-type.constant";
import usePlaylistState from "../states/playlist.state";

type songsListProps = {
  songs: resSong[];
};

const SongsList: React.FC<songsListProps> = ({ songs }) => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const { songArrangementType } = usePlaylistState();

  const compact = ArrangementOptions.COMPACT;

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
        <div className={`flex-1 min-w-[100px]`}>Album</div>

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
        {songs.map((song, index) => {
          const { title, imageUrl, artist, album, duration, createdAt } = song;

          return (
            <AnimationWrapper
              key={index}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className={`
                group
                flex
                py-2
                px-4
                gap-5
                w-full
                items-center
                hover:bg-neutral-700/40
                text-sm
                font-light
                text-grey-custom/60
                rounded-md
                transition
              `}
            >
              {/* index */}
              <div
                className={`
                  w-5
                  min-w-[30px]
                  transition
                `}
              >
                {/* index number */}
                <p
                  className={`
                    group-hover:hidden
                  `}
                >
                  {index + 1}
                </p>

                {/* play icon */}
                <Icon
                  name={FaPlay}
                  className={`
                    hidden
                    group-hover:block
                    text-white
                  `}
                />
              </div>

              {/* titile */}
              <div
                className={`
                  flex
                  flex-1
                  min-w-[150px]
                  gap-3
                  items-center
                `}
              >
                <img
                  src={imageUrl}
                  className={`
                    w-[3rem]
                    h-[3rem]
                    object-cover
                    rounded-md
                    ${songArrangementType === compact ? "hidden" : "block"}
                  `}
                />

                <div>
                  <p className={`text-white line-clamp-1`}>{title}</p>
                  <p
                    className={`${
                      songArrangementType === compact ? "hidden" : "block"
                    }`}
                  >
                    {artist}
                  </p>
                </div>
              </div>

              {/* artist */}
              <div
                className={`
                  flex-1
                  min-w-[100px]  
                  ${songArrangementType === compact ? "block" : "hidden"}
                `}
              >
                <p>{artist}</p>
              </div>

              {/* Album */}
              <div
                className={`
                  flex-1
                  min-w-[100px]
                `}
              >
                <p className={`line-clamp-1`}>{album.length ? album : "--"}</p>
              </div>

              {/* Date added */}
              <div
                className={`
                  w-40
                  min-w-[100px]
                  ${isCollapsed ? "max-md:hidden" : "max-lg:hidden"}
                `}
              >
                <p className={`line-clamp-1`}>{getTimeAgo(createdAt)}</p>
              </div>

              {/* Duration */}
              <div className={`w-20`}>
                <p className={`line-clamp-1`}>{getDuration(duration)}</p>
              </div>
            </AnimationWrapper>
          );
        })}
      </div>
    </div>
  );
};

export default SongsList;
