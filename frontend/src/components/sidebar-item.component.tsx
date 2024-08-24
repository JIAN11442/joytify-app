import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { IconType } from "react-icons";

import Icon from "./react-icons.component";
import useSidebarState from "../states/sidebar.state";

type SidebarItemProps = {
  icon: IconType;
  label: string;
  href?: string;
  collapse?: boolean;
  className?: string;
  onClick?: () => void;
};

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  href,
  collapse = false,
  className,
  onClick,
}) => {
  const navigate = useNavigate();
  const active = window.location.pathname === href;

  const { floating } = useSidebarState();

  const handleOnClick = () => {
    if (href) {
      navigate(href);
    }

    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleOnClick}
      className={twMerge(
        `
          flex
          gap-x-4
          items-center
          cursor-pointer
          ${
            active
              ? "text-white"
              : collapse && !floating
              ? "text-neutral-700"
              : "text-neutral-400"
          }
          hover:text-white
          transition
        `,
        className
      )}
    >
      {/* Icon */}
      <Icon name={icon} opts={{ size: 28 }} />

      {/* Label */}
      <>
        {!collapse || floating ? (
          <p
            className={`
              text-lgc
              font-bold
              truncate
            `}
          >
            {label}
          </p>
        ) : (
          ""
        )}
      </>
    </div>
  );
};

export default SidebarItem;
