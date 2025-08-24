import { useMemo } from "react";
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
  tw?: { image?: string; container?: string; text?: string };
  children?: React.ReactNode;
};

type CardListSkeleton = Omit<CardSkeleton, "tw"> & {
  count?: number;
  tw?: {
    container?: string;
    image?: string;
  };
};

type CardListSectionSkeleton = {
  sectionCount?: number;
  listCount?: number;
  showDescription?: boolean;
  className?: string;
};

const useSkeletonCommon = () => {
  const { screenWidth } = useProviderState();
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const defaultColumnCount = useMemo(() => {
    if (screenWidth < 640) {
      return 4;
    } else if (screenWidth > 640 && screenWidth < 1024) {
      return isCollapsed ? 5 : 4;
    } else if (screenWidth > 1024 && screenWidth < 1280) {
      return isCollapsed ? 6 : 5;
    }

    return 2;
  }, [screenWidth, isCollapsed]);

  return {
    screenWidth,
    isCollapsed,
    defaultColumnCount,
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
export const CardSkeleton: React.FC<CardSkeleton> = ({ children, className, tw }) => {
  return (
    <div
      className={twMerge(
        `
          flex
          flex-col
          p-2.5
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
      <ImageSkeleton className={twMerge(`w-full`, tw?.image)} />

      {children ? children : <TextSkeleton />}
    </div>
  );
};

// manage card skeleton
export const ManageCardSkeleton: React.FC<CardSkeleton> = ({ className, tw }) => {
  return (
    <CardSkeleton className={className} tw={{ ...tw, image: "h-[250px]" }}>
      <div className={`grid grid-cols-2 gap-3`}>
        <TextSkeleton />
        <div className={`flex gap-2 justify-end`}>
          <Skeleton className={`w-5 h-5 rounded-full`} />
          <Skeleton className={`w-5 h-5 rounded-full`} />
          <Skeleton className={`w-5 h-5 rounded-full`} />
        </div>
      </div>
    </CardSkeleton>
  );
};

// circle card skeleton
export const CircleCardSkeleton: React.FC<CardSkeleton> = ({ className, tw }) => {
  return (
    <div className={twMerge(`grid-card-wrapper p-3 gap-3 no-hover`, className)}>
      <ImageSkeleton className={twMerge(`h-full w-full aspect-square rounded-full`, tw?.image)} />

      <div className={`flex flex-col pl-5`}>
        <TextSkeleton className={`w-[60%]`} />
        <TextSkeleton className={`w-[40%]`} />
      </div>
    </div>
  );
};

// grid card skeleton
export const GridCardSkeleton: React.FC<Pick<CardSkeleton, "tw">> = ({ tw }) => {
  return (
    <CardSkeleton
      className={twMerge(`from-transparent to-transparent border-none`, tw?.container)}
      tw={{ ...tw, image: "aspect-square h-full" }}
    >
      <div className={`flex flex-col pl-2 gap-2`}>
        <TextSkeleton className={`w-[60%]`} />
        <TextSkeleton className={`w-[40%]`} />
      </div>
    </CardSkeleton>
  );
};

// grid card list skeleton
export const GridCardListSkeleton: React.FC<CardListSkeleton> = ({ count = 1, className, tw }) => {
  const { isCollapsed } = useSkeletonCommon();
  return (
    <div
      className={twMerge(
        `${isCollapsed ? "card-list-arrange--collapsed" : "card-list-arrange--expanded"}`,
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => {
        return <GridCardSkeleton key={`card-list-skeleton-${index}`} tw={tw} />;
      })}
    </div>
  );
};

// card list section skeleton
export const GridCardListSectionSkeleton: React.FC<CardListSectionSkeleton> = ({
  sectionCount = 1,
  listCount = 4,
  showDescription = false,
  className,
}) => {
  return Array.from({ length: sectionCount }).map((_, index) => {
    return (
      <div key={`card-list-section-skeleton-${index}`} className={className}>
        <TextSkeleton className={`w-[10%] pl-3`} />
        {showDescription && <TextSkeleton className={`w-[15%] pl-3`} />}

        <GridCardListSkeleton
          key={`card-list-section-skeleton-${index}`}
          count={listCount}
          className={`flex overflow-x-auto hidden-scrollbar`}
          tw={{ container: "w-[180px] shrink-0", image: "h-[180px]" }}
        />
      </div>
    );
  });
};

// manage grid card list skeleton
export const ManageGridCardListSkeleton: React.FC<CardListSkeleton> = ({
  count = 1,
  className,
  tw,
}) => {
  const { isCollapsed } = useSkeletonCommon();

  return (
    <div
      className={twMerge(
        `${
          isCollapsed ? "manage-card-list-arrange--collapsed" : "manage-card-list-arrange--expanded"
        }`,
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => {
        const { container, ...rest } = tw ?? {};

        return (
          <ManageCardSkeleton key={`card-list-skeleton-${index}`} className={container} tw={rest} />
        );
      })}
    </div>
  );
};

// circle card list skeleton
export const CircleCardListSkeleton: React.FC<CardListSkeleton> = ({
  count = 1,
  className,
  tw,
}) => {
  const { isCollapsed } = useSkeletonCommon();

  return (
    <div
      className={twMerge(
        `${isCollapsed ? "card-list-arrange--collapsed" : "card-list-arrange--expanded"}`,
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => {
        const { container, ...rest } = tw ?? {};
        return (
          <CircleCardSkeleton key={`card-list-skeleton-${index}`} className={container} tw={rest} />
        );
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

// notification control panel skeleton
export const NotificationControlPanelSkeleton = () => {
  return <Skeleton className={`w-full h-[3rem] rounded-md`} />;
};

// notification card list skeleton
export const NotificationCardListSkeleton = ({ count = 1 }: { count?: number }) => {
  return (
    <div
      className={`
        flex
        flex-col
        w-full
        gap-3
      `}
    >
      {Array.from({ length: count }).map((_, index) => {
        return (
          <div
            key={`notification-card-list-skeleton-${index}`}
            className={`
              flex
              w-full
              h-full
              p-5
              gap-5
              bg-neutral-700/20
              rounded-md
          `}
          >
            <ImageSkeleton />

            <div className={`flex w-full flex-col gap-3`}>
              {/* header */}
              <div className={`flex w-full items-center justify-between`}>
                <div className={`flex gap-2`}>
                  {Array.from({ length: 2 }).map((_, index) => {
                    return (
                      <Skeleton
                        key={`notification-card-list-skeleton-${index}`}
                        className={`w-20 h-4 rounded-full`}
                      />
                    );
                  })}
                </div>
                <Skeleton className={`w-20 h-4 rounded-full`} />
              </div>

              {/* body */}
              <TextSkeleton count={2} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// song table list skeleton
export const SongTableListSkeleton = ({ listCount = 5 }: { listCount?: number }) => {
  const { defaultColumnCount } = useSkeletonCommon();

  return (
    <table className={`w-full`}>
      <thead>
        <tr className={`border-b border-grey-custom/5`}>
          {/* index */}
          <th className={`w-3`}>
            <Skeleton className={`w-3 h-3 rounded-md`} />
          </th>

          {/* other */}
          {Array.from({ length: defaultColumnCount - 1 }).map((_, index) => {
            return (
              <th key={`song-list-skeleton-th-${index}`}>
                <TextSkeleton />
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {Array.from({ length: listCount }).map((_, index) => {
          return (
            <SongTableTrSkeleton
              key={`song-list-skeleton-tr-${index}`}
              columnCount={defaultColumnCount}
            />
          );
        })}
      </tbody>
    </table>
  );
};

// song table tr skeleton
export const SongTableTrSkeleton = ({ columnCount }: { columnCount?: number }) => {
  const { defaultColumnCount } = useSkeletonCommon();

  return (
    <tr>
      {/* index */}
      <td className={`px-0 pl-5 max-w-[30px]`}>
        <Skeleton className={`w-3 h-3 rounded-md`} />
      </td>

      {/*  title */}
      <td>
        <SquareDualLineSkeleton tw={{ square: "w-[3.3rem] h-[3.3rem]" }} />
      </td>

      {/* other */}
      {Array.from({ length: (columnCount ?? defaultColumnCount) - 2 }).map((_, index) => {
        return (
          <td key={`song-list-skeleton-td-${index}`}>
            <TextSkeleton />
          </td>
        );
      })}
    </tr>
  );
};
