import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RiErrorWarningLine } from "react-icons/ri";
import { FaCheckCircle } from "react-icons/fa";
import { IoKey } from "react-icons/io5";

import Loader from "../components/loader.component";
import InputBox from "../components/input-box.component";
import WarningMsgBox from "./warning-message-box.component";

import { defaultUpdatePasswordData } from "../constants/form.constant";
import { WarningOptions } from "../constants/warning.constant";
import { DefaultUpdatePasswordForm } from "../types/form.type";
import { WarningType } from "../types/warning.type";
import { isHighlight } from "../lib/icon-highlight.lib";
import { passwordRegex } from "../utils/regex";
import { timeoutForDelay } from "../lib/timeout.lib";
import { twMerge } from "tailwind-merge";

type UpdateFnParams = {
  currentPassword: string;
  newPassword: string;
};

type UpdatePasswordFormProps = {
  title?: string;
  description?: string;
  updatePasswordFn: (params: UpdateFnParams) => void;
  isFetching?: boolean;
  verified?: boolean;
  disabled?: boolean;
  isPending?: boolean;
  className?: string;
  tw?: {
    form?: string;
    title?: string;
    description?: string;
  };
};

const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({
  title,
  description,
  updatePasswordFn,
  isFetching,
  verified,
  disabled,
  isPending,
  className,
  tw,
}) => {
  const [closeMsg, setCloseMsg] = useState(false);

  const {
    IS_FETCHING_TOKEN,
    VALID_TOKEN,
    INVALID_TOKEN,
    INVALID_PASSWORD_REGEX,
    PASSWORD_IS_DUPLICATED,
    PASSWORD_IS_NOT_MATCH,
  } = WarningOptions;

  // get warning msg
  const getWarningMsg = (type: WarningType) => {
    switch (type) {
      case IS_FETCHING_TOKEN:
        return "Verifying your password reset link...";
      case VALID_TOKEN:
        return "Verification complete! You can now change your password";
      case INVALID_TOKEN:
        return "Your password reset link is not valid, expired, or already used";
      case INVALID_PASSWORD_REGEX:
        return "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters";
      case PASSWORD_IS_DUPLICATED:
        return "Your new password should not match your current password";
      case PASSWORD_IS_NOT_MATCH:
        return "Please ensure the confirmation password matches the new password";
    }
  };

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    trigger,
    formState: { isValid, errors },
  } = useForm<DefaultUpdatePasswordForm>({
    defaultValues: defaultUpdatePasswordData,
    mode: "onChange",
  });

  // show verify status msg
  const visibleVerifyStatusMsg = useMemo(() => {
    if (isFetching === undefined && verified === undefined) return false;

    return isFetching || (verified && !closeMsg) || !verified;
  }, [isFetching, verified, closeMsg]);

  // icon highlight
  const isIconHighlight = (target: keyof DefaultUpdatePasswordForm) =>
    isHighlight(watch, errors, target);

  // handle form submit
  const onSubmit: SubmitHandler<DefaultUpdatePasswordForm> = (value) => {
    const { currentPassword, newPassword } = value;

    updatePasswordFn({ currentPassword, newPassword });
  };

  // auto close verified msg
  useEffect(() => {
    timeoutForDelay(() => {
      if (verified) {
        setCloseMsg(true);
        document.getElementById("reset-current-password")?.focus();
      }
    }, 2000);
  }, [verified]);

  return (
    <div
      className={twMerge(
        `
        flex
        flex-col
        gap-4
        max-w-[380px]
      `,
        className
      )}
    >
      {/* title */}
      {title && <h1 className={twMerge(`text-4xl font-extrabold`, tw?.title)}>{title}</h1>}

      {/* description */}
      {description && (
        <p className={twMerge(`text-sm text-neutral-500 tracking-wide`, tw?.description)}>
          {description}
        </p>
      )}

      {/* warning box */}
      <>
        <WarningMsgBox
          visible={visibleVerifyStatusMsg}
          transition={{ duration: 0.2 }}
          warningMsg={getWarningMsg(
            isFetching ? IS_FETCHING_TOKEN : verified ? VALID_TOKEN : INVALID_TOKEN
          )}
          headerIcon={{
            name: isFetching
              ? AiOutlineLoading3Quarters
              : verified
              ? FaCheckCircle
              : RiErrorWarningLine,
            opts: {
              color: isFetching ? "#93c5fd" : verified ? "#22c55e" : "#f87171",
              size: 20,
            },
          }}
          tw={{
            wrapper: `my-1 ${
              isFetching
                ? "bg-blue-300/10 border-blue-300"
                : verified
                ? "bg-green-400/10 border-green-400"
                : "bg-red-400/10 border-red-400"
            }`,
            hdrIcon: isFetching ? "animate-spin" : "",
            msg: `tracking-wider ${
              isFetching ? "text-blue-300" : verified ? "text-green-500" : "text-red-400"
            }`,
            clsBtn: "hidden",
          }}
        />

        {Object.entries(errors).length > 0 && (
          <WarningMsgBox
            warningMsg={Object.entries(errors)[0][1].message}
            tw={{
              wrapper: "my-1",
              clsBtn: "hidden",
              msg: "tracking-wider",
            }}
          />
        )}
      </>

      {/* form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={twMerge(
          `
          flex
          flex-col
          w-full
          gap-4
          ${!visibleVerifyStatusMsg && "mt-3"}
        `,
          tw?.form
        )}
      >
        {/* current password */}
        <InputBox
          id="reset-current-password"
          type="password"
          placeholder="Current Password"
          icon={{ name: IoKey }}
          iconHighlight={isIconHighlight("currentPassword")}
          disabled={disabled}
          className={`py-4`}
          required
          {...register("currentPassword", {
            validate: (value) => {
              return passwordRegex.test(value) || getWarningMsg(INVALID_PASSWORD_REGEX);
            },
            onChange: () => watch("newPassword").length > 0 && trigger("newPassword"),
          })}
        />

        {/* new password */}
        <InputBox
          type="password"
          placeholder="New Password"
          icon={{ name: IoKey }}
          iconHighlight={isIconHighlight("newPassword")}
          disabled={disabled}
          className={`py-4`}
          required
          {...register("newPassword", {
            validate: (value) => {
              if (!passwordRegex.test(value)) {
                return getWarningMsg(INVALID_PASSWORD_REGEX);
              } else if (value === getValues("currentPassword")) {
                return getWarningMsg(PASSWORD_IS_DUPLICATED);
              }
            },
            onChange: () => watch("confirmPassword").length > 0 && trigger("confirmPassword"),
          })}
        />

        {/* confirm password */}
        <InputBox
          type="password"
          placeholder="Confirm Password"
          icon={{ name: IoKey }}
          iconHighlight={isIconHighlight("confirmPassword")}
          disabled={disabled}
          required
          className={`py-4`}
          {...register("confirmPassword", {
            validate: (value) => {
              if (!passwordRegex.test(value)) {
                return getWarningMsg(INVALID_PASSWORD_REGEX);
              } else if (value !== getValues("newPassword")) {
                return getWarningMsg(PASSWORD_IS_NOT_MATCH);
              }
            },
          })}
        />

        {/* submit button */}
        <button
          type="submit"
          disabled={disabled || !isValid}
          className={`
            mt-5
            submit-btn
            text-sm
            rounded-full
          `}
        >
          {isPending ? <Loader loader={{ size: 20 }} /> : "Reset password"}
        </button>
      </form>
    </div>
  );
};

export default UpdatePasswordForm;
