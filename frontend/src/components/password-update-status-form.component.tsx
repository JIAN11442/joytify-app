import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { IoCheckmark, IoClose } from "react-icons/io5";

import Icon from "./react-icons.component";
import { PasswordUpdateStatus } from "@joytify/shared-types/constants";
import { PasswordUpdateStatusType } from "@joytify/shared-types/types";
import { timeoutForDelay } from "../lib/timeout.lib";
import { getDuration } from "../utils/get-time.util";
import { useSignOutDevicesMutation } from "../hooks/session-mutate.hook";
import Loader from "./loader.component";

type PasswordStatusProps = {
  isSuccess: boolean;
  setPasswordUpdateStatus: (status: PasswordUpdateStatusType) => void;
  logoutAllDevices?: boolean;
  closeModalFn?: () => void;
  className?: string;
};

const PasswordUpdateStatusForm: React.FC<PasswordStatusProps> = ({
  isSuccess,
  setPasswordUpdateStatus,
  logoutAllDevices = false,
  closeModalFn,
  className,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [countdown, setCountdown] = useState(10);

  const { INITIAL } = PasswordUpdateStatus;
  const enableLogoutAllDevices = isSuccess && logoutAllDevices;

  const { mutate: signOutDevicesFn, isPending } = useSignOutDevicesMutation();

  const handleBtnOnClick = () => {
    timeoutForDelay(() => {
      if (isSuccess) {
        closeModalFn?.();
      } else {
        setPasswordUpdateStatus(INITIAL);
      }
    });
  };

  const handleLogoutAllDevices = () => {
    timeoutForDelay(() => {
      signOutDevicesFn();

      closeModalFn?.();
    });
  };

  const iconName = isSuccess ? IoCheckmark : IoClose;
  const title = isSuccess ? "Success!" : "Failed!";
  const content = isSuccess
    ? `Your password has been changed successfully. ${
        logoutAllDevices
          ? "For enhanced security, would you like to sign out from all other active devices?"
          : "Now You can log in with your new password."
      }`
    : "Something went wrong. Please try again later.";
  const btnContent = isSuccess ? (logoutAllDevices ? "Back" : "Sign in") : "Retry";

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
      className={twMerge(
        `
        flex
        flex-col
        gap-8
        max-w-[380px]
        items-center
        justify-center
      `,
        className
      )}
    >
      {/* Icon */}
      <div
        className={`
          p-6
          rounded-full
          shadow-[0_0_30px_5px]
          animate-shadow-pulse-5
          ${isSuccess ? "bg-green-500 shadow-green-500/30" : "bg-red-500 shadow-red-500/50"}
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
      <div
        className={`
          flex
          w-full
          items-center
          ${enableLogoutAllDevices ? "justify-between" : "justify-center"}
        `}
      >
        {enableLogoutAllDevices && (
          <button
            onClick={handleLogoutAllDevices}
            className={`
              modal-btn
              bg-red-500
              border-red-500
          `}
          >
            {isPending ? <Loader className={{ container: "h-full" }} /> : "Sign out all devices"}
          </button>
        )}

        <button
          ref={btnRef}
          disabled={countdown === 0}
          onClick={handleBtnOnClick}
          autoFocus
          className={`
            modal-btn
            ${!isSuccess && "bg-red-500 border-red-500"}
          `}
        >
          <p>
            {btnContent} {countdown > 0 && `(${getDuration(countdown)})`}
          </p>
        </button>
      </div>
    </div>
  );
};

export default PasswordUpdateStatusForm;
