import { twMerge } from "tailwind-merge";
import AlbumCard from "./album-card.component";
import AnimationWrapper from "./animation-wrapper.component";
import { RefactorAlbumResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";

type AlbumCardListProps = {
  albums: RefactorAlbumResponse[];
  children?: React.ReactNode;
  className?: string;
  tw?: { wrapper?: string; cardWrapper?: string; cardTw?: { img?: string } };
};

const AlbumCardList: React.FC<AlbumCardListProps> = ({ albums, children, className, tw }) => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <div
      className={twMerge(
        `${isCollapsed ? "card-list-arrange--collapsed" : "card-list-arrange--expanded"}`,
        className
      )}
    >
      {albums.map((album, index) => {
        const { _id: albumId } = album;

        return (
          <AnimationWrapper
            key={`album-card-${albumId}`}
            transition={{ delay: index * 0.1 }}
            className={tw?.wrapper}
          >
            <AlbumCard album={album} className={tw?.cardWrapper} tw={{ img: tw?.cardTw?.img }} />
          </AnimationWrapper>
        );
      })}

      {children}
    </div>
  );
};

export default AlbumCardList;
