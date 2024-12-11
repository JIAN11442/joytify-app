import Modal from "./modal.component";
import AuthForm from "./auth-form.component";

import AuthForOptions from "../constants/auth.constant";
import useAuthModalState from "../states/auth-modal.state";
import ForgotPasswordForm from "./forgot-password-form.component";

const AuthModal = () => {
  const { activeModal, authFor, closeAuthModal } = useAuthModalState();

  const SIGN_IN = AuthForOptions.SIGN_IN;
  const SIGN_UP = AuthForOptions.SIGN_UP;
  const FORGOT_PASSWORD = AuthForOptions.FORGOT_PASSWORD;

  const title =
    authFor === SIGN_IN
      ? "Welcome back"
      : authFor === SIGN_UP
      ? "Join use today"
      : "Reset your password";

  const description =
    authFor === SIGN_IN
      ? "Login to your account"
      : authFor === SIGN_UP
      ? "Sign up to get own account"
      : "Enter your email to get a reset password link";

  return (
    <Modal
      title={title}
      description={description}
      activeState={activeModal}
      closeModalFn={closeAuthModal}
    >
      {authFor === FORGOT_PASSWORD ? <ForgotPasswordForm /> : <AuthForm />}
    </Modal>
  );
};

export default AuthModal;
