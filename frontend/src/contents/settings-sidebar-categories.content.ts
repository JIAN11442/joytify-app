import { IconType } from "react-icons";
import { PiDevices } from "react-icons/pi";
import { TbUsersPlus } from "react-icons/tb";
import { VscAccount } from "react-icons/vsc";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdOutlineLibraryMusic } from "react-icons/md";
import { IntlShape } from "react-intl";
import { HiOutlineTranslate } from "react-icons/hi";

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

export const getSettingsSidebarCategories = (intl: IntlShape): MenuCategory[] => {
  const categories = [
    {
      category: intl.formatMessage({ id: "settings.sidebar.categories.mainMenu" }),
      items: [
        {
          href: "/settings/account",
          icon: { name: VscAccount },
          label: intl.formatMessage({ id: "settings.sidebar.categories.mainMenu.account" }),
        },
        {
          href: "/settings/notifications",
          icon: {
            name: IoNotificationsOutline,
            getSize: (isCollapsed: boolean) => (isCollapsed ? 24 : 22),
          },
          label: intl.formatMessage({ id: "settings.sidebar.categories.mainMenu.notifications" }),
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
      category: intl.formatMessage({ id: "settings.sidebar.categories.other" }),
      items: [
        {
          href: "/settings/languages",
          icon: { name: HiOutlineTranslate },
          label: intl.formatMessage({ id: "settings.sidebar.categories.other.languages" }),
        },
        {
          href: "/settings/connected-devices",
          icon: { name: PiDevices, getSize: (isCollapsed: boolean) => (isCollapsed ? 24 : 22) },
          label: intl.formatMessage({ id: "settings.sidebar.categories.other.connectedDevices" }),
        },
      ],
    },
  ];

  return categories;
};
