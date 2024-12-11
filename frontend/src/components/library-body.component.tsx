import { AxiosResponse } from "axios";

import Loader from "./loader.component";
import LibraryPlaylist from "./library-playlist.component";

import useSidebarState from "../states/sidebar.state";
import { resUser } from "../constants/axios-response.constant";

type LibraryBodyProps = {
  user: AxiosResponse | resUser | undefined;
  isLoading: boolean;
};

const LibraryBody: React.FC<LibraryBodyProps> = ({
  user,
  isLoading: isAuthLoading,
}) => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <div
      className={`
        overflow-y-auto
        overflow-x-hidden
        hidden-scrollbar
        ${!isCollapsed && "pl-3 pr-3"}
      `}
    >
      {isAuthLoading ? (
        <Loader />
      ) : user ? (
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
