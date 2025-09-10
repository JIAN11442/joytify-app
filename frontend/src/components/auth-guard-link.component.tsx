import { forwardRef } from "react";
import { Link, LinkProps } from "react-router-dom";
import { AuthForOptions } from "@joytify/types/constants";
import useAuthModalState from "../states/auth-modal.state";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const AuthGuardLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, onClick, children, ...props }, ref) => {
    const { authUser } = useUserState();
    const { openAuthModal } = useAuthModalState();

    const { SIGN_IN } = AuthForOptions;

    const handleLinkOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!authUser) {
        e.preventDefault();

        timeoutForDelay(() => {
          openAuthModal(SIGN_IN);
        });
      }

      onClick?.(e);
    };

    return (
      <Link to={to} ref={ref} onClick={handleLinkOnClick} {...props}>
        {children}
      </Link>
    );
  }
);

export default AuthGuardLink;
