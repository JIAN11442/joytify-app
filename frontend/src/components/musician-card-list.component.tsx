import { twMerge } from "tailwind-merge";
import MusicianCard from "./musician-card.component";
import AnimationWrapper from "./animation-wrapper.component";
import { RefactorMusicianResponse } from "@joytify/types/types";
import useSidebarState from "../states/sidebar.state";

type MusicianCardListProps = {
  musicians: RefactorMusicianResponse[];
  children?: React.ReactNode;
  className?: string;
  tw?: { wrapper?: string; cardWrapper?: string; cardTw?: { img?: string } };
};

const MusicianCardList: React.FC<MusicianCardListProps> = ({
  musicians,
  children,
  className,
  tw,
}) => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <div
      className={twMerge(
        `${isCollapsed ? "card-list-arrange--collapsed" : "card-list-arrange--expanded"}`,
        className
      )}
    >
      {musicians.map((musician, index) => {
        const musicianId = musician?._id;

        return (
          <AnimationWrapper
            key={`musician-card-${musicianId}`}
            transition={{ delay: index * 0.1 }}
            className={tw?.wrapper}
          >
            <MusicianCard musician={musician} className={tw?.cardWrapper} tw={tw?.cardTw} />
          </AnimationWrapper>
        );
      })}

      {children}
    </div>
  );
};

export default MusicianCardList;
