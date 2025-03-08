import { FaCheck } from "react-icons/fa6";
import {
  VerificationCodeActions,
  VerificationForType,
} from "../constants/verification.constant";
import Icon from "./react-icons.component";
import { IoClose } from "react-icons/io5";
import useVerificationModalState from "../states/verification.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { useEffect, useRef, useState } from "react";
import { getDuration } from "../utils/get-time.util";

type VerifyStatusFormProps = {
  isSuccess: boolean;
  initialPage: VerificationForType;
  registerFn: () => void;
};

const VerifyStatusForm: React.FC<VerifyStatusFormProps> = ({
  isSuccess,
  initialPage,
  registerFn,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [countdown, setCountdown] = useState(5);

  const { backToInitialPage, closeVerificationCodeModal } =
    useVerificationModalState();

  const { EMAIL_VERIFY_FAILED } = VerificationCodeActions;
  const iconName = isSuccess ? FaCheck : IoClose;

  const handleBtnClick = () => {
    timeoutForDelay(() => {
      if (isSuccess) {
        timeoutForDelay(() => {
          closeVerificationCodeModal();
          registerFn();
        });
      } else {
        backToInitialPage(initialPage, EMAIL_VERIFY_FAILED);
      }
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0 && btnRef && btnRef.current) {
      clearInterval(timer);
      btnRef.current.disabled = true;
      handleBtnClick();
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
        gap-5
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex
          p-4
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
          mb-3
          text-center
        `}
      >
        <p
          className={`
            text-xl
            text-neutral-400 
            font-medium
          `}
        >
          {!isSuccess ? "Failed to verify code" : "Verified"}
        </p>

        <p
          className={`
            text-sm
            text-neutral-500
          `}
        >
          {isSuccess
            ? "You have successfully verified your email address."
            : "Please check your email inbox or spam folder and try again."}
        </p>

        <p></p>
      </div>

      {/* Button */}
      <button
        ref={btnRef}
        type="button"
        autoFocus
        onClick={handleBtnClick}
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

export default VerifyStatusForm;
