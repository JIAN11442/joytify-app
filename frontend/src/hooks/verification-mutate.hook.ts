import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import {
  sendResetPasswordEmail,
  sendVerificationCode,
  verifyVerificationCode,
} from "../fetchs/verification.fetch";
import { MutationKey } from "../constants/query-client-key.constant";
import { ErrorCode } from "@joytify/shared-types/constants";
import { SendCodeRequest } from "@joytify/shared-types/types";
import { AppError } from "@joytify/shared-types/classes";
import useVerificationModalState from "../states/verification.state";
import useAuthModalState from "../states/auth-modal.state";
import { navigate } from "../lib/navigate.lib";
import toast from "../lib/toast.lib";

const { VERIFICATION_CODE_RATE_LIMIT_EXCEEDED } = ErrorCode;

// send verification code mutation
export const useSendCodeMutation = (opts: object = {}) => {
  const intl = useIntl();
  const { setVerificationProcessPending, openVerificationCodeModal } = useVerificationModalState();

  const mutation = useMutation({
    mutationKey: [MutationKey.SEND_VERIFICATION_CODE],
    mutationFn: async (data: SendCodeRequest) => {
      const { email, registerFn } = data;

      setVerificationProcessPending(true);

      return sendVerificationCode(data).then((res) => {
        const { id, action } = res;

        if (id) {
          openVerificationCodeModal(email, action, registerFn);
        }
      });
    },
    onSuccess: () => {
      toast.success(intl.formatMessage({ id: "toast.verification.sendCode.success" }));
    },
    onError: (error) => {
      if ((error as AppError).errorCode === VERIFICATION_CODE_RATE_LIMIT_EXCEEDED) {
        toast.error(intl.formatMessage({ id: "toast.verification.sendCode.error" }));
      } else {
        toast.error(error.message);
      }

      setVerificationProcessPending(false);
    },
    ...opts,
  });

  return mutation;
};

// resend verification code mutation
export const useResendCodeMutation = (opts: object = {}) => {
  const intl = useIntl();
  const { openResendStatusModal } = useVerificationModalState();

  const mutation = useMutation({
    mutationKey: [MutationKey.RESEND_VERIFICATION_CODE],
    mutationFn: async (data: SendCodeRequest) => {
      await sendVerificationCode(data);
    },
    onSuccess: () => {
      openResendStatusModal(true);
      toast.success(intl.formatMessage({ id: "toast.verification.resendCode.success" }));
    },
    onError: (error) => {
      openResendStatusModal(false);
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

// send reset password email mutation
export const useSendResetPasswordEmailMutation = (opts: object = {}) => {
  const intl = useIntl();
  const location = useLocation();
  const { closeAuthModal } = useAuthModalState();

  const redirectPath = location.state?.redirectUrl || "/";

  const mutation = useMutation({
    mutationKey: [MutationKey.SEND_RESET_PASSWORD_EMAIL],
    mutationFn: sendResetPasswordEmail,
    onSuccess: () => {
      closeAuthModal();

      toast.success(intl.formatMessage({ id: "toast.verification.sendResetPassword.success" }));

      // navigate to redirect path
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      if ((error as AppError).errorCode === VERIFICATION_CODE_RATE_LIMIT_EXCEEDED) {
        toast.error(intl.formatMessage({ id: "toast.verification.sendResetPassword.error" }));
      } else {
        toast.error(error.message);
      }
    },
    ...opts,
  });

  return mutation;
};

// verify verification code mutation
export const useVerifyCodeMutation = (opts: object = {}) => {
  const intl = useIntl();
  const { openVerifyStatusModal } = useVerificationModalState();

  const mutation = useMutation({
    mutationKey: [MutationKey.VERIFY_VERIFICATION_CODE],
    mutationFn: verifyVerificationCode,
    onSuccess: (res) => {
      const { verified } = res;

      openVerifyStatusModal(verified);

      if (verified) {
        toast.success(intl.formatMessage({ id: "toast.verification.verifyCode.success" }));
      } else {
        toast.error(intl.formatMessage({ id: "toast.verification.verifyCode.error" }));
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
