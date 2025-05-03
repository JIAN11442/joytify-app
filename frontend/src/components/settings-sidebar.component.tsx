import ContentBox from "./content-box.component";
import SidebarItem from "./sidebar-item.component";
import { SquareDualLineSkeleton } from "./skeleton-loading.component";

import useUserState from "../states/user.state";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { useIntl } from "react-intl";
import { getSettingsSidebarCategories } from "../contents/settings-sidebar-categories.content";

const SettingsSidebar = () => {
  const intl = useIntl();
  const { profileUser } = useUserState();
  const { collapseSideBarState, activeFloatingSidebar, closeFloatingSidebar } = useSidebarState();

  const { isCollapsed } = collapseSideBarState;
  const { username, profile_img, email } = profileUser ?? {};

  const settingsSidebarCategories = getSettingsSidebarCategories(intl);

  const handleCloseFloatingMenu = () => {
    timeoutForDelay(() => {
      if (activeFloatingSidebar) {
        closeFloatingSidebar();
      }
    });
  };

  return (
    <>
      <ContentBox
        className={`
          flex
          flex-col
          h-full
          pt-8
          pb-0
          ${isCollapsed ? "px-1" : "px-5"}
          ${isCollapsed ? "justify-start items-center" : "justify-between"}
          overflow-y-auto
      `}
      >
        <div className={`flex flex-col gap-6`}>
          {settingsSidebarCategories.map(({ category, items }, index) => (
            <div
              key={category}
              className={`
                flex
                flex-col
                gap-3
              `}
            >
              {/* category title */}
              {!isCollapsed ? (
                <p
                  className={`
                    text-sm
                    text-neutral-600
                    font-bold
                  `}
                >
                  {category.toUpperCase()}
                </p>
              ) : (
                index > 0 && <hr className={`border-neutral-800/50`} />
              )}

              {/* category items */}
              <div className={`flex flex-col gap-1`}>
                {items.map(({ href, icon: Icon, label }) => (
                  <SidebarItem
                    key={label}
                    href={href}
                    icon={{
                      name: Icon.name,
                      opts: { size: Icon.getSize ? Icon.getSize(isCollapsed) : 22 },
                    }}
                    label={label}
                    collapse={isCollapsed}
                    onClick={handleCloseFloatingMenu}
                    className={`
                      ${isCollapsed ? "w-fit" : "hover:bg-neutral-800/50"}
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

      {!isCollapsed && (
        <ContentBox
          className={`
            flex
            p-5
            gap-3
            items-center
            justify-start
          `}
        >
          {/* User Avatar */}
          {profileUser ? (
            <div className={`flex w-full gap-3 items-center`}>
              <img
                src={profile_img}
                className={`
                  w-[3rem]
                  h-[3rem]
                  rounded-md
                  object-cover
                `}
              />
              <p className={`flex flex-col text-sm`}>
                <span className={`font-bold`}>{username?.split("?nanoid=")[0]}</span>
                <span className={`text-neutral-500`}>{email}</span>
              </p>
            </div>
          ) : (
            <SquareDualLineSkeleton />
          )}
        </ContentBox>
      )}
    </>
  );
};

export default SettingsSidebar;
