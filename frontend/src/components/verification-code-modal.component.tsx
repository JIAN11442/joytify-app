import Modal from "./modal.component";
import VerificationInputForm from "./verification-input-form.component";
import ResendStatusForm from "./resend-status-form.component";
import VerifyStatusForm from "./verify-status-form.component";

import {
  VerificationCodeActions,
  VerificationForOptions,
} from "../constants/verification.constant";
import useVerificationModalState from "../states/verification.state";

const VerificationCodeModal = () => {
  const {
    activeVerificationCodeModal,
    closeVerificationCodeModal,
    verifyCodePending,
  } = useVerificationModalState();
  const {
    active,
    type,
    userEmail,
    isResendSuccessful,
    isVerified,
    action,
    registerFn,
  } = activeVerificationCodeModal;

  const { EMAIL_VERIFICATION, RESEND_EMAIL_VERIFICATION, VERIFY_EMAIL } =
    VerificationForOptions;
  const { CODE_RETURNED, CODE_SEND_FAILED, EMAIL_VERIFY_FAILED } =
    VerificationCodeActions;

  let description = "";
  const title = type === EMAIL_VERIFICATION ? "Verify your email" : "";

  if (type === EMAIL_VERIFICATION) {
    switch (action) {
      case CODE_RETURNED:
        description = `The verification code was sent to ${userEmail} a few minutes ago. Please check your inbox or spam folder.`;
        break;
      case CODE_SEND_FAILED:
        description = `Something went wrong. Please try again later.`;
        break;
      case EMAIL_VERIFY_FAILED:
        description = `Your email verification failed. Please try again later.`;
        break;
      default:
        description = `A new verification code has just been sent to ${userEmail}`;
        break;
    }
  }

  return (
    <Modal
      title={title}
      description={description}
      activeState={active}
      closeModalFn={closeVerificationCodeModal}
      closeBtnDisabled={true}
      autoCloseModalFn={false}
      switchPage={{ initialPage: EMAIL_VERIFICATION, currentPage: type }}
      loading={verifyCodePending}
    >
      {type === EMAIL_VERIFICATION && userEmail && (
        <VerificationInputForm email={userEmail} />
      )}

      {type === RESEND_EMAIL_VERIFICATION && (
        <ResendStatusForm
          isSuccess={isResendSuccessful}
          initialPage={EMAIL_VERIFICATION}
        />
      )}

      {type === VERIFY_EMAIL && registerFn && (
        <VerifyStatusForm
          isSuccess={isVerified}
          initialPage={EMAIL_VERIFICATION}
          registerFn={registerFn}
        />
      )}
    </Modal>
  );
};

export default VerificationCodeModal;
