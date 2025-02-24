import { useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";

import {
  sendVerificationCode,
  verifyVerificationCode,
  SendCodeParams,
} from "../fetchs/verification-code.fetch";
import {
  defaultVerificationCodeInput,
  VerificationCodeForm,
} from "../constants/form.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import useVerificationCodeModalState from "../states/verification-code.state";
import { timeoutForDelay } from "../lib/timeout.lib";

interface VerificationInputFormProps {
  email: string;
}

const VerificationInputForm: React.FC<VerificationInputFormProps> = ({
  email,
}) => {
  const letterRegix = /^[A-Za-z]$/;
  const numberRegix = /^\d$/;

  const { openResendStatusModal, openVerifyStatusModal, setVerifyCodePending } =
    useVerificationCodeModalState();

  const handleLetterInputOnChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.slice(-1);

    if (value) {
      setValue("letter", value, {
        shouldValidate: true,
        shouldDirty: true,
      });

      setFocus("numbers.0");
    }
  };

  const handleNumberInputOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.slice(-1);

    if (value) {
      setValue(`numbers.${index}`, value, {
        shouldValidate: true,
        shouldDirty: true,
      });

      setFocus(`numbers.${index + 1}`);
    }
  };

  const handleOnKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const inputValue = e.currentTarget.value;

    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();

      setValue(`numbers.${index}`, "");

      if (!inputValue) {
        setFocus(index === 0 ? "letter" : `numbers.${index - 1}`);
      }
    }
  };

  const handleResendVerificationCode = () => {
    timeoutForDelay(() => {
      resendVerificationCodeToUser({
        email,
        shouldResendCode: true,
      });
    });
  };

  // resend code mutation
  const { mutate: resendVerificationCodeToUser } = useMutation({
    mutationKey: [MutationKey.RESEND_VERIFICATION_CODE],
    mutationFn: async (data: SendCodeParams) => {
      await sendVerificationCode(data);
    },
    onSuccess: () => {
      openResendStatusModal(true);
      toast.success("verification code resent successfully");
    },
    onError: (error) => {
      openResendStatusModal(false);
      toast.error(error.message);
    },
  });

  // verify code mutation
  const { mutate: verifyCode, isPending: verifyPending } = useMutation({
    mutationKey: [MutationKey.VERIFY_VERIFICATION_CODE],
    mutationFn: verifyVerificationCode,
    onSuccess: (res) => {
      const { verified } = res;

      openVerifyStatusModal(verified);

      if (verified) {
        toast.success("Code verified successfully");
      } else {
        toast.error("Failed to verify code");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    control,
    formState: { isValid },
  } = useForm<VerificationCodeForm>({
    defaultValues: defaultVerificationCodeInput,
    mode: "onChange",
  });

  const watchLetter = useWatch({ control, name: "letter" });
  const watchNumbers = useWatch({ control, name: "numbers" });
  const isCompleted = watchLetter && watchNumbers.every((num) => num !== "");

  const onSubmit: SubmitHandler<VerificationCodeForm> = async (value) => {
    const { letter, numbers } = value;
    const code = `${String(letter).toLocaleUpperCase()}-${numbers.join("")}`;

    verifyCode({ email, code });
  };

  // while the verification code is completed and valid, submit the form
  useEffect(() => {
    if (isCompleted && isValid) {
      handleSubmit(onSubmit)();
    }
  }, [isCompleted, isValid]);

  // save pending state
  useEffect(() => {
    setVerifyCodePending(verifyPending);
  }, [verifyPending]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        className={`
        flex 
        flex-col
        items-center
      `}
      >
        {/* input */}
        <div
          className={`
          flex 
          gap-2
          m-5
          items-center  
          justify-center
        `}
        >
          {/* letter input */}
          <input
            type="text"
            autoComplete="off"
            autoFocus
            {...register("letter", {
              required: true,
              validate: (value) => letterRegix.test(value),
              pattern: {
                value: letterRegix,
                message: "Must be a letter",
              },
            })}
            onChange={(e) => handleLetterInputOnChange(e)}
            className={`verification-input`}
          />

          {/* dash */}
          <p className={`text-2xl`}>-</p>

          {/* numbers input */}
          <div className={`flex gap-2`}>
            {Array.from({ length: 6 }).map((_, index) => {
              return (
                <input
                  key={index}
                  type="text"
                  autoComplete="off"
                  {...register(`numbers.${index}`, {
                    required: true,
                    validate: (value) => numberRegix.test(value),
                    pattern: {
                      value: numberRegix,
                      message: "Must be a number",
                    },
                  })}
                  onChange={(e) => handleNumberInputOnChange(e, index)}
                  onKeyDown={(e) => handleOnKeyDown(e, index)}
                  className={`verification-input`}
                />
              );
            })}
          </div>
        </div>

        {/* warning */}
        <>
          {isCompleted && !isValid && (
            <div
              className={`
              flex
              gap-2
              text-sm
            text-red-500
              font-medium
          `}
            >
              <p>* </p>
              <p>
                Something went wrong, Please check your verification code and
                ensure it matches the one you received.
              </p>
            </div>
          )}
        </>

        {/* seperate line */}
        <hr className={`divider`} />

        {/* resend code */}
        <div
          className={`
          flex
          flex-col
          gap-2
          items-center
          justify-center
          text-sm
          text-neutral-500
        `}
        >
          <p className={`font-medium`}>Didn't receive the code?</p>
          <p>
            Check your spam folder or{" "}
            <button
              type="button"
              onClick={handleResendVerificationCode}
              className={`text-blue-500 underline`}
            >
              resend verification code
            </button>
          </p>
        </div>
      </div>
    </form>
  );
};

export default VerificationInputForm;
