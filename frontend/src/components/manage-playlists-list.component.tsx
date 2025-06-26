import { twMerge } from "tailwind-merge";
import { BiPlus } from "react-icons/bi";

import Icon from "./react-icons.component";
import ManagePlaylistGridCard from "./manage-playlist-grid-card.component";
import ManagePlaylistListCard from "./manage-playlist-list-card.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { ManagePlaylistsArrangement } from "../constants/manage.constant";
import { ManagePlaylistsArrangementType } from "../types/manage.type";
import { PlaylistResponse } from "@joytify/shared-types/types";
import usePlaylistState from "../states/playlist.state";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { CardListSkeleton, PlaylistListCardSkeleton } from "./skeleton-loading.component";

type ManagePlaylistsListProps = {
  fm: ScopedFormatMessage;
  playlists: PlaylistResponse[];
  arrangement: ManagePlaylistsArrangementType;
  isPending?: boolean;
  className?: string;
};

const ManagePlaylistsList: React.FC<ManagePlaylistsListProps> = ({
  fm,
  playlists,
  arrangement,
  isPending,
  className,
}) => {
  const { collapseSideBarState } = useSidebarState();
  const { setActivePlaylistAdvancedCreateModal } = usePlaylistState();

  const handleActivePlaylistAdvancedCreateModal = () => {
    timeoutForDelay(() => {
      setActivePlaylistAdvancedCreateModal(true);
    });
  };

  const { isCollapsed } = collapseSideBarState;
  const { GRID } = ManagePlaylistsArrangement;

  const managePlaylistCardFm = fm("manage.playlist.card");

  return (
    <div
      className={twMerge(
        `
          mt-5
          mb-8
          ${
            arrangement === GRID
              ? `
                grid
                ${
                  isCollapsed
                    ? "max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "max-lg:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                }
                `
              : `flex flex-col`
          }
          gap-5
        `,
        className
      )}
    >
      {/* add playlist */}
      {arrangement === GRID ? (
        <div
          onClick={handleActivePlaylistAdvancedCreateModal}
          className={`
            group 
            card-wrapper 
            border-[2px] 
            border-dashed
            border-neutral-400/50 
            hover:border-neutral-400
            cursor-pointer
          `}
        >
          {/* image */}
          <div className={`add-playlist-card-image`}>
            <Icon
              name={BiPlus}
              opts={{ size: 35 }}
              className={`
                text-neutral-400/50 
                group-hover:scale-150
                group-hover:text-neutral-400/60
                duration-200
                transition-all
              `}
            />
          </div>

          {/* content */}
          <p className={`text-sm text-neutral-300 font-semibold`}>
            {managePlaylistCardFm("createPlaylist.title")}
          </p>
        </div>
      ) : (
        <div
          onClick={handleActivePlaylistAdvancedCreateModal}
          className={`
            group
            card-wrapper
            flex-row
            p-4
            gap-5
            from-neutral-500/10
            border-2
            border-dashed
            border-neutral-400/50
            hover:border-neutral-400
            hover:scale-[1.01]
            ease-in-out
            duration-200
            transition
            cursor-pointer
          `}
        >
          {/* image */}
          <div
            className={`
              add-playlist-card-image
              w-20
              h-20 
              bg-neutral-700
              group-hover:bg-neutral-600
          `}
          >
            <Icon
              name={BiPlus}
              opts={{ size: 26 }}
              className={`
                text-neutral-400/50
                group-hover:scale-125
                group-hover:text-neutral-400
                duration-200
                transition
              `}
            />
          </div>

          {/* content */}
          <div
            className={`
              flex
              flex-col
              gap-2
              items-start
              justify-center
              font-ubuntu
            `}
          >
            {/* title */}
            <p className={`text-lg font-semibold`}>
              {managePlaylistCardFm("createPlaylist.title")}
            </p>

            {/* description */}
            <p
              className={`
                text-sm
                text-neutral-500
              `}
            >
              {managePlaylistCardFm("createPlaylist.description")}
            </p>
          </div>
        </div>
      )}

      {/* other playlists */}
      {isPending ? (
        <>
          {Array.from({ length: 3 }).map((_, index) =>
            arrangement === GRID ? (
              <CardListSkeleton key={`card-list-skeleton-${index}`} className={`block`} />
            ) : (
              <PlaylistListCardSkeleton key={`playlist-list-card-skeleton-${index}`} />
            )
          )}
        </>
      ) : (
        playlists.map((playlist) =>
          arrangement === GRID ? (
            <ManagePlaylistGridCard key={playlist._id} playlist={playlist} />
          ) : (
            <ManagePlaylistListCard key={playlist._id} fm={fm} playlist={playlist} />
          )
        )
      )}
    </div>
  );
};

export default ManagePlaylistsList;
