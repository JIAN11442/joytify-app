import { IconBaseProps } from "react-icons";
import Icon, { IconName } from "./react-icons.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { twMerge } from "tailwind-merge";

type NotificationCardProps = {
  fm: ScopedFormatMessage;
  icon: { name: IconName; opts: IconBaseProps };
  tag: string;
  isRead: boolean;
  title: string;
  description: React.ReactNode;
  date: string;
  tw?: { icon?: string };
};

const ManageNotificationCard: React.FC<NotificationCardProps> = ({
  fm,
  icon,
  tag,
  isRead,
  title,
  description,
  date,
  tw,
}) => {
  const manageNotificationCardFm = fm("manage.notification.card");
  const isUnread = !isRead;

  return (
    <div
      className={`
        flex
        w-full
        h-full
        p-5
        gap-5
        bg-gradient-to-r
        from-neutral-700
        to-neutral-900
        hover:scale-[1.02]
        hover:from-neutral-700/80
        ${isUnread && "border-l-4 border-green-500"}
        items-start
        cursor-pointer
        rounded-md
        transition-all
      `}
    >
      {/* icon */}
      <Icon name={icon.name} opts={icon.opts} className={twMerge(`shrink-0`, tw?.icon)} />

      {/* content */}
      <div className={`flex w-full flex-col gap-3`}>
        {/* header */}
        <div className={`flex w-full items-center justify-between`}>
          {/* tag & unread */}
          <div className={`flex gap-2`}>
            {/* tags */}
            <div
              className={`
                py-1.5
                px-3
                text-xs
                bg-neutral-500
                text-neutral-100
                font-semibold
                rounded-full
              `}
            >
              {tag}
            </div>

            {/* unread */}
            {isUnread && (
              <div
                className={`
                  py-1.5
                  px-3
                  text-xs
                  bg-green-500
                  text-neutral-100
                  font-semibold
                  rounded-full
                `}
              >
                {manageNotificationCardFm("unread")}
              </div>
            )}
          </div>
          {/* date - sm */}
          <p className={`text-sm text-neutral-500 block max-sm:hidden`}>{date}</p>
        </div>

        {/* body */}
        <div className={`flex flex-col gap-1`}>
          {/* title */}
          <p className={`text-lg text-neutral-300 font-bold font-ubuntu`}>{title}</p>

          {/* description */}
          <p className={`text-sm text-neutral-400 leading-6`}>{description}</p>

          {/* date - max-sm */}
          <p className={`mt-3 text-sm text-neutral-500 max-sm:block hidden`}>{date}</p>
        </div>
      </div>
    </div>
  );
};

export default ManageNotificationCard;
