import { twMerge } from "tailwind-merge";
import Icon from "./react-icons.component";
import { DevicesOverviewSkeleton } from "./skeleton-loading.component";
import { getDeviceStatusOverviewFields } from "../contents/device-status-overview.content";
import { useScopedIntl } from "../hooks/intl.hook";
import { DeviceStats } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";

type DeviceStatusOverviewProps = {
  deviceStats: DeviceStats | undefined;
};

const DeviceStatusOverview: React.FC<DeviceStatusOverviewProps> = ({ deviceStats }) => {
  const { fm } = useScopedIntl();
  const deviceStatusFields = getDeviceStatusOverviewFields(fm);

  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  if (!deviceStats) return <DevicesOverviewSkeleton count={3} />;

  return (
    <div
      className={`
        grid
        ${isCollapsed ? `max-sm:grid-cols-1 sm:grid-cols-3` : `md:grid-cols-3`}
        gap-5
    `}
    >
      {deviceStatusFields.map((field) => {
        const { id, key, color, icon, title, description } = field;

        const DeviceStatusIcon: React.FC<{ className?: string }> = ({ className }) => {
          return (
            <div
              className={twMerge(
                `
                  flex
                  w-full
                  gap-5
                  items-center
                  justify-between
               `,
                className
              )}
            >
              <p style={{ color }} className={`text-4xl`}>
                {deviceStats[key as keyof DeviceStats]}
              </p>
              <div className={`p-3 bg-[#37415120] rounded-md`}>
                <Icon
                  name={icon.name}
                  opts={{ size: icon.size + 5 }}
                  className={`${icon.color} shrink-0`}
                />
              </div>
            </div>
          );
        };

        return (
          <div
            key={id}
            style={{
              background: `radial-gradient(circle, ${color}20 0%, ${color}40 40%, ${color}60 70%, ${color}90 100%)`,
              border: `0.1px solid ${color}20`,
            }}
            className={`
              flex
              p-5
              gap-5
              bg-neutral-200/5
              items-center
              justify-between
              rounded-md
            `}
          >
            <div
              className={`
                flex
                flex-col
                w-full
                gap-3
                text-sm
                text-neutral-400
                justify-between
              `}
            >
              <p className={`text-neutral-200 line-clamp-1`}>{title}</p>
              <DeviceStatusIcon className={`hidden sm:flex`} />
              <p className={`line-clamp-1`}>{description}</p>
            </div>

            {/* small screen item */}
            <DeviceStatusIcon className={`sm:hidden justify-end`} />
          </div>
        );
      })}
    </div>
  );
};

export default DeviceStatusOverview;
