/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";
import { IconBaseProps } from "react-icons";

import Icon, { IconName } from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";

import { FormMethods } from "../types/form.type";
import { timeoutForDelay } from "../lib/timeout.lib";
import mergeRefs from "../lib/merge-refs.lib";

export interface InputProps<T extends FieldValues = any>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  icon?: { name: IconName; opts?: IconBaseProps };
  toArray?: boolean;
  formMethods?: FormMethods<T>;
  syncWithOtherInput?: {
    active: boolean;
    syncVal: string | string[] | FileList | null | undefined;
  };
  iconHighlight?: "success" | "error";
  className?: string;
  tw?: { icon?: string; title?: string };
}

const InputBox = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      title,
      icon,
      placeholder,
      formMethods,
      syncWithOtherInput,
      toArray = false,
      iconHighlight,
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
    const [isSyncChecked, setIsSyncChecked] = useState(false);

    const handleSwitchPasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      timeoutForDelay(() => {
        setIsPasswordVisible(!isPasswordVisible);
      });
    };

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setInputVal(value);

      onChange?.(e);
    };

    const handleCheckboxOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;

      setIsSyncChecked(!!checked);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      timeoutForDelay(() => {
        if (onKeyDown) {
          onKeyDown(e);
        }
      });
    };

    const handleInputOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      timeoutForDelay(() => {
        formatAndSetFormValue(inputVal);

        if (onBlur) {
          onBlur(e);
        }
      });
    };

    // formatted input value and return to useForm
    const formatAndSetFormValue = (value: string) => {
      if (toArray && name && formMethods) {
        const { setFormValue, trigger } = formMethods;

        // convert a comma-separated string into an array of strings
        const generateInputVal = value
          ?.split(",")
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
      const formattedVal = (Array.isArray(syncVal) ? syncVal.join(", ") : syncVal) as string;

      // syncVal is derived from watch(name), which is a listening function.
      // this can cause useEffect to trigger repeatedly even if the value hasn't changed.
      // to prevent that, we check if the formatted value has actually changed.
      const hasChanged = formattedVal !== prevFormValRef.current;

      // if synchronization is enabled and the value has changed, update the input value
      if (isSyncChecked && hasChanged) {
        formatAndSetFormValue(formattedVal);

        // update the reference to the current formatted value for future comparisons
        prevFormValRef.current = formattedVal;
      }
    }, [isSyncChecked, syncVal]);

    return (
      <div
        className={`
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
          `}
        >
          {/* title */}
          {title && (
            <p
              className={twMerge(
                `
                  text-sm
                  text-grey-custom/50
                `,
                tw?.title
              )}
            >
              {title}
              {required && <span className={`text-red-500`}> *</span>}
            </p>
          )}

          {/* sync checkbox */}
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
                <p className={`text-sm text-grey-custom/50`}>sync</p>
              </label>
            </AnimationWrapper>
          )}
        </div>

        {/* input */}
        <div className={`relative`}>
          {type === "file" ? (
            // custom file input
            <label
              className={`
                group
                flex
                flex-col
                gap-1
                cursor-pointer
            `}
            >
              <div
                className={twMerge(
                  `
                  input-box
                  flex
                  items-center
                  justify-between
                `,
                  className
                )}
              >
                <span
                  className={` 
                    truncate
                    ${!inputVal && "text-grey-custom/30"}
                  `}
                >
                  {inputVal || placeholder}
                </span>
                <Icon
                  name={LuUpload}
                  opts={{ size: 15 }}
                  className={`text-blue-500/50 group-hover:text-blue-400 transition-all`}
                />
              </div>
              <input
                name={name}
                ref={mergeRefs(ref, inputRef)}
                type="file"
                disabled={disabled}
                onChange={(e) => handleInputOnChange(e)}
                onKeyDown={(e) => handleInputKeyDown(e)}
                onBlur={(e) => handleInputOnBlur(e)}
                required={required}
                readOnly={isSyncChecked}
                className={`hidden`}
                {...props}
              />
            </label>
          ) : (
            // other type input
            <input
              name={name}
              placeholder={placeholder}
              ref={mergeRefs(ref, inputRef)}
              type={type === "password" ? (isPasswordVisible ? "text" : "password") : type}
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
              `,
                className
              )}
              {...props}
            />
          )}

          {/* input icon */}
          {icon && (
            <Icon
              name={icon.name}
              opts={icon?.opts}
              className={twMerge(
                `
                  input-left-icon
                  ${
                    iconHighlight && !disabled
                      ? iconHighlight === "success"
                        ? "text-green-custom/80"
                        : "text-orange-400/80"
                      : disabled
                      ? "opacity-50"
                      : ""
                  }
                  `,
                tw?.icon
              )}
            />
          )}

          {/* password visible icon */}
          {type === "password" && (
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={handleSwitchPasswordVisibility}
              className={`
                input-right-icon
                transition
              `}
            >
              <Icon name={isPasswordVisible ? IoEyeOff : IoEye} />
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default InputBox;
