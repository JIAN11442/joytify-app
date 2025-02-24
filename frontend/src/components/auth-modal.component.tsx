import Modal from "./modal.component";
import AuthForm from "./auth-form.component";
import ForgotPasswordForm from "./forgot-password-form.component";

import AuthForOptions from "../constants/auth.constant";
import useAuthModalState from "../states/auth-modal.state";
import useVerificationCodeModalState from "../states/verification-code.state";

const AuthModal = () => {
  const { activeModal, authFor, closeAuthModal } = useAuthModalState();
  const { activeVerificationCodeModal } = useVerificationCodeModalState();

  const { SIGN_IN, SIGN_UP, FORGOT_PASSWORD } = AuthForOptions;

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
      autoCloseModalFn={!activeVerificationCodeModal.active}
      switchPage={{ initialPage: SIGN_UP, currentPage: authFor }}
    >
      {authFor === FORGOT_PASSWORD ? <ForgotPasswordForm /> : <AuthForm />}
    </Modal>
  );
};

export default AuthModal;
