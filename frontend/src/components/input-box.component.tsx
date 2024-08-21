import { forwardRef, useState } from "react";
import Icon from "./react-icons.component";
import { IconType } from "react-icons";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

type InputBoxProps = {
  id: string;
  type: React.HTMLInputTypeAttribute;
  name: string;
  value?: string;
  placeholder: string;
  icon: IconType;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
};

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  (
    {
      id,
      type,
      name,
      value,
      placeholder,
      icon,
      disabled,
      autoFocus = false,
      onChange,
      onBlur,
      onKeyDown,
      className,
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // switch password visibility
    const handleSwitchPasswordVisibility = (
      e: React.MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();

      const timeout = setTimeout(() => {
        setIsPasswordVisible(!isPasswordVisible);
      }, 0);

      return () => clearTimeout(timeout);
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
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={twMerge(
            `
              input-box
            `,
            className
          )}
        />

        {/* input icon */}
        <Icon
          name={icon}
          className={`
            input-left-icon
            ${value?.length && "text-green-custom/80"}
          `}
        />

        {/* password visible icon */}
        <>
          {type === "password" && (
            <button
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
