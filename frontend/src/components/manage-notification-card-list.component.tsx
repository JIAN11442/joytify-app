import { IntlShape } from "react-intl";
import AnimationWrapper from "./animation-wrapper.component";
import PaginationControl from "./pagination-control.component";
import { NotificationCardListSkeleton } from "./skeleton-loading.component";
import ManageNotificationCardListItem from "./manage-notification-card-list-item.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { PaginatedNotificationResponse } from "@joytify/types/types";

type NotificationCardListProps = {
  fm: ScopedFormatMessage;
  intl: IntlShape;
  notifications: PaginatedNotificationResponse | undefined;
  pageControl: {
    page: number;
    setPage: (page: number) => void;
  };
  isPending: boolean;
};

const ManageNotificationCardList = ({
  fm,
  intl,
  notifications,
  pageControl,
  isPending,
}: NotificationCardListProps) => {
  const manageNotificationListFm = fm("manage.notification.list");

  if (isPending) {
    return <NotificationCardListSkeleton count={3} />;
  }

  if (!notifications) {
    return (
      <p
        className={`
          mt-20
          text-center
          text-neutral-500
        `}
      >
        {manageNotificationListFm("somethingWentWrong")}
      </p>
    );
  }

  if (notifications.docs.length === 0) {
    return (
      <p
        className={`
          mt-20
          text-center
          text-neutral-500
        `}
      >
        {manageNotificationListFm("noNotifications")}
      </p>
    );
  }

  const { docs, totalDocs, page } = notifications;

  return (
    <div
      className={`
        flex
        flex-col
        gap-10
        items-center
        justify-center
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
        {docs.map((notification, index) => {
          const { _id } = notification;

          return (
            <AnimationWrapper
              key={`manage-notification-list-${_id}`}
              transition={{ delay: index * 0.1 }}
            >
              <ManageNotificationCardListItem fm={fm} intl={intl} notification={notification} />
            </AnimationWrapper>
          );
        })}
      </div>

      {/* load */}
      <PaginationControl
        fm={fm}
        totalDocs={totalDocs}
        currentPage={page}
        currentDocsLength={docs.length}
        pageControl={pageControl}
      />
    </div>
  );
};

export default ManageNotificationCardList;
