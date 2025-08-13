import { useCallback, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { timeoutForDelay } from "../lib/timeout.lib";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { TbTrashX } from "react-icons/tb";

import Menu from "./menu.component";
import MenuItem from "./menu-item.component";
import Icon from "./react-icons.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import {
  useDeleteTargetNotificationMutation,
  useMarkNotificationsAsReadMutation,
} from "../hooks/notification-mutate.hook";

type ManageNotificationCardMenuProps = {
  fm: ScopedFormatMessage;
  isRead: boolean;
  notificationId: string;
};

const ManageNotificationCardMenu: React.FC<ManageNotificationCardMenuProps> = ({
  fm,
  isRead,
  notificationId,
}) => {
  const [activeMenu, setActiveMenu] = useState(false);
  const manageNotificationCardFm = fm("manage.notification.card");

  const { mutate: markNotificationsAsRead } = useMarkNotificationsAsReadMutation();
  const { mutate: deleteTargetNotification } = useDeleteTargetNotificationMutation();

  const handleActiveOptionsMenu = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      timeoutForDelay(() => {
        setActiveMenu(!activeMenu);
      });
    },
    [activeMenu]
  );

  const handleMarkNotificationAsRead = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      timeoutForDelay(() => {
        markNotificationsAsRead([notificationId]);
        setActiveMenu(false);
      });
    },
    [markNotificationsAsRead, notificationId]
  );

  const handleDeleteNotification = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      timeoutForDelay(() => {
        deleteTargetNotification(notificationId);
        setActiveMenu(false);
      });
    },
    [deleteTargetNotification, notificationId]
  );

  return (
    <>
      <button
        type="button"
        onClick={handleActiveOptionsMenu}
        className={`
          text-grey-custom/50
          hover:text-white
          outline-none
          transition-all
        `}
      >
        <Icon name={BsThreeDotsVertical} opts={{ size: 16 }} />
      </button>

      <Menu
        activeState={{ visible: activeMenu, setVisible: setActiveMenu }}
        className={`absolute top-1 right-6 w-[210px]}`}
      >
        {/* mark as read */}
        <MenuItem
          icon={{ name: IoMdCheckmarkCircleOutline, opts: { size: 18 } }}
          label={manageNotificationCardFm("menu.markAsRead")}
          onClick={handleMarkNotificationAsRead}
          className={`${isRead && "hidden"}`}
        />

        {/* delete */}
        <MenuItem
          icon={{ name: TbTrashX, opts: { size: 19 } }}
          label={manageNotificationCardFm("menu.delete")}
          onClick={handleDeleteNotification}
        />
      </Menu>
    </>
  );
};

export default ManageNotificationCardMenu;
