import { useEffect } from "react";
import { useGetUserPreferencesCookieQuery } from "../hooks/cookie-query.hook";
import { SupportedLocale } from "@joytify/shared-types/constants";
import useSidebarState from "../states/sidebar.state";
import useLocaleState from "../states/locale.state";
import useUserState from "../states/user.state";

const UserPreferencesProvider = () => {
  const { authUser } = useUserState();
  const { setCollapseSideBarState, collapseSideBarState } = useSidebarState();
  const { setThemeLocale } = useLocaleState();
  const { userPreferences } = useGetUserPreferencesCookieQuery();

  const { sidebarCollapsed, locale } = userPreferences ?? {};
  const { EN_US } = SupportedLocale;

  useEffect(() => {
    // if login, initialize sidebar collapsed state with user preferences cookie
    // if not login or logout, initialize sidebar collapsed state with false
    setCollapseSideBarState({
      ...collapseSideBarState,
      isCollapsed: !!sidebarCollapsed,
    });

    setThemeLocale(authUser ? locale ?? EN_US : EN_US);
  }, [authUser]);

  return null;
};

export default UserPreferencesProvider;
