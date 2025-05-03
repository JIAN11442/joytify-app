import { useIntl } from "react-intl";
import { useCallback, useEffect, useRef } from "react";
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
import { emailRegex } from "../utils/regex.util";

type ForgotPasswordFormProps = {
  setModalCloseBtnDisabled?: (state: boolean) => void;
};

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ setModalCloseBtnDisabled }) => {
  const intl = useIntl();
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const { openAuthModal } = useAuthModalState();
  const { mutate: sendResetPasswordEmailFn, isPending } = useSendResetPasswordEmailMutation();

  const handleNavigateToSignInModal = () => {
    timeoutForDelay(() => {
      openAuthModal(AuthForOptions.SIGN_IN);
    });
  };

  const {
    handleSubmit,
    register,
    watch,
    formState: { isValid, errors },
  } = useForm<DefaultForgotPasswordForm>({
    defaultValues: defaultForgotPasswordData,
    mode: "onChange",
  });

  const isIconHighlight = useCallback(
    (target: keyof DefaultForgotPasswordForm) => isHighlight(watch, errors, target),
    [watch, errors]
  );

  const onSubmit: SubmitHandler<DefaultForgotPasswordForm> = async (value) => {
    sendResetPasswordEmailFn(value.email);
  };

  // handle parent modal close button disabled state through isPending
  useEffect(() => {
    timeoutForDelay(() => {
      setModalCloseBtnDisabled?.(isPending);
    });
  }, [isPending]);

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
        placeholder={intl.formatMessage({
          id: "forgot.password.form.email.input.placeholder",
        })}
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
        {isPending ? (
          <Loader loader={{ size: 20 }} />
        ) : (
          intl.formatMessage({ id: "forgot.password.form.submit.button" })
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
        {intl.formatMessage({ id: "forgot.password.form.switchAccount.prompt" })}
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
          {intl.formatMessage({ id: "forgot.password.form.switchAccount.button" })}
        </button>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
