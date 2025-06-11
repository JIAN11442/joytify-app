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
  const { screenWidth } = useProviderState();
  const { collapseSideBarState } = useSidebarState();

  const { isCollapsed } = collapseSideBarState;
  const isSmallScreen = screenWidth < 640;

  return (
    <div
      className={twMerge(
        `
          grid
          ${
            isCollapsed
              ? `
                  max-sm:grid-cols-1
                  sm:grid-cols-3
                `
              : `
                  md:grid-cols-3
                `
          }
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
