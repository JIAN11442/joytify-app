import Loader from "./loader.component";
import LibraryPlaylist from "./library-playlist.component";

import useSidebarState from "../states/sidebar.state";
import { AuthUserResponse } from "@joytify/shared-types/types";

type LibraryBodyProps = {
  authUser?: AuthUserResponse | null;
  isLoading: boolean;
};

const LibraryBody: React.FC<LibraryBodyProps> = ({ authUser, isLoading: isAuthLoading }) => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <div
      className={`
        overflow-y-auto
        hidden-scrollbar
        text-neutral-600/50
        ${!isCollapsed && "pl-3 pr-3"}
      `}
    >
      {isAuthLoading ? (
        <Loader />
      ) : authUser ? (
        // already login
        <LibraryPlaylist />
      ) : (
        // not login yet
        <>
          {!isCollapsed && (
            <p
              className={`
               mt-5
               pr-2
               text-[15px]
               font-medium
               text-neutral-500
             `}
            >
              The playlist is empty before logging into your account.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default LibraryBody;
