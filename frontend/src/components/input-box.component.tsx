/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IconBaseProps } from "react-icons";

import Icon, { IconName } from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";

import mergeRefs from "../lib/merge-refs.lib";
import { timeoutForDelay } from "../lib/timeout.lib";
import { FormMethods } from "../constants/form.constant";

export interface InputProps<T extends FieldValues = any>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  icon?: { name: IconName; opts?: IconBaseProps };
  warning?: string[];
  toArray?: boolean;
  formMethods?: FormMethods<T>;
  syncWithOtherInput?: {
    active: boolean;
    syncVal: string | string[] | FileList | null | undefined;
  };
  iconHighlight?: boolean;
  className?: string;
  tw?: { icon?: string };
}

const InputBox = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      title,
      icon,
      warning,
      formMethods,
      syncWithOtherInput,
      toArray = false,
      iconHighlight = true,
      type,
      name,
      disabled,
      className,
      onChange,
      onKeyDown,
      onBlur,
      required,
      tw,
      ...props
    },
    ref
  ) => {
    const { active: syncFnActive, syncVal } = syncWithOtherInput ?? {};

    const inputRef = useRef<HTMLInputElement | null>(null);
    const prevFormValRef = useRef<string | null>(null);

    const [inputVal, setInputVal] = useState<string>("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [visibleWarning, setVisibleWarning] = useState(false);
    const [isSyncChecked, setIsSyncChecked] = useState(false);

    // switch password visibility
    const handleSwitchPasswordVisibility = (
      e: React.MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      timeoutForDelay(() => {
        setIsPasswordVisible(!isPasswordVisible);
      });
    };

    // handle the file onchange
    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files?.length;
      const value = e.target.value;

      setInputVal(value);
      setIsFileSelected(!!files);

      if (onChange) {
        onChange(e);
      }
    };

    const handleCheckboxOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;

      setIsSyncChecked(!!checked);
    };

    // handle input keydown
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const ekey = e.key;
      const isNonAlphanumeric = /[^\w,]/.test(ekey);

      // if keydown is not a alphanumeric, display warning content
      if (warning) {
        setVisibleWarning(isNonAlphanumeric);
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    // handle input on blur
    const handleInputOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e);
      }

      timeoutForDelay(() => {
        formatAndSetFormValue(inputVal);
        setVisibleWarning(false);
      });
    };

    // formatted input value and return to useForm
    const formatAndSetFormValue = (value: string) => {
      if (toArray && name && formMethods) {
        const { setFormValue, trigger } = formMethods;

        // convert a comma-separated string into an array of strings
        const generateInputVal = value
          .split(",")
          .filter((val) => val.length)
          .map((val) => val.trim());

        // return formatted value to useForm,
        // validate specified field manually
        timeoutForDelay(() => {
          setFormValue(name, generateInputVal);
          trigger(name);
        });
      }
    };

    useEffect(() => {
      // if syncVal is an array, join its elements into a single string
      const formattedVal = (
        Array.isArray(syncVal) ? syncVal.join(", ") : syncVal
      ) as string;

      // syncVal is derived from watch(name), which is a listening function.
      // this can cause useEffect to trigger repeatedly even if the value hasn't changed.
      // to prevent that, we check if the formatted value has actually changed.
      const hasChanged = formattedVal !== prevFormValRef.current;

      // if synchronization is enabled and the value has changed, update the input value
      if (isSyncChecked && hasChanged) {
        setInputVal(formattedVal);

        formatAndSetFormValue(formattedVal);

        // update the reference to the current formatted value for future comparisons
        prevFormValRef.current = formattedVal;
      }
    }, [isSyncChecked, syncVal]);

    return (
      <div
        className={`
          relative
          w-full
          ${
            title &&
            `
              flex
              flex-col
              gap-2
            `
          }
        `}
      >
        {/* title && sync checkbox */}
        <div
          className={`
            flex
            items-center
            justify-between
            text-sm
            text-grey-custom/50
          `}
        >
          {/* title */}
          <>
            {title && (
              <p>
                {title}
                {required && <span className={`text-red-500`}> *</span>}
              </p>
            )}
          </>

          {/* sync checkbox */}
          <>
            {syncFnActive && (
              <AnimationWrapper>
                <label
                  className={`
                    flex
                    gap-2
                    items-center
                  `}
                >
                  <input
                    type="checkbox"
                    onChange={(e) => handleCheckboxOnChange(e)}
                    disabled={disabled}
                    className={`w-3 h-3`}
                  />
                  <p>sync</p>
                </label>
              </AnimationWrapper>
            )}
          </>
        </div>

        {/* input */}
        <input
          name={name}
          ref={mergeRefs(ref, inputRef)}
          type={
            type === "password"
              ? isPasswordVisible
                ? "text"
                : "password"
              : type
          }
          value={inputVal}
          disabled={disabled}
          onChange={(e) => handleInputOnChange(e)}
          onKeyDown={(e) => handleInputKeyDown(e)}
          onBlur={(e) => handleInputOnBlur(e)}
          required={required}
          readOnly={isSyncChecked}
          className={twMerge(
            `
              input-box
              ${icon && "pl-[3.5rem]"}
              ${
                type === "file" &&
                ` ${
                  isFileSelected ? "text-grey-custom/80" : "text-grey-custom/30"
                }`
              }
            `,
            className
          )}
          {...props}
        />

        {/* input icon */}
        <>
          {icon && (
            <Icon
              name={icon.name}
              opts={icon?.opts}
              className={twMerge(
                `
                input-left-icon
                ${iconHighlight && inputVal?.length && "text-green-custom/80"}
              `,
                tw?.icon
              )}
            />
          )}
        </>

        {/* password visible icon */}
        <>
          {type === "password" && (
            <button
              type="button"
              onClick={handleSwitchPasswordVisibility}
              className={`
                input-right-icon
                hover:text-grey-custom
                transition
              `}
            >
              <Icon name={isPasswordVisible ? IoEyeOff : IoEye} />
            </button>
          )}
        </>

        {/* warning content */}
        <>
          {visibleWarning && (
            <AnimationWrapper
              className={`
                flex
                gap-2
                text-sm
                text-red-500
              `}
            >
              <p>*</p>
              <p className={`flex flex-col`}>
                {warning?.map((content, index) => (
                  <span key={index}>{content}</span>
                ))}
              </p>
            </AnimationWrapper>
          )}
        </>
      </div>
    );
  }
);

export default InputBox;
