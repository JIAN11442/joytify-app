import { useCallback, useEffect, useMemo, useRef } from "react";
import { AuthProvider } from "firebase/auth";
import { IoKey } from "react-icons/io5";
import { MdAlternateEmail } from "react-icons/md";
import { SubmitHandler, useForm } from "react-hook-form";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import googleLogo from "../images/google.png";
import githubLogo from "../images/github.png";

import Loader from "./loader.component";
import Icon from "./react-icons.component";
import InputBox from "./input-box.component";

import { useScopedIntl } from "../hooks/intl.hook";
import { useSendCodeMutation } from "../hooks/verification-mutate.hook";
import { useLocalAuthMutation, useThirdPartyAuthMutation } from "../hooks/auth-mutate.hook";
import { getCurrentIPGeoLocation } from "../fetchs/network.fetch";
import { defaultLoginData, defaultRegisterData } from "../constants/form.constant";
import { FirebaseProvider } from "../constants/firebase-provider.constant";
import { AuthForOptions } from "@joytify/shared-types/constants";
import type { DefaultAuthForm } from "../types/form.type";
import useAuthModalState from "../states/auth-modal.state";
import useVerificationModalState from "../states/verification.state";
import { isHighlight } from "../lib/icon-highlight.lib";
import { timeoutForDelay } from "../lib/timeout.lib";
import { emailRegex, passwordRegex } from "../utils/regex.util";
import { getSessionInfo } from "../utils/get-devide-info.util";

type AuthFormProps = {
  setModalCloseBtnDisabled?: (state: boolean) => void;
};

const AuthForm: React.FC<AuthFormProps> = ({ setModalCloseBtnDisabled }) => {
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const { fm } = useScopedIntl();
  const { authFor, openAuthModal } = useAuthModalState();
  const { verificationProcessPending } = useVerificationModalState();

  const { mutate: sendCodeFn } = useSendCodeMutation();
  const { mutate: localAuthFn, isPending: localAuthPending } = useLocalAuthMutation();
  const { mutate: thirdPartyAuthFn, isPending: thirdPartyAuthPending } =
    useThirdPartyAuthMutation();

  const authFormFm = fm("auth.form");

  const { SIGN_IN, SIGN_UP } = AuthForOptions;
  const { GOOGLE, GITHUB } = FirebaseProvider;

  const handleSwitchAuthModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    timeoutForDelay(() => {
      openAuthModal(authFor === SIGN_IN ? SIGN_UP : SIGN_IN);
    });
  };

  const handleNavigateToForgotPasswordPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    timeoutForDelay(() => {
      openAuthModal(AuthForOptions.FORGOT_PASSWORD);
    });
  };

  const handleAuthWithThirdParty = async (provider: AuthProvider) => {
    timeoutForDelay(async () => {
      const sessionInfo = await getCurrentSessionInfo();
      thirdPartyAuthFn({ provider, authFor, sessionInfo });
    });
  };

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { isValid, errors },
  } = useForm<DefaultAuthForm>({
    defaultValues: authFor === SIGN_IN ? defaultLoginData : defaultRegisterData,
    mode: "onChange",
  });

  const getCurrentSessionInfo = useCallback(async () => {
    const geoInfo = await getCurrentIPGeoLocation();
    const sessionInfo = getSessionInfo(geoInfo);

    return sessionInfo;
  }, [getCurrentIPGeoLocation, getSessionInfo]);

  const isIconHighlight = useCallback(
    (target: keyof DefaultAuthForm) => isHighlight(watch, errors, target),
    [watch, errors]
  );

  const disabledEdit = useMemo(() => {
    return verificationProcessPending || localAuthPending || thirdPartyAuthPending;
  }, [verificationProcessPending, localAuthPending, thirdPartyAuthPending]);

  // handle form submit
  const onSubmit: SubmitHandler<DefaultAuthForm> = async (value) => {
    const { email } = value;
    const sessionInfo = await getCurrentSessionInfo();
    const authData = { ...value, sessionInfo };

    if (authFor === SIGN_IN) {
      localAuthFn(authData);
    } else {
      sendCodeFn({
        email,
        shouldResendCode: false,
        registerFn: () => localAuthFn(authData),
      });
    }
  };

  // handle parent modal close button disabled state through isPending
  useEffect(() => {
    setModalCloseBtnDisabled?.(localAuthPending || thirdPartyAuthPending);
  }, [localAuthPending, thirdPartyAuthPending]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`
        flex
        flex-col
        gap-3
      `}
    >
      {/* Third-party login method */}
      <div
        className={`
          flex
          flex-col
          gap-3
        `}
      >
        {/* Google */}
        <button
          type="button"
          disabled={disabledEdit}
          onClick={() => handleAuthWithThirdParty(GOOGLE)}
          className={`third-party-btn`}
        >
          <img alt="google logo" src={googleLogo} className={`w-5 h-5`} />
          <p>
            {authFor === SIGN_IN
              ? authFormFm("thirdParty.Google.signIn")
              : authFormFm("thirdParty.Google.signUp")}
          </p>
        </button>

        {/* Github */}
        <button
          type="button"
          disabled={disabledEdit}
          onClick={() => handleAuthWithThirdParty(GITHUB)}
          className={`third-party-btn`}
        >
          <img
            alt="github logo"
            src={githubLogo}
            className={`
              w-6
              h-6
              object-cover
            `}
          />
          <p>
            {authFor === SIGN_IN
              ? authFormFm("thirdParty.Github.signIn")
              : authFormFm("thirdParty.Github.signUp")}
          </p>
        </button>
      </div>

      {/* Separate line */}
      <div
        className={`
          flex
          items-center
          justify-center
          gap-2
        `}
      >
        <hr className={`divider`} />
        <p
          className={`
            text-sm
            text-grey-custom/10
            whitespace-nowrap
          `}
        >
          {authFormFm("divider.text")}
        </p>
        <hr className={`divider`} />
      </div>

      {/* Email */}
      <InputBox
        type="email"
        title={authFormFm("email.input.title")}
        placeholder={authFormFm("email.input.placeholder")}
        icon={{ name: MdAlternateEmail }}
        iconHighlight={isIconHighlight("email")}
        disabled={disabledEdit}
        {...register("email", {
          required: true,
          validate: (value) => emailRegex.test(value),
        })}
      />

      {/* Password */}
      <div
        className={`
          flex
          flex-col
          gap-2
        `}
      >
        <InputBox
          type="password"
          title={authFormFm("password.input.title")}
          placeholder={authFormFm("password.input.placeholder")}
          icon={{ name: IoKey }}
          iconHighlight={isIconHighlight("password")}
          disabled={disabledEdit}
          {...register("password", {
            required: true,
            validate: (value) => passwordRegex.test(value),
            onChange: () => trigger("confirmPassword"),
          })}
        />

        {authFor === SIGN_IN ? (
          <div
            className={`
              flex
              items-center
              justify-end
              text-sm
              text-neutral-700
            `}
          >
            <button
              type="button"
              onClick={handleNavigateToForgotPasswordPage}
              className={`
                flex
                gap-2
                items-center
                justify-center
                hover:text-green-custom
                hover:underline
                transition
              `}
            >
              <Icon name={BsFillQuestionCircleFill} />
              <p>{authFormFm("forgotPassword.text")}</p>
            </button>
          </div>
        ) : (
          ""
        )}
      </div>

      {/* Confirm password */}
      {authFor !== SIGN_IN && (
        <InputBox
          type="password"
          title={authFormFm("confirmPassword.input.title")}
          placeholder={authFormFm("confirmPassword.input.placeholder")}
          icon={{ name: IoKey }}
          iconHighlight={isIconHighlight("confirmPassword")}
          disabled={disabledEdit}
          {...register("confirmPassword", {
            required: true,
            validate: (value) => {
              return value === watch("password");
            },
          })}
        />
      )}

      {/* Submit button */}
      <button
        ref={submitBtnRef}
        disabled={!isValid || disabledEdit}
        className={`
          mt-2
          submit-btn
          capitalize
          text-sm
          outline-none
          rounded-full
        `}
      >
        {disabledEdit ? (
          <Loader loader={{ size: 20 }} />
        ) : authFor === SIGN_IN ? (
          authFormFm("submit.button.signIn")
        ) : (
          authFormFm("submit.button.signUp")
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
        {authFor === SIGN_IN
          ? authFormFm("switchAccount.prompt.signIn")
          : authFormFm("switchAccount.prompt.signUp")}

        <button
          onClick={handleSwitchAuthModal}
          disabled={disabledEdit}
          className={`
            ml-2
            text-green-custom
            underline
            disabled:text-neutral-500
          `}
        >
          {authFor === SIGN_IN
            ? authFormFm("switchAccount.button.signIn")
            : authFormFm("switchAccount.button.signUp")}
        </button>
      </p>
    </form>
  );
};

export default AuthForm;
