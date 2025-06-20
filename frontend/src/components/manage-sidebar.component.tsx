import { useScopedIntl } from "../hooks/intl.hook";
import SidebarCategoryList from "./sidebar-category-list.component";
import { getManageSidebarCategories } from "../contents/manage-sidebar-categories.content";

const ManageSidebar = () => {
  const { fm } = useScopedIntl();
  const manageCategories = getManageSidebarCategories(fm);

  return (
    <SidebarCategoryList
      categories={manageCategories}
      tw={{
        sidebatItem: `
          via-purple-400/50 via-[50%]
        `,
      }}
    />
  );
};

export default ManageSidebar;
