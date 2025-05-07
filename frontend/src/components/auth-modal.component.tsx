import { useState } from "react";

import Modal from "./modal.component";
import AuthForm from "./auth-form.component";
import ForgotPasswordForm from "./forgot-password-form.component";
import { useScopedIntl } from "../hooks/intl.hook";

import { AuthForOptions } from "@joytify/shared-types/constants";
import useVerificationModalState from "../states/verification.state";
import useAuthModalState from "../states/auth-modal.state";

const AuthModal = () => {
  const [closeBtnDisabled, setCloseBtnDisabled] = useState(false);

  const { fm } = useScopedIntl();
  const authModalFm = fm("auth.modal");
  const forgotPasswordFormFm = fm("forgot.password.form");

  const { activeAuthModal, authFor, closeAuthModal } = useAuthModalState();
  const { activeVerificationCodeModal } = useVerificationModalState();

  const { SIGN_IN, SIGN_UP, FORGOT_PASSWORD } = AuthForOptions;

  const title =
    authFor === SIGN_IN
      ? authModalFm("title.signIn")
      : authFor === SIGN_UP
      ? authModalFm("title.signUp")
      : forgotPasswordFormFm("title");

  const description =
    authFor === SIGN_IN
      ? authModalFm("description.signIn")
      : authFor === SIGN_UP
      ? authModalFm("description.signUp")
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
