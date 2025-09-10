import { twMerge } from "tailwind-merge";
import SongCard from "./song-card.component";
import AnimationWrapper from "./animation-wrapper.component";
import { RefactorSongResponse } from "@joytify/types/types";
import useSidebarState from "../states/sidebar.state";

type SongCardListProps = {
  songs: RefactorSongResponse[];
  className?: string;
  tw?: { wrapper?: string; card?: string };
};

const SongCardList: React.FC<SongCardListProps> = ({ songs, className, tw }) => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <div
      className={twMerge(
        `${isCollapsed ? "card-list-arrange--collapsed" : "card-list-arrange--expanded"}`,
        className
      )}
    >
      {songs.map((song, index) => {
        const { _id: songId } = song;

        return (
          <AnimationWrapper
            key={`song-card-${songId}`}
            transition={{ delay: index * 0.1 }}
            className={tw?.wrapper}
          >
            <SongCard song={song} className={tw?.card} />
          </AnimationWrapper>
        );
      })}
    </div>
  );
};

export default SongCardList;
