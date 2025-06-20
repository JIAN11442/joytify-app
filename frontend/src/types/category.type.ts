import { IconType } from "react-icons";

export type MenuItem = {
  href: string;
  icon: {
    name: IconType;
    getSize?: (isCollapsed: boolean) => number;
  };
  label: string;
};

export type MenuCategory = {
  category: string;
  items: MenuItem[];
};
