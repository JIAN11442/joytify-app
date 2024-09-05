import { forwardRef, useState } from "react";
import { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";
import { IoEye, IoEyeOff } from "react-icons/io5";

import Icon from "./react-icons.component";

import { timeoutForDelay } from "../lib/timeout.lib";

interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconType;
  value?: string;
  className?: string;
}

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  ({ id, icon, value, type, disabled, className, onChange, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFileSelected, setIsFileSelected] = useState(false);

    // switch password visibility
    const handleSwitchPasswordVisibility = (
      e: React.MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      timeoutForDelay(() => {
        setIsPasswordVisible(!isPasswordVisible);
      });
    };

    // listening the file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files?.length;

      setIsFileSelected(!!files);

      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="relative">
        {/* input */}
        <input
          id={id}
          ref={ref}
          type={
            type === "password"
              ? isPasswordVisible
                ? "text"
                : "password"
              : type
          }
          value={value}
          disabled={disabled}
          onChange={handleFileChange}
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
                ${value?.length && "text-green-custom/80"}
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
      </div>
    );
  }
);

export default InputBox;
