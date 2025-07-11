import { useCallback } from "react";
import { IntlShape } from "react-intl";
import AnimationWrapper from "./animation-wrapper.component";
import ManageNotificationListCard from "./manage-notification-list-card.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { PaginatedNotificationResponse } from "@joytify/shared-types/types";
import { timeoutForDelay } from "../lib/timeout.lib";

type NotificationListProps = {
  fm: ScopedFormatMessage;
  intl: IntlShape;
  notifications: PaginatedNotificationResponse | undefined;
  pageControl: {
    page: number;
    setPage: (page: number) => void;
  };
};

const ManageNotificationList = ({
  fm,
  intl,
  notifications,
  pageControl,
}: NotificationListProps) => {
  const { page, setPage } = pageControl;

  const handleLoadMore = useCallback(() => {
    timeoutForDelay(() => {
      setPage(page + 1);
    });
  }, [page, setPage]);

  const handleLoadLess = useCallback(() => {
    timeoutForDelay(() => {
      setPage(page - 1);
    });
  }, [page, setPage]);

  if (!notifications) return <p>Loading...</p>;

  const { docs, totalDocs } = notifications;
  const isLoadMore = totalDocs && totalDocs > docs.length;
  const isLoadLess = page > 1 && docs.length > 0;

  const notificationListFm = fm("manage.notification.list");

  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        gap-10
      `}
    >
      {/* list */}
      <div
        className={`
          flex 
          flex-col 
          w-full 
          gap-3
        `}
      >
        {notifications.docs.map((notification, index) => {
          const { _id } = notification;

          return (
            <AnimationWrapper
              key={`manage-notification-list-${_id}`}
              transition={{ delay: index * 0.2 }}
            >
              <ManageNotificationListCard fm={fm} intl={intl} notification={notification} />
            </AnimationWrapper>
          );
        })}
      </div>

      {/* load */}
      <div
        className={`
          flex 
          w-full 
          gap-10 
          items-center 
          justify-center
        `}
      >
        {/* load more */}
        {isLoadMore && (
          <button className={`load-btn`} onClick={handleLoadMore}>
            {notificationListFm("loadMore")}
          </button>
        )}

        {/* load less */}
        {isLoadLess && (
          <button className={`load-btn`} onClick={handleLoadLess}>
            {notificationListFm("loadLess")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ManageNotificationList;
