import { IconType } from "react-icons";
import { PiDevices } from "react-icons/pi";
import { TbUsersPlus } from "react-icons/tb";
import { VscAccount } from "react-icons/vsc";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdOutlineLibraryMusic } from "react-icons/md";
import { HiOutlineTranslate } from "react-icons/hi";
import { ScopedFormatMessage } from "../hooks/intl.hook";

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

export const getSettingsSidebarCategories = (fm: ScopedFormatMessage): MenuCategory[] => {
  const settingsSidebarCategoriesFm = fm("settings.sidebar.categories");

  const categories = [
    {
      category: settingsSidebarCategoriesFm("mainMenu"),
      items: [
        {
          href: "/settings/account",
          icon: { name: VscAccount },
          label: settingsSidebarCategoriesFm("mainMenu.account"),
        },
        {
          href: "/settings/notifications",
          icon: {
            name: IoNotificationsOutline,
            getSize: (isCollapsed: boolean) => (isCollapsed ? 24 : 22),
          },
          label: settingsSidebarCategoriesFm("mainMenu.notifications"),
        },
      ],
    },
    // {
    //   category: "Dashboard",
    //   items: [
    //     {
    //       href: "/settings/songs",
    //       icon: { name: MdOutlineLibraryMusic },
    //       label: "Songs",
    //     },
    //     {
    //       href: "/settings/following",
    //       icon: { name: TbUsersPlus },
    //       label: "Following",
    //     },
    //   ],
    // },
    {
      category: settingsSidebarCategoriesFm("other"),
      items: [
        {
          href: "/settings/languages",
          icon: { name: HiOutlineTranslate },
          label: settingsSidebarCategoriesFm("other.languages"),
        },
        {
          href: "/settings/connected-devices",
          icon: { name: PiDevices, getSize: (isCollapsed: boolean) => (isCollapsed ? 24 : 22) },
          label: settingsSidebarCategoriesFm("other.connectedDevices"),
        },
      ],
    },
  ];

  return categories;
};
