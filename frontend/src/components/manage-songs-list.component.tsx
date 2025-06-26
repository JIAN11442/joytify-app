import { twMerge } from "tailwind-merge";

import ManageSongCard from "./manage-song-card.component";
import AnimationWrapper from "./animation-wrapper.component";
import { CardListSkeleton } from "./skeleton-loading.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";

type ManageSongsListProps = {
  songs: RefactorSongResponse[] | undefined;
  filteredSongs: RefactorSongResponse[] | undefined;
  isPending: boolean;
  className?: string;
};

const ManageSongsList: React.FC<ManageSongsListProps> = ({
  songs,
  filteredSongs,
  isPending,
  className,
}) => {
  const { fm } = useScopedIntl();
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const hasSongs = songs && songs.length > 0;
  const hasFilteredSongs = filteredSongs && filteredSongs.length > 0;
  const showSongs = hasSongs && hasFilteredSongs;

  const manageSongsListFm = fm("manage.songs.list");

  if (isPending) {
    return <CardListSkeleton count={2} className={`mt-5`} />;
  }

  if (!showSongs) {
    return (
      <div className={`flex h-[80%] items-center justify-center`}>
        <p className={`text-center text-neutral-500`}>
          {hasSongs ? manageSongsListFm("noFound") : manageSongsListFm("noSongs")}
        </p>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        `
          mt-5
          mb-8
          grid
          ${
            isCollapsed
              ? "max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "max-lg:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
          }
          gap-5
      `,
        className
      )}
    >
      {filteredSongs.map((song, index) => (
        <AnimationWrapper key={`manage-song-card-${song._id}`} transition={{ delay: index * 0.1 }}>
          <ManageSongCard songs={filteredSongs} currentIndex={index} />
        </AnimationWrapper>
      ))}
    </div>
  );
};

export default ManageSongsList;
