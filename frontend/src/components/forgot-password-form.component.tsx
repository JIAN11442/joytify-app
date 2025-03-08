import { useRef } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { MdAlternateEmail } from "react-icons/md";

import Loader from "./loader.component";
import InputBox from "./input-box.component";

import { sendResetPasswordEmail } from "../fetchs/verification.fetch";
import AuthForOptions from "../constants/auth.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import { defaultForgotPasswordData } from "../constants/form.constant";
import type { ForgotPasswordForm } from "../constants/form.constant";
import { AppError, ErrorCode } from "../constants/error-code.constant";
import useAuthModalState from "../states/auth-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { navigate } from "../lib/navigate.lib";
import { isHighlight } from "../lib/icon-highlight.lib";
import { emailRegex } from "../utils/regex";

const ForgotPasswordForm = () => {
  const location = useLocation();
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const { openAuthModal, closeAuthModal } = useAuthModalState();

  // redirect path
  const redirectPath = location.state?.redirectUrl || "/";

  // send reset password email mutation
  const { mutate: sendResetPasswordEmailToUser, isPending } = useMutation({
    mutationKey: [MutationKey.SEND_RESET_PASSWORD_EMAIL],
    mutationFn: sendResetPasswordEmail,
    onSuccess: () => {
      closeAuthModal();

      toast.success("Reset password email sent");

      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      if (
        (error as AppError).errorCode ===
        ErrorCode.VerificationCodeRateLimitExceeded
      ) {
        toast.error("You've made too many requests, please try again later");
      } else {
        toast.error(error.message);
      }
    },
  });

  // handle navigate to sign in modal
  const handleNavigateToSignInModal = () => {
    timeoutForDelay(() => {
      openAuthModal(AuthForOptions.SIGN_IN);
    });
  };

  // initialize form data
  const {
    handleSubmit,
    register,
    watch,
    formState: { isValid, errors },
  } = useForm<ForgotPasswordForm>({
    defaultValues: defaultForgotPasswordData,
    mode: "onChange",
  });

  // icon highlight
  const isIconHighlight = (target: keyof ForgotPasswordForm) =>
    isHighlight(watch, errors, target);

  // handle submit
  const onSubmit: SubmitHandler<ForgotPasswordForm> = async (value) => {
    sendResetPasswordEmailToUser(value.email);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`
        flex
        flex-col
        gap-4
      `}
    >
      {/* Email address */}
      <InputBox
        type="email"
        placeholder="Your registered email address"
        icon={{ name: MdAlternateEmail }}
        iconHighlight={isIconHighlight("email")}
        className={`py-4`}
        {...register("email", {
          required: true,
          validate: (value) => emailRegex.test(value),
        })}
      />

      {/* Submit button */}
      <button
        type="submit"
        ref={submitBtnRef}
        disabled={!isValid || isPending}
        className={`
          submit-btn
          mt-2
          py-2.5
          text-sm
          outline-none
          rounded-full
          capitalize
        `}
      >
        {isPending ? <Loader loader={{ size: 20 }} /> : "Send"}
      </button>

      {/* Navigate link */}
      <p
        className={`
          text-sm
          text-neutral-600
          text-center
        `}
      >
        Already have an account?
        <button
          type="button"
          onClick={handleNavigateToSignInModal}
          disabled={isPending}
          className={`
            ml-2
            text-green-custom
            underline
            disabled:text-neutral-600
          `}
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
