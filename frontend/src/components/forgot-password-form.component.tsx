import { useRef } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { MdAlternateEmail } from "react-icons/md";

import Loader from "./loader.component";
import InputBox from "./input-box.component";

import { MutationKey } from "../constants/query-client-key.constant";
import AuthForOptions from "../constants/auth.constant";
import { DefaultsResetPasswordType } from "../constants/form-default-data.constant";
import useAuthModalState from "../states/auth-modal.state";
import { sendResetPasswordEmail } from "../fetchs/auth.fetch";
import { timeoutForDelay } from "../lib/timeout.lib";
import { navigate } from "../lib/navigate.lib";

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
      toast.error(error.message);
    },
  });

  // handle input onKeyDown
  const handleMoveToNextElement = (
    e: React.KeyboardEvent<HTMLInputElement>,
    next: React.RefObject<HTMLButtonElement>,
    condition: string | boolean = e.currentTarget.value.length > 0
  ) => {
    if (e.key === "Enter" && condition) {
      if (typeof next === "string") {
        setFocus(next);
      } else if (next?.current) {
        next.current.focus();
      }
    }
  };

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
    setFocus,
    formState: { isValid },
  } = useForm<DefaultsResetPasswordType>({
    defaultValues: { email: "" },
  });

  // handle submit
  const onSubmit: SubmitHandler<DefaultsResetPasswordType> = async (value) => {
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
      <div
        className={`
          flex
          flex-col
          gap-2
        `}
      >
        <p
          className={`
            text-sm
            text-grey-custom/50
          `}
        >
          Email address
        </p>

        <InputBox
          type="email"
          placeholder="Your email address"
          icon={{ name: MdAlternateEmail }}
          onKeyDown={(e) => handleMoveToNextElement(e, submitBtnRef)}
          {...register("email", { required: true })}
        />
      </div>

      {/* Submit button */}
      <button
        ref={submitBtnRef}
        disabled={!isValid}
        className={`
          mt-2
          submit-btn
          capitalize
          text-sm
          outline-none
          rounded-full
        `}
      >
        {isPending ? (
          <Loader loader={{ size: 20 }} />
        ) : (
          "Send reset password link"
        )}
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
          onClick={handleNavigateToSignInModal}
          className={`
            ml-2
            text-green-custom
            underline
          `}
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
