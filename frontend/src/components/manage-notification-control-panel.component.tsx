import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { NotificationControlPanelSkeleton } from "./skeleton-loading.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { getManageNotificationControlPanelContent } from "../contents/manage-notification-control-panel.content";
import { NotificationTypeOptions } from "@joytify/shared-types/constants";
import { NotificationCountsResponse } from "@joytify/shared-types/types";
import { timeoutForDelay } from "../lib/timeout.lib";

type ManageNotificationControlPanelProps = {
  fm: ScopedFormatMessage;
  counts: NotificationCountsResponse | undefined;
  onTypeChange?: (type: NotificationTypeOptions) => void;
  className?: string;
  tw?: { item?: string };
};

const ManageNotificationControlPanel = ({
  fm,
  counts,
  onTypeChange,
  className,
  tw,
}: ManageNotificationControlPanelProps) => {
  const { ALL } = NotificationTypeOptions;
  const [selectedType, setSelectedType] = useState<NotificationTypeOptions>(ALL);

  const handleSelectType = (type: NotificationTypeOptions) => {
    timeoutForDelay(() => {
      setSelectedType(type);
      onTypeChange?.(type);
    });
  };

  if (!counts) return <NotificationControlPanelSkeleton />;

  const notificationControlPanelFields = getManageNotificationControlPanelContent(fm, counts);

  return (
    <div
      className={twMerge(
        `
          control-panel-items-wrapper
          grid
          grid-cols-4 
        `,
        className
      )}
    >
      {notificationControlPanelFields.map((field) => {
        const { id, key, title, count } = field;

        return (
          <button
            key={id}
            type="button"
            onClick={() => handleSelectType(key)}
            className={twMerge(
              `
              control-panel-btn
              min-w-[50px]
              ${
                selectedType === key
                  ? `control-panel-selected`
                  : `
                      text-neutral-400
                      hover:text-neutral-300
                      hover:bg-neutral-700
                    `
              }
            `,
              tw?.item
            )}
          >
            <p className={`flex gap-1 items-center max-w-full`}>
              <span className={`truncate`}>{title}</span>
              <span className={`whitespace-nowrap`}>({count})</span>
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default ManageNotificationControlPanel;
