import { useRef } from "react";
import toast from "react-hot-toast";
import { AuthProvider } from "firebase/auth";
import { MdAlternateEmail } from "react-icons/md";
import { SubmitHandler, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { IoKey } from "react-icons/io5";
import { BsFillQuestionCircleFill } from "react-icons/bs";

import googleLogo from "../images/google.png";
import githubLogo from "../images/github.png";
import Icon from "./react-icons.component";
import Loader from "./loader.component";
import InputBox from "./input-box.component";

import { authWithThirdParty, signin, signup } from "../fetchs/auth.fetch";
import {
  sendVerificationCode,
  SendCodeParams,
} from "../fetchs/verification.fetch";

import useAuth from "../hooks/auth.hook";
import AuthForOptions from "../constants/auth.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import {
  defaultLoginData,
  defaultRegisterData,
} from "../constants/form.constant";
import type { AuthForm } from "../constants/form.constant";
import FirebaseProvider from "../constants/firebase-provider.constant";
import { AppError, ErrorCode } from "../constants/error-code.constant";

import useAuthModalState from "../states/auth-modal.state";
import useVerificationModalState from "../states/verification.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { isHighlight } from "../lib/icon-highlight.lib";
import { emailRegex, passwordRegex } from "../utils/regex";

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const { refetch: authRefetch } = useAuth();
  const { authFor, openAuthModal, closeAuthModal } = useAuthModalState();
  const {
    openVerificationCodeModal,
    setVerificationProcessPending,
    verificationProcessPending,
  } = useVerificationModalState();

  const { SIGN_IN, SIGN_UP } = AuthForOptions;

  const redirectPath = location.state?.redirectUrl || "/";

  const thirdPartySubmitText =
    authFor === SIGN_IN ? "Continue" : authFor.replace("-", " ");

  const mutationKey =
    authFor === SIGN_IN ? MutationKey.SIGNIN : MutationKey.SIGNUP;

  const authFunc = authFor === SIGN_IN ? signin : signup;

  // send verification code mutation
  const { mutate: sendVerificationCodeToUser } = useMutation({
    mutationKey: [MutationKey.SEND_VERIFICATION_CODE],
    mutationFn: async (data: SendCodeParams) => {
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
      if (
        (error as AppError).errorCode ===
        ErrorCode.VerificationCodeRateLimitExceeded
      ) {
        toast.error("You've made too many requests, please try again later");
      } else {
        toast.error(error.message);
      }

      setVerificationProcessPending(false);
    },
  });

  // auth mutation (through email and password)
  const { mutate: authUser, isPending: authPending } = useMutation({
    mutationKey: [mutationKey],
    mutationFn: authFunc,
    onSuccess: () => {
      // close modal
      closeAuthModal();

      // refetch auth query
      authRefetch();

      // display success message
      toast.success(
        `${authFor === SIGN_IN ? "Login" : "Registered"} successfully`
      );

      // navigate to route before logout
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // auth mutation (through third-party)
  const { mutate: authUserWithThirdParty, isPending: thirdPartyAuthPending } =
    useMutation({
      mutationKey: [MutationKey.THIRD_PARTY_AUTH],
      mutationFn: authWithThirdParty,
      onSuccess: () => {
        // close modal
        closeAuthModal();

        // refetch auth query
        authRefetch();

        // display success message
        toast.success("Login Successfully");

        // navigate to route before logout
        navigate(redirectPath, { replace: true });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // navigate to the other auth modal
  const handleSwitchAuthModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    openAuthModal(authFor === SIGN_IN ? SIGN_UP : SIGN_IN);
  };

  // navigate to forgot password page
  const handleNavigateToForgotPasswordPage = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    timeoutForDelay(() => {
      openAuthModal(AuthForOptions.FORGOT_PASSWORD);
    });
  };

  // handle auth with third-party
  const handleAuthWithThirdParty = async (provider: AuthProvider) => {
    authUserWithThirdParty({ provider, authFor });
  };

  // get form data
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { isValid, errors },
  } = useForm<AuthForm>({
    defaultValues: authFor === SIGN_IN ? defaultLoginData : defaultRegisterData,
    mode: "onChange",
  });

  // disable edit
  const disabledEdit =
    verificationProcessPending || authPending || thirdPartyAuthPending;

  // icon highlight
  const isIconHighlight = (target: keyof AuthForm) =>
    isHighlight(watch, errors, target);

  // handle form submit
  const onSubmit: SubmitHandler<AuthForm> = async (value) => {
    const { email } = value;

    if (authFor === SIGN_IN) {
      authUser(value);
    } else {
      sendVerificationCodeToUser({
        email,
        shouldResendCode: false,
        registerFn: () => authUser(value),
      });
    }
  };

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
          onClick={() => handleAuthWithThirdParty(FirebaseProvider.GOOGLE)}
          className={`third-party-btn`}
        >
          <img
            src={googleLogo}
            className={`
              w-5
              h-5
            `}
          />
          <p>{thirdPartySubmitText} with Google</p>
        </button>

        {/* Github */}
        <button
          type="button"
          disabled={disabledEdit}
          onClick={() => handleAuthWithThirdParty(FirebaseProvider.GITHUB)}
          className={`third-party-btn`}
        >
          <img
            src={githubLogo}
            className={`
              w-6
              h-6
              object-cover
            `}
          />
          <p>{thirdPartySubmitText} with Github</p>
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
            text-grey-custom/5
          `}
        >
          OR
        </p>
        <hr className={`divider`} />
      </div>

      {/* Email */}
      <InputBox
        type="email"
        title="Email address"
        placeholder="Your email address"
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
          title="Password"
          placeholder="Your Password"
          icon={{ name: IoKey }}
          iconHighlight={isIconHighlight("password")}
          disabled={disabledEdit}
          {...register("password", {
            required: true,
            validate: (value) => passwordRegex.test(value),
            onChange: () => trigger("confirmPassword"),
          })}
        />

        <>
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
                <p>Forgot password?</p>
              </button>
            </div>
          ) : (
            ""
          )}
        </>
      </div>

      {/* Confirm password */}
      <>
        {authFor !== SIGN_IN && (
          <InputBox
            type="password"
            title="Confirm Password"
            placeholder="Confirm Password"
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
      </>

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
        ) : (
          authFor.replace("-", " ")
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
          ? "Don't have an account?"
          : "Already have an account?"}

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
          {authFor === SIGN_IN ? "Sign up" : "Sign in"}
        </button>
      </p>
    </form>
  );
};

export default AuthForm;
