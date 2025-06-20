import { twMerge } from "tailwind-merge";
import ContentBox from "./content-box.component";
import SidebarItem from "./sidebar-item.component";
import { MenuCategory } from "../types/category.type";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type SidebarCategoryListProps = {
  categories: MenuCategory[];
  className?: string;
  tw?: {
    sidebatItem?: string;
  };
};

const SidebarCategoryList: React.FC<SidebarCategoryListProps> = ({ categories, className, tw }) => {
  const { collapseSideBarState, activeFloatingSidebar, closeFloatingSidebar } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const handleCloseFloatingMenu = () => {
    timeoutForDelay(() => {
      if (activeFloatingSidebar) {
        closeFloatingSidebar();
      }
    });
  };

  return (
    <ContentBox
      className={twMerge(
        `
        flex
        flex-col
        h-full
        pt-8
        pb-0
        ${isCollapsed ? "px-1" : "px-5"}
        ${isCollapsed ? "justify-start items-center" : "justify-between"}
        overflow-y-auto
    `,
        className
      )}
    >
      <div className={`flex flex-col gap-6`}>
        {categories.map(({ category, items }, index) => (
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
                  className={twMerge(
                    `
                    ${isCollapsed ? "w-fit" : "hover:bg-neutral-800/50"}
                    px-4
                    py-3.5
                  `,
                    tw?.sidebatItem
                  )}
                  tw={{ label: `text-[14px]` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ContentBox>
  );
};

export default SidebarCategoryList;
