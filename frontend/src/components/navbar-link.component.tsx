import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { LinkProps, NavLink } from "react-router-dom";
import { IconBaseProps } from "react-icons";

import Icon, { IconName } from "./react-icons.component";

type PublicProps = Omit<LinkProps, "to"> & {
  tw?: { icon?: string };
  to?: string;
};

type NavbarLinkProps =
  | (PublicProps & {
      icon: {
        name: IconName;
        opts?: IconBaseProps;
      };
      children?: never;
    })
  | (PublicProps & {
      icon?: never;
      children: React.ReactNode;
    });

const NavbarLink = forwardRef<HTMLAnchorElement, NavbarLinkProps>(
  ({ to = "#", icon, className, tw, children, ...props }, ref) => {
    return (
      <NavLink
        to={to}
        ref={ref}
        className={twMerge(`${icon && "navbar-link"}`, className)}
        {...props}
      >
        {icon ? (
          <Icon name={icon.name} opts={{ size: 22, ...icon?.opts }} className={tw?.icon} />
        ) : (
          <>{children}</>
        )}
      </NavLink>
    );
  }
);

export default NavbarLink;
