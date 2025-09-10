import { useScopedIntl } from "../hooks/intl.hook";
import { ManageSongsOverviewSkeleton } from "./skeleton-loading.component";
import { getManageSongsOverviewContent } from "../contents/manage-songs-overview.content";
import { SongStatsResponse } from "@joytify/types/types";
import useSidebarState from "../states/sidebar.state";

type ManageSongsOverviewProps = {
  stats: SongStatsResponse | undefined;
  isPending: boolean;
};

const ManageSongsOverview: React.FC<ManageSongsOverviewProps> = ({ stats, isPending }) => {
  const { fm } = useScopedIntl();
  const songStatsFields = getManageSongsOverviewContent(fm);

  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  if (isPending) return <ManageSongsOverviewSkeleton />;

  return (
    <div
      className={`
        grid
        ${
          isCollapsed
            ? `max-sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-4`
            : `md:grid-cols-2 lg:grid-cols-4`
        }
        gap-5
    `}
    >
      {songStatsFields.map((field) => {
        const { id, key, title, unitFormatFn } = field;
        const value = stats?.[key as keyof SongStatsResponse] || 0;

        return (
          <div
            key={id}
            className={`
              flex
              flex-col
              p-5
              gap-3
              items-start
              justify-between
              border-[1px]
              border-neutral-200/5
              bg-neutral-200/5
              font-ubuntu
              rounded-md
            `}
          >
            <p className={`text-sm text-neutral-400 line-clamp-1`}>{title}</p>
            <p className={`text-3xl font-bold`}>{unitFormatFn ? unitFormatFn(value) : value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ManageSongsOverview;
