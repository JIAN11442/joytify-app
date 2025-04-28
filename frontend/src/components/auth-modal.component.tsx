import Modal from "./modal.component";
import AuthForm from "./auth-form.component";
import ForgotPasswordForm from "./forgot-password-form.component";

import { AuthForOptions } from "@joytify/shared-types/constants";
import useVerificationModalState from "../states/verification.state";
import useAuthModalState from "../states/auth-modal.state";
import { useState } from "react";

const AuthModal = () => {
  const [closeBtnDisabled, setCloseBtnDisabled] = useState(false);

  const { activeAuthModal, authFor, closeAuthModal } = useAuthModalState();
  const { activeVerificationCodeModal } = useVerificationModalState();

  const { SIGN_IN, SIGN_UP, FORGOT_PASSWORD } = AuthForOptions;

  const title =
    authFor === SIGN_IN
      ? "Welcome back"
      : authFor === SIGN_UP
      ? "Join use today"
      : "Get a reset password link";

  const description =
    authFor === SIGN_IN
      ? "Login to your account"
      : authFor === SIGN_UP
      ? "Sign up to get own account"
      : "";

  return (
    <Modal
      title={title}
      description={description}
      activeState={activeAuthModal}
      closeModalFn={!closeBtnDisabled ? closeAuthModal : undefined}
      autoCloseModal={!activeVerificationCodeModal.active}
      switchPage={{ initialPage: SIGN_UP, currentPage: authFor }}
    >
      {authFor === FORGOT_PASSWORD ? (
        <ForgotPasswordForm setModalCloseBtnDisabled={setCloseBtnDisabled} />
      ) : (
        <AuthForm setModalCloseBtnDisabled={setCloseBtnDisabled} />
      )}
    </Modal>
  );
};

export default AuthModal;
