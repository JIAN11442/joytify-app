import { BsPeople } from "react-icons/bs";
import { TbPlaylist } from "react-icons/tb";
import { CiMusicNote1 } from "react-icons/ci";
import { IoNotificationsOutline } from "react-icons/io5";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { MenuCategory } from "../types/category.type";

export const getManageSidebarCategories = (fm: ScopedFormatMessage): MenuCategory[] => {
  const manageCategoriesFm = fm("manage.sidebar.categories");

  const categories = [
    {
      category: manageCategoriesFm("library"),
      items: [
        {
          href: "/manage/songs",
          icon: { name: CiMusicNote1 },
          label: manageCategoriesFm("library.songs"),
        },
        {
          href: "/manage/playlists",
          icon: { name: TbPlaylist },
          label: manageCategoriesFm("library.playlists"),
        },
        {
          href: "/manage/following",
          icon: { name: BsPeople },
          label: manageCategoriesFm("library.following"),
        },
      ],
    },
    {
      category: manageCategoriesFm("other"),
      items: [
        {
          href: "/manage/notifications",
          icon: { name: IoNotificationsOutline },
          label: manageCategoriesFm("other.notifications"),
        },
      ],
    },
  ];

  return categories;
};
