import Loader from "./loader.component";
import LibraryPlaylist from "./library-playlist.component";
import { useScopedIntl } from "../hooks/intl.hook";

import { AuthUserResponse } from "@joytify/types/types";
import useSidebarState from "../states/sidebar.state";

type LibraryBodyProps = {
  authUser?: AuthUserResponse | null;
  isLoading: boolean;
};

const LibraryBody: React.FC<LibraryBodyProps> = ({ authUser, isLoading: isAuthLoading }) => {
  const { fm } = useScopedIntl();
  const libraryStatusNotLoggedInFm = fm("library.status.notLoggedIn");

  const { collapseSideBarState, activeFloatingSidebar } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;
  const isFixedSidebarExpanded = !isCollapsed && !activeFloatingSidebar;

  return (
    <div
      className={`
        overflow-y-auto
        hidden-scrollbar
        text-neutral-600/50
        ${!isCollapsed && "px-3"}
      `}
    >
      {isAuthLoading ? (
        <Loader className={{ container: "mt-5" }} />
      ) : authUser ? (
        // already login
        <LibraryPlaylist />
      ) : (
        // not login yet
        <>
          {!isCollapsed && (
            <p
              className={`
               flex
               flex-col
               gap-2
               mt-5
               pr-2
               text-[15px]
               text-neutral-500
               leading-7
             `}
            >
              {libraryStatusNotLoggedInFm("question")}
              <br className={`block ${isFixedSidebarExpanded && "max-lg:hidden"}`} />
              {libraryStatusNotLoggedInFm("action")}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default LibraryBody;
