import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import JoytifyLogo from "../../public/logos/joytify-logo.svg";
import ContentBox from "../components/content-box.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import ResetPasswordForm from "../components/reset-password-form.component";
import PasswordUpdateStatusForm from "../components/password-update-status-form.component";
import { PasswordUpdateStatus } from "@joytify/shared-types/constants";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [direction, setDirection] = useState(0);
  const { passwordResetStatus, setPasswordResetStatus } = useUserState();

  const token = searchParams.get("token") || "";

  const { INITIAL, SUCCESS } = PasswordUpdateStatus;

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
            gap-1
            mt-10
            mb-12
          `}
        >
          <img src={JoytifyLogo} className={`w-7`} />

          <p
            className={`
              text-3xl
              text-[#1cd760]
              font-medium
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
          className={`
            flex
            w-[450px]
            items-center
            justify-center
          `}
        >
          {passwordResetStatus === INITIAL ? (
            <ResetPasswordForm token={token} />
          ) : (
            <PasswordUpdateStatusForm
              isSuccess={passwordResetStatus === SUCCESS}
              setPasswordUpdateStatus={setPasswordResetStatus}
              className={`mt-10`}
            />
          )}
        </AnimationWrapper>

        {/* copyright */}
        <div className={`absolute bottom-5`}>
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
