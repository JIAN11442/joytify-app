import { useEffect, useRef, useState } from "react";
import { LuMailCheck, LuMailX } from "react-icons/lu";

import Icon from "./react-icons.component";
import { VerificationCodeActions } from "@joytify/shared-types/constants";
import { VerificationForType } from "@joytify/shared-types/types";
import useVerificationModalState from "../states/verification.state";
import { getDuration } from "../utils/get-time.util";
import { timeoutForDelay } from "../lib/timeout.lib";

type ResendStatusFormProps = {
  isSuccess: boolean;
  initialPage: VerificationForType;
};

const ResendStatusForm: React.FC<ResendStatusFormProps> = ({ isSuccess, initialPage }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [countdown, setCountdown] = useState(5);

  const { activeVerificationCodeModal, backToInitialPage } = useVerificationModalState();

  const { userEmail } = activeVerificationCodeModal;

  const { CODE_UPDATED, CODE_SEND_FAILED } = VerificationCodeActions;
  const action = isSuccess ? CODE_UPDATED : CODE_SEND_FAILED;

  const handleSwitchToMainForm = () => {
    timeoutForDelay(() => {
      backToInitialPage(initialPage, action);
    });
  };

  const iconName = isSuccess ? LuMailCheck : LuMailX;
  const content = isSuccess
    ? "A verification code was just sent to your email"
    : "Something went wrong. Please try again later.";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0 && btnRef.current) {
      clearInterval(timer);
      btnRef.current.disabled = true;
      handleSwitchToMainForm();
    }

    return () => clearInterval(timer);
  }, [countdown, btnRef]);

  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        gap-10
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex
          p-5
          ${isSuccess ? "bg-green-500/30" : "bg-red-500/30"}
          rounded-full
        `}
      >
        <Icon
          name={iconName}
          opts={{ size: 60 }}
          className={`
          ${isSuccess ? "text-green-500" : "text-red-500"}
          `}
        />
      </div>

      {/* Content */}
      <div
        className={`
          flex
          flex-col
          gap-2
          text-center
        `}
      >
        <p className={`text-neutral-400`}>
          {content}{" "}
          {isSuccess && (
            <span>
              <span className={`text-blue-500`}>{userEmail}</span>. Please check your email inbox or
              spam folder.
            </span>
          )}
        </p>
      </div>

      {/* Button */}
      <button
        ref={btnRef}
        autoFocus
        onClick={handleSwitchToMainForm}
        className={`
          submit-btn
          ${countdown > 0 ? "w-fit" : "w-20"}
          rounded-md
        `}
      >
        <p>OK {countdown > 0 && `(${getDuration(countdown)})`}</p>
      </button>
    </div>
  );
};

export default ResendStatusForm;
