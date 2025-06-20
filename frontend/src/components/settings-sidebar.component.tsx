import ContentBox from "./content-box.component";
import SidebarCategoryList from "./sidebar-category-list.component";
import { SquareDualLineSkeleton } from "./skeleton-loading.component";
import { getSettingsSidebarCategories } from "../contents/settings-sidebar-categories.content";
import { useScopedIntl } from "../hooks/intl.hook";
import useSidebarState from "../states/sidebar.state";
import useUserState from "../states/user.state";

const SettingsSidebar = () => {
  const { fm } = useScopedIntl();
  const { profileUser } = useUserState();
  const { collapseSideBarState } = useSidebarState();

  const { isCollapsed } = collapseSideBarState;
  const { username, profileImage, email } = profileUser ?? {};

  const settingsSidebarCategories = getSettingsSidebarCategories(fm);

  return (
    <>
      <SidebarCategoryList categories={settingsSidebarCategories} />

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
                src={profileImage}
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
