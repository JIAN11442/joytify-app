import { IconType } from "react-icons";
import { PiDevices } from "react-icons/pi";
import { LuLanguages } from "react-icons/lu";
import { TbUsersPlus } from "react-icons/tb";
import { VscAccount } from "react-icons/vsc";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdOutlineLibraryMusic } from "react-icons/md";

interface MenuItem {
  href: string;
  icon: {
    name: IconType;
    getSize?: (isCollapsed: boolean) => number;
  };
  label: string;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export const settingsSidebarCategories: MenuCategory[] = [
  {
    category: "Main Menu",
    items: [
      {
        href: "/settings/account",
        icon: { name: VscAccount },
        label: "Account",
      },
      {
        href: "/settings/notifications",
        icon: { name: IoNotificationsOutline, getSize: (isCollapsed) => (isCollapsed ? 24 : 22) },
        label: "Notifications",
      },
    ],
  },
  {
    category: "Dashboard",
    items: [
      {
        href: "/settings/songs",
        icon: { name: MdOutlineLibraryMusic },
        label: "Songs",
      },
      {
        href: "/settings/following",
        icon: { name: TbUsersPlus },
        label: "Following",
      },
    ],
  },
  {
    category: "Other",
    items: [
      {
        href: "/settings/languages",
        icon: { name: LuLanguages },
        label: "Languages",
      },
      {
        href: "/settings/connected-devices",
        icon: { name: PiDevices, getSize: (isCollapsed) => (isCollapsed ? 24 : 22) },
        label: "Connected Devices",
      },
    ],
  },
];
