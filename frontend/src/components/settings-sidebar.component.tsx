import { VscAccount } from "react-icons/vsc";
import { IoNotificationsOutline } from "react-icons/io5";

import ContentBox from "./content-box.component";
import SidebarItem from "./sidebar-item.component";
import { TbUsersPlus } from "react-icons/tb";
import { MdDevices, MdOutlineLibraryMusic } from "react-icons/md";
import { PiLockKey } from "react-icons/pi";
import { LuLanguages } from "react-icons/lu";
import { useGetProfileUserInfoQuery } from "../hooks/user-query.hook";

const SettingsSidebar = () => {
  const { profileUser } = useGetProfileUserInfoQuery();
  const { username, profile_img, email } = profileUser ?? {};

  const settingsCategories = [
    {
      category: "Main Menu",
      items: [
        {
          href: "/settings/account",
          icon: { name: VscAccount, size: 18 },
          label: "Account",
        },
        {
          href: "/settings/notifications",
          icon: { name: IoNotificationsOutline },
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
      category: "Security",
      items: [
        {
          href: "/settings/change-password",
          icon: { name: PiLockKey },
          label: "Change Password",
        },
        {
          href: "/settings/connected-devices",
          icon: { name: MdDevices },
          label: "Connected Devices",
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
      ],
    },
  ];

  return (
    <>
      <ContentBox
        className={`
          flex
          flex-col
          h-full
          pt-8
          px-5
          pb-0
          justify-between
          overflow-y-auto
      `}
      >
        <div className={`flex flex-col gap-6`}>
          {settingsCategories.map(({ category, items }) => (
            <div
              key={category}
              className={`
                flex
                flex-col
                gap-3
              `}
            >
              {/* category title */}
              <p className={`text-sm text-neutral-600 font-bold`}>{category}</p>

              {/* category items */}
              <div className={`flex flex-col gap-1`}>
                {items.map(({ href, icon: Icon, label }) => (
                  <SidebarItem
                    key={label}
                    href={href}
                    icon={{ name: Icon.name, opts: { size: Icon.size ?? 20 } }}
                    label={label}
                    className={`
                      px-5
                      py-3.5
                    `}
                    tw={{ label: `text-[14px]` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ContentBox>

      <ContentBox
        className={`
          flex
          gap-2
          p-5
          items-center
          justify-start
        `}
      >
        {/* User Avatar */}
        <img
          src={profile_img}
          className={`
            w-[3rem]
            h-[3rem]
            rounded-md
            object-cover
          `}
        />
        <p
          className={`
            flex
            flex-col
            text-sm
          `}
        >
          <span className={`font-bold`}>{username?.split("?nanoid=")[0]}</span>
          <span className={`text-neutral-500`}>{email}</span>
        </p>
      </ContentBox>
    </>
  );
};

export default SettingsSidebar;
