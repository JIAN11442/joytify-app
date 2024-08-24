import Loader from "./loader.component";
import useSidebarState from "../states/sidebar.state";
import { resUser } from "../constants/data-type.constant";
import { AxiosResponse } from "axios";

type LibraryBodyProps = {
  user: AxiosResponse | resUser | undefined;
  isLoading: boolean;
};

const LibraryBody: React.FC<LibraryBodyProps> = ({ user, isLoading }) => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : user ? (
        ""
      ) : (
        !isCollapsed && (
          <p
            className={`
              mt-5
              pl-4
              text-[15px]
              font-medium
              text-neutral-500
            `}
          >
            The playlist is empty before logging into your account.
          </p>
        )
      )}
    </>
  );
};

export default LibraryBody;
