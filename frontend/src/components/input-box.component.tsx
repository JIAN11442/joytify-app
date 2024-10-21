import { forwardRef, useEffect, useRef, useState } from "react";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IconType } from "react-icons";

import Icon from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";

import { timeoutForDelay } from "../lib/timeout.lib";
import mergeRefs from "../lib/merge-refs.lib";
import { reqUpload } from "../constants/data-type.constant";
import { DefaultsSongType } from "../constants/form-default-data.constant";

interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  icon?: IconType;
  value?: string;
  warning?: string[];
  toArray?: boolean;
  formValueState?: {
    name: reqUpload;
    setFormValue: UseFormSetValue<DefaultsSongType>;
    trigger: UseFormTrigger<DefaultsSongType>;
  };
  iconHighlight?: boolean;
  className?: string;
}

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  (
    {
      id,
      title,
      icon,
      warning,
      toArray,
      formValueState,
      iconHighlight = true,
      type,
      disabled,
      className,
      onChange,
      onKeyDown,
      onBlur,
      required,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [inputVal, setInputVal] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [visibleWarning, setVisibleWarning] = useState(false);

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

      setIsFileSelected(!!files);
      setInputVal(value);

      if (onChange) {
        onChange(e);
      }
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

    // handle input onblur
    const handleInputOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      timeoutForDelay(() => {
        setVisibleWarning(false);
      });

      if (onBlur) {
        onBlur(e);
      }
    };

    useEffect(() => {
      if (formValueState) {
        const { name, setFormValue, trigger } = formValueState;

        if (toArray) {
          const generateInputVal = inputVal
            .split(",")
            .filter((val) => val.trim().length);
          setFormValue(name, generateInputVal);
        }

        trigger(name);
      }
    }, [inputVal, toArray, formValueState]);

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
        {/* title */}
        <>
          {title && (
            <p
              className={`
                text-sm
                text-grey-custom/50
              `}
            >
              {title}
              {required && <span className={`text-red-500`}> *</span>}
            </p>
          )}
        </>

        {/* input */}
        <input
          id={id}
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
              name={icon}
              className={`
                input-left-icon
                ${iconHighlight && inputVal?.length && "text-green-custom/80"}
              `}
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
                text-[14px]
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
