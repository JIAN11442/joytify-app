import { ButtonHTMLAttributes } from "react";
import { Link, LinkProps } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { IconBaseProps } from "react-icons";
import Icon, { IconName } from "./react-icons.component";

interface MenuItemBaseProps {
  icon?: { name: IconName; opts?: IconBaseProps };
  label?: string;
  children?: React.ReactNode;
  className?: string;
  tw?: { label?: string };
}

type MenuItemProps =
  | (MenuItemBaseProps & LinkProps & { to: string; onClick?: never })
  | (MenuItemBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never });

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  to,
  children,
  className,
  tw,
  ...props
}) => {
  const twMergeClass = twMerge(`menu-btn py-2`, className);
  const menuContent = (
    <>
      {icon && <Icon name={icon.name} opts={{ size: 16, ...icon.opts }} className={`shrink-0`} />}
      {label && <p className={`${tw?.label}`}>{label}</p>}
      {children}
    </>
  );

  if (to) {
    return (
      <Link {...(props as LinkProps)} to={to} className={twMergeClass} data-menu-item>
        {menuContent}
      </Link>
    );
  }

  return (
    <button
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      type="button"
      className={twMergeClass}
      data-menu-item
    >
      {menuContent}
    </button>
  );
};

export default MenuItem;
