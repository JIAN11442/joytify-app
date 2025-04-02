import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/loader.component";
import { useGetAuthUserInfoQuery } from "../hooks/user-query.hook";

const AppContainerPage = () => {
  const { authUser, isFetching } = useGetAuthUserInfoQuery();

  return isFetching ? (
    <Loader className={{ container: "h-full" }} />
  ) : authUser ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace={true} state={{ redirectUrl: window.location.pathname }} />
  );
};

export default AppContainerPage;
