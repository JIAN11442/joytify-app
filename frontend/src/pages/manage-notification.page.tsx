import { useCallback, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

import Menu from "../components/menu.component";
import Icon from "../components/react-icons.component";
import MenuItem from "../components/menu-item.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import PageSectionTitle from "../components/page-section-title.component";
import ManageNotificationControlPanel from "../components/manage-notification-control-panel.component";
import ManageNotificationList from "../components/manage-notification-list.component";
import {
  useGetUserNotificationCountsQuery,
  useGetUserNotificationsQuery,
} from "../hooks/notification-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { NotificationTypeOptions } from "@joytify/shared-types/constants";
import { NotificationType } from "@joytify/shared-types/types";
import { timeoutForDelay } from "../lib/timeout.lib";

const ManageNotificationPage = () => {
  const { fm, intl } = useScopedIntl();
  const manageNotificationFm = fm("manage.notification");

  const { ALL } = NotificationTypeOptions;

  const [activeMenu, setActiveMenu] = useState(false);
  const [selectedNotificationType, setSelectedNotificationType] = useState<NotificationType>(ALL);

  const { counts } = useGetUserNotificationCountsQuery();
  const { notifications, page, setPage } = useGetUserNotificationsQuery(selectedNotificationType);

  const handleActiveOptionsMenu = useCallback(() => {
    timeoutForDelay(() => {
      setActiveMenu(!activeMenu);
    });
  }, [activeMenu]);

  const handleSelectNotificationType = useCallback((type: NotificationType) => {
    timeoutForDelay(() => {
      setSelectedNotificationType(type);
    });
  }, []);

  return (
    <div className={`settings-page-container`}>
      {/* header */}
      <AnimationWrapper
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-5 items-center justify-between`}
      >
        {/* title */}
        <PageSectionTitle
          icon={{ name: IoNotificationsOutline }}
          title={manageNotificationFm("title")}
          description={manageNotificationFm("description")}
        />

        {/* menu */}
        <div className={`relative`}>
          <button
            type="button"
            onClick={handleActiveOptionsMenu}
            className={`
              text-grey-custom/50
              hover:text-white
              outline-none
              transition
            `}
          >
            <Icon name={BsThreeDotsVertical} opts={{ size: 22 }} />
          </button>

          <Menu
            activeState={{ visible: activeMenu, setVisible: setActiveMenu }}
            className={`absolute top-1 right-6 w-[210px]`}
          >
            {/* mark all as read */}
            <MenuItem
              icon={{ name: IoMdCheckmarkCircleOutline }}
              label={manageNotificationFm("header.button.markAllAsRead")}
            />
          </Menu>
        </div>
      </AnimationWrapper>

      {/* control panel */}
      <AnimationWrapper initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <ManageNotificationControlPanel
          fm={fm}
          counts={counts}
          onTypeChange={handleSelectNotificationType}
        />
      </AnimationWrapper>

      {/* messages list */}
      <AnimationWrapper
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-3`}
      >
        <ManageNotificationList
          fm={fm}
          intl={intl}
          notifications={notifications}
          pageControl={{ page, setPage }}
        />
      </AnimationWrapper>
    </div>
  );
};

export default ManageNotificationPage;
