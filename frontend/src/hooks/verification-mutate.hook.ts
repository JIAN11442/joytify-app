import toast from "react-hot-toast";
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

const { VERIFICATION_CODE_RATE_LIMIT_EXCEEDED } = ErrorCode;

// send verification code mutation
export const useSendCodeMutation = (opts: object = {}) => {
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
      toast.success("Verification code sent successfully");
    },
    onError: (error) => {
      if ((error as AppError).errorCode === VERIFICATION_CODE_RATE_LIMIT_EXCEEDED) {
        toast.error("You've made too many requests, please try again later");
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
  const { openResendStatusModal } = useVerificationModalState();

  const mutation = useMutation({
    mutationKey: [MutationKey.RESEND_VERIFICATION_CODE],
    mutationFn: async (data: SendCodeRequest) => {
      await sendVerificationCode(data);
    },
    onSuccess: () => {
      openResendStatusModal(true);
      toast.success("verification code resent successfully");
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
  const location = useLocation();
  const { closeAuthModal } = useAuthModalState();

  const redirectPath = location.state?.redirectUrl || "/";

  const mutation = useMutation({
    mutationKey: [MutationKey.SEND_RESET_PASSWORD_EMAIL],
    mutationFn: sendResetPasswordEmail,
    onSuccess: () => {
      // close auth modal
      closeAuthModal();
      // display success toast
      toast.success("Reset password email sent successfully");
      // navigate to redirect path
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      if ((error as AppError).errorCode === VERIFICATION_CODE_RATE_LIMIT_EXCEEDED) {
        toast.error("You've made too many requests, please try again later");
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
  const { openVerifyStatusModal } = useVerificationModalState();

  const mutation = useMutation({
    mutationKey: [MutationKey.VERIFY_VERIFICATION_CODE],
    mutationFn: verifyVerificationCode,
    onSuccess: (res) => {
      const { verified } = res;

      openVerifyStatusModal(verified);

      if (verified) {
        toast.success("Code verified successfully");
      } else {
        toast.error("Failed to verify code");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
