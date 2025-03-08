import { useEffect, useRef, useState } from "react";
import { IoCheckmark, IoClose } from "react-icons/io5";

import Icon from "./react-icons.component";
import { PasswordResetStatus } from "../constants/user.constant";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { getDuration } from "../utils/get-time.util";

type ResetStatusFormProps = {
  isSuccess: boolean;
};

const ResetStatusForm: React.FC<ResetStatusFormProps> = ({ isSuccess }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [countdown, setCountdown] = useState(10);

  const { setPasswordResetStatus } = useUserState();
  const { INITIAL } = PasswordResetStatus;

  // handle button click
  const handleBtnOnClick = () => {
    timeoutForDelay(() => {
      if (isSuccess) {
        window.location.href = "/";
      } else {
        setPasswordResetStatus(INITIAL);
      }
    });
  };

  // set icon, title, content, and button content
  const iconName = isSuccess ? IoCheckmark : IoClose;
  const title = isSuccess ? "Success!" : "Failed!";
  const content = isSuccess
    ? "Your password has been changed successfully. Now You can log in with your new password."
    : "Something went wrong. Please try again later.";
  const btnContent = isSuccess ? "Sign in" : "Retry";

  // auto switch to main form
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      clearInterval(timer);
      handleBtnOnClick();
    }

    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div
      className={`
        flex
        flex-col
        mt-10
        gap-8
        max-w-[380px]
        items-center
        justify-center
      `}
    >
      {/* Icon */}
      <div
        className={`
          p-6
          rounded-full
          shadow-[0_0_30px_5px]
          animate-shadow-pulse-5
          ${
            isSuccess
              ? "bg-green-500 shadow-green-500/30"
              : "bg-red-500 shadow-red-500/50"
          }
        `}
      >
        <Icon name={iconName} opts={{ size: 100 }} />
      </div>

      {/* Content */}
      <div
        className={`
          flex
          flex-col
          gap-5
          text-center
        `}
      >
        <p
          className={`
            text-5xl 
            font-extrabold
            font-ubuntu
            ${isSuccess ? "text-green-500" : "text-red-500"}
          `}
        >
          {title}
        </p>
        <p className={`text-neutral-500`}>{content}</p>
      </div>

      {/* Button */}
      <button
        ref={btnRef}
        disabled={countdown === 0}
        autoFocus
        onClick={handleBtnOnClick}
        className={`
          submit-btn
          w-fit
          px-5
          mt-3
          rounded-md
          ${!isSuccess && "bg-red-500 border-red-500"}
        `}
      >
        <p>
          {btnContent} {countdown > 0 && `(${getDuration(countdown)})`}
        </p>
      </button>
    </div>
  );
};

export default ResetStatusForm;
