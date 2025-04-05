import { useEffect } from "react";
import { useGetUserPreferencesCookieQuery } from "../hooks/cookie-query.hook";
import useSidebarState from "../states/sidebar.state";

const UserPreferencesProvider = () => {
  const { userPreferences } = useGetUserPreferencesCookieQuery();
  const { setCollapseSideBarState, collapseSideBarState } = useSidebarState();

  useEffect(() => {
    if (userPreferences) {
      const { collapseSidebar } = userPreferences;

      setCollapseSideBarState({
        ...collapseSideBarState,
        isCollapsed: collapseSidebar,
      });
    }
  }, [userPreferences]);

  return null;
};

export default UserPreferencesProvider;
