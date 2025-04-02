import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ContentBox from "../components/content-box.component";
import ResetPasswordForm from "../components/reset-password-form.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import ResetStatusForm from "../components/reset-status-form.component";
import JoytifyLogo from "../../public/joytify-logo.svg";

import { PasswordResetStatus } from "@joytify/shared-types/constants";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [direction, setDirection] = useState(0);
  const { passwordResetStatus } = useUserState();

  const token = searchParams.get("token") || "";

  const { INITIAL, SUCCESS } = PasswordResetStatus;

  // set switch direction
  useEffect(() => {
    timeoutForDelay(() => {
      if (passwordResetStatus) {
        setDirection(passwordResetStatus === INITIAL ? 1 : -1);
      }
    });
  }, [passwordResetStatus]);

  return (
    <div className={`h-screen p-2`}>
      <ContentBox
        className={`
          relative
          flex
          flex-col
          w-full
          h-full
          items-center
          justify-start
        `}
      >
        {/* logo */}
        <div
          className={`
            flex
            items-center
            gap-1
            mt-10
            mb-12
          `}
        >
          <img src={JoytifyLogo} className={`w-7`} />

          <p
            className={`
              text-3xl
              font-medium
              text-[#1cd760]
              font-ubuntu
            `}
          >
            Joytify<span className="text-sm align-top">®</span>
          </p>
        </div>

        {/* content */}
        <AnimationWrapper
          key={passwordResetStatus}
          initial={{ x: direction * 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * 50, opacity: 0 }}
          transition={{ type: "tween", duration: 0.2 }}
        >
          {passwordResetStatus === INITIAL ? (
            <ResetPasswordForm token={token} />
          ) : (
            <ResetStatusForm isSuccess={passwordResetStatus === SUCCESS} />
          )}
        </AnimationWrapper>

        {/* copyright */}
        <div
          className={`
            absolute
            bottom-5
          `}
        >
          <p
            className={`
              text-[12px]
              text-neutral-500/50
            `}
          >
            © Copyright 2025 Joytify Corporation
          </p>
        </div>
      </ContentBox>
    </div>
  );
};

export default ResetPasswordPage;
