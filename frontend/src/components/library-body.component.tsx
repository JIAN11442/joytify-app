import Loader from "./loader.component";
import useAuthHook from "../hooks/auth.hook";
import useSidebarState from "../states/sidebar.state";

const LibraryBody = () => {
  const { user, isLoading } = useAuthHook();
  const { collapse } = useSidebarState();
  const { isCollapsed } = collapse;

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : user ? (
        "is login"
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
