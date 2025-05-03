import { ButtonHTMLAttributes } from "react";
import { Link, LinkProps } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { IconBaseProps } from "react-icons";
import Icon, { IconName } from "./react-icons.component";

interface MenuItemBaseProps {
  icon?: { name: IconName; opts?: IconBaseProps };
  label?: string;
  className?: string;
}

type MenuItemProps =
  | (MenuItemBaseProps & LinkProps & { to: string; onClick?: never })
  | (MenuItemBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never });

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, to, className, ...props }) => {
  const twMergeClass = twMerge(`menu-btn py-2`, className);
  const menuContent = (
    <>
      {icon && <Icon name={icon.name} opts={{ size: 16, ...icon.opts }} />}
      {label && <p>{label}</p>}
    </>
  );

  if (to) {
    return (
      <Link {...(props as LinkProps)} to={to} className={twMergeClass}>
        {menuContent}
      </Link>
    );
  }

  return (
    <button
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      type="button"
      className={twMergeClass}
    >
      {menuContent}
    </button>
  );
};

export default MenuItem;
