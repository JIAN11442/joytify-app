import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/loader.component";
import { useGetAuthUserInfoQuery, useGetProfileUserInfoQuery } from "../hooks/user-query.hook";

type AuthGuardContainerPageProps = {
  redirectToHomeOnUnauthorized?: boolean;
};

const AuthGuardContainerPage: React.FC<AuthGuardContainerPageProps> = ({
  redirectToHomeOnUnauthorized = true,
}) => {
  const { authUser, isFetching } = useGetAuthUserInfoQuery();
  const { profileUser } = useGetProfileUserInfoQuery();

  if (isFetching) {
    return <Loader className={{ container: "h-full" }} />;
  }

  // If not logged in and should redirect home, navigate to home page
  if (!authUser && !profileUser && redirectToHomeOnUnauthorized) {
    return <Navigate to="/" replace state={{ redirectUrl: window.location.pathname }} />;
  }

  // Otherwise (logged in, or not logged in but redirect is not allowed—e.g., reset password page), render the outlet
  return <Outlet />;
};

export default AuthGuardContainerPage;
