import { twMerge } from "tailwind-merge";
import LabelCard from "./label-card.component";
import AnimationWrapper from "./animation-wrapper.component";
import { RefactorSearchLabelResponse } from "@joytify/types/types";
import useSidebarState from "../states/sidebar.state";

type LabelCardListProps = {
  labels: RefactorSearchLabelResponse[];
  children?: React.ReactNode;
  className?: string;
  tw?: { wrapper?: string; cardWrapper?: string; cardTw?: { img?: string } };
};

const LabelCardList: React.FC<LabelCardListProps> = ({ labels, children, className, tw }) => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <div
      className={twMerge(
        `${isCollapsed ? "card-list-arrange--collapsed" : "card-list-arrange--expanded"}`,
        className
      )}
    >
      {labels.map((label, index) => {
        const labelId = label?._id;

        return (
          <AnimationWrapper
            key={`label-card-${labelId}`}
            transition={{ delay: index * 0.1 }}
            className={tw?.wrapper}
          >
            <LabelCard label={label} className={tw?.cardWrapper} tw={tw?.cardTw} />
          </AnimationWrapper>
        );
      })}

      {children}
    </div>
  );
};

export default LabelCardList;
