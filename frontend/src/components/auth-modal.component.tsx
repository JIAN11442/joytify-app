import { useState } from "react";
import { useIntl } from "react-intl";
import Modal from "./modal.component";
import AuthForm from "./auth-form.component";
import ForgotPasswordForm from "./forgot-password-form.component";

import { AuthForOptions } from "@joytify/shared-types/constants";
import useVerificationModalState from "../states/verification.state";
import useAuthModalState from "../states/auth-modal.state";

const AuthModal = () => {
  const [closeBtnDisabled, setCloseBtnDisabled] = useState(false);

  const intl = useIntl();
  const { activeAuthModal, authFor, closeAuthModal } = useAuthModalState();
  const { activeVerificationCodeModal } = useVerificationModalState();

  const { SIGN_IN, SIGN_UP, FORGOT_PASSWORD } = AuthForOptions;

  const title =
    authFor === SIGN_IN
      ? intl.formatMessage({ id: "auth.modal.title.signIn" })
      : authFor === SIGN_UP
      ? intl.formatMessage({ id: "auth.modal.title.signUp" })
      : intl.formatMessage({ id: "forgot.password.form.title" });

  const description =
    authFor === SIGN_IN
      ? intl.formatMessage({ id: "auth.modal.description.signIn" })
      : authFor === SIGN_UP
      ? intl.formatMessage({ id: "auth.modal.description.signUp" })
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
