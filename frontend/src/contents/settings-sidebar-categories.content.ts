import { PiDevices } from "react-icons/pi";
import { VscAccount } from "react-icons/vsc";
import { HiOutlineTranslate } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { MenuCategory } from "../types/category.type";

export const getSettingsSidebarCategories = (fm: ScopedFormatMessage): MenuCategory[] => {
  const settingsCategoriesFm = fm("settings.sidebar.categories");

  const categories = [
    {
      category: settingsCategoriesFm("mainMenu"),
      items: [
        {
          href: "/settings/account",
          icon: { name: VscAccount },
          label: settingsCategoriesFm("mainMenu.account"),
        },
        {
          href: "/settings/notifications",
          icon: {
            name: IoNotificationsOutline,
            getSize: (isCollapsed: boolean) => (isCollapsed ? 24 : 22),
          },
          label: settingsCategoriesFm("mainMenu.notifications"),
        },
      ],
    },
    {
      category: settingsCategoriesFm("other"),
      items: [
        {
          href: "/settings/languages",
          icon: { name: HiOutlineTranslate },
          label: settingsCategoriesFm("other.languages"),
        },
        {
          href: "/settings/connected-devices",
          icon: { name: PiDevices, getSize: (isCollapsed: boolean) => (isCollapsed ? 24 : 22) },
          label: settingsCategoriesFm("other.connectedDevices"),
        },
      ],
    },
  ];

  return categories;
};
