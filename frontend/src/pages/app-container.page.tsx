import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/loader.component";
import useAuth from "../hooks/auth.hook";

const AppContainerPage = () => {
  const { user, isLoading } = useAuth();

  return isLoading ? (
    <Loader />
  ) : user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/"
      replace={true}
      state={{ redirectUrl: window.location.pathname }}
    />
  );
};

export default AppContainerPage;
