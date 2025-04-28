import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { twMerge } from "tailwind-merge";
import useSidebarState from "../states/sidebar.state";

type SquareDualLineSkeleton = {
  count?: number;
  className?: string;
  tw?: {
    container?: string;
    square?: string;
    dualLine?: string;
  };
};

export const SquareDualLineSkeleton: React.FC<SquareDualLineSkeleton> = ({
  count = 1,
  className,
  tw,
}) => {
  return (
    <div className={twMerge(`flex flex-col w-full gap-2`, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`square-dual-line-skeleton-${index}`}
          className={twMerge(
            `
            flex
            gap-3
            w-full
            h-full
          `,
            tw?.container
          )}
        >
          {/* image skeleton */}
          <Skeleton
            className={twMerge(`w-[3rem] h-[3rem] rounded-md`, tw?.square)}
            containerClassName="flex items-center"
          />

          {/* content skeleton */}
          <div className={twMerge(`flex flex-col w-full justify-center`, tw?.dualLine)}>
            <Skeleton width={`100%`} height={12} />
            <Skeleton width={`100%`} height={12} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const LibraryPlaylistSkeleton = () => {
  const { collapseSideBarState, activeFloatingSidebar } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <SquareDualLineSkeleton
      count={3}
      className={`
        ${isCollapsed ? "gap-y-3" : "gap-y-1"}
      `}
      tw={{
        container: `${isCollapsed && !activeFloatingSidebar ? "p-0 hover:opacity-80" : "p-2"}`,
        square: "w-[3.3rem] h-[3.3rem]",
        dualLine: `${isCollapsed ? "hidden" : "block"}`,
      }}
    />
  );
};
