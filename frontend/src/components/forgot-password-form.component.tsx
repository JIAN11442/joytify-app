import { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdAlternateEmail } from "react-icons/md";

import Loader from "./loader.component";
import InputBox from "./input-box.component";

import { useSendResetPasswordEmailMutation } from "../hooks/verification-mutate.hook";
import { defaultForgotPasswordData } from "../constants/form.constant";
import { AuthForOptions } from "@joytify/shared-types/constants";
import { DefaultForgotPasswordForm } from "../types/form.type";
import useAuthModalState from "../states/auth-modal.state";
import { isHighlight } from "../lib/icon-highlight.lib";
import { timeoutForDelay } from "../lib/timeout.lib";
import { emailRegex } from "../utils/regex";

const ForgotPasswordForm = () => {
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const { openAuthModal } = useAuthModalState();

  // send reset password email mutation
  const { mutate: sendResetPasswordEmailFn, isPending } = useSendResetPasswordEmailMutation();

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
  } = useForm<DefaultForgotPasswordForm>({
    defaultValues: defaultForgotPasswordData,
    mode: "onChange",
  });

  // icon highlight
  const isIconHighlight = (target: keyof DefaultForgotPasswordForm) =>
    isHighlight(watch, errors, target);

  // handle submit
  const onSubmit: SubmitHandler<DefaultForgotPasswordForm> = async (value) => {
    sendResetPasswordEmailFn(value.email);
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
