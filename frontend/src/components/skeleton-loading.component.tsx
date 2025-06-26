import { twMerge } from "tailwind-merge";
import Skeleton, { SkeletonProps } from "react-loading-skeleton";
import useSidebarState from "../states/sidebar.state";
import useProviderState from "../states/provider.state";
import "react-loading-skeleton/dist/skeleton.css";

interface ImageSkeleton extends SkeletonProps {
  className?: string;
}

interface TextSkeleton extends SkeletonProps {
  count?: number;
  className?: string;
  tw?: {
    width?: string | number;
    height?: string | number;
  };
}

interface DeviceListSkeleton {
  thCount?: number;
  tdCount?: number;
}

interface SquareDualLineSkeleton extends SkeletonProps {
  count?: number;
  className?: string;
  tw?: {
    container?: string;
    square?: string;
    dualLine?: string;
  };
}

type CardSkeleton = {
  className?: string;
  tw?: { image?: string };
};

type CardListSkeleton = Omit<CardSkeleton, "tw"> & {
  count?: number;
  tw?: {
    container?: string;
    image?: string;
  };
};

const useSkeletonCommon = () => {
  const { screenWidth } = useProviderState();
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return {
    screenWidth,
    isCollapsed,
  };
};

// image skeleton (square)
export const ImageSkeleton: React.FC<ImageSkeleton> = ({ className, ...props }) => {
  return (
    <Skeleton
      className={twMerge(`w-[3rem] h-[3rem] rounded-md`, className)}
      containerClassName="flex items-center"
      {...props}
    />
  );
};

// text skeleton (line)
export const TextSkeleton: React.FC<TextSkeleton> = ({ count = 1, className, tw, ...props }) => {
  return (
    <div
      className={twMerge(
        `
        flex
        flex-col
        w-full
        justify-center
      `,
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={`text-skeleton-${index}`}
          width={tw?.width ?? "100%"}
          height={tw?.height ?? 12}
          {...props}
        />
      ))}
    </div>
  );
};

// square dual line skeleton
export const SquareDualLineSkeleton: React.FC<SquareDualLineSkeleton> = ({
  count = 1,
  className,
  tw,
  ...props
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
          <ImageSkeleton className={tw?.square} {...props} />

          {/* content skeleton */}
          <TextSkeleton count={2} {...props} />
        </div>
      ))}
    </div>
  );
};

// library playlist skeleton
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

// devices overview skeleton
export const DevicesOverviewSkeleton: React.FC<SquareDualLineSkeleton> = ({
  count = 1,
  className,
  tw,
  ...props
}) => {
  const { screenWidth, isCollapsed } = useSkeletonCommon();

  const isSmallScreen = screenWidth < 640;

  return (
    <div
      className={twMerge(
        `
          grid
          ${isCollapsed ? `max-sm:grid-cols-1 sm:grid-cols-3` : `md:grid-cols-3`}
          gap-5
        `,
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`devices-overview-skeleton-${index}`}
          className={twMerge(
            `
            flex
            py-5
            sm:py-8
            px-5
            gap-5
            bg-neutral-200/5
            items-center
            justify-between
            rounded-md
          `,
            tw?.container
          )}
        >
          {/* content skeleton */}
          <TextSkeleton count={isSmallScreen ? 2 : 3} {...props} />

          {/* image skeleton */}
          <ImageSkeleton className={tw?.square} {...props} />
        </div>
      ))}
    </div>
  );
};

// devices list skeleton
export const DevicesListSkeleton: React.FC<DeviceListSkeleton> = ({ thCount = 1, tdCount = 1 }) => {
  return (
    <table className={`min-w-full bg-neutral-200/5 rounded-md`}>
      <thead className={`border-b border-grey-custom/5`}>
        <tr>
          {Array.from({ length: thCount }).map((_, index) => (
            <th key={index}>
              <TextSkeleton />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: tdCount }).map((_, index) => (
          <tr
            key={index}
            className={`
              border-b
              border-grey-custom/5
          `}
          >
            <td key={index}>
              <SquareDualLineSkeleton count={1} />
            </td>
            {Array.from({ length: thCount - 1 }).map((_, index) => (
              <td key={`divice-list-td-${index}`}>
                <TextSkeleton />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// manage songs overview skeleton
export const ManageSongsOverviewSkeleton = () => {
  const { isCollapsed } = useSkeletonCommon();

  return (
    <div
      className={`
        grid
        ${isCollapsed ? `max-sm:grid-cols-1 sm:grid-cols-4` : `md:grid-cols-4`}
        gap-5
    `}
    >
      {Array.from({ length: 4 }).map((_, index) => {
        return (
          <div
            key={`manage-songs-overview-skeleton-${index}`}
            className={`
              flex
              flex-col
              p-5
              gap-3
              bg-neutral-200/5
              rounded-md
            `}
          >
            <TextSkeleton />
            <TextSkeleton />
          </div>
        );
      })}
    </div>
  );
};

// song playlist assignment skeleton
export const PlaylistCheckboxListSkeleton = ({ count = 1 }: { count: number }) => {
  return (
    <div
      className={`
        flex
        flex-col
        gap-3
      `}
    >
      {Array.from({ length: count }).map((_, index) => {
        return (
          <div
            key={`playlist-checkbox-list-skeleton-${index}`}
            className={`
              flex
              gap-3
              p-3
              pl-5
              bg-neutral-200/5
              items-center
              rounded-md
          `}
          >
            <Skeleton className={`w-3 h-3 rounded-md`} />
            <SquareDualLineSkeleton tw={{ square: "w-16 h-16" }} />
          </div>
        );
      })}
    </div>
  );
};

// card skeleton
export const CardSkeleton: React.FC<CardSkeleton> = ({ className, tw }) => {
  return (
    <div
      className={twMerge(
        `
        flex
        flex-col
        p-3
        gap-3
        w-full
        bg-gradient-to-t
        from-neutral-700/10
        to-neutral-700
        border-[0.1px]
        border-neutral-700
        rounded-md
      `,
        className
      )}
    >
      <ImageSkeleton className={twMerge(`w-full h-[250px]`, tw?.image)} />
      <div className={`grid grid-cols-2 gap-3`}>
        <TextSkeleton />
        <div className={`flex gap-2 justify-end`}>
          <Skeleton className={`w-5 h-5 rounded-full`} />
          <Skeleton className={`w-5 h-5 rounded-full`} />
          <Skeleton className={`w-5 h-5 rounded-full`} />
        </div>
      </div>
    </div>
  );
};

// card list skeleton
export const CardListSkeleton: React.FC<CardListSkeleton> = ({ count = 1, className, tw }) => {
  const { isCollapsed } = useSkeletonCommon();

  return (
    <div
      className={twMerge(
        `
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
      {Array.from({ length: count }).map((_, index) => {
        const { container, ...rest } = tw ?? {};

        return <CardSkeleton key={`card-list-skeleton-${index}`} className={container} tw={rest} />;
      })}
    </div>
  );
};

// playlist edit modal skeleton
export const PlaylistEditModalSkeleton = () => {
  return (
    <div
      className={`
        flex
        max-sm:flex-col
        gap-5
        w-full
        h-fit
      `}
    >
      <Skeleton className={`w-[15rem] h-[15rem]`} />

      <div className={`flex flex-col gap-3 w-full h-[15rem]`}>
        <Skeleton className={`h-full`} containerClassName="w-full h-16" />
        <Skeleton className={`h-full`} containerClassName="w-full h-full" />
      </div>
    </div>
  );
};

// playlist list arrangement skeleton
export const PlaylistListCardSkeleton = () => {
  return (
    <div
      className={`
        flex
        p-4
        gap-16
        bg-neutral-500/10
        items-center
        justify-between
        rounded-md
      `}
    >
      <SquareDualLineSkeleton tw={{ square: "w-20 h-20" }} />

      <div className={`flex gap-5 justify-end`}>
        <Skeleton className={`w-5 h-5 rounded-full`} />
        <Skeleton className={`w-5 h-5 rounded-full`} />
      </div>
    </div>
  );
};
