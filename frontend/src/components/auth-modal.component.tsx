import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { IoKey } from "react-icons/io5";
import { MdAlternateEmail } from "react-icons/md";
import { BsFillQuestionCircleFill } from "react-icons/bs";

import InputBox from "./input-box.component";
import Modal from "./modal.component";
import Icon from "./react-icons.component";
import Loader from "./loader.component";

import useAuthModalState from "../states/auth-modal.state";
import AuthForOptions from "../constants/auth-type.constant";
import getFormData from "../utils/get-form-data.util";
import MutationKey from "../config/mutation-key.config";
import { authParams, login, register } from "../fetchs/auth.fetch";

const AuthModal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const formRef = useRef<HTMLFormElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { isActive, authFor, openAuthModal, closeAuthModal } =
    useAuthModalState();

  const SIGN_IN = AuthForOptions.SIGN_IN;
  const SIGN_UP = AuthForOptions.SIGN_UP;

  const title = authFor === SIGN_IN ? "Welcome back" : "Join use today";
  const description =
    authFor === SIGN_IN
      ? "Login to your account"
      : "Sign up to get own account";

  // submit button disabled state
  const submitBtnDisabled =
    authFor === SIGN_IN
      ? !email || !password
      : !email || !password || password !== confirmPassword;

  // redirect path
  const redirectPath = location.state?.redirectUrl || "/";

  // auth mutation
  const { mutate: authUser, isPending } = useMutation({
    mutationKey: [MutationKey.AUTH],
    mutationFn: authFor === SIGN_IN ? login : register,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      closeAuthModal();

      toast.success(
        `${authFor === SIGN_IN ? "Login" : "Registered"} successfully`
      );

      navigate(redirectPath, { replace: true });
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

    closeAuthModal();
    navigate("/auth/password/forgot", { replace: true });
  };

  // handle input onKeyDown
  const handleInputOnKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef:
      | React.RefObject<HTMLInputElement>
      | React.RefObject<HTMLButtonElement>,
    condition: boolean | string = true
  ) => {
    if (nextRef.current && e.key === "Enter" && condition) {
      nextRef.current.focus();
    }
  };

  // handle input onChange
  const handleInputOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setData: (val: string) => void
  ) => {
    const value = e.target.value;

    setData(value);
  };

  // handle form submit
  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const { formData } = getFormData<authParams>(formRef);

    authUser(formData);
  };

  return (
    <Modal title={title} description={description} activeState={isActive}>
      <form
        ref={formRef}
        className={`
          flex
          flex-col
          gap-5
        `}
      >
        {/* Email */}
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
            id="email"
            type="email"
            name="email"
            value={email}
            placeholder="Your email address"
            icon={MdAlternateEmail}
            onChange={(e) => handleInputOnChange(e, setEmail)}
            onKeyDown={(e) =>
              handleInputOnKeyDown(
                e,
                passwordRef,
                e.currentTarget.value.length > 0
              )
            }
          />
        </div>

        {/* Password */}
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
            Password
          </p>

          <InputBox
            ref={passwordRef}
            id="password"
            type="password"
            name="password"
            value={password}
            placeholder="Your Password"
            icon={IoKey}
            onChange={(e) => handleInputOnChange(e, setPassword)}
            onKeyDown={(e) =>
              handleInputOnKeyDown(
                e,
                (authFor === SIGN_IN
                  ? submitBtnRef
                  : confirmPasswordRef) as React.RefObject<HTMLInputElement>,
                e.currentTarget.value.length > 0
              )
            }
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
          {authFor !== SIGN_IN ? (
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
                Confirm Password
              </p>

              <InputBox
                ref={confirmPasswordRef}
                id="confirm-password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                placeholder="Confirm Password"
                icon={IoKey}
                onChange={(e) => handleInputOnChange(e, setConfirmPassword)}
                onKeyDown={(e) =>
                  handleInputOnKeyDown(
                    e,
                    submitBtnRef,
                    e.currentTarget.value === passwordRef.current?.value
                  )
                }
              />
            </div>
          ) : (
            ""
          )}
        </>

        {/* Submit button */}
        <button
          ref={submitBtnRef}
          disabled={submitBtnDisabled}
          onClick={handleFormSubmit}
          className={`
            submit-btn
            capitalize
            text-sm
            outline-none
          `}
        >
          {isPending ? (
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
            className={`
              ml-2
              text-green-custom
              underline
            `}
          >
            {authFor === SIGN_IN ? "Sign up" : "Sign in"}
          </button>
        </p>
      </form>
    </Modal>
  );
};

export default AuthModal;
